<template>
  <div class="my-errors-container">
    <div class="page-header">
      <h2 class="page-title">我的错题本</h2>
    </div>

    <el-tabs v-model="activeTab" class="error-tabs">
      <!-- 错题列表与纠错 -->
      <el-tab-pane label="错题列表" name="list">
        <el-card class="filter-card">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="题目类型">
              <el-select v-model="filterForm.type" placeholder="全部题型" clearable style="width: 150px">
                <el-option v-for="item in questionTypes" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="filterForm.keyword" placeholder="搜索题目内容" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <div v-loading="loading">
          <el-empty v-if="errorList.length === 0 && !loading" description="暂无错题，继续加油！" />
          
          <div v-else class="error-list">
            <el-card v-for="item in errorList" :key="item.id" class="error-item-card" shadow="hover">
              <div class="error-item-header">
                <el-tag :type="getQuestionTypeTag(item.question.type)">{{ getQuestionTypeLabel(item.question.type) }}</el-tag>
                <span class="error-time">上次错误时间: {{ item.lastErrorTime }}</span>
                <span class="error-count">错误次数: <span class="count-num">{{ item.errorCount }}</span></span>
              </div>
              
              <div class="question-content">
                {{ item.question.content }}
              </div>
              
              <div class="error-actions">
                <el-button type="primary" size="small" @click="handleRedo(item)">重做题目</el-button>
                <el-button type="info" size="small" @click="handleViewDetail(item)">查看解析</el-button>
                <el-button type="danger" size="small" link @click="handleRemove(item)">移出错题本</el-button>
              </div>
            </el-card>
          </div>
          
          <div class="pagination-container" v-if="total > 0">
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
      </el-tab-pane>

      <!-- 错题分析 -->
      <el-tab-pane label="错题分析" name="analysis">
        <div class="analysis-container">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>错题总览</span>
                  </div>
                </template>
                <div class="overview-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ totalErrors }}</div>
                    <div class="stat-label">累计错题数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value success">{{ solvedErrors }}</div>
                    <div class="stat-label">已攻克</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value warning">{{ solvingRate }}%</div>
                    <div class="stat-label">攻克率</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="16">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>题型错误分布</span>
                  </div>
                </template>
                <div class="type-distribution">
                  <div v-for="type in typeStats" :key="type.label" class="progress-item">
                    <span class="progress-label">{{ type.label }}</span>
                    <el-progress :percentage="type.percentage" :color="type.color" :format="() => type.count + '题'" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="24">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>薄弱知识点TOP5</span>
                  </div>
                </template>
                <el-table :data="weakPoints" style="width: 100%">
                  <el-table-column prop="name" label="知识点" />
                  <el-table-column prop="errorCount" label="错误次数" width="120" />
                  <el-table-column label="掌握程度" width="300">
                    <template #default="scope">
                      <el-progress :percentage="scope.row.mastery" :status="scope.row.mastery < 60 ? 'exception' : 'warning'" />
                    </template>
                  </el-table-column>
                  <el-table-column label="建议" show-overflow-tooltip>
                    <template #default="scope">
                      {{ scope.row.suggestion }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 重做/查看题目对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'redo' ? '重做题目' : '题目解析'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentError" class="question-detail">
        <div class="question-type-badge">
          <el-tag size="small">{{ getQuestionTypeLabel(currentError.question.type) }}</el-tag>
          <span class="difficulty">难度: <el-rate v-model="currentError.question.difficulty" disabled size="small" /></span>
        </div>
        
        <div class="detail-content">
          {{ currentError.question.content }}
        </div>
        
        <!-- 选项区域 (单选/多选) -->
        <div v-if="['single_choice', 'multiple_choice'].includes(currentError.question.type)" class="options-area">
          <div 
            v-for="opt in currentError.question.options" 
            :key="opt.key" 
            class="option-row"
            :class="{ 
              'selected': isSelected(opt.key),
              'correct': dialogMode === 'view' && isCorrectOption(opt.key),
              'wrong': dialogMode === 'view' && isWrongOption(opt.key)
            }"
            @click="dialogMode === 'redo' && handleSelectOption(opt.key)"
          >
            <span class="option-key">{{ opt.key }}.</span>
            <span class="option-val">{{ opt.value }}</span>
            <el-icon v-if="dialogMode === 'view' && isCorrectOption(opt.key)" class="status-icon success"><Check /></el-icon>
            <el-icon v-if="dialogMode === 'view' && isWrongOption(opt.key)" class="status-icon error"><Close /></el-icon>
          </div>
        </div>
        
        <!-- 其他题型简单输入框模拟 -->
        <div v-else class="text-answer-area">
          <el-input
            v-if="dialogMode === 'redo'"
            v-model="userAnswer"
            type="textarea"
            :rows="4"
            placeholder="请输入你的答案"
          />
          <div v-else class="answer-display">
            <p><strong>你的答案：</strong>{{ currentError.myWrongAnswer }}</p>
          </div>
        </div>

        <!-- 解析区域 (仅查看模式或提交后显示) -->
        <div v-if="dialogMode === 'view' || showResult" class="analysis-area">
          <el-divider />
          <p class="correct-answer"><strong>正确答案：</strong>{{ currentError.question.answer }}</p>
          <div class="analysis-text">
            <p><strong>解析：</strong></p>
            <p>{{ currentError.question.analysis || '暂无解析' }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="dialogMode === 'redo' && !showResult" 
            type="primary" 
            @click="handleSubmitAnswer"
          >
            提交答案
          </el-button>
          <el-button 
            v-if="dialogMode === 'redo' && showResult" 
            type="primary" 
            @click="dialogVisible = false"
          >
            完成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

const showMessage = inject('showMessage')

const activeTab = ref('list')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const errorList = ref([])

// 筛选表单
const filterForm = reactive({
  type: '',
  keyword: ''
})

// 对话框状态
const dialogVisible = ref(false)
const dialogMode = ref('redo') // 'redo' or 'view'
const currentError = ref(null)
const userAnswer = ref('') // 用户当前输入的答案 (single string or array for multiple)
const showResult = ref(false) // 是否显示结果（重做提交后）

const questionTypes = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '编程题', value: 'programming' }
]

