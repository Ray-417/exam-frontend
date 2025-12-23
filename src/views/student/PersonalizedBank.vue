<template>
  <div class="personalized-bank-container">
    <div class="page-header">
      <h2 class="page-title">个性化题库</h2>
    </div>

    <el-row :gutter="20" class="full-height-content">
      <!-- Left Sidebar: Collection List -->
      <el-col :span="6" class="sidebar-col">
        <el-card class="box-card full-height-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>我的题集</span>
              <div class="header-actions">
                 <el-button v-if="!isCollectionManageMode" type="primary" plain size="small" @click="isCollectionManageMode = true">管理</el-button>
                 <el-button v-else type="success" size="small" @click="isCollectionManageMode = false">完成</el-button>
                 <el-button link type="primary" @click="handleAddCollection">
                   <el-icon><Plus /></el-icon>
                 </el-button>
              </div>
            </div>
          </template>
          <div class="collection-list">
            <div 
              v-for="item in collectionList" 
              :key="item.id" 
              class="collection-item"
              :class="{ active: currentCollectionId === item.id }"
              @click="handleSelectCollection(item)"
            >
              <div class="collection-info">
                <span class="collection-name">{{ item.name }}</span>
                <span class="collection-count">{{ item.count }}题</span>
              </div>
              <div class="collection-actions" v-if="isCollectionManageMode && !item.isDefault">
                <el-button link type="danger" size="small" @click.stop="handleDeleteCollection(item)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right Main: Question List & Self-Test -->
      <el-col :span="18" class="main-col">
        <el-card class="box-card full-height-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="current-col-title">{{ currentCollectionName }}</span>
              <div class="header-actions">
                 <el-button v-if="isManageMode" type="danger" plain @click="handleBatchDelete" :disabled="selectedRows.length === 0">
                    批量移除
                 </el-button>
                 <el-button v-if="isManageMode" type="warning" plain @click="isManageMode = false">退出</el-button>
                 <el-button v-else type="primary" plain @click="isManageMode = true">管理</el-button>
                 
                <el-button type="primary" @click="handleStartSelfTest">
                  <el-icon><VideoPlay /></el-icon> 开始自测
                </el-button>
              </div>
            </div>
          </template>

          <!-- Filter Bar (Redesigned) -->
          <div class="filter-container">
             <div class="filter-row">
                <span class="filter-label">题目类型：</span>
                <el-radio-group v-model="filterForm.type" size="default" @change="loadQuestions">
                   <el-radio-button label="">全部</el-radio-button>
                   <el-radio-button v-for="item in questionTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
                </el-radio-group>
             </div>
             <div class="filter-row mt-15">
                <span class="filter-label">学科搜索：</span>
                <el-input v-model="filterForm.subject" placeholder="学科名称" clearable style="width: 200px" @keyup.enter="loadQuestions" />
                <el-button type="primary" @click="loadQuestions" style="margin-left: 15px">查询</el-button>
             </div>
          </div>

          <!-- Question Table -->
          <el-table 
             ref="tableRef"
             :data="questionList" 
             style="width: 100%" 
             height="calc(100vh - 350px)" 
             v-loading="loading"
             @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="isManageMode" type="selection" width="55" />
            
            <el-table-column prop="type" label="题型" width="100" align="center">
               <template #default="scope">
                  <el-tag effect="plain" type="info">{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="content" label="题目预览" show-overflow-tooltip />
            <el-table-column prop="subject" label="学科" width="120" align="center" />
            <el-table-column prop="difficulty" label="难度" width="150" align="center">
               <template #default="scope">
                 <el-rate v-model="scope.row.difficulty" disabled text-color="#ff9900" />
               </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handleViewDetail(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>

           <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="loadQuestions"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Question Detail Modal -->
    <el-dialog v-model="detailDialogVisible" title="题目详情" width="600px" custom-class="detail-dialog">
       <div v-if="currentQuestion" class="detail-content">
          <div class="detail-header">
             <el-tag size="large" effect="dark">{{ getQuestionTypeLabel(currentQuestion.type) }}</el-tag>
             <span class="detail-subject">{{ currentQuestion.subject }}</span>
             <el-rate v-model="currentQuestion.difficulty" disabled text-color="#ff9900" />
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
          <el-button type="danger" @click="handleRemoveQuestion(currentQuestion)">
             <el-icon><Delete /></el-icon> 移出题集
          </el-button>
       </template>
    </el-dialog>

    <!-- Create Collection Dialog -->
    <el-dialog v-model="createDialogVisible" title="新建题集" width="400px">
      <el-form :model="createForm">
        <el-form-item label="题集名称" required>
          <el-input v-model="createForm.name" placeholder="请输入题集名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateCollection">确定</el-button>
      </template>
    </el-dialog>

    <!-- Self Test Setup Dialog -->
    <el-dialog v-model="testSetupVisible" title="生成自测卷" width="400px">
      <el-form :model="testSetupForm" label-width="100px">
        <el-form-item label="测试模式">
          <el-radio-group v-model="testSetupForm.mode">
            <el-radio label="all">全部题目 ({{ currentCollectionCount }})</el-radio>
            <el-radio label="random">随机抽取</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="抽取数量" v-if="testSetupForm.mode === 'random'">
          <el-input-number v-model="testSetupForm.count" :min="1" :max="currentCollectionCount" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testSetupVisible = false">取消</el-button>
        <el-button type="primary" @click="startQuiz">开始作答</el-button>
      </template>
    </el-dialog>

    <!-- Quiz Overlay (Full Screen) -->
    <el-dialog v-model="quizVisible" fullscreen :show-close="false" class="quiz-fullscreen-dialog">
      <div class="quiz-container">
         <!-- Left: Navigation & Timer -->
         <div class="quiz-sidebar">
            <div class="quiz-timer-card">
               <div class="timer-label">考试用时</div>
               <div class="timer-value">{{ formatTime(timer) }}</div>
            </div>
            
            <div class="quiz-nav-card">
               <div class="nav-title">题目导航</div>
               <div class="nav-grid">
                  <div 
                     v-for="(q, index) in quizQuestions" 
                     :key="q.id" 
                     class="nav-item"
                     :class="{ 'answered': userAnswers[q.id], 'active': currentQuizIndex === index }"
                     @click="scrollToQuestion(index)"
                  >
                     {{ index + 1 }}
                  </div>
               </div>
            </div>
            
            <div class="quiz-actions">
               <el-button type="primary" class="action-btn" @click="submitQuiz">提交试卷</el-button>
               <el-button class="action-btn" @click="quitQuiz">退出自测</el-button>
            </div>
         </div>
         
         <!-- Right: Question Content -->
         <div class="quiz-main">
            <div class="quiz-header-bar">
               <h2>{{ currentCollectionName }} - 自测</h2>
               <div class="progress-info">
                  已答 {{ answeredCount }} / {{ quizQuestions.length }}
               </div>
            </div>
            
            <div class="quiz-scroll-area" id="quiz-scroll-area">
               <div v-for="(q, index) in quizQuestions" :key="q.id" class="quiz-question-card" :id="'q-' + index">
                  <div class="q-header">
                     <span class="q-no">{{ index + 1 }}</span>
                     <span class="q-type-badge">{{ getQuestionTypeLabel(q.type) }}</span>
                  </div>
                  <div class="q-content">{{ q.content }}</div>
                  
                  <!-- Options -->
                  <div class="q-input-area">
                     <!-- Single Choice -->
                     <div v-if="q.type === 'single_choice'" class="choice-group">
                        <div 
                           v-for="opt in parseOptions(q.options)" 
                           :key="opt.key" 
                           class="choice-item"
                           :class="{ selected: userAnswers[q.id] === opt.key }"
                           @click="userAnswers[q.id] = opt.key"
                        >
                           <span class="choice-key">{{ opt.key }}</span>
                           <span class="choice-val">{{ opt.value }}</span>
                        </div>
                     </div>
                     
                     <!-- Multiple Choice -->
                     <div v-else-if="q.type === 'multiple_choice'" class="choice-group">
                        <div 
                           v-for="opt in parseOptions(q.options)" 
                           :key="opt.key" 
                           class="choice-item"
                           :class="{ selected: userAnswers[q.id]?.includes(opt.key) }"
                           @click="toggleMultipleChoice(q.id, opt.key)"
                        >
                           <span class="choice-key">{{ opt.key }}</span>
                           <span class="choice-val">{{ opt.value }}</span>
                        </div>
                     </div>
                     
                     <!-- True/False -->
                     <div v-else-if="q.type === 'true_false'" class="choice-group horizontal">
                        <div 
                           class="choice-item"
                           :class="{ selected: userAnswers[q.id] === 'T' }"
                           @click="userAnswers[q.id] = 'T'"
                        >
                           <span class="choice-val">正确</span>
                        </div>
                        <div 
                           class="choice-item"
                           :class="{ selected: userAnswers[q.id] === 'F' }"
                           @click="userAnswers[q.id] = 'F'"
                        >
                           <span class="choice-val">错误</span>
                        </div>
                     </div>
                     
                     <!-- Text Input -->
                     <div v-else>
                        <el-input 
                           type="textarea" 
                           v-model="userAnswers[q.id]" 
                           placeholder="请输入您的答案..." 
                           :rows="4" 
                           resize="none"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </el-dialog>

    <!-- Quiz Result Dialog -->
    <el-dialog v-model="resultVisible" title="自测结果" width="700px">
       <div class="result-summary">
          <div class="score-circle">
             <span class="score">{{ quizResult.score }}</span>
             <span class="total">/ {{ quizResult.totalScore }}</span>
          </div>
          <div class="stat-items">
             <div class="stat-item">
                <span class="label">正确率</span>
                <span class="val">{{ quizResult.accuracy }}%</span>
             </div>
             <div class="stat-item">
                <span class="label">用时</span>
                <span class="val">{{ formatTime(timer) }}</span>
             </div>
          </div>
       </div>
       <el-divider />
       <div class="result-detail-list">
          <div v-for="(q, index) in quizQuestions" :key="q.id" class="result-card">
             <div class="rc-header">
                <span class="rc-index">{{ index + 1 }}.</span>
                <el-tag size="small" :type="quizResult.details[q.id]?.isCorrect ? 'success' : 'danger'">
                   {{ quizResult.details[q.id]?.isCorrect ? '正确' : '错误' }}
                </el-tag>
                <span class="rc-type">{{ getQuestionTypeLabel(q.type) }}</span>
             </div>
             <div class="rc-content">{{ q.content }}</div>
             <div class="rc-comparison">
                <div class="rc-row">
                   <span class="label">您的答案：</span>
                   <span class="val" :class="quizResult.details[q.id]?.isCorrect ? 'text-success' : 'text-danger'">
                      {{ formatAnswer(userAnswers[q.id]) }}
                   </span>
                </div>
                <div class="rc-row">
                   <span class="label">正确答案：</span>
                   <span class="val text-success">{{ q.answer }}</span>
                </div>
             </div>
             <div class="rc-analysis">
                <strong>解析：</strong> {{ q.analysis || '暂无解析' }}
             </div>
          </div>
       </div>
       <template #footer>
          <el-button type="primary" @click="resultVisible = false">关闭</el-button>
       </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, inject } from 'vue'
import { Plus, Delete, VideoPlay, Timer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const showMessage = inject('showMessage') || ElMessage

// --- State ---
const collectionList = ref([])
const currentCollectionId = ref(null)
const isCollectionManageMode = ref(false) // New: Collection Manage Mode
const questionList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailDialogVisible = ref(false)
const currentQuestion = ref(null)

const isManageMode = ref(false) // Question Manage Mode
const selectedRows = ref([])
const tableRef = ref(null)

const createDialogVisible = ref(false)
const createForm = reactive({ name: '' })

const filterForm = reactive({ type: '', subject: '' })

// Quiz State
const testSetupVisible = ref(false)
const testSetupForm = reactive({ mode: 'all', count: 10 })
const quizVisible = ref(false)
const quizQuestions = ref([])
const userAnswers = ref({})
const currentQuizIndex = ref(0)
const timer = ref(0)
let timerInterval = null
const resultVisible = ref(false)
const quizResult = reactive({ score: 0, totalScore: 0, accuracy: 0, details: {} })

// --- Computed ---
const currentCollectionName = computed(() => {
   const c = collectionList.value.find(i => i.id === currentCollectionId.value)
   return c ? c.name : '未选择题集'
})

const currentCollectionCount = computed(() => {
   const c = collectionList.value.find(i => i.id === currentCollectionId.value)
   return c ? c.count : 0
})

const answeredCount = computed(() => {
   let count = 0
   for (const key in userAnswers.value) {
      const ans = userAnswers.value[key]
      if (Array.isArray(ans) ? ans.length > 0 : !!ans) {
         count++
      }
   }
   return count
})

const questionTypes = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '编程题', value: 'programming' }
]

