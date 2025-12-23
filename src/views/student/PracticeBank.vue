<template>
  <div class="practice-bank-container">
    <div class="page-header">
      <h2 class="page-title">练题题库</h2>
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon> 上传题目
      </el-button>
    </div>
    
    <!-- Advanced Filter -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
         <span class="filter-label">题目类型：</span>
         <el-radio-group v-model="filterForm.type" size="default" @change="handleSearch">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button v-for="item in questionTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
         </el-radio-group>
      </div>
      <div class="filter-row" style="margin-top: 15px;">
         <span class="filter-label">难度筛选：</span>
         <el-rate v-model="filterForm.difficulty" @change="handleSearch" clearable />
         <span class="filter-label" style="margin-left: 30px;">学科搜索：</span>
         <el-input v-model="filterForm.subject" placeholder="例如: Java" clearable style="width: 200px" @keyup.enter="handleSearch" />
         <span class="filter-label" style="margin-left: 20px;">关键词：</span>
         <el-input v-model="filterForm.keyword" placeholder="题目内容关键词" clearable style="width: 250px" @keyup.enter="handleSearch" />
         <el-button type="primary" @click="handleSearch" style="margin-left: 20px;">查询</el-button>
         <el-button @click="resetFilter">重置</el-button>
      </div>
    </el-card>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-table v-loading="loading" :data="questionList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="type" label="题型" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getTypeTagEffect(scope.row.type)">{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="学科" width="150" align="center" />
          <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
          <el-table-column prop="difficulty" label="难度" width="150" align="center">
            <template #default="scope">
              <el-rate v-model="scope.row.difficulty" disabled text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleViewDetail(scope.row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
              <el-button link type="warning" @click="handleAddToCollection(scope.row)">
                <el-icon><Plus /></el-icon> 添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    
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

    <!-- Question Detail Modal -->
    <el-dialog v-model="detailDialogVisible" title="题目详情" width="50%" custom-class="detail-dialog">
       <div v-if="currentQuestion" class="detail-content">
          <div class="detail-header-refined">
             <div class="dh-left">
                <span class="dh-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
                <span class="dh-subject">{{ currentQuestion.subject }}</span>
             </div>
             <div class="dh-right">
                <span class="dh-label">难度：</span>
                <el-rate v-model="currentQuestion.difficulty" disabled text-color="#ff9900" />
             </div>
          </div>
          
          <div class="detail-body">
             <p class="q-text">{{ currentQuestion.content }}</p>
             
             <div v-if="['single_choice', 'multiple_choice'].includes(currentQuestion.type)" class="q-options">
                <div v-for="opt in parseOptions(currentQuestion.options)" :key="opt.key" class="option-item">
                   <span class="opt-key">{{ opt.key }}.</span>
                   <span class="opt-val">{{ opt.value }}</span>
                </div>
             </div>
             
             <el-divider border-style="dashed" />
             
             <div class="q-answer-section">
                <p><strong>参考答案：</strong><span class="text-success">{{ currentQuestion.answer }}</span></p>
                <div class="analysis-box">
                   <strong>解析：</strong>
                   <p>{{ currentQuestion.analysis || '暂无解析' }}</p>
                </div>
             </div>
          </div>
       </div>
       <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleAddToCollection(currentQuestion)">
             <el-icon><Plus /></el-icon> 添加到题集
          </el-button>
       </template>
    </el-dialog>

    <!-- Add to Collection Modal -->
    <el-dialog v-model="collectionDialogVisible" title="添加到题集" width="400px">
       <div class="collection-select-list">
          <div 
             v-for="c in userCollections" 
             :key="c.id" 
             class="collection-select-item"
             :class="{ 'is-added': c.hasQuestion }"
             @click="toggleCollection(c)"
          >
             <div class="c-info">
                <span class="c-name">{{ c.name }}</span>
                <span class="c-count">{{ c.count }}题</span>
             </div>
             <div class="c-status">
                <el-icon v-if="c.hasQuestion" color="#67C23A"><Check /></el-icon>
                <el-icon v-else class="add-icon"><Plus /></el-icon>
             </div>
          </div>
       </div>
    </el-dialog>

    <!-- Upload Question Dialog -->
    <el-dialog v-model="uploadDialogVisible" title="上传题目 (需审核)" width="600px">
      <el-form :model="uploadForm" ref="uploadFormRef" :rules="uploadRules" label-width="80px">
        <el-form-item label="学科" prop="subject">
          <el-input v-model="uploadForm.subject" placeholder="例如: Java" />
        </el-form-item>
        <el-form-item label="题型" prop="type">
          <el-select v-model="uploadForm.type" placeholder="请选择题型" @change="handleTypeChange" style="width: 100%">
            <el-option v-for="t in questionTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-rate v-model="uploadForm.difficulty" />
        </el-form-item>
        <el-form-item label="题目内容" prop="content">
          <el-input v-model="uploadForm.content" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- Options for Choice Questions -->
        <div v-if="['single_choice', 'multiple_choice'].includes(uploadForm.type)">
           <el-divider content-position="left">选项设置</el-divider>
           <div v-for="(opt, index) in uploadForm.options" :key="index" class="option-row">
              <el-input v-model="opt.key" placeholder="选项" style="width: 60px; margin-right: 10px;" />
              <el-input v-model="opt.value" placeholder="内容" style="flex: 1" />
              <el-button link type="danger" @click="removeOption(index)" v-if="uploadForm.options.length > 2">
                <el-icon><Delete /></el-icon>
              </el-button>
           </div>
           <el-button link type="primary" @click="addOption" style="margin-top: 5px">+ 添加选项</el-button>
        </div>

        <el-form-item label="参考答案" prop="answer" style="margin-top: 20px">
          <el-input v-if="!['single_choice', 'multiple_choice', 'true_false'].includes(uploadForm.type)" v-model="uploadForm.answer" type="textarea" />
          
          <el-radio-group v-if="uploadForm.type === 'single_choice'" v-model="uploadForm.answer">
             <el-radio v-for="opt in uploadForm.options" :key="opt.key" :label="opt.key">{{ opt.key }}</el-radio>
          </el-radio-group>
          
          <el-checkbox-group v-if="uploadForm.type === 'multiple_choice'" v-model="uploadForm.answerArr">
             <el-checkbox v-for="opt in uploadForm.options" :key="opt.key" :label="opt.key">{{ opt.key }}</el-checkbox>
          </el-checkbox-group>

          <el-radio-group v-if="uploadForm.type === 'true_false'" v-model="uploadForm.answer">
             <el-radio label="T">正确</el-radio>
             <el-radio label="F">错误</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="解析" prop="analysis">
          <el-input v-model="uploadForm.analysis" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">提交审核</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { Upload, Plus, View, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const showMessage = inject('showMessage') || ElMessage

// --- State ---
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const questionList = ref([])
const detailDialogVisible = ref(false)
const currentQuestion = ref(null)

// Upload State
const uploadDialogVisible = ref(false)
const uploadFormRef = ref(null)
const uploadForm = reactive({
  subject: '',
  type: 'single_choice',
  difficulty: 3,
  content: '',
  options: [{key: 'A', value: ''}, {key: 'B', value: ''}, {key: 'C', value: ''}, {key: 'D', value: ''}],
  answer: '',
  answerArr: [], // for multiple choice
  analysis: ''
})

// Collection State
const collectionDialogVisible = ref(false)
const userCollections = ref([])
const targetQuestionId = ref(null)

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
  difficulty: 0,
  subject: '',
  keyword: ''
})