// 模拟数据
const mockErrorData = [
  {
    id: 1,
    question: {
      id: 101,
      type: 'single_choice',
      difficulty: 2,
      content: 'Java中，int类型的默认值是？',
      options: [
        { key: 'A', value: '0' },
        { key: 'B', value: '1' },
        { key: 'C', value: 'null' },
        { key: 'D', value: 'undefined' }
      ],
      answer: 'A',
      analysis: '基本数据类型int的成员变量默认值是0。局部变量必须初始化。'
    },
    myWrongAnswer: 'C',
    errorCount: 3,
    lastErrorTime: '2023-12-01 10:30'
  },
  {
    id: 2,
    question: {
      id: 102,
      type: 'multiple_choice',
      difficulty: 3,
      content: '下列哪些属于Java的访问修饰符？',
      options: [
        { key: 'A', value: 'public' },
        { key: 'B', value: 'protected' },
        { key: 'C', value: 'friend' },
        { key: 'D', value: 'private' }
      ],
      answer: 'ABD',
      analysis: 'Java的访问修饰符包括public, protected, private以及默认（default）。friend是C++的关键字。'
    },
    myWrongAnswer: ['A', 'B'],
    errorCount: 2,
    lastErrorTime: '2023-12-05 14:20'
  },
  {
    id: 3,
    question: {
      id: 103,
      type: 'true_false',
      difficulty: 1,
      content: 'Java接口中可以定义构造方法。',
      answer: '错', // 或者 false
      analysis: '接口中不能定义构造方法，因为接口不能被实例化。'
    },
    myWrongAnswer: '对',
    errorCount: 5,
    lastErrorTime: '2023-12-07 09:15'
  }
]

// 模拟分析数据
const totalErrors = ref(156)
const solvedErrors = ref(89)
const solvingRate = computed(() => Math.round((solvedErrors.value / totalErrors.value) * 100))

const typeStats = ref([
  { label: '单选题', count: 45, percentage: 60, color: '#409eff' },
  { label: '多选题', count: 30, percentage: 40, color: '#e6a23c' },
  { label: '判断题', count: 25, percentage: 33, color: '#67c23a' },
  { label: '编程题', count: 56, percentage: 75, color: '#f56c6c' }
])

const weakPoints = ref([
  { name: '多线程并发', errorCount: 42, mastery: 35, suggestion: '建议系统学习JUC包相关类，重点掌握锁机制和线程池。' },
  { name: '集合框架源码', errorCount: 28, mastery: 45, suggestion: '建议阅读ArrayList和HashMap源码，理解扩容机制。' },
  { name: 'JVM内存模型', errorCount: 25, mastery: 50, suggestion: '重点区分堆、栈、方法区的数据存储。' },
  { name: 'IO流', errorCount: 15, mastery: 65, suggestion: '多练习文件读写操作，区分字节流和字符流。' },
  { name: '异常处理', errorCount: 12, mastery: 75, suggestion: '注意finally块的执行顺序。' }
])

// 辅助函数
const getQuestionTypeLabel = (type) => {
  const found = questionTypes.find(item => item.value === type)
  return found ? found.label : type
}

const getQuestionTypeTag = (type) => {
  const map = {
    'single_choice': '',
    'multiple_choice': 'warning',
    'true_false': 'success',
    'fill_blank': 'info',
    'short_answer': 'danger',
    'programming': 'danger'
  }
  return map[type] || ''
}

// 加载数据
const loadErrorList = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟筛选
    let result = [...mockErrorData]
    if (filterForm.type) {
      result = result.filter(item => item.question.type === filterForm.type)
    }
    if (filterForm.keyword) {
      result = result.filter(item => item.question.content.includes(filterForm.keyword))
    }
    
    total.value = result.length
    // 模拟分页
    const start = (currentPage.value - 1) * pageSize.value
    errorList.value = result.slice(start, start + pageSize.value)
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  currentPage.value = 1
  loadErrorList()
}

