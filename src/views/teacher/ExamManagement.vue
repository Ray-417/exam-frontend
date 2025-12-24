<template>
  <div class="exam-management-container">
    <div class="page-header">
      <h2 class="page-title">考试管理</h2>
    </div>
    
    <el-tabs v-model="activeModule" type="card" class="module-tabs">
      <!-- ==================== 考试列表模块 ==================== -->
      <el-tab-pane label="考试列表" name="exam">
        <div class="tab-content">
          <div class="action-bar">
            <el-button type="primary" @click="handleCreateExamGuide">
              <el-icon><Plus /></el-icon>创建考试
            </el-button>
          </div>
          
          <el-tabs v-model="examStatusTab" @tab-click="handleExamTabClick">
            <!-- 未开始 -->
            <el-tab-pane label="未开始" name="upcoming">
              <el-table :data="upcomingExams" border style="width: 100%" stripe>
                <el-table-column prop="name" label="考试名称" min-width="180" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="startTime" label="开始时间" width="180" />
                <el-table-column prop="duration" label="时长(分钟)" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="info">未开始</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                  <template #default="scope">
                    <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
                    <el-button link type="primary" @click="handleManageStudents(scope.row)">考生</el-button>
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 进行中 -->
            <el-tab-pane label="进行中" name="ongoing">
              <el-table :data="ongoingExams" border style="width: 100%" stripe @row-click="handleRowClick" class="clickable-row">
                <el-table-column prop="name" label="考试名称" min-width="180" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="startTime" label="开始时间" width="180" />
                <el-table-column prop="duration" label="时长(分钟)" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="success">进行中</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                  <template #default="scope">
                    <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
                    <el-button link type="success" @click="handleMonitor(scope.row)">进入监考</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 已结束 -->
            <el-tab-pane label="已结束" name="finished">
              <el-alert title="点击表格行或“批阅”按钮可进入阅卷界面" type="info" show-icon :closable="false" style="margin-bottom: 15px;" />
              <el-table :data="finishedExams" border style="width: 100%" stripe @row-click="handleRowClick" class="clickable-row" highlight-current-row>
                <el-table-column prop="name" label="考试名称" min-width="180" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="startTime" label="开始时间" width="180" />
                <el-table-column prop="duration" label="时长(分钟)" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="warning">已结束</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                  <template #default="scope">
                    <el-button link type="warning" @click="handleGrade(scope.row)">批阅</el-button>
                    <el-button link type="info" @click="handleViewResults(scope.row)">成绩分析</el-button>
                    <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
      
      <!-- ==================== 试卷管理模块 ==================== -->
      <el-tab-pane label="试卷管理" name="paper">
        <div class="tab-content">
          <div class="action-bar">
            <el-button type="primary" @click="handleCreatePaper('manual')">
              <el-icon><Edit /></el-icon>手动组卷
            </el-button>
            <el-button type="success" @click="handleCreatePaper('auto')">
              <el-icon><MagicStick /></el-icon>智能组卷
            </el-button>
          </div>
          
          <el-table v-loading="paperLoading" :data="paperList" border style="width: 100%">
            <el-table-column prop="name" label="试卷名称" min-width="180" />
            <el-table-column prop="subject" label="科目" width="100" />
            <el-table-column prop="questionCount" label="题目数量" width="100" />
            <el-table-column prop="totalScore" label="总分" width="80" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getPaperStatusType(scope.row.status)">
                  {{ getPaperStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handlePreviewPaper(scope.row)">预览</el-button>
                <el-button link type="primary" @click="handleEditPaper(scope.row)" v-if="scope.row.status !== 'used'">编辑</el-button>
                <el-button link type="success" @click="handlePublishExam(scope.row)">发布考试</el-button>
                <el-button link type="warning" @click="handleViewPaperAnalysis(scope.row)" v-if="scope.row.status === 'used'">查看分析</el-button>
                <el-button link type="danger" @click="handleDeletePaper(scope.row)" v-if="scope.row.status !== 'used'">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="paperPage"
              v-model:page-size="paperPageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="paperTotal"
              @size-change="handlePaperSizeChange"
              @current-change="handlePaperCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 组卷对话框 (Manual/Auto) -->
    <el-dialog v-model="createPaperVisible" :title="paperMode === 'manual' ? '手动组卷' : '智能组卷'" width="900px">
      <el-form :model="paperForm" label-width="100px">
        <el-form-item label="试卷名称">
          <el-input v-model="paperForm.name" placeholder="请输入试卷名称" />
        </el-form-item>
        <el-form-item label="所属科目">
          <el-select v-model="paperForm.subject" placeholder="请选择科目">
            <el-option label="Java" value="Java" />
            <el-option label="数据结构" value="数据结构" />
            <el-option label="计算机网络" value="计算机网络" />
          </el-select>
        </el-form-item>
        
        <!-- 手动组卷：题目选择 -->
        <div v-if="paperMode === 'manual'">
          <el-divider content-position="left">题目选择</el-divider>
          
          <!-- Filters for Question Selection -->
          <el-form :inline="true" class="mb-2">
            <el-form-item label="题型">
               <el-select v-model="questionFilter.type" placeholder="全部" clearable style="width: 120px">
                  <el-option v-for="t in questionTypes" :key="t.value" :label="t.label" :value="t.value" />
               </el-select>
            </el-form-item>
            <el-form-item label="难度">
               <el-select v-model="questionFilter.difficulty" placeholder="全部" clearable style="width: 100px">
                  <el-option label="简单" :value="1" />
                  <el-option label="中等" :value="3" />
                  <el-option label="困难" :value="5" />
               </el-select>
            </el-form-item>
            <el-form-item>
               <el-button type="primary" @click="filterQuestions">筛选</el-button>
            </el-form-item>
          </el-form>

          <el-table 
            :data="filteredMockQuestions" 
            border 
            style="width: 100%; height: 400px; overflow-y: auto;"
            @selection-change="handleQuestionSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="type" label="题型" width="100">
               <template #default="scope">
                  {{ getQuestionTypeLabel(scope.row.type) }}
               </template>
            </el-table-column>
            <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
            <el-table-column prop="difficulty" label="难度" width="80">
                <template #default="scope">
                    <el-rate v-model="scope.row.difficulty" disabled text-color="#ff9900" />
                </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; text-align: right;">
            已选: {{ selectedQuestions.length }} 题
          </div>
        </div>

        <!-- 智能组卷：规则配置 -->
        <div v-else>
          <el-divider content-position="left">组卷规则</el-divider>
          <el-form-item label="单选题数量">
            <el-input-number v-model="paperForm.singleCount" :min="0" :max="50" />
          </el-form-item>
          <el-form-item label="多选题数量">
            <el-input-number v-model="paperForm.multiCount" :min="0" :max="30" />
          </el-form-item>
          <el-form-item label="判断题数量">
            <el-input-number v-model="paperForm.judgeCount" :min="0" :max="20" />
          </el-form-item>
          <el-form-item label="难度偏好">
             <el-radio-group v-model="paperForm.difficulty">
                <el-radio label="easy">简单</el-radio>
                <el-radio label="medium">中等</el-radio>
                <el-radio label="hard">困难</el-radio>
             </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createPaperVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreatePaper">确定创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发布考试对话框 -->
    <el-dialog v-model="publishExamVisible" title="发布考试" width="600px">
      <el-form :model="examForm" label-width="100px">
        <el-form-item label="使用试卷">
          <el-input v-model="examForm.paperName" disabled />
        </el-form-item>
        <el-form-item label="考试名称">
          <el-input v-model="examForm.name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="examForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="考试时长">
          <el-input-number v-model="examForm.duration" :min="1" :step="10" /> 分钟
        </el-form-item>
        <el-form-item label="参考班级">
          <el-select v-model="examForm.classes" multiple placeholder="请选择参考班级" style="width: 100%">
            <el-option label="计算机科学与技术1班" value="cs1" />
            <el-option label="计算机科学与技术2班" value="cs2" />
            <el-option label="软件工程1班" value="se1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="publishExamVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPublishExam">确认发布</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 考生管理对话框 -->
    <el-dialog v-model="studentManageVisible" title="考生管理" width="700px">
       <div style="margin-bottom: 15px;">
          <el-button type="primary" size="small" icon="Plus" @click="handleAddStudent">添加考生</el-button>
          <el-button type="danger" size="small" icon="Delete" :disabled="!selectedStudents.length" @click="handleBatchDeleteStudent">批量移除</el-button>
       </div>
       <el-table :data="currentExamStudents" border @selection-change="handleStudentSelectionChange" max-height="400">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="class" label="班级" />
          <el-table-column label="操作" width="100">
             <template #default="scope">
                <el-button link type="danger" @click="handleRemoveStudent(scope.row)">移除</el-button>
             </template>
          </el-table-column>
       </el-table>
    </el-dialog>


    <!-- 监考看板 (Drawer) -->
    <el-drawer v-model="monitorVisible" title="在线监考看板" size="100%" :with-header="false">
      <div class="monitor-container" v-if="currentMonitoredExam">
        <div class="monitor-header">
          <div class="exam-info">
            <el-button icon="ArrowLeft" @click="monitorVisible = false" circle style="margin-right: 15px;" />
            <div>
               <h3>{{ currentMonitoredExam.name }} <el-tag type="success" effect="dark">进行中</el-tag></h3>
               <p>应考: {{ monitorStats.total }} | 实考: {{ monitorStats.online }} | 已提交: {{ monitorStats.submitted }} | 异常: {{ monitorStats.abnormal }}</p>
            </div>
          </div>
          <div class="monitor-actions">
            <el-select v-model="monitorFilter" placeholder="状态筛选" style="width: 120px; margin-right: 10px;">
                <el-option label="全部" value="all" />
                <el-option label="异常" value="abnormal" />
                <el-option label="在线" value="online" />
                <el-option label="已交卷" value="submitted" />
            </el-select>
            <el-button type="primary" plain @click="handleBroadcast">发送广播</el-button>
            <el-button type="warning" plain @click="refreshMonitor">刷新数据</el-button>
            <el-button type="danger" plain @click="handleForceSubmitAll">一键收卷</el-button>
          </div>
        </div>

        <div class="monitor-body">
            <div class="monitor-main">
                <el-divider content-position="left">考生实时监控</el-divider>
                <el-row :gutter="20">
                <el-col :span="6" v-for="student in filteredMonitorStudents" :key="student.id" style="margin-bottom: 20px;">
                    <el-card :class="['student-card', { 'abnormal-card': student.switchCount > 3, 'submitted-card': student.status === 'submitted' }]">
                    <div class="student-camera-placeholder">
                        <el-icon v-if="student.status === 'online'" class="camera-icon"><VideoCamera /></el-icon>
                        <div v-else class="camera-offline">
                            {{ student.status === 'submitted' ? '已交卷' : '离线' }}
                        </div>
                    </div>
                    <div class="student-info">
                        <div class="student-detail">
                        <div class="name">{{ student.name }} <span class="id">({{ student.id }})</span></div>
                        </div>
                        <div class="status-tag">
                        <el-tag size="small" :type="getStudentStatusType(student.status)">{{ getStudentStatusText(student.status) }}</el-tag>
                        </div>
                    </div>
                    <div class="monitor-metrics">
                        <div class="metric-item">
                        <span class="label">切屏次数</span>
                        <span :class="['value', { 'danger-text': student.switchCount > 3 }]">{{ student.switchCount }}</span>
                        </div>
                        <div class="metric-item">
                        <span class="label">答题进度</span>
                        <span class="value">{{ student.progress }}%</span>
                        </div>
                    </div>
                    <div class="card-actions" v-if="student.status === 'online'">
                        <el-button type="danger" link size="small" @click="handleWarning(student)">警告</el-button>
                        <el-button type="primary" link size="small" @click="handleForceSubmit(student)">强制收卷</el-button>
                    </div>
                    </el-card>
                </el-col>
                </el-row>
            </div>
            
            <div class="monitor-sidebar">
                <div class="sidebar-title">监考日志</div>
                <div class="log-list">
                    <div v-for="(log, index) in monitorLogs" :key="index" class="log-item">
                        <span class="log-time">{{ log.time }}</span>
                        <span :class="['log-content', {'log-danger': log.type === 'danger'}]">{{ log.content }}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, onUnmounted, computed } from 'vue'
import { Plus, Edit, MagicStick, VideoCamera, ArrowLeft, Delete } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getExams, createExam, deleteExam, getPapers, createPaper, deletePaper, getMonitorData, sendWarning, forceSubmit, getQuestions } from '@/api/teacher'

