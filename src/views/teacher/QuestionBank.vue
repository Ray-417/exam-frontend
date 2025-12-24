<template>
  <div class="question-bank-container">
    <div class="page-header">
      <h2 class="page-title">考题管理</h2>
      <div class="header-actions">
        <el-button type="success" @click="handleImport">
          <el-icon><Upload /></el-icon>批量导入
        </el-button>
        <el-button type="primary" @click="handleAddQuestion">
          <el-icon><Plus /></el-icon>添加题目
        </el-button>
      </div>
    </div>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="题目类型">
          <el-select v-model="filterForm.type" placeholder="全部题型" clearable style="width: 150px">
            <el-option v-for="item in questionTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filterForm.difficulty" placeholder="全部难度" clearable style="width: 150px">
            <el-option label="简单 (1-2星)" :value="1" />
            <el-option label="中等 (3星)" :value="3" />
            <el-option label="困难 (4-5星)" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="题目内容/知识点" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="questionList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="type" label="题型" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getQuestionTypeTag(scope.row.type)">{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="题目内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="knowledgePoints" label="知识点" width="150">
          <template #default="scope">
          <el-tag v-for="tag in scope.row.knowledgePoints" :key="tag" size="small" class="mr-1">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度" width="120" align="center">
        <template #default="scope">
          <el-rate
            v-model="scope.row.difficulty"
            disabled
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- Add/Edit Dialog using shared component -->
    <QuestionFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogType"
      :initial-data="currentQuestionData"
      :submitting="submitting"
      @submit="handleQuestionSubmit"
    />

    <!-- Preview Dialog -->
    <el-dialog v-model="previewVisible" title="题目预览" width="500px">
      <div v-if="currentQuestion" class="preview-content">
        <div class="preview-type">
          <el-tag>{{ getQuestionTypeLabel(currentQuestion.type) }}</el-tag>
          <el-rate v-model="currentQuestion.difficulty" disabled text-color="#ff9900" class="ml-2" />
        </div>
        <div class="preview-body mt-2">
          <strong>题目：</strong> {{ currentQuestion.content }}
        </div>
        <div v-if="currentQuestion.options && currentQuestion.options.length" class="preview-options mt-2">
          <div v-for="opt in currentQuestion.options" :key="opt.key" class="preview-option">
            {{ opt.key }}. {{ opt.value }}
          </div>
        </div>
        <el-divider />
        <div class="preview-answer">
          <strong>正确答案：</strong> {{ currentQuestion.answer }}
        </div>
        <div class="preview-analysis mt-1">
          <strong>解析：</strong> {{ currentQuestion.analysis || '暂无解析' }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { Plus, Upload, Delete } from '@element-plus/icons-vue'
import QuestionFormDialog from '@/components/QuestionFormDialog.vue'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/api/teacher'

const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const loading = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const questionList = ref([])

const dialogVisible = ref(false)
const previewVisible = ref(false)
const dialogType = ref('add')
const currentQuestion = ref(null) // For preview
const currentQuestionData = ref({}) // For edit form

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
  difficulty: '',
  keyword: ''
})

const getQuestionTypeLabel = (type) => {
  const found = questionTypes.find(item => item.value === type)
  return found ? found.label : '未知'
}

const getQuestionTypeTag = (type) => {
  const map = {
    'single_choice': '',
    'multiple_choice': 'success',
    'true_false': 'warning',
    'fill_blank': 'info',
    'short_answer': 'danger',
    'programming': ''
  }
  return map[type] || ''
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }
    const res = await getQuestions(params)
    // Adapt response if needed, assuming API returns { list: [], total: 0 } or { data: { list: [], total: 0 } }
    // Based on request.js interceptor, it returns res.data directly if code===200
    if (res && res.list) {
        questionList.value = res.list
        total.value = res.total
    } else {
        questionList.value = []
        total.value = 0
    }
  } catch (error) {
    console.error('Load data failed:', error)
    questionList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetFilter = () => {
  filterForm.type = ''
  filterForm.difficulty = ''
  filterForm.keyword = ''
  handleSearch()
}

const handleAddQuestion = () => {
  dialogType.value = 'add'
  currentQuestionData.value = {}
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentQuestionData.value = { ...row }
  dialogVisible.value = true
}

const handleQuestionSubmit = async (formData) => {
  submitting.value = true
  try {
    if (dialogType.value === 'add') {
      await createQuestion(formData)
      showMessage('添加成功', 'success')
    } else {
      await updateQuestion(currentQuestionData.value.id, formData)
      showMessage('修改成功', 'success')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
    showMessage('操作失败', 'error')
  } finally {
    submitting.value = false
  }
}

const handlePreview = (row) => {
  currentQuestion.value = row
  previewVisible.value = true
}

const handleDelete = (row) => {
  showConfirm('确定要删除该题目吗？', '提示', 'warning')
    .then(async () => {
      try {
        await deleteQuestion(row.id)
        showMessage('删除成功', 'success')
        loadData()
      } catch (error) {
        console.error(error)
        showMessage('删除失败', 'error')
      }
    })
    .catch(() => {})
}

const handleImport = () => {
  showMessage('批量导入功能待后端接口就绪', 'info')
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.question-bank-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.filter-card {
  margin-bottom: 20px;
}

.mr-1 {
  margin-right: 5px;
}

.ml-2 {
  margin-left: 10px;
}

.mt-2 {
  margin-top: 10px;
}

.mt-1 {
  margin-top: 5px;
}

.preview-content {
  padding: 10px;
}

.preview-option {
  padding: 5px 0;
}
</style>
