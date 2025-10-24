<template>
  <div class="exam-list-container">
    <div class="page-header">
      <h2 class="page-title">考试列表</h2>
      <el-button type="primary" @click="handleCreateExam" v-if="userType === 'teacher' || userType === 'admin'">
        <el-icon><Plus /></el-icon>创建考试
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="考试名称">
          <el-input v-model="filterForm.name" placeholder="请输入考试名称" clearable />
        </el-form-item>
        <el-form-item label="考试状态">
          <el-select v-model="filterForm.status" placeholder="请选择考试状态" clearable>
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已结束" value="finished" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="全部考试" name="all"></el-tab-pane>
      <el-tab-pane label="未开始" name="not_started"></el-tab-pane>
      <el-tab-pane label="进行中" name="in_progress"></el-tab-pane>
      <el-tab-pane label="已结束" name="finished"></el-tab-pane>
    </el-tabs>

    <el-table
      v-loading="loading"
      :data="examList"
      border
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="考试名称" min-width="180" />
      <el-table-column prop="subject" label="科目" min-width="120" />
      <el-table-column label="考试时间" min-width="240">
        <template #default="scope">
          {{ formatDate(scope.row.startTime) }} 至 {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="考试时长" min-width="100">
        <template #default="scope">
          {{ scope.row.duration }} 分钟
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === 'not_started' && (userType === 'teacher' || userType === 'admin')"
            link 
            type="primary" 
            @click.stop="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            v-if="scope.row.status === 'in_progress' && userType === 'student'"
            link 
            type="success" 
            @click.stop="handleTakeExam(scope.row)"
          >
            参加考试
          </el-button>
          <el-button 
            v-if="scope.row.status === 'in_progress' && (userType === 'teacher' || userType === 'admin')"
            link 
            type="warning" 
            @click.stop="handleMonitor(scope.row)"
          >
            监考
          </el-button>
          <el-button 
            v-if="scope.row.status === 'finished' && (userType === 'teacher' || userType === 'admin')"
            link 
            type="info" 
            @click.stop="handleGrade(scope.row)"
          >
            阅卷
          </el-button>
          <el-button 
            v-if="scope.row.status === 'finished'"
            link 
            type="primary" 
            @click.stop="handleViewResult(scope.row)"
          >
            查看成绩
          </el-button>
          <el-button 
            v-if="userType === 'admin'"
            link 
            type="danger" 
            @click.stop="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const loading = ref(false)
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const examList = ref([])
const userType = ref(localStorage.getItem('userType') || 'student')

const filterForm = reactive({
  name: '',
  status: ''
})

// 模拟数据
const mockExams = [
  {
    id: 1,
    name: '2023年春季高等数学期末考试',
    subject: '高等数学',
    startTime: '2023-06-20 09:00:00',
    endTime: '2023-06-20 11:00:00',
    duration: 120,
    status: 'finished'
  },
  {
    id: 2,
    name: '2023年春季大学英语四级模拟考试',
    subject: '大学英语',
    startTime: '2023-06-25 14:00:00',
    endTime: '2023-06-25 16:00:00',
    duration: 120,
    status: 'finished'
  },
  {
    id: 3,
    name: '2023年秋季Java程序设计期中考试',
    subject: 'Java程序设计',
    startTime: '2023-11-10 10:00:00',
    endTime: '2023-11-10 12:00:00',
    duration: 120,
    status: 'in_progress'
  },
  {
    id: 4,
    name: '2023年秋季数据结构期末考试',
    subject: '数据结构',
    startTime: '2023-12-25 09:00:00',
    endTime: '2023-12-25 11:00:00',
    duration: 120,
    status: 'not_started'
  },
  {
    id: 5,
    name: '2023年秋季计算机网络期末考试',
    subject: '计算机网络',
    startTime: '2023-12-28 14:00:00',
    endTime: '2023-12-28 16:00:00',
    duration: 120,
    status: 'not_started'
  }
]

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'not_started':
      return 'info'
    case 'in_progress':
      return 'success'
    case 'finished':
      return ''
    default:
      return ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'not_started':
      return '未开始'
    case 'in_progress':
      return '进行中'
    case 'finished':
      return '已结束'
    default:
      return '未知'
  }
}

// 加载考试列表
const loadExamList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 根据tab筛选
    let filteredExams = [...mockExams]
    
    if (activeTab.value !== 'all') {
      filteredExams = filteredExams.filter(exam => exam.status === activeTab.value)
    }
    
    // 根据筛选条件过滤
    if (filterForm.name) {
      filteredExams = filteredExams.filter(exam => exam.name.includes(filterForm.name))
    }
    
    if (filterForm.status) {
      filteredExams = filteredExams.filter(exam => exam.status === filterForm.status)
    }
    
    total.value = filteredExams.length
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    examList.value = filteredExams.slice(start, end)
    
    loading.value = false
  }, 500)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadExamList()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.name = ''
  filterForm.status = ''
  handleSearch()
}

// 处理标签页切换
const handleTabChange = () => {
  currentPage.value = 1
  loadExamList()
}

// 处理页码变化
const handleCurrentChange = () => {
  loadExamList()
}

// 处理每页数量变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadExamList()
}

// 处理行点击
const handleRowClick = (row) => {
  router.push(`/dashboard/exam-detail/${row.id}`)
}

// 处理创建考试
const handleCreateExam = () => {
  router.push('/dashboard/exam-management')
}

// 处理编辑考试
const handleEdit = (row) => {
  router.push(`/dashboard/exam-management?id=${row.id}`)
}

// 处理参加考试
const handleTakeExam = (row) => {
  router.push(`/take-exam/${row.id}`)
}

// 处理监考
const handleMonitor = (row) => {
  router.push(`/dashboard/exam-management?id=${row.id}&monitor=true`)
}

// 处理阅卷
const handleGrade = (row) => {
  router.push(`/dashboard/marking-papers?examId=${row.id}`)
}

// 处理查看成绩
const handleViewResult = (row) => {
  router.push(`/dashboard/results?examId=${row.id}`)
}

// 处理删除考试
const handleDelete = (row) => {
  showConfirm(`确定要删除考试"${row.name}"吗？`, '删除确认', 'warning')
    .then(() => {
      // 模拟删除请求
      setTimeout(() => {
        const index = examList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          examList.value.splice(index, 1)
        }
        showMessage('删除成功', 'success')
      }, 500)
    })
    .catch(() => {
      // 取消删除
    })
}

onMounted(() => {
  loadExamList()
})
</script>

<style scoped>
.exam-list-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }
}
</style>