const router = useRouter()
const route = useRoute()
const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const activeModule = ref('exam')
const examStatusTab = ref('upcoming')

// --- Exam Logic ---
const examList = ref([])

const upcomingExams = computed(() => examList.value.filter(e => e.status === 'upcoming'))
const ongoingExams = computed(() => examList.value.filter(e => e.status === 'ongoing'))
const finishedExams = computed(() => examList.value.filter(e => e.status === 'finished'))

const loadExamList = async () => {
  try {
      const res = await getExams()
      examList.value = res.list || []
  } catch (error) {
      console.error(error)
      examList.value = []
  }
}

const handleExamTabClick = () => {
    // 切换tab时不需要做额外操作，computed会自动更新
}

const handleCreateExamGuide = () => {
  activeModule.value = 'paper'
  showMessage('请先选择或创建试卷，然后点击"发布考试"', 'info')
}

const handleViewDetail = (row) => showMessage(`查看考试详情: ${row.name}`, 'info')

const handleGrade = (row) => {
  router.push({
    name: 'TeacherScoreManagement',
    query: {
      activeTab: 'grading',
      examId: row.id,
      from: 'finished'
    }
  })
}

const handleViewResults = (row) => {
  router.push({
    name: 'TeacherScoreManagement',
    query: {
      activeTab: 'analysis',
      examId: row.id,
      from: 'finished'
    }
  })
}

