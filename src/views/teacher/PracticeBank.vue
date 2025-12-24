<template>
  <div class="question-bank-container">
    <div class="page-header">
      <h2 class="page-title">练题题库管理</h2>
      <el-button type="primary" @click="handleAddQuestion">
        <el-icon><Plus /></el-icon>添加题目
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="demo-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="题目列表" name="list">
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
          <el-table-column prop="uploader" label="上传者" width="120">
             <template #default="scope">
                {{ scope.row.uploader || '老师' }}
             </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane label="待审核题目" name="audit">
         <template #label>
            <span class="custom-tabs-label">
              <span>待审核题目</span>
              <el-badge :value="auditCount" class="item" v-if="auditCount > 0" type="danger" style="margin-left: 5px; vertical-align: super;" />
            </span>
          </template>
         <el-table v-loading="loading" :data="auditList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="type" label="题型" width="120">
            <template #default="scope">
              {{ getQuestionTypeLabel(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
          <el-table-column prop="uploader" label="上传学生" width="120" />
          <el-table-column prop="createTime" label="上传时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button link type="success" @click="handleApprove(scope.row)">通过</el-button>
              <el-button link type="warning" @click="handleReject(scope.row)">驳回</el-button>
              <el-button link type="primary" @click="handlePreview(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

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

    <!-- Add/Edit Dialog -->
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
import { ref, reactive, onMounted, inject, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import QuestionFormDialog from '@/components/QuestionFormDialog.vue'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, auditQuestion } from '@/api/teacher'

const showMessage = inject('showMessage')
const showConfirm = inject('showConfirm')

const loading = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const questionList = ref([])
const auditList = ref([])
const activeTab = ref('list')
const auditCount = ref(0)

const dialogVisible = ref(false)
const previewVisible = ref(false)
const dialogType = ref('add')
const currentQuestionData = ref({})
const currentQuestion = ref(null)

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

// 加载题目列表
const loadQuestionList = async () => {
  loading.value = true
  try {
      const params = {
          page: currentPage.value,
          size: pageSize.value,
          ...filterForm
      }
      
      if (activeTab.value === 'list') {
          params.status = 'approved'
          const res = await getQuestions(params)
          questionList.value = res.list || []
          total.value = res.total || 0
      } else {
          // Audit list
          params.status = 'pending'
          const res = await getQuestions(params)
          auditList.value = res.list || []
          total.value = res.total || 0
          auditCount.value = res.total || 0
      }
  } catch (error) {
      console.error(error)
      questionList.value = []
      auditList.value = []
  } finally {
      loading.value = false
  }
}

const handleTabChange = () => {
    currentPage.value = 1
    loadQuestionList()
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

// 处理添加题目
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
      loadQuestionList()
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
          loadQuestionList()
      } catch (error) {
          console.error(error)
          showMessage('删除失败', 'error')
      }
    })
    .catch(() => {})
}

const handleApprove = (row) => {
    showConfirm('确定通过该题目吗？', '审核', 'success')
    .then(async () => {
        try {
            await auditQuestion(row.id, { status: 'approved' })
            showMessage('审核通过', 'success')
            loadQuestionList()
        } catch (error) {
            console.error(error)
            showMessage('操作失败', 'error')
        }
    })
    .catch(() => {})
}

const handleReject = (row) => {
    showConfirm('确定驳回该题目吗？', '审核', 'warning')
    .then(async () => {
        try {
            await auditQuestion(row.id, { status: 'rejected' })
            showMessage('已驳回', 'success')
            loadQuestionList()
        } catch (error) {
            console.error(error)
            showMessage('操作失败', 'error')
        }
    })
    .catch(() => {})
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
</style>