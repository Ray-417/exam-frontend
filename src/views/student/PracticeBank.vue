<template>
  <div class="question-bank-container">
    <div class="page-header">
      <h2 class="page-title">练习题库</h2>
    </div>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="题目类型">
          <el-select v-model="filterForm.type" placeholder="请选择题型" clearable>
            <el-option v-for="item in questionTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="请输入关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-table v-loading="loading" :data="questionList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="type" label="题型" width="120">
        <template #default="scope">
          {{ getQuestionTypeLabel(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="scope">
          <el-rate
            v-model="scope.row.difficulty"
            disabled
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handlePractice(scope.row)">开始练习</el-button>
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

const showMessage = inject('showMessage')

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const questionList = ref([])

const questionTypes = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '编程题', value: 'programming' }
]

const filterForm = reactive({
  type: '',
  keyword: ''
})

// 获取题型标签
const getQuestionTypeLabel = (type) => {
  const found = questionTypes.find(item => item.value === type)
  return found ? found.label : '未知'
}

// 模拟数据
const mockQuestions = [
  {
    id: 1,
    type: 'single_choice',
    content: 'Java中，下列哪个不是基本数据类型？',
    difficulty: 2,
    createTime: '2023-09-15 10:30:45'
  },
  {
    id: 2,
    type: 'multiple_choice',
    content: '下列哪些是Java中的集合类？',
    difficulty: 3,
    createTime: '2023-09-16 14:22:33'
  },
  {
    id: 3,
    type: 'true_false',
    content: 'Java中，String类是final的。',
    difficulty: 1,
    createTime: '2023-09-17 09:15:20'
  },
  {
    id: 4,
    type: 'fill_blank',
    content: 'Java中，用于处理输入输出的包是_____。',
    difficulty: 2,
    createTime: '2023-09-18 16:40:12'
  },
  {
    id: 5,
    type: 'short_answer',
    content: '简述Java中的多态性及其实现方式。',
    difficulty: 4,
    createTime: '2023-09-19 11:25:36'
  }
]

// 加载题目列表
const loadQuestionList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 根据筛选条件过滤
    let filteredQuestions = [...mockQuestions]
    
    if (filterForm.type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === filterForm.type)
    }
    
    if (filterForm.keyword) {
      filteredQuestions = filteredQuestions.filter(q => q.content.includes(filterForm.keyword))
    }
    
    total.value = filteredQuestions.length
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    questionList.value = filteredQuestions.slice(start, end)
    
    loading.value = false
  }, 500)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadQuestionList()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.type = ''
  filterForm.keyword = ''
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = () => {
  loadQuestionList()
}

// 处理每页数量变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadQuestionList()
}

// 处理开始练习
const handlePractice = (row) => {
  showMessage(`开始练习题目ID: ${row.id}`, 'info')
}

onMounted(() => {
  loadQuestionList()
})
</script>

<style scoped>
.question-bank-container {
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