const handleRowClick = (row) => {
  if (row.status === 'finished') {
    handleGrade(row)
  } else if (row.status === 'ongoing') {
    handleMonitor(row)
  }
}

const handleDelete = (row) => {
  showConfirm(`确定要删除考试"${row.name}"吗？`, '删除确认', 'warning')
    .then(async () => {
      try {
          await deleteExam(row.id)
          showMessage('删除成功', 'success')
          loadExamList()
      } catch (error) {
          console.error(error)
          showMessage('删除失败', 'error')
      }
    })
    .catch(() => {})
}

// --- Paper Logic ---
const paperLoading = ref(false)
const paperPage = ref(1)
const paperPageSize = ref(10)
const paperTotal = ref(0)
const paperList = ref([])

const questionTypes = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '编程题', value: 'programming' }
]

const getQuestionTypeLabel = (type) => {
  const found = questionTypes.find(item => item.value === type)
  return found ? found.label : type
}

const mockQuestions = ref([]) 
const filteredMockQuestions = ref([])

const getPaperStatusType = (status) => status === 'used' ? 'success' : 'info'
const getPaperStatusText = (status) => status === 'used' ? '已使用' : '未使用'

const loadPaperList = async () => {
  paperLoading.value = true
  try {
      const res = await getPapers({
          page: paperPage.value,
          size: paperPageSize.value
      })
      paperList.value = res.list || []
      paperTotal.value = res.total || 0
  } catch (error) {
      console.error(error)
      paperList.value = []
  } finally {
      paperLoading.value = false
  }
}

