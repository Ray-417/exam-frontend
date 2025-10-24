<template>
  <div class="grading-management-container">
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
    
    <el-card class="exam-info-card">
      <template #header>
        <div class="card-header">
          <span>考试信息</span>
        </div>
      </template>
      <div class="exam-info">
        <div class="info-item">
          <span class="label">考试名称：</span>
          <span class="value">{{ examInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">科目：</span>
          <span class="value">{{ examInfo.subject }}</span>
        </div>
        <div class="info-item">
          <span class="label">考试时间：</span>
          <span class="value">{{ examInfo.examTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">考试时长：</span>
          <span class="value">{{ examInfo.duration }}分钟</span>
        </div>
        <div class="info-item">
          <span class="label">总分：</span>
          <span class="value">{{ examInfo.totalScore }}分</span>
        </div>
        <div class="info-item">
          <span class="label">参考人数：</span>
          <span class="value">{{ examInfo.studentCount }}人</span>
        </div>
        <div class="info-item">
          <span class="label">批阅进度：</span>
          <span class="value">{{ examInfo.gradedCount }}/{{ examInfo.studentCount }}</span>
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
                  <span>学生：{{ currentStudent.name }}</span>
                  <el-tag type="info" style="margin-left: 10px">{{ currentStudent.id }}</el-tag>
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
                <el-select v-model="filterStatus" placeholder="筛选状态" size="small">
                  <el-option label="全部" value="" />
                  <el-option label="未批阅" value="ungraded" />
                  <el-option label="已批阅" value="graded" />
                </el-select>
              </div>
            </template>
            <div class="student-list">
              <el-table
                :data="filteredStudents"
                style="width: 100%"
                height="calc(100vh - 300px)"
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
        <el-table :data="studentList" border style="width: 100%">
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
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { Edit, Check } from '@element-plus/icons-vue'

const showMessage = inject('showMessage')

// 考试信息
const examInfo = ref({
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
const studentList = ref([
  { id: '2023001', name: '张三', status: 'graded', score: 85, submitTime: '2023-10-20 15:45:22', gradingTime: '2023-10-21 10:30:15' },
  { id: '2023002', name: '李四', status: 'graded', score: 92, submitTime: '2023-10-20 15:50:36', gradingTime: '2023-10-21 11:15:42' },
  { id: '2023003', name: '王五', status: 'ungraded', score: null, submitTime: '2023-10-20 15:55:18', gradingTime: null },
  { id: '2023004', name: '赵六', status: 'ungraded', score: null, submitTime: '2023-10-20 15:58:47', gradingTime: null },
  { id: '2023005', name: '钱七', status: 'graded', score: 78, submitTime: '2023-10-20 15:59:59', gradingTime: '2023-10-21 14:20:33' }
])

// 当前选中的学生
const currentStudent = ref({})

// 筛选状态
const filterStatus = ref('')

// 筛选后的学生列表
const filteredStudents = computed(() => {
  if (!filterStatus.value) {
    return studentList.value
  }
  return studentList.value.filter(student => student.status === filterStatus.value)
})

// 是否有下一个学生
const hasNextStudent = computed(() => {
  const currentIndex = studentList.value.findIndex(s => s.id === currentStudent.value.id)
  return currentIndex < studentList.value.length - 1
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
  const firstUngraded = studentList.value.find(s => s.status === 'ungraded')
  if (firstUngraded) {
    currentStudent.value = firstUngraded
  } else {
    currentStudent.value = studentList.value[0]
  }
}

// 完成批阅
const finishGrading = () => {
  isGrading.value = false
  showMessage('批阅已完成', 'success')
}

// 选择学生
const handleStudentSelect = (row) => {
  currentStudent.value = row
  // 在实际应用中，这里应该加载该学生的答卷
  showMessage(`已加载${row.name}的答卷`, 'success')
}

// 保存当前批阅
const saveCurrentGrading = () => {
  // 计算总分
  const totalScore = paperQuestions.value.reduce((sum, q) => sum + q.givenScore, 0)
  
  // 更新学生状态
  const studentIndex = studentList.value.findIndex(s => s.id === currentStudent.value.id)
  if (studentIndex !== -1) {
    studentList.value[studentIndex].status = 'graded'
    studentList.value[studentIndex].score = totalScore
    studentList.value[studentIndex].gradingTime = new Date().toLocaleString()
  }
  
  // 更新批阅进度
  examInfo.value.gradedCount = studentList.value.filter(s => s.status === 'graded').length
  
  showMessage('批阅已保存', 'success')
}

// 下一个学生
const nextStudent = () => {
  const currentIndex = studentList.value.findIndex(s => s.id === currentStudent.value.id)
  if (currentIndex < studentList.value.length - 1) {
    currentStudent.value = studentList.value[currentIndex + 1]
    // 在实际应用中，这里应该加载该学生的答卷
    showMessage(`已加载${currentStudent.value.name}的答卷`, 'success')
  }
}

// 查看学生试卷
const viewStudentPaper = (student) => {
  currentStudent.value = student
  isGrading.value = true
}

// 编辑批阅
const editGrading = (student) => {
  currentStudent.value = student
  isGrading.value = true
}

onMounted(() => {
  // 在实际应用中，这里应该加载考试信息和学生列表
})
</script>

<style scoped>
.grading-management-container {
  padding: 20px;
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

.paper-card {
  margin-bottom: 20px;
}

.paper-content {
  max-height: calc(100vh - 200px);
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
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.student-list {
  flex: 1;
  overflow: hidden;
}
</style>