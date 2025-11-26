<template>
  <div class="exam-management-container">
    <div class="page-header">
      <h2 class="page-title">考试管理</h2>
    </div>
    
    <el-tabs v-model="activeModule" type="card" class="module-tabs">
      <el-tab-pane label="考试列表" name="exam">
        <div class="tab-content">
          <div class="action-bar">
            <el-button type="primary" @click="handleCreateExam">
              <el-icon><Plus /></el-icon>创建考试
            </el-button>
          </div>
          
          <el-tabs v-model="examStatusTab" @tab-click="handleExamTabClick">
            <el-tab-pane label="未开始" name="upcoming">
              <exam-table :status="'upcoming'" :data="examList" @refresh="loadExamList" />
            </el-tab-pane>
            <el-tab-pane label="进行中" name="ongoing">
              <exam-table :status="'ongoing'" :data="examList" @refresh="loadExamList" />
            </el-tab-pane>
            <el-tab-pane label="已结束" name="finished">
              <exam-table :status="'finished'" :data="examList" @refresh="loadExamList" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
      
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
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { Plus, Edit, MagicStick } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const activeModule = ref('exam')
const examStatusTab = ref('upcoming')

// --- Exam Logic ---
const examList = ref([])

// 考试表格组件
const ExamTable = {
  props: {
    status: { type: String, required: true },
    data: { type: Array, required: true }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const router = useRouter()
    const showMessage = inject('showMessage')
    const showConfirm = inject('showConfirm')
    
    const getStatusType = (status) => {
      const map = { upcoming: 'info', ongoing: 'success', finished: 'warning' }
      return map[status] || ''
    }
    
    const getStatusText = (status) => {
      const map = { upcoming: '未开始', ongoing: '进行中', finished: '已结束' }
      return map[status] || '未知'
    }
    
    const handleViewDetail = (row) => showMessage(`查看考试详情: ${row.id}`, 'info')
    const handleManageStudents = (row) => showMessage('管理考生功能待实现', 'info')
    const handleProctor = (row) => showMessage('在线监考功能待实现', 'info')
    const handleGrade = (row) => router.push(`/teacher/score-management`) // Redirect to Score Management
    const handleViewResults = (row) => router.push(`/teacher/score-management`) // Redirect to Score Management
    
    const handleDelete = (row) => {
      showConfirm(`确定要删除考试"${row.name}"吗？`, '删除确认', 'warning')
        .then(() => {
          setTimeout(() => {
            showMessage('删除成功', 'success')
            emit('refresh')
          }, 500)
        })
        .catch(() => {})
    }
    
    return {
      getStatusType, getStatusText, handleViewDetail, handleManageStudents,
      handleProctor, handleGrade, handleViewResults, handleDelete
    }
  },
  template: `
    <el-table :data="data.filter(item => item.status === status)" border style="width: 100%">
      <el-table-column prop="name" label="考试名称" min-width="180" />
      <el-table-column prop="subject" label="科目" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="duration" label="考试时长" width="100">
        <template #default="scope">{{ scope.row.duration }}分钟</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
          <el-button link type="primary" @click="handleManageStudents(scope.row)">考生</el-button>
          <el-button link type="success" @click="handleProctor(scope.row)" v-if="scope.row.status === 'ongoing'">监考</el-button>
          <el-button link type="warning" @click="handleGrade(scope.row)" v-if="scope.row.status === 'finished'">批阅</el-button>
          <el-button link type="info" @click="handleViewResults(scope.row)" v-if="scope.row.status === 'finished'">成绩</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status === 'upcoming'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  `
}

const mockExams = [
  { id: 1, name: 'Java程序设计期中考试', subject: 'Java', startTime: '2023-11-15 14:30:00', duration: 120, status: 'upcoming' },
  { id: 2, name: '数据结构期末考试', subject: '数据结构', startTime: '2023-11-10 09:00:00', duration: 150, status: 'ongoing' },
  { id: 3, name: '计算机网络模拟考试', subject: '计算机网络', startTime: '2023-10-20 16:00:00', duration: 90, status: 'finished' }
]

const loadExamList = () => {
  setTimeout(() => { examList.value = mockExams }, 500)
}

const handleExamTabClick = () => loadExamList()
const handleCreateExam = () => {
  activeModule.value = 'paper' // Switch to paper tab to select paper
  showMessage('请先选择或创建试卷，然后发布考试', 'info')
}

// --- Paper Logic ---
const paperLoading = ref(false)
const paperPage = ref(1)
const paperPageSize = ref(10)
const paperTotal = ref(0)
const paperList = ref([])

const mockPapers = [
  { id: 1, name: 'Java程序设计期中试卷', questionCount: 25, totalScore: 100, createTime: '2023-10-15 14:30:22', status: 'unused' },
  { id: 2, name: '数据结构期末试卷', questionCount: 30, totalScore: 100, createTime: '2023-10-18 09:45:36', status: 'used' },
  { id: 3, name: '计算机网络模拟试卷', questionCount: 28, totalScore: 100, createTime: '2023-10-20 16:22:15', status: 'unused' }
]

const getPaperStatusType = (status) => status === 'used' ? 'success' : 'info'
const getPaperStatusText = (status) => status === 'used' ? '已使用' : '未使用'

const loadPaperList = () => {
  paperLoading.value = true
  setTimeout(() => {
    paperTotal.value = mockPapers.length
    const start = (paperPage.value - 1) * paperPageSize.value
    const end = start + paperPageSize.value
    paperList.value = mockPapers.slice(start, end)
    paperLoading.value = false
  }, 500)
}

const handlePaperCurrentChange = () => loadPaperList()
const handlePaperSizeChange = () => { paperPage.value = 1; loadPaperList() }
const handleCreatePaper = (type) => showMessage(`${type === 'manual' ? '手动' : '智能'}组卷功能待实现`, 'info')
const handlePreviewPaper = (row) => showMessage(`预览试卷ID: ${row.id}`, 'info')
const handleEditPaper = (row) => showMessage(`编辑试卷ID: ${row.id}`, 'info')
const handlePublishExam = (row) => {
  // Logic to publish exam from paper
  showMessage(`发布考试: ${row.name}`, 'success')
  activeModule.value = 'exam' // Switch back to exam list
  loadExamList()
}
const handleDeletePaper = (row) => {
  showConfirm(`确定要删除试卷"${row.name}"吗？`, '删除确认', 'warning')
    .then(() => {
      setTimeout(() => {
        showMessage('删除成功', 'success')
        loadPaperList()
      }, 500)
    })
    .catch(() => {})
}

onMounted(() => {
  loadExamList()
  loadPaperList()
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
</style>