const handlePaperCurrentChange = () => loadPaperList()
const handlePaperSizeChange = () => { paperPage.value = 1; loadPaperList() }

// Paper Creation
const createPaperVisible = ref(false)
const paperMode = ref('manual')
const paperForm = reactive({
  name: '',
  subject: '',
  singleCount: 0,
  multiCount: 0,
  judgeCount: 0,
  difficulty: 'medium'
})
const selectedQuestions = ref([])
const questionFilter = reactive({ type: '', difficulty: '' })

const filterQuestions = () => {
    filteredMockQuestions.value = mockQuestions.value.filter(q => {
        let match = true
        if (questionFilter.type) match = match && q.type === questionFilter.type
        if (questionFilter.difficulty) match = match && q.difficulty === questionFilter.difficulty
        return match
    })
}

const handleCreatePaper = (mode) => {
  paperMode.value = mode
  createPaperVisible.value = true
  // Reset Form
  paperForm.name = ''
  paperForm.subject = ''
  selectedQuestions.value = []
  // Reset filter
  questionFilter.type = ''
  questionFilter.difficulty = ''
  
  // Load questions if manual
  getQuestions({ size: 100 }).then(res => {
       mockQuestions.value = res.list || []
       filterQuestions()
  }).catch(() => {
       mockQuestions.value = []
       filterQuestions()
  })
}