// --- Mock Data Helpers ---
const mockCollections = [
  { id: 1, name: '我的错题集', count: 12, isDefault: true },
  { id: 2, name: 'Java重点复习', count: 5, isDefault: false },
  { id: 3, name: '数据结构收藏', count: 8, isDefault: false }
]

const mockQuestionsData = [
  { id: 101, type: 'single_choice', content: 'Java中int占用几个字节？', options: '[{"key":"A","value":"2"},{"key":"B","value":"4"}]', answer: 'B', analysis: 'Java基本类型int占4字节', difficulty: 1, subject: 'Java' },
  { id: 102, type: 'true_false', content: 'List是线程安全的吗？', options: null, answer: 'F', analysis: 'ArrayList等常用实现非线程安全', difficulty: 2, subject: 'Java' },
  { id: 103, type: 'short_answer', content: '简述MVC模式', options: null, answer: 'Model-View-Controller', analysis: '略', difficulty: 3, subject: '软工' },
  { id: 104, type: 'multiple_choice', content: '以下属于Java集合框架的接口有？', options: '[{"key":"A","value":"List"},{"key":"B","value":"Map"},{"key":"C","value":"Thread"},{"key":"D","value":"Set"}]', answer: 'A,B,D', analysis: 'Thread是类不是集合接口', difficulty: 2, subject: 'Java' }
]

