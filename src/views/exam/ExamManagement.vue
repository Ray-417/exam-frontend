<template>
  <div class="exam-management-container">
    <div class="page-header">
      <h2 class="page-title">考试管理</h2>
      <el-button type="primary" @click="handleCreateExam">
        <el-icon><Plus /></el-icon>创建考试
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
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
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 考试表格组件
const ExamTable = {
  props: {
    status: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const router = useRouter()
    const showMessage = inject('showMessage')
    const showConfirm = inject('showConfirm')
    
    // 获取状态标签类型
    const getStatusType = (status) => {
      switch (status) {
        case 'upcoming':
          return 'info'
        case 'ongoing':
          return 'success'
        case 'finished':
          return 'warning'
        default:
          return ''
      }
    }
    
    // 获取状态标签文本
    const getStatusText = (status) => {
      switch (status) {
        case 'upcoming':
          return '未开始'
        case 'ongoing':
          return '进行中'
        case 'finished':
          return '已结束'
        default:
          return '未知'
      }
    }
    
    // 查看考试详情
    const handleViewDetail = (row) => {
      router.push(`/dashboard/exam-detail/${row.id}`)
    }
    
    // 管理考生
    const handleManageStudents = (row) => {
      showMessage('管理考生功能待实现', 'info')
    }
    
    // 在线监考
    const handleProctor = (row) => {
      showMessage('在线监考功能待实现', 'info')
    }
    
    // 批阅试卷
    const handleGrade = (row) => {
      router.push(`/dashboard/grading/${row.id}`)
    }
    
    // 查看成绩
    const handleViewResults = (row) => {
      router.push(`/dashboard/results/${row.id}`)
    }
    
    // 删除考试
    const handleDelete = (row) => {
      showConfirm(`确定要删除考试"${row.name}"吗？`, '删除确认', 'warning')
        .then(() => {
          // 模拟删除请求
          setTimeout(() => {
            showMessage('删除成功', 'success')
            emit('refresh')
          }, 500)
        })
        .catch(() => {
          // 取消删除
        })
    }
    
    return {
      getStatusType,
      getStatusText,
      handleViewDetail,
      handleManageStudents,
      handleProctor,
      handleGrade,
      handleViewResults,
      handleDelete
    }
  },
  template: `
    <el-table :data="data.filter(item => item.status === status)" border style="width: 100%">
      <el-table-column prop="name" label="考试名称" min-width="180" />
      <el-table-column prop="subject" label="科目" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="duration" label="考试时长" width="100">
        <template #default="scope">
          {{ scope.row.duration }}分钟
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
          <el-button link type="primary" @click="handleManageStudents(scope.row)">管理考生</el-button>
          <el-button link type="success" @click="handleProctor(scope.row)" v-if="scope.row.status === 'ongoing'">监考</el-button>
          <el-button link type="warning" @click="handleGrade(scope.row)" v-if="scope.row.status === 'finished'">批阅</el-button>
          <el-button link type="info" @click="handleViewResults(scope.row)" v-if="scope.row.status === 'finished'">成绩</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status === 'upcoming'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  `
}

const router = useRouter()
const activeTab = ref('upcoming')
const examList = ref([])

// 模拟数据
const mockExams = [
  {
    id: 1,
    name: 'Java程序设计期中考试',
    subject: 'Java',
    startTime: '2023-11-15 14:30:00',
    duration: 120,
    status: 'upcoming'
  },
  {
    id: 2,
    name: '数据结构期末考试',
    subject: '数据结构',
    startTime: '2023-11-10 09:00:00',
    duration: 150,
    status: 'ongoing'
  },
  {
    id: 3,
    name: '计算机网络模拟考试',
    subject: '计算机网络',
    startTime: '2023-10-20 16:00:00',
    duration: 90,
    status: 'finished'
  },
  {
    id: 4,
    name: '操作系统期中考试',
    subject: '操作系统',
    startTime: '2023-11-22 10:00:00',
    duration: 120,
    status: 'upcoming'
  },
  {
    id: 5,
    name: '数据库原理期末考试',
    subject: '数据库',
    startTime: '2023-10-25 14:00:00',
    duration: 120,
    status: 'finished'
  }
]

// 加载考试列表
const loadExamList = () => {
  // 模拟API请求
  setTimeout(() => {
    examList.value = mockExams
  }, 500)
}

// 处理标签页点击
const handleTabClick = () => {
  // 可以在这里根据标签页加载不同状态的考试
  loadExamList()
}

// 处理创建考试
const handleCreateExam = () => {
  router.push('/dashboard/paper-management')
}

onMounted(() => {
  loadExamList()
})
</script>

<style scoped>
.exam-management-container {
  padding: 20px;
}
</style>