const handleQuestionSelectionChange = (val) => {
  selectedQuestions.value = val
}

const confirmCreatePaper = async () => {
  if (!paperForm.name || !paperForm.subject) {
    showMessage('请完善试卷基本信息', 'warning')
    return
  }
  
  try {
      const data = {
          name: paperForm.name,
          subject: paperForm.subject,
          mode: paperMode.value,
          // ... other fields
      }
      if (paperMode.value === 'manual') {
          data.questionIds = selectedQuestions.value.map(q => q.id)
      } else {
          data.rules = {
              single: paperForm.singleCount,
              multi: paperForm.multiCount,
              judge: paperForm.judgeCount,
              difficulty: paperForm.difficulty
          }
      }
      
      await createPaper(data)
      createPaperVisible.value = false
      showMessage('试卷创建成功', 'success')
      loadPaperList()
  } catch (error) {
      console.error(error)
      showMessage('创建失败', 'error')
  }
}

// Publish Exam
const publishExamVisible = ref(false)
const examForm = reactive({
  paperName: '',
  name: '',
  startTime: '',
  duration: 120,
  classes: []
})
let selectedPaperForExam = null

const handlePublishExam = (row) => {
  selectedPaperForExam = row
  examForm.paperName = row.name
  examForm.name = row.name + ' (考试)'
  examForm.startTime = ''
  examForm.duration = 120
  examForm.classes = []
  publishExamVisible.value = true
}

const confirmPublishExam = async () => {
  if (!examForm.name || !examForm.startTime || examForm.classes.length === 0) {
    showMessage('请完善考试发布信息', 'warning')
    return
  }
  
  try {
      const data = {
          name: examForm.name,
          subject: selectedPaperForExam.subject,
          paperId: selectedPaperForExam.id,
          startTime: examForm.startTime,
          duration: examForm.duration,
          classes: examForm.classes
      }
      await createExam(data)
      publishExamVisible.value = false
      showMessage('考试发布成功', 'success')
      
      // Switch to exam tab
      activeModule.value = 'exam'
      examStatusTab.value = 'upcoming'
      loadExamList()
  } catch (error) {
      console.error(error)
      showMessage('发布失败', 'error')
  }
}

const handleViewPaperAnalysis = (row) => {
  router.push({
    name: 'TeacherScoreManagement',
    query: {
        activeTab: 'analysis',
        from: 'paper'
    }
  })
}