const uploadRules = {
  subject: [{ required: true, message: '请输入学科', trigger: 'blur' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入或选择答案', trigger: 'change' }]
}

// --- Mock Data ---
const mockPublicQuestions = [
  { id: 201, type: 'single_choice', subject: 'Java', difficulty: 2, content: 'Java中Runnable接口的方法是？', options: '[{"key":"A","value":"start"},{"key":"B","value":"run"},{"key":"C","value":"stop"}]', answer: 'B', analysis: 'Runnable只有一个run方法' },
  { id: 202, type: 'short_answer', subject: '操作系统', difficulty: 4, content: '什么是死锁？产生死锁的四个必要条件是什么？', options: null, answer: '略', analysis: '互斥、占有且等待、不可抢占、循环等待' },
  { id: 203, type: 'true_false', subject: '计算机网络', difficulty: 1, content: 'TCP是面向连接的协议', options: null, answer: 'T', analysis: '正确' }
]

const mockUserCollections = [
   { id: 1, name: '我的错题集', isDefault: true, count: 12, hasQuestion: true },
   { id: 2, name: 'Java重点复习', isDefault: false, count: 5, hasQuestion: false }
]

// --- Methods ---

const getQuestionTypeLabel = (type) => {
  const t = questionTypes.find(i => i.value === type)
  return t ? t.label : type
}

const getTypeTagEffect = (type) => {
    return 'light'
}

const parseOptions = (jsonStr) => {
   if (!jsonStr) return []
   try {
      return JSON.parse(jsonStr)
   } catch (e) {
      return []
   }
}

const loadQuestionList = () => {
  loading.value = true
  setTimeout(() => {
    let list = [...mockPublicQuestions]
    if (filterForm.type) list = list.filter(q => q.type === filterForm.type)
    if (filterForm.difficulty > 0) list = list.filter(q => q.difficulty === filterForm.difficulty)
    if (filterForm.subject) list = list.filter(q => q.subject.toLowerCase().includes(filterForm.subject.toLowerCase()))
    if (filterForm.keyword) list = list.filter(q => q.content.includes(filterForm.keyword))
    
    total.value = list.length
    questionList.value = list.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
    loading.value = false
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadQuestionList()
}

const resetFilter = () => {
  filterForm.type = ''
  filterForm.difficulty = 0
  filterForm.subject = ''
  filterForm.keyword = ''
  handleSearch()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadQuestionList()
}
const handleCurrentChange = () => {
  loadQuestionList()
}

// Detail Logic
const handleViewDetail = (row) => {
    currentQuestion.value = row
    detailDialogVisible.value = true
}

// Upload Logic
const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleTypeChange = () => {
   uploadForm.answer = ''
   uploadForm.answerArr = []
}

const addOption = () => {
   const nextKey = String.fromCharCode(65 + uploadForm.options.length)
   uploadForm.options.push({ key: nextKey, value: '' })
}

const removeOption = (index) => {
   uploadForm.options.splice(index, 1)
   uploadForm.options.forEach((opt, idx) => {
      opt.key = String.fromCharCode(65 + idx)
   })
}

const submitUpload = () => {
   uploadFormRef.value.validate((valid) => {
      if (valid) {
         if (uploadForm.type === 'multiple_choice') {
            uploadForm.answer = uploadForm.answerArr.sort().join(',')
         }
         showMessage('提交成功，等待老师审核', 'success')
         uploadDialogVisible.value = false
         uploadForm.content = ''
         uploadForm.analysis = ''
         uploadForm.answer = ''
         uploadForm.answerArr = []
      }
   })
}

// Collection Logic
const handleAddToCollection = (row) => {
   targetQuestionId.value = row.id
   // Mock API call to get collections with status for this question
   // GET /api/student/collections?questionId=row.id
   
   // Randomly assigning state for demo
   const demoCollections = mockUserCollections.map(c => ({
       ...c,
       hasQuestion: Math.random() > 0.5
   }))
   userCollections.value = demoCollections
   
   collectionDialogVisible.value = true
}

const toggleCollection = (collection) => {
    if (collection.hasQuestion) return // Already added
    
    // Call API to add
    // POST /api/student/collections/{id}/questions { questionId: targetQuestionId.value }
    
    collection.hasQuestion = true
    collection.count++ // Optimistic update
    showMessage(`已添加到 "${collection.name}"`, 'success')
}

onMounted(() => {
  loadQuestionList()
})

</script>

<style scoped>
.practice-bank-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #E4E7ED;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.filter-label {
    font-weight: bold;
    color: #606266;
    margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-success { color: #67C23A; }

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* Detail Modal Styles */
.detail-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #EBEEF5;
}
.detail-subject {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}
.q-text {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
}
.option-item {
    margin-bottom: 10px;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
}
.opt-key {
    font-weight: bold;
    margin-right: 10px;
    color: #409EFF;
}
.analysis-box {
    margin-top: 15px;
    padding: 15px;
    background-color: #f0f9eb;
    border-radius: 4px;
    color: #67C23A;
}

/* Collection Select List */
.collection-select-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 5px 2px;
}
.collection-select-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.collection-select-item:hover {
    border-color: #409EFF;
    background-color: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.collection-select-item.is-added {
    cursor: default;
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    box-shadow: none;
    transform: none;
}
.c-name {
    font-weight: bold;
    font-size: 16px;
    color: #303133;
}
.c-count {
    font-size: 13px;
    color: #909399;
    margin-left: 15px;
}
.c-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}
.add-icon {
    font-weight: bold;
    color: #409EFF;
}
</style>