// --- Methods ---

const getQuestionTypeLabel = (type) => {
  const t = questionTypes.find(i => i.value === type)
  return t ? t.label : type
}

const parseOptions = (jsonStr) => {
   if (!jsonStr) return []
   try {
      return JSON.parse(jsonStr)
   } catch (e) {
      return []
   }
}

const formatAnswer = (ans) => {
   if (Array.isArray(ans)) return ans.join(', ')
   return ans || '未作答'
}

const formatTime = (seconds) => {
   const m = Math.floor(seconds / 60)
   const s = seconds % 60
   return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// API Calls (Simulated)
const loadCollections = async () => {
   collectionList.value = mockCollections
   if (collectionList.value.length > 0 && !currentCollectionId.value) {
      handleSelectCollection(collectionList.value[0])
   }
}

const loadQuestions = async () => {
   if (!currentCollectionId.value) return
   loading.value = true
   
   setTimeout(() => {
      let list = [...mockQuestionsData]
      if (filterForm.type) list = list.filter(q => q.type === filterForm.type)
      if (filterForm.subject) list = list.filter(q => q.subject.includes(filterForm.subject))
      
      const c = collectionList.value.find(i => i.id === currentCollectionId.value)
      if (c && c.count > list.length) {
         while(list.length < c.count) list.push({...list[0], id: list.length + 100})
      }
      
      total.value = list.length
      questionList.value = list.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
      loading.value = false
   }, 300)
}

// Actions
const handleSelectCollection = (item) => {
   if (isCollectionManageMode.value) return // Prevent selection in manage mode if desired, or allow it
   currentCollectionId.value = item.id
   currentPage.value = 1
   isManageMode.value = false
   selectedRows.value = []
   loadQuestions()
}

const handleAddCollection = () => {
   createForm.name = ''
   createDialogVisible.value = true
}

const resetFilter = () => {
   filterForm.type = ''
   filterForm.subject = ''
   filterForm.difficulty = 0
   loadQuestions()
}

const submitCreateCollection = () => {
   if (!createForm.name) return
   const newId = Math.max(...collectionList.value.map(i => i.id)) + 1
   collectionList.value.push({ id: newId, name: createForm.name, count: 0, isDefault: false })
   createDialogVisible.value = false
   showMessage('创建成功', 'success')
}

const handleDeleteCollection = (item) => {
   ElMessageBox.confirm(`确定删除题集"${item.name}"吗?`, '提示', { type: 'warning' })
     .then(() => {
        collectionList.value = collectionList.value.filter(i => i.id !== item.id)
        if (currentCollectionId.value === item.id) {
           currentCollectionId.value = null
           questionList.value = []
           if (collectionList.value.length > 0) handleSelectCollection(collectionList.value[0])
        }
        showMessage('删除成功', 'success')
     })
}

// Detail & Remove Logic
const handleViewDetail = (row) => {
    currentQuestion.value = row
    detailDialogVisible.value = true
}

const handleRemoveQuestion = (row) => {
    ElMessageBox.confirm('确定将该题移出此合集吗?', '确认移除', { 
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'warning' 
    })
      .then(() => {
         questionList.value = questionList.value.filter(q => q.id !== row.id)
         const c = collectionList.value.find(i => i.id === currentCollectionId.value)
         if(c) c.count--
         detailDialogVisible.value = false
         showMessage('移除成功', 'success')
      })
}

const handleSelectionChange = (val) => {
    selectedRows.value = val
}

const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    ElMessageBox.confirm(`确定将选中的 ${selectedRows.value.length} 道题目移出此合集吗?`, '批量移除', {
        type: 'warning',
        confirmButtonText: '确定移除'
    }).then(() => {
        const ids = selectedRows.value.map(r => r.id)
        questionList.value = questionList.value.filter(q => !ids.includes(q.id))
        const c = collectionList.value.find(i => i.id === currentCollectionId.value)
        if(c) c.count -= ids.length
        selectedRows.value = []
        showMessage('批量移除成功', 'success')
    })
}