const handlePreviewPaper = (row) => showMessage(`预览试卷ID: ${row.id}`, 'info')
const handleEditPaper = (row) => showMessage(`编辑试卷ID: ${row.id}`, 'info')
const handleDeletePaper = (row) => {
  showConfirm(`确定要删除试卷"${row.name}"吗？`, '删除确认', 'warning')
    .then(async () => {
      try {
          await deletePaper(row.id)
          loadPaperList()
          showMessage('删除成功', 'success')
      } catch (error) {
          console.error(error)
          showMessage('删除失败', 'error')
      }
    })
    .catch(() => {})
}

// --- Student Management Logic ---
const studentManageVisible = ref(false)
const currentExamStudents = ref([])
const selectedStudents = ref([])

const handleManageStudents = (row) => {
  studentManageVisible.value = true
  currentExamStudents.value = [] 
  showMessage('暂无考生数据 (需对接API)', 'info')
}

const handleAddStudent = () => {
  showMessage('添加考生功能待实现', 'info')
}

const handleStudentSelectionChange = (val) => {
  selectedStudents.value = val
}

const handleRemoveStudent = (row) => {
  showConfirm(`确定要移除考生 ${row.name} 吗？`, '提示', 'warning')
    .then(() => {
      currentExamStudents.value = currentExamStudents.value.filter(s => s.id !== row.id)
      showMessage('移除成功', 'success')
    })
    .catch(() => {})
}

const handleBatchDeleteStudent = () => {
   showConfirm(`确定要移除选中的 ${selectedStudents.value.length} 名考生吗？`, '提示', 'warning')
    .then(() => {
      const ids = selectedStudents.value.map(s => s.id)
      currentExamStudents.value = currentExamStudents.value.filter(s => !ids.includes(s.id))
      showMessage('批量移除成功', 'success')
    })
    .catch(() => {})
}

// --- Proctoring Logic ---
const monitorVisible = ref(false)
const currentMonitoredExam = ref(null)
const monitorStudents = ref([])
const monitorStats = reactive({ total: 0, online: 0, submitted: 0, abnormal: 0 })
const monitorFilter = ref('all')
const monitorLogs = ref([])
let monitorTimer = null

const filteredMonitorStudents = computed(() => {
  if (monitorFilter.value === 'all') return monitorStudents.value
  if (monitorFilter.value === 'abnormal') return monitorStudents.value.filter(s => s.switchCount > 3)
  return monitorStudents.value.filter(s => s.status === monitorFilter.value)
})

const addMonitorLog = (content, type = 'info') => {
  monitorLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    content,
    type
  })
}

const handleBroadcast = () => {
  ElMessageBox.prompt('请输入广播内容', '发送广播', {
    confirmButtonText: '发送',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      addMonitorLog(`老师发送广播: ${value}`, 'info')
      showMessage('广播发送成功', 'success')
    })
    .catch(() => {})
}

const handleMonitor = (exam) => {
  currentMonitoredExam.value = exam
  monitorVisible.value = true
  initMonitorData()
  startMonitorSimulation()
}

const initMonitorData = async () => {
  monitorLogs.value = [] // Reset logs
  addMonitorLog('监考系统启动', 'info')
  
  try {
      const res = await getMonitorData(currentMonitoredExam.value.id)
      monitorStudents.value = res.students || []
      monitorStats.total = res.total || 0
      monitorStats.online = res.online || 0
      monitorStats.submitted = res.submitted || 0
      monitorStats.abnormal = res.abnormal || 0
  } catch (error) {
      console.error(error)
      monitorStudents.value = []
  }
}

const refreshMonitor = () => {
  initMonitorData()
  showMessage('数据已刷新', 'success')
}

const handleForceSubmit = (student) => {
    showConfirm(`确定要强制收取 ${student.name} 的试卷吗？`, '警告', 'warning')
    .then(async () => {
        try {
            await forceSubmit(currentMonitoredExam.value.id, { studentIds: [student.id] })
            student.status = 'submitted'
            student.progress = 100
            addMonitorLog(`强制收卷: ${student.name}`, 'danger')
            initMonitorData()
            showMessage('强制收卷成功', 'success')
        } catch (error) {
             showMessage('操作失败', 'error')
        }
    })
    .catch(() => {})
}