const resetFilter = () => {
  filterForm.type = ''
  filterForm.keyword = ''
  handleSearch()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadErrorList()
}

const handleCurrentChange = () => {
  loadErrorList()
}

// 操作处理
const handleRemove = (item) => {
  // 实际应该调用API
  const index = errorList.value.findIndex(e => e.id === item.id)
  if (index > -1) {
    errorList.value.splice(index, 1)
    showMessage('已移出错题本', 'success')
  }
}

const handleViewDetail = (item) => {
  currentError.value = item
  dialogMode.value = 'view'
  userAnswer.value = item.myWrongAnswer // 显示上次的错误答案
  showResult.value = true // 直接显示解析
  dialogVisible.value = true
}

const handleRedo = (item) => {
  currentError.value = item
  dialogMode.value = 'redo'
  
  // 重置用户答案
  if (item.question.type === 'multiple_choice') {
    userAnswer.value = []
  } else {
    userAnswer.value = ''
  }
  
  showResult.value = false
  dialogVisible.value = true
}

// 答题相关逻辑
const handleSelectOption = (key) => {
  if (dialogMode.value !== 'redo' || showResult.value) return
  
  const type = currentError.value.question.type
  if (type === 'single_choice') {
    userAnswer.value = key
  } else if (type === 'multiple_choice') {
    const idx = userAnswer.value.indexOf(key)
    if (idx > -1) {
      userAnswer.value.splice(idx, 1)
    } else {
      userAnswer.value.push(key)
      userAnswer.value.sort() // 保持顺序
    }
  }
}

const isSelected = (key) => {
  if (Array.isArray(userAnswer.value)) {
    return userAnswer.value.includes(key)
  }
  return userAnswer.value === key
}

const isCorrectOption = (key) => {
  const correct = currentError.value.question.answer
  return correct.includes(key)
}

const isWrongOption = (key) => {
  // 在查看模式下，如果用户选了这个key，但它不是正确答案，标红
  // 或者在redo模式提交后
  const myAnswer = dialogMode.value === 'view' ? currentError.value.myWrongAnswer : userAnswer.value
  
  if (Array.isArray(myAnswer)) {
    return myAnswer.includes(key) && !currentError.value.question.answer.includes(key)
  }
  return myAnswer === key && !currentError.value.question.answer.includes(key)
}

const handleSubmitAnswer = () => {
  if (!userAnswer.value || (Array.isArray(userAnswer.value) && userAnswer.value.length === 0)) {
    showMessage('请先作答', 'warning')
    return
  }
  
  showResult.value = true
  
  // 简单判断对错
  let isCorrect = false
  const correctAns = currentError.value.question.answer
  
  if (Array.isArray(userAnswer.value)) {
    isCorrect = userAnswer.value.join('') === correctAns
  } else {
    isCorrect = userAnswer.value === correctAns
  }
  
  if (isCorrect) {
    showMessage('回答正确！太棒了！', 'success')
    // 这里可以调用API减少错误次数或标记已掌握
  } else {
    showMessage('回答错误，请查看解析。', 'error')
  }
}

onMounted(() => {
  loadErrorList()
})
</script>

<style scoped>
.my-errors-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error-item-card {
  transition: all 0.3s;
}

.error-item-card:hover {
  transform: translateY(-2px);
}

.error-item-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.error-time {
  margin-left: auto;
}

.error-count {
  font-weight: bold;
}

.count-num {
  color: #f56c6c;
  font-size: 16px;
}

.question-content {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Analysis Styles */
.analysis-container {
  padding: 10px 0;
}

.analysis-card {
  height: 100%;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-value.success { color: #67c23a; }
.stat-value.warning { color: #e6a23c; }

.stat-label {
  color: #909399;
  font-size: 14px;
}

.type-distribution {
  padding: 10px;
}

.progress-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.progress-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.progress-item .el-progress {
  flex: 1;
}

/* Dialog Question Styles */
.question-detail {
  padding: 10px;
}

.question-type-badge {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.detail-content {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-row:hover {
  background-color: #f5f7fa;
}

.option-row.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
}

.option-row.correct {
  border-color: #67c23a;
  background-color: #f0f9eb;
  color: #67c23a;
}

.option-row.wrong {
  border-color: #f56c6c;
  background-color: #fef0f0;
  color: #f56c6c;
}

.option-key {
  font-weight: bold;
  margin-right: 10px;
}

.option-val {
  flex: 1;
}

.status-icon {
  font-size: 18px;
}

.status-icon.success { color: #67c23a; }
.status-icon.error { color: #f56c6c; }

.analysis-area {
  margin-top: 20px;
  background-color: #fafafa;
  padding: 15px;
  border-radius: 4px;
}

.correct-answer {
  color: #67c23a;
  margin-bottom: 10px;
}

.analysis-text {
  color: #606266;
  line-height: 1.6;
}
</style>
