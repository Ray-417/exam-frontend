<template>
  <div class="paper-management-container">
    <div class="page-header">
      <h2 class="page-title">试卷管理</h2>
      <div>
        <el-button type="primary" @click="handleCreatePaper('manual')">
          <el-icon><Edit /></el-icon>手动组卷
        </el-button>
        <el-button type="success" @click="handleCreatePaper('auto')">
          <el-icon><MagicStick /></el-icon>智能组卷
        </el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="paperList" border style="width: 100%">
      <el-table-column prop="name" label="试卷名称" min-width="180" />
      <el-table-column prop="questionCount" label="题目数量" width="100" />
      <el-table-column prop="totalScore" label="总分" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getPaperStatusType(scope.row.status)">
            {{ getPaperStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
          <el-button link type="primary" @click="handleEdit(scope.row)" v-if="scope.row.status !== 'used'">编辑</el-button>
          <el-button link type="success" @click="handleCreateExam(scope.row)">发布考试</el-button>
          <el-button link type="info" @click="handleCopy(scope.row)">复制</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status !== 'used'">删除</el-button>
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
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, MagicStick } from '@element-plus/icons-vue'

const router = useRouter()
const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const paperList = ref([])

// 模拟数据
const mockPapers = [
  {
    id: 1,
    name: 'Java程序设计期中试卷',
    questionCount: 25,
    totalScore: 100,
    createTime: '2023-10-15 14:30:22',
    creator: '张老师',
    status: 'unused'
  },
  {
    id: 2,
    name: '数据结构期末试卷',
    questionCount: 30,
    totalScore: 100,
    createTime: '2023-10-18 09:45:36',
    creator: '李老师',
    status: 'used'
  },
  {
    id: 3,
    name: '计算机网络模拟试卷',
    questionCount: 28,
    totalScore: 100,
    createTime: '2023-10-20 16:22:15',
    creator: '王老师',
    status: 'unused'
  },
  {
    id: 4,
    name: '操作系统期中试卷',
    questionCount: 22,
    totalScore: 100,
    createTime: '2023-10-22 11:10:48',
    creator: '赵老师',
    status: 'unused'
  },
  {
    id: 5,
    name: '数据库原理期末试卷',
    questionCount: 26,
    totalScore: 100,
    createTime: '2023-10-25 15:35:27',
    creator: '钱老师',
    status: 'used'
  }
]

// 获取试卷状态类型
const getPaperStatusType = (status) => {
  switch (status) {
    case 'unused':
      return 'info'
    case 'used':
      return 'success'
    default:
      return ''
  }
}

// 获取试卷状态文本
const getPaperStatusText = (status) => {
  switch (status) {
    case 'unused':
      return '未使用'
    case 'used':
      return '已使用'
    default:
      return '未知'
  }
}

// 加载试卷列表
const loadPaperList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    total.value = mockPapers.length
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    paperList.value = mockPapers.slice(start, end)
    
    loading.value = false
  }, 500)
}

// 处理页码变化
const handleCurrentChange = () => {
  loadPaperList()
}

// 处理每页数量变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadPaperList()
}

// 处理创建试卷
const handleCreatePaper = (type) => {
  // 实际项目中应该跳转到创建试卷页面
  showMessage(`${type === 'manual' ? '手动' : '智能'}组卷功能待实现`, 'info')
}

// 处理预览试卷
const handlePreview = (row) => {
  // 实际项目中应该打开预览对话框或跳转到预览页面
  showMessage(`预览试卷ID: ${row.id}`, 'info')
}

// 处理编辑试卷
const handleEdit = (row) => {
  // 实际项目中应该跳转到编辑试卷页面
  showMessage(`编辑试卷ID: ${row.id}`, 'info')
}

// 处理发布考试
const handleCreateExam = (row) => {
  router.push(`/dashboard/exam-management?paperId=${row.id}`)
}

// 处理复制试卷
const handleCopy = (row) => {
  showMessage(`复制试卷ID: ${row.id}`, 'info')
}

// 处理删除试卷
const handleDelete = (row) => {
  showConfirm(`确定要删除试卷"${row.name}"吗？`, '删除确认', 'warning')
    .then(() => {
      // 模拟删除请求
      setTimeout(() => {
        const index = paperList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          paperList.value.splice(index, 1)
        }
        showMessage('删除成功', 'success')
      }, 500)
    })
    .catch(() => {
      // 取消删除
    })
}

onMounted(() => {
  loadPaperList()
})
</script>

<style scoped>
.paper-management-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>