const handleForceSubmitAll = () => {
    showConfirm('确定要收取所有考生的试卷吗？', '严重警告', 'error')
    .then(async () => {
        try {
            // Collect all online student IDs
            const onlineIds = monitorStudents.value.filter(s => s.status === 'online').map(s => s.id)
            if(onlineIds.length > 0) {
                await forceSubmit(currentMonitoredExam.value.id, { studentIds: onlineIds })
                addMonitorLog(`批量强制收卷: ${onlineIds.length}人`, 'danger')
                initMonitorData()
                showMessage('一键收卷成功，正在跳转至阅卷界面...', 'success')
                setTimeout(() => {
                    router.push({
                        name: 'TeacherScoreManagement',
                        query: {
                            activeTab: 'grading',
                            examId: currentMonitoredExam.value?.id,
                            from: 'monitor'
                        }
                    })
                }, 1000)
            } else {
                 showMessage('当前无在线考生需要收卷', 'info')
            }
        } catch (error) {
             showMessage('操作失败', 'error')
        }
    })
    .catch(() => {})
}

const startMonitorSimulation = () => {
  if (monitorTimer) clearInterval(monitorTimer)
  monitorTimer = setInterval(() => {
    // In real app, this would poll the API
    initMonitorData()
  }, 5000) // Poll every 5 seconds
}

const getStudentStatusType = (status) => {
  const map = { online: 'success', offline: 'info', submitted: 'warning' }
  return map[status] || ''
}
const getStudentStatusText = (status) => {
  const map = { online: '考试中', offline: '离线', submitted: '已交卷' }
  return map[status] || ''
}

const handleWarning = (student) => {
  // sendWarning API
  sendWarning(currentMonitoredExam.value.id, { studentId: student.id, message: '警告' })
  .then(() => {
      addMonitorLog(`发送警告给 ${student.name}`, 'warning')
      showMessage(`已向学生 ${student.name} 发送警告`, 'warning')
  })
}

onMounted(() => {
  if (route.query.activeModule) {
    activeModule.value = route.query.activeModule
  }
  if (route.query.examStatusTab) {
    examStatusTab.value = route.query.examStatusTab
  }
  loadExamList()
  loadPaperList()
})

onUnmounted(() => {
  if (monitorTimer) clearInterval(monitorTimer)
})
</script>

<style scoped>
.exam-management-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mb-2 {
    margin-bottom: 10px;
}

.clickable-row {
  cursor: pointer;
}

/* Monitor Styles */
.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.student-card {
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.abnormal-card {
  border-color: #F56C6C;
  background-color: #fef0f0;
}

.submitted-card {
  background-color: #f0f9eb;
}

.student-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.student-detail .name {
  font-weight: bold;
}

.student-detail .id {
  font-size: 12px;
  color: #909399;
}

.status-tag {
  margin-left: auto;
}

.monitor-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-item .value {
  font-weight: bold;
  margin-top: 4px;
}

.danger-text {
  color: #F56C6C;
}

.card-actions {
  text-align: right;
  margin-top: 5px;
}

.monitor-body {
  display: flex;
  height: calc(100vh - 100px);
  overflow: hidden;
}

.monitor-main {
  flex: 1;
  padding-right: 20px;
  overflow-y: auto;
}

.monitor-sidebar {
  width: 300px;
  border-left: 1px solid #dcdfe6;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 16px;
}

.log-list {
    flex: 1;
    overflow-y: auto;
}

.log-item {
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;
}

.log-time {
    color: #909399;
    margin-right: 5px;
}

.log-danger {
    color: #F56C6C;
}

.student-camera-placeholder {
    height: 80px;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    border-radius: 4px;
    color: #fff;
}

.camera-icon {
    font-size: 24px;
}

.camera-offline {
    font-size: 12px;
    color: #909399;
}
</style>
