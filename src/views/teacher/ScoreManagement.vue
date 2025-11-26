<template>
  <div class="score-management-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="阅卷管理" name="grading">
        <div class="grading-pane">
          <div class="page-header">
            <h2 class="page-title">阅卷管理</h2>
            <div class="header-actions">
              <el-button type="primary" @click="startGrading" v-if="!isGrading">
                <el-icon><Edit /></el-icon>开始批阅
              </el-button>
              <el-button type="success" @click="finishGrading" v-if="isGrading">
                <el-icon><Check /></el-icon>完成批阅
              </el-button>
            </div>
          </div>
          
          <el-card class="exam-info-card" v-if="!isGrading">
            <template #header>
              <div class="card-header">
                <span>考试信息</span>
              </div>
            </template>
            <div class="exam-info">
              <div class="info-item">
                <span class="label">考试名称：</span>
                <span class="value">{{ gradingExamInfo.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">科目：</span>
                <span class="value">{{ gradingExamInfo.subject }}</span>
              </div>
              <div class="info-item">
                <span class="label">考试时间：</span>
                <span class="value">{{ gradingExamInfo.examTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">考试时长：</span>
                <span class="value">{{ gradingExamInfo.duration }}分钟</span>
              </div>
              <div class="info-item">
                <span class="label">总分：</span>
                <span class="value">{{ gradingExamInfo.totalScore }}分</span>
              </div>
              <div class="info-item">
                <span class="label">参考人数：</span>
                <span class="value">{{ gradingExamInfo.studentCount }}人</span>
              </div>
              <div class="info-item">
                <span class="label">批阅进度：</span>
                <span class="value">{{ gradingExamInfo.gradedCount }}/{{ gradingExamInfo.studentCount }}</span>
              </div>
            </div>
          </el-card>
          
          <div class="grading-content" v-if="isGrading">
            <el-row :gutter="20">
              <el-col :span="16">
                <el-card class="paper-card">
                  <template #header>
                    <div class="card-header">
                      <span>试卷内容</span>
                      <div>
                        <span>学生：{{ currentGradingStudent.name }}</span>
                        <el-tag type="info" style="margin-left: 10px">{{ currentGradingStudent.id }}</el-tag>
                      </div>
                    </div>
                  </template>
                  <div class="paper-content">
                    <div v-for="(question, index) in paperQuestions" :key="index" class="question-item">
                      <div class="question-header">
                        <div class="question-title">
                          <span class="question-number">{{ index + 1 }}.</span>
                          <span class="question-type">[{{ getQuestionTypeLabel(question.type) }}]</span>
                          <span>{{ question.content }}</span>
                        </div>
                        <div class="question-score">
                          <span>{{ question.score }}分</span>
                        </div>
                      </div>
                      
                      <div class="student-answer">
                        <div class="answer-label">学生答案：</div>
                        <div class="answer-content" v-html="formatStudentAnswer(question)"></div>
                      </div>
                      
                      <div class="correct-answer" v-if="question.type !== 'essay' && question.type !== 'short'">
                        <div class="answer-label">正确答案：</div>
                        <div class="answer-content" v-html="formatCorrectAnswer(question)"></div>
                      </div>
                      
                      <div class="grading-area" v-if="!question.autoGraded">
                        <div class="score-input">
                          <span>评分：</span>
                          <el-input-number 
                            v-model="question.givenScore" 
                            :min="0" 
                            :max="question.score" 
                            :step="0.5"
                            size="small"
                          />
                          <span class="max-score">/ {{ question.score }}分</span>
                        </div>
                        <div class="comment-input">
                          <span>评语：</span>
                          <el-input 
                            v-model="question.comment" 
                            type="textarea" 
                            :rows="2" 
                            placeholder="请输入评语（可选）"
                          />
                        </div>
                      </div>
                      <div class="auto-graded" v-else>
                        <el-tag type="success">系统已自动评分: {{ question.givenScore }}分</el-tag>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <el-card class="student-list-card">
                  <template #header>
                    <div class="card-header">
                      <span>学生列表</span>
                      <el-select v-model="gradingFilterStatus" placeholder="筛选状态" size="small">
                        <el-option label="全部" value="" />
                        <el-option label="未批阅" value="ungraded" />
                        <el-option label="已批阅" value="graded" />
                      </el-select>
                    </div>
                  </template>
                  <div class="student-list">
                    <el-table
                      :data="filteredGradingStudents"
                      style="width: 100%"
                      height="calc(100vh - 350px)"
                      @row-click="handleStudentSelect"
                      highlight-current-row
                    >
                      <el-table-column prop="name" label="姓名" width="100" />
                      <el-table-column prop="id" label="学号" width="120" />
                      <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                          <el-tag :type="scope.row.status === 'graded' ? 'success' : 'info'">
                            {{ scope.row.status === 'graded' ? '已批阅' : '未批阅' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="grading-actions">
                    <el-button type="primary" @click="saveCurrentGrading">保存当前</el-button>
                    <el-button @click="nextStudent" :disabled="!hasNextStudent">下一个</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <div class="grading-summary" v-else>
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>批阅统计</span>
                </div>
              </template>
              <el-table :data="gradingStudentList" border style="width: 100%">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="id" label="学号" width="120" />
                <el-table-column prop="score" label="总分" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'graded' ? 'success' : 'info'">
                      {{ scope.row.status === 'graded' ? '已批阅' : '未批阅' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" width="180" />
                <el-table-column prop="gradingTime" label="批阅时间" width="180" />
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button link type="primary" @click="viewStudentPaper(scope.row)">查看</el-button>
                    <el-button link type="primary" @click="editGrading(scope.row)" v-if="scope.row.status === 'graded'">修改</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="成绩统计" name="results">
        <div class="results-pane">
          <div class="page-header">
            <h2 class="page-title">成绩统计</h2>
            <div>
              <el-button type="primary" @click="exportResults">
                <el-icon><Download /></el-icon>导出成绩
              </el-button>
            </div>
          </div>
          
          <el-card class="filter-card">
            <div class="filter-container">
              <el-form :inline="true" :model="resultsFilterForm" class="filter-form">
                <el-form-item label="考试名称">
                  <el-select v-model="resultsFilterForm.examId" placeholder="选择考试" clearable>
                    <el-option v-for="item in examOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="班级">
                  <el-select v-model="resultsFilterForm.classId" placeholder="选择班级" clearable>
                    <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="学号/姓名">
                  <el-input v-model="resultsFilterForm.keyword" placeholder="输入学号或姓名" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">
                    <el-icon><Search /></el-icon>搜索
                  </el-button>
                  <el-button @click="resetFilter">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
          
          <div class="results-content" v-if="currentResultsExam.id">
            <el-card class="exam-info-card">
              <template #header>
                <div class="card-header">
                  <span>{{ currentResultsExam.name }}</span>
                  <el-tag type="success">已完成</el-tag>
                </div>
              </template>
              <div class="exam-info">
                <div class="info-item">
                  <span class="label">考试科目：</span>
                  <span class="value">{{ currentResultsExam.subject }}</span>
                </div>
                <div class="info-item">
                  <span class="label">考试时间：</span>
                  <span class="value">{{ currentResultsExam.examTime }}</span>
                </div>
                <div class="info-item">
                  <span class="label">总分：</span>
                  <span class="value">{{ currentResultsExam.totalScore }}分</span>
                </div>
                <div class="info-item">
                  <span class="label">参考人数：</span>
                  <span class="value">{{ currentResultsExam.studentCount }}人</span>
                </div>
                <div class="info-item">
                  <span class="label">平均分：</span>
                  <span class="value">{{ currentResultsExam.averageScore }}分</span>
                </div>
                <div class="info-item">
                  <span class="label">最高分：</span>
                  <span class="value">{{ currentResultsExam.highestScore }}分</span>
                </div>
                <div class="info-item">
                  <span class="label">最低分：</span>
                  <span class="value">{{ currentResultsExam.lowestScore }}分</span>
                </div>
                <div class="info-item">
                  <span class="label">及格率：</span>
                  <span class="value">{{ currentResultsExam.passRate }}%</span>
                </div>
              </div>
            </el-card>
            
            <div class="charts-container">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>分数分布</span>
                      </div>
                    </template>
                    <div class="chart-placeholder">
                      <div class="chart-mock">
                        <div class="chart-bar" style="height: 30%; background-color: #67C23A;">
                          <div class="chart-label">90-100</div>
                        </div>
                        <div class="chart-bar" style="height: 60%; background-color: #409EFF;">
                          <div class="chart-label">80-89</div>
                        </div>
                        <div class="chart-bar" style="height: 80%; background-color: #E6A23C;">
                          <div class="chart-label">70-79</div>
                        </div>
                        <div class="chart-bar" style="height: 40%; background-color: #F56C6C;">
                          <div class="chart-label">60-69</div>
                        </div>
                        <div class="chart-bar" style="height: 20%; background-color: #909399;">
                          <div class="chart-label">0-59</div>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>班级平均分对比</span>
                      </div>
                    </template>
                    <div class="chart-placeholder">
                      <div class="chart-mock horizontal">
                        <div class="chart-row">
                          <div class="chart-label">计科1班</div>
                          <div class="chart-bar-h" style="width: 85%; background-color: #409EFF;">85</div>
                        </div>
                        <div class="chart-row">
                          <div class="chart-label">计科2班</div>
                          <div class="chart-bar-h" style="width: 78%; background-color: #409EFF;">78</div>
                        </div>
                        <div class="chart-row">
                          <div class="chart-label">软工1班</div>
                          <div class="chart-bar-h" style="width: 82%; background-color: #409EFF;">82</div>
                        </div>
                        <div class="chart-row">
                          <div class="chart-label">软工2班</div>
                          <div class="chart-bar-h" style="width: 80%; background-color: #409EFF;">80</div>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            
            <el-card class="results-table-card">
              <template #header>
                <div class="card-header">
                  <span>成绩列表</span>
                </div>
              </template>
              <el-table :data="resultsList" border style="width: 100%">
                <el-table-column prop="studentId" label="学号" width="120" />
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="className" label="班级" width="120" />
                <el-table-column prop="score" label="成绩" width="100">
                  <template #default="scope">
                    <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="rank" label="排名" width="80" />
                <el-table-column prop="submitTime" label="提交时间" width="180" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
                      {{ scope.row.status === 'normal' ? '正常' : '异常' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button link type="primary" @click="viewDetail(scope.row)">查看详情</el-button>
                    <el-button link type="primary" @click="adjustScore(scope.row)">调整分数</el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="resultsCurrentPage"
                  v-model:page-size="resultsPageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="resultsTotal"
                  @size-change="handleResultsSizeChange"
                  @current-change="handleResultsCurrentChange"
                />
              </div>
            </el-card>
          </div>
          
          <div class="no-exam-selected" v-else>
            <el-empty description="请选择一个考试查看成绩" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 调整分数对话框 -->
    <el-dialog v-model="adjustScoreDialog.visible" title="调整分数" width="500px">
      <el-form :model="adjustScoreDialog.form" label-width="100px">
        <el-form-item label="学生">
          <span>{{ adjustScoreDialog.form.name }} ({{ adjustScoreDialog.form.studentId }})</span>
        </el-form-item>
        <el-form-item label="原始分数">
          <span>{{ adjustScoreDialog.form.originalScore }}</span>
        </el-form-item>
        <el-form-item label="调整后分数">
          <el-input-number v-model="adjustScoreDialog.form.newScore" :min="0" :max="currentResultsExam.totalScore" />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input v-model="adjustScoreDialog.form.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustScoreDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdjustScore">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { Edit, Check, Download, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMessage = inject('showMessage')

const activeTab = ref('grading')

// ================= 阅卷管理逻辑 =================

// 考试信息
const gradingExamInfo = ref({
  id: 1,
  name: '计算机网络期末考试',
  subject: '计算机网络',
  examTime: '2023-10-20 14:00-16:00',
  duration: 120,
  totalScore: 100,
  studentCount: 30,
  gradedCount: 18
})

// 批阅状态
const isGrading = ref(false)

// 学生列表
const gradingStudentList = ref([
  { id: '2023001', name: '张三', status: 'graded', score: 85, submitTime: '2023-10-20 15:45:22', gradingTime: '2023-10-21 10:30:15' },
  { id: '2023002', name: '李四', status: 'graded', score: 92, submitTime: '2023-10-20 15:50:36', gradingTime: '2023-10-21 11:15:42' },
  { id: '2023003', name: '王五', status: 'ungraded', score: null, submitTime: '2023-10-20 15:55:18', gradingTime: null },
  { id: '2023004', name: '赵六', status: 'ungraded', score: null, submitTime: '2023-10-20 15:58:47', gradingTime: null },
  { id: '2023005', name: '钱七', status: 'graded', score: 78, submitTime: '2023-10-20 15:59:59', gradingTime: '2023-10-21 14:20:33' }
])

// 当前选中的学生
const currentGradingStudent = ref({})

// 筛选状态
const gradingFilterStatus = ref('')

// 筛选后的学生列表
const filteredGradingStudents = computed(() => {
  if (!gradingFilterStatus.value) {
    return gradingStudentList.value
  }
  return gradingStudentList.value.filter(student => student.status === gradingFilterStatus.value)
})

// 是否有下一个学生
const hasNextStudent = computed(() => {
  const currentIndex = gradingStudentList.value.findIndex(s => s.id === currentGradingStudent.value.id)
  return currentIndex < gradingStudentList.value.length - 1
})

// 试卷题目
const paperQuestions = ref([
  {
    id: 1,
    type: 'single',
    content: 'TCP/IP协议中，以下哪个协议工作在传输层？',
    options: [
      { label: 'A', content: 'HTTP' },
      { label: 'B', content: 'IP' },
      { label: 'C', content: 'TCP' },
      { label: 'D', content: 'ARP' }
    ],
    correctAnswer: 'C',
    studentAnswer: 'C',
    score: 2,
    givenScore: 2,
    autoGraded: true,
    comment: ''
  },
  {
    id: 2,
    type: 'multiple',
    content: '以下哪些是数据链路层的功能？',
    options: [
      { label: 'A', content: '差错控制' },
      { label: 'B', content: '流量控制' },
      { label: 'C', content: '路由选择' },
      { label: 'D', content: '拥塞控制' }
    ],
    correctAnswer: ['A', 'B'],
    studentAnswer: ['A', 'B', 'D'],
    score: 4,
    givenScore: 2,
    autoGraded: true,
    comment: ''
  },
  {
    id: 3,
    type: 'fill',
    content: 'HTTP协议默认使用的端口号是_____。',
    correctAnswer: '80',
    studentAnswer: '80',
    score: 2,
    givenScore: 2,
    autoGraded: true,
    comment: ''
  },
  {
    id: 4,
    type: 'short',
    content: '简述TCP三次握手的过程。',
    correctAnswer: 'TCP三次握手过程：1. 客户端发送SYN包到服务器，进入SYN_SENT状态；2. 服务器收到SYN包，回应SYN+ACK包，进入SYN_RECV状态；3. 客户端收到SYN+ACK包，回应ACK包，双方进入ESTABLISHED状态。',
    studentAnswer: 'TCP三次握手：客户端先发SYN，服务器回复SYN+ACK，客户端再发ACK，然后连接建立。这样可以确保双方都有收发能力。',
    score: 10,
    givenScore: 8,
    autoGraded: false,
    comment: '描述基本正确，但缺少状态变化的说明'
  },
  {
    id: 5,
    type: 'essay',
    content: '论述计算机网络分层体系结构的意义，并比较OSI参考模型和TCP/IP模型的异同。',
    correctAnswer: '计算机网络分层体系结构的意义在于...(标准答案)',
    studentAnswer: '计算机网络分层的主要意义是将复杂的网络通信过程分解为若干个相对独立的部分，每层只需关注自己的功能，通过接口与相邻层交互。这样有利于标准化、模块化设计，便于实现和维护。\n\nOSI参考模型分为7层：物理层、数据链路层、网络层、传输层、会话层、表示层和应用层。而TCP/IP模型分为4层：网络接口层、网络层、传输层和应用层。\n\n相同点：两者都采用了分层的思想；都有网络层和传输层，功能相似。\n\n不同点：OSI是理论上的标准，TCP/IP是事实上的标准；OSI分7层，TCP/IP分4层；OSI先有模型后有协议，TCP/IP先有协议后有模型；TCP/IP模型更实用。',
    score: 20,
    givenScore: 16,
    autoGraded: false,
    comment: '论述比较全面，但对OSI各层功能的描述不够详细，对两种模型的比较可以更加深入'
  }
])

// 获取题目类型标签
const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'judge': '判断题',
    'short': '简答题',
    'essay': '论述题',
    'calculation': '计算题',
    'programming': '程序题'
  }
  return typeMap[type] || '未知类型'
}

// 格式化学生答案
const formatStudentAnswer = (question) => {
  switch (question.type) {
    case 'single':
      const singleOption = question.options.find(opt => opt.label === question.studentAnswer)
      return `${question.studentAnswer}: ${singleOption ? singleOption.content : ''}`
    case 'multiple':
      return question.studentAnswer.map(label => {
        const option = question.options.find(opt => opt.label === label)
        return `${label}: ${option ? option.content : ''}`
      }).join('<br>')
    case 'fill':
      return question.studentAnswer
    case 'judge':
      return question.studentAnswer ? '正确' : '错误'
    case 'short':
    case 'essay':
    case 'calculation':
    case 'programming':
      return question.studentAnswer.replace(/\n/g, '<br>')
    default:
      return question.studentAnswer
  }
}

// 格式化正确答案
const formatCorrectAnswer = (question) => {
  switch (question.type) {
    case 'single':
      const singleOption = question.options.find(opt => opt.label === question.correctAnswer)
      return `${question.correctAnswer}: ${singleOption ? singleOption.content : ''}`
    case 'multiple':
      return question.correctAnswer.map(label => {
        const option = question.options.find(opt => opt.label === label)
        return `${label}: ${option ? option.content : ''}`
      }).join('<br>')
    case 'fill':
      return question.correctAnswer
    case 'judge':
      return question.correctAnswer ? '正确' : '错误'
    default:
      return question.correctAnswer
  }
}

// 开始批阅
const startGrading = () => {
  isGrading.value = true
  // 默认选择第一个未批阅的学生
  const firstUngraded = gradingStudentList.value.find(s => s.status === 'ungraded')
  if (firstUngraded) {
    currentGradingStudent.value = firstUngraded
  } else {
    currentGradingStudent.value = gradingStudentList.value[0]
  }
}

// 完成批阅
const finishGrading = () => {
  isGrading.value = false
  showMessage('批阅已完成', 'success')
}

// 选择学生
const handleStudentSelect = (row) => {
  currentGradingStudent.value = row
  // 在实际应用中，这里应该加载该学生的答卷
  showMessage(`已加载${row.name}的答卷`, 'success')
}

// 保存当前批阅
const saveCurrentGrading = () => {
  // 计算总分
  const totalScore = paperQuestions.value.reduce((sum, q) => sum + q.givenScore, 0)
  
  // 更新学生状态
  const studentIndex = gradingStudentList.value.findIndex(s => s.id === currentGradingStudent.value.id)
  if (studentIndex !== -1) {
    gradingStudentList.value[studentIndex].status = 'graded'
    gradingStudentList.value[studentIndex].score = totalScore
    gradingStudentList.value[studentIndex].gradingTime = new Date().toLocaleString()
  }
  
  // 更新批阅进度
  gradingExamInfo.value.gradedCount = gradingStudentList.value.filter(s => s.status === 'graded').length
  
  showMessage('批阅已保存', 'success')
}

// 下一个学生
const nextStudent = () => {
  const currentIndex = gradingStudentList.value.findIndex(s => s.id === currentGradingStudent.value.id)
  if (currentIndex < gradingStudentList.value.length - 1) {
    currentGradingStudent.value = gradingStudentList.value[currentIndex + 1]
    // 在实际应用中，这里应该加载该学生的答卷
    showMessage(`已加载${currentGradingStudent.value.name}的答卷`, 'success')
  }
}

// 查看学生试卷
const viewStudentPaper = (student) => {
  currentGradingStudent.value = student
  isGrading.value = true
}

// 编辑批阅
const editGrading = (student) => {
  currentGradingStudent.value = student
  isGrading.value = true
}

// ================= 成绩统计逻辑 =================

// 分页
const resultsCurrentPage = ref(1)
const resultsPageSize = ref(10)
const resultsTotal = ref(0)

// 筛选表单
const resultsFilterForm = reactive({
  examId: '',
  classId: '',
  keyword: ''
})

// 考试选项
const examOptions = ref([
  { id: 1, name: '计算机网络期末考试' },
  { id: 2, name: 'Java程序设计期中考试' },
  { id: 3, name: '数据结构期末考试' }
])

// 班级选项
const classOptions = ref([
  { id: 1, name: '计科1班' },
  { id: 2, name: '计科2班' },
  { id: 3, name: '软工1班' },
  { id: 4, name: '软工2班' }
])

// 当前选中的考试（成绩统计）
const currentResultsExam = ref({})

// 成绩列表
const resultsList = ref([])

// 调整分数对话框
const adjustScoreDialog = reactive({
  visible: false,
  form: {
    studentId: '',
    name: '',
    originalScore: 0,
    newScore: 0,
    reason: ''
  }
})

// 模拟数据 - 考试信息
const mockResultsExamInfo = {
  id: 1,
  name: '计算机网络期末考试',
  subject: '计算机网络',
  examTime: '2023-10-20 14:00-16:00',
  totalScore: 100,
  studentCount: 120,
  averageScore: 78.5,
  highestScore: 98,
  lowestScore: 45,
  passRate: 85.2
}

// 模拟数据 - 成绩列表
const mockResults = [
  { studentId: '2023001', name: '张三', className: '计科1班', score: 92, rank: 1, submitTime: '2023-10-20 15:45:22', status: 'normal' },
  { studentId: '2023002', name: '李四', className: '计科1班', score: 88, rank: 3, submitTime: '2023-10-20 15:50:36', status: 'normal' },
  { studentId: '2023003', name: '王五', className: '计科2班', score: 76, rank: 8, submitTime: '2023-10-20 15:55:18', status: 'normal' },
  { studentId: '2023004', name: '赵六', className: '软工1班', score: 90, rank: 2, submitTime: '2023-10-20 15:58:47', status: 'normal' },
  { studentId: '2023005', name: '钱七', className: '软工2班', score: 85, rank: 4, submitTime: '2023-10-20 15:59:59', status: 'abnormal' },
  { studentId: '2023006', name: '孙八', className: '计科1班', score: 72, rank: 10, submitTime: '2023-10-20 15:48:33', status: 'normal' },
  { studentId: '2023007', name: '周九', className: '计科2班', score: 81, rank: 5, submitTime: '2023-10-20 15:52:41', status: 'normal' },
  { studentId: '2023008', name: '吴十', className: '软工1班', score: 79, rank: 6, submitTime: '2023-10-20 15:56:27', status: 'normal' },
  { studentId: '2023009', name: '郑十一', className: '软工2班', score: 65, rank: 12, submitTime: '2023-10-20 15:57:38', status: 'normal' },
  { studentId: '2023010', name: '王十二', className: '计科1班', score: 77, rank: 7, submitTime: '2023-10-20 15:59:12', status: 'normal' }
]

// 获取分数样式类
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-medium'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 加载成绩列表
const loadResultsList = () => {
  // 模拟API请求
  setTimeout(() => {
    if (resultsFilterForm.examId) {
      currentResultsExam.value = { ...mockResultsExamInfo }
      
      // 过滤
      let filteredResults = [...mockResults]
      
      if (resultsFilterForm.classId) {
        const className = classOptions.value.find(c => c.id === resultsFilterForm.classId)?.name
        filteredResults = filteredResults.filter(r => r.className === className)
      }
      
      if (resultsFilterForm.keyword) {
        const keyword = resultsFilterForm.keyword.toLowerCase()
        filteredResults = filteredResults.filter(r => 
          r.studentId.toLowerCase().includes(keyword) || 
          r.name.toLowerCase().includes(keyword)
        )
      }
      
      resultsTotal.value = filteredResults.length
      
      // 分页
      const start = (resultsCurrentPage.value - 1) * resultsPageSize.value
      const end = start + resultsPageSize.value
      resultsList.value = filteredResults.slice(start, end)
    } else {
      currentResultsExam.value = {}
      resultsList.value = []
      resultsTotal.value = 0
    }
  }, 500)
}

// 处理搜索
const handleSearch = () => {
  resultsCurrentPage.value = 1
  loadResultsList()
}

// 重置过滤条件
const resetFilter = () => {
  resultsFilterForm.classId = ''
  resultsFilterForm.keyword = ''
  handleSearch()
}

// 处理页码变化
const handleResultsCurrentChange = () => {
  loadResultsList()
}

// 处理每页数量变化
const handleResultsSizeChange = () => {
  resultsCurrentPage.value = 1
  loadResultsList()
}

// 导出成绩
const exportResults = () => {
  if (!currentResultsExam.value.id) {
    showMessage('请先选择一个考试', 'warning')
    return
  }
  showMessage('成绩导出功能待实现', 'info')
}

// 查看详情
const viewDetail = (row) => {
  // 实际应用中可以跳转到详情页或弹窗
  showMessage(`查看学生 ${row.name} 的成绩详情`, 'info')
}

// 调整分数
const adjustScore = (row) => {
  adjustScoreDialog.form = {
    studentId: row.studentId,
    name: row.name,
    originalScore: row.score,
    newScore: row.score,
    reason: ''
  }
  adjustScoreDialog.visible = true
}

// 确认调整分数
const confirmAdjustScore = () => {
  if (!adjustScoreDialog.form.reason) {
    showMessage('请输入调整原因', 'warning')
    return
  }
  
  // 模拟API请求
  setTimeout(() => {
    // 更新列表中的分数
    const index = resultsList.value.findIndex(r => r.studentId === adjustScoreDialog.form.studentId)
    if (index !== -1) {
      resultsList.value[index].score = adjustScoreDialog.form.newScore
      // 重新排序和计算排名（实际应用中应该由后端处理）
    }
    
    showMessage('分数调整成功', 'success')
    adjustScoreDialog.visible = false
  }, 500)
}

onMounted(() => {
  // 默认选择第一个考试
  if (examOptions.value.length > 0) {
    resultsFilterForm.examId = examOptions.value[0].id
    loadResultsList()
  }
})
</script>

<style scoped>
.score-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.exam-info-card {
  margin-bottom: 20px;
}

.exam-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Grading Styles */
.paper-card {
  margin-bottom: 20px;
}

.paper-content {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding-right: 10px;
}

.question-item {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.question-title {
  font-weight: bold;
}

.question-number {
  margin-right: 5px;
}

.question-type {
  color: var(--el-color-primary);
  margin-right: 10px;
}

.student-answer, .correct-answer {
  margin-bottom: 15px;
}

.answer-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.answer-content {
  padding: 10px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.grading-area {
  margin-top: 15px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.score-input {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.max-score {
  margin-left: 5px;
  color: var(--el-text-color-secondary);
}

.comment-input {
  display: flex;
  align-items: flex-start;
}

.comment-input span {
  margin-right: 10px;
  margin-top: 5px;
}

.auto-graded {
  margin-top: 15px;
}

.grading-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.student-list-card {
  height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.student-list {
  flex: 1;
  overflow: hidden;
}

/* Results Styles */
.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 230px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-mock {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.chart-bar {
  width: 60px;
  background-color: var(--el-color-primary);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
}

.chart-label {
  position: absolute;
  bottom: -25px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chart-mock.horizontal {
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
}

.chart-row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.chart-row .chart-label {
  position: static;
  width: 80px;
  text-align: right;
  margin-right: 10px;
}

.chart-bar-h {
  height: 30px;
  background-color: var(--el-color-primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
  transition: width 0.3s;
}

.results-table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.no-exam-selected {
  margin-top: 100px;
}

.score-excellent {
  color: #67C23A;
  font-weight: bold;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
}

.score-medium {
  color: #E6A23C;
}

.score-pass {
  color: #F56C6C;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
}
</style>