// Self Test Logic
const handleStartSelfTest = () => {
   if (currentCollectionCount.value === 0) {
      showMessage('该题集暂无题目', 'warning')
      return
   }
   testSetupForm.mode = 'all'
   testSetupForm.count = Math.min(10, currentCollectionCount.value)
   testSetupVisible.value = true
}

const startQuiz = () => {
   const count = testSetupForm.mode === 'all' ? currentCollectionCount.value : testSetupForm.count
   let questions = [...mockQuestionsData] 
   
   quizQuestions.value = questions.slice(0, count).map(q => ({...q})) 
   userAnswers.value = {}
   quizQuestions.value.forEach(q => {
      if(q.type === 'multiple_choice') userAnswers.value[q.id] = []
   })
   
   testSetupVisible.value = false
   quizVisible.value = true
   
   timer.value = 0
   if (timerInterval) clearInterval(timerInterval)
   timerInterval = setInterval(() => { timer.value++ }, 1000)
}

const toggleMultipleChoice = (qid, key) => {
   const arr = userAnswers.value[qid] || []
   if (arr.includes(key)) {
      userAnswers.value[qid] = arr.filter(k => k !== key)
   } else {
      userAnswers.value[qid] = [...arr, key]
   }
}

const scrollToQuestion = (index) => {
   currentQuizIndex.value = index
   const el = document.getElementById(`q-${index}`)
   if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const quitQuiz = () => {
   ElMessageBox.confirm('退出后不保存当前进度，确定退出吗？', '提示', { type: 'warning' })
     .then(() => {
        quizVisible.value = false
        clearInterval(timerInterval)
     })
}

const submitQuiz = () => {
   ElMessageBox.confirm('确定提交试卷吗？', '提示', { type: 'info' })
     .then(() => {
        clearInterval(timerInterval)
        calculateResult()
        quizVisible.value = false
        resultVisible.value = true
     })
}

const calculateResult = () => {
   let score = 0
   let correctCount = 0
   const totalQ = quizQuestions.value.length
   const details = {}
   
   quizQuestions.value.forEach(q => {
      let isCorrect = false
      const userAns = userAnswers.value[q.id]
      
      if (q.type === 'single_choice' || q.type === 'true_false') {
         isCorrect = userAns === q.answer
      } else if (q.type === 'multiple_choice') {
         const sortedUser = [...(userAns || [])].sort().join(',')
         isCorrect = sortedUser === q.answer 
      } else {
         isCorrect = !!userAns
      }
      
      if (isCorrect) {
         score += 10 
         correctCount++
      }
      
      details[q.id] = { isCorrect }
   })
   
   quizResult.score = score
   quizResult.totalScore = totalQ * 10
   quizResult.accuracy = Math.round((correctCount / totalQ) * 100)
   quizResult.details = details
}

onMounted(() => {
   loadCollections()
})

onUnmounted(() => {
   if (timerInterval) clearInterval(timerInterval)
})

</script>

<style scoped>
.personalized-bank-container {
  padding: 20px;
  height: calc(100vh - 84px);
  box-sizing: border-box;
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
.full-height-content {
  height: calc(100% - 50px);
}
.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.full-height-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-col-title {
    font-size: 18px;
    font-weight: bold;
}

/* Sidebar Styles */
.collection-list {
  flex: 1;
  overflow-y: auto;
}
.collection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 5px;
  transition: background-color 0.2s;
}
.collection-item:hover {
  background-color: #f5f7fa;
}
.collection-item.active {
  background-color: #ecf5ff;
  color: #409EFF;
}
.collection-info {
  display: flex;
  flex-direction: column;
}
.collection-name {
  font-weight: 500;
}
.collection-count {
  font-size: 12px;
  color: #909399;
}

/* Main Content Styles */
.filter-container {
  margin-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
}
.filter-row {
    display: flex;
    align-items: center;
}
.mt-15 { margin-top: 15px; }
.filter-label {
    font-weight: bold;
    color: #606266;
    margin-right: 10px;
}

/* Global Modal Enhancements */
:deep(.el-dialog__body) {
    padding: 30px 25px !important;
}

/* Detail Modal Styles Refined */
.detail-header-refined {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #EBEEF5;
}
.dh-left {
   display: flex;
   align-items: center;
   gap: 12px;
}
.dh-right {
   display: flex;
   align-items: center;
   gap: 10px;
}
.dh-type {
   background-color: #409EFF;
   color: white;
   padding: 4px 12px;
   border-radius: 20px;
   font-size: 13px;
   font-weight: 500;
}
.dh-subject {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
}
.dh-label {
   font-size: 14px;
   color: #909399;
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
.text-success { color: #67C23A; }
.text-danger { color: #F56C6C; }

/* Quiz Fullscreen Styles Enhanced */
.quiz-container {
   display: flex;
   height: 100vh;
   background-color: #f0f2f5;
}
.quiz-sidebar {
   width: 300px;
   background-color: white;
   border-right: 1px solid #e6e6e6;
   display: flex;
   flex-direction: column;
   padding: 20px;
   box-shadow: 2px 0 8px rgba(0,0,0,0.05);
   z-index: 10;
}
.quiz-timer-card {
   background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
   border: 1px solid #d9ecff;
   border-radius: 12px;
   padding: 20px;
   text-align: center;
   margin-bottom: 25px;
   box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}
.timer-label { font-size: 13px; color: #909399; letter-spacing: 1px; }
.timer-value { font-size: 32px; font-weight: bold; color: #409EFF; margin-top: 5px; font-family: monospace; }

.quiz-nav-card {
   flex: 1;
   overflow-y: auto;
   padding-right: 5px;
}
.nav-title { font-weight: bold; margin-bottom: 15px; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }
.nav-grid {
   display: grid;
   grid-template-columns: repeat(5, 1fr);
   gap: 10px;
}
.nav-item {
   width: 40px;
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: center;
   border: 1px solid #dcdfe6;
   border-radius: 50%; /* Circle */
   cursor: pointer;
   font-size: 14px;
   transition: all 0.2s;
   color: #606266;
   background-color: #fff;
}
.nav-item:hover { border-color: #409EFF; color: #409EFF; transform: translateY(-2px); }
.nav-item.active { background-color: #ecf5ff; border-color: #409EFF; color: #409EFF; font-weight: bold; box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); }
.nav-item.answered { background-color: #409EFF; border-color: #409EFF; color: white; }
.nav-item.active.answered { background-color: #66b1ff; border-color: #66b1ff; }

.quiz-actions {
   margin-top: 20px;
   display: flex;
   flex-direction: column;
   gap: 12px;
}
.action-btn { width: 100%; margin-left: 0 !important; height: 40px; font-size: 15px; }

.quiz-main {
   flex: 1;
   display: flex;
   flex-direction: column;
   padding: 0;
   overflow: hidden;
}
.quiz-header-bar {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 15px 40px;
   background: white;
   box-shadow: 0 2px 4px rgba(0,0,0,0.05);
   z-index: 5;
}
.quiz-header-bar h2 { margin: 0; font-size: 20px; color: #303133; }
.progress-info {
   font-size: 14px;
   color: #606266;
   background: #f0f2f5;
   padding: 5px 15px;
   border-radius: 15px;
}
.quiz-scroll-area {
   flex: 1;
   overflow-y: auto;
   padding: 30px 40px;
   scroll-behavior: smooth;
}
.quiz-question-card {
   background: white;
   padding: 40px;
   border-radius: 12px;
   box-shadow: 0 4px 16px rgba(0,0,0,0.08);
   margin-bottom: 40px;
   transition: transform 0.3s;
}
/* Highlight current question slightly if needed, but spacing is enough */
.q-header { display: flex; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f0f2f5; padding-bottom: 15px; }
.q-no { font-size: 28px; font-weight: 900; color: #409EFF; margin-right: 15px; font-style: italic; }
.q-type-badge { background: #ecf5ff; color: #409EFF; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold; }
.q-content { font-size: 18px; line-height: 1.8; margin-bottom: 30px; color: #303133; }

.choice-group { display: flex; flex-direction: column; gap: 15px; }
.choice-item {
   display: flex;
   align-items: center;
   padding: 15px 20px;
   border: 2px solid #e4e7ed;
   border-radius: 8px;
   cursor: pointer;
   transition: all 0.2s;
}
.choice-item:hover { border-color: #b3d8ff; background-color: #f0f9eb; }
.choice-item.selected { border-color: #409EFF; background-color: #ecf5ff; }
.choice-key { font-weight: bold; width: 35px; height: 35px; border-radius: 50%; background: #f0f2f5; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #606266; font-size: 16px; }
.choice-item.selected .choice-key { background: #409EFF; color: white; }
.choice-val { font-size: 16px; color: #606266; flex: 1; }
.choice-item.selected .choice-val { color: #409EFF; font-weight: 500; }

.choice-group.horizontal { flex-direction: row; gap: 30px; }
.choice-group.horizontal .choice-item { flex: 1; justify-content: center; padding: 20px; }

/* Result Dialog Styles */
.result-summary { display: flex; align-items: center; justify-content: space-around; padding: 20px; }
.score-circle { 
   width: 120px; height: 120px; border-radius: 50%; border: 4px solid #409EFF; 
   display: flex; align-items: center; justify-content: center; flex-direction: column;
}
.score-circle .score { font-size: 32px; font-weight: bold; color: #409EFF; }
.score-circle .total { font-size: 12px; color: #909399; }
.stat-items { display: flex; gap: 40px; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-item .label { color: #909399; font-size: 14px; }
.stat-item .val { font-size: 24px; font-weight: bold; color: #303133; margin-top: 5px; }

.result-detail-list { max-height: 500px; overflow-y: auto; padding: 10px; }
.result-card { background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
.rc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.rc-index { font-weight: bold; }
.rc-content { margin-bottom: 10px; color: #606266; }
.rc-comparison { background: white; padding: 10px; border-radius: 4px; font-size: 14px; }
.rc-row { margin-bottom: 5px; display: flex; }
.rc-row .label { width: 80px; color: #909399; }
.rc-analysis { margin-top: 10px; font-size: 13px; color: #E6A23C; }
</style>
