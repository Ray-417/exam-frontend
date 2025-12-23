<template>
  <div class="exam-list-container">
    <div class="page-header">
      <h2 class="page-title">我的考试</h2>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="学科名称">
          <el-input v-model="filterForm.subject" placeholder="例如: 高等数学" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filterForm.semester" placeholder="选择学期" clearable style="width: 160px">
             <el-option label="全部学期" value="" />
             <el-option label="2023-2024 秋季" value="2023_autumn" />
             <el-option label="2023-2024 春季" value="2023_spring" />
             <el-option label="2022-2023 秋季" value="2022_autumn" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 160px">
            <el-option label="全部状态" value="" />
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="待批阅" value="pending_grading" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table
      v-loading="loading"
      :data="examList"
      border
      style="width: 100%; margin-top: 20px;"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="考试名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="subject" label="学科" width="150" align="center" />
      <el-table-column label="考试时间" width="320" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.startTime) }} 至 {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="100" align="center" />
      <el-table-column prop="semester" label="学期" width="150" align="center">
          <template #default="scope">{{ getSemesterLabel(scope.row.semester) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="150" align="center">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === 'in_progress'"
            type="primary" 
            size="small"
            @click.stop="handleTakeExam(scope.row)"
          >
            参加考试
          </el-button>
          <el-button 
            v-else-if="scope.row.status === 'completed'"
            link 
            type="primary" 
            size="small"
            @click.stop="handleViewResult(scope.row)"
          >
            查看成绩
          </el-button>
           <el-button 
            v-else-if="scope.row.status === 'pending_grading'"
            link 
            type="info" 
            size="small"
            @click.stop="handleViewInfo(scope.row)"
          >
            查看详情
          </el-button>
           <el-button 
            v-else
            link 
            type="info" 
            size="small"
            @click.stop="handleViewInfo(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadExamList"
      />
    </div>

    <!-- Exam Info Dialog (Not Started / Pending Grading / Completed) -->
    <el-dialog v-model="infoDialogVisible" title="考试详情" width="600px" custom-class="exam-info-dialog">
        <div v-if="currentExamInfo" class="exam-info-content">
            <h3 class="info-title">{{ currentExamInfo.name }}</h3>
            
            <el-descriptions :column="1" border size="large" class="info-desc">
                <el-descriptions-item label="学科">{{ currentExamInfo.subject }}</el-descriptions-item>
                <el-descriptions-item label="学期">{{ getSemesterLabel(currentExamInfo.semester) }}</el-descriptions-item>
                <el-descriptions-item label="考试时间">
                    {{ formatDate(currentExamInfo.startTime) }} <br/>至<br/> {{ formatDate(currentExamInfo.endTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="考试时长">{{ currentExamInfo.duration }} 分钟</el-descriptions-item>
                <el-descriptions-item label="当前状态">
                    <el-tag :type="getStatusType(currentExamInfo.status)" size="small">
                        {{ getStatusText(currentExamInfo.status) }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
            
            <div v-if="currentExamInfo.status === 'completed'" class="result-box">
                <div class="score-circle-lg">
                    <span class="sc-val">{{ currentExamInfo.score || 0 }}</span>
                    <span class="sc-label">最终得分</span>
                </div>
                <div class="result-meta">
                    <div class="rm-item">
                        <span class="rm-label">实际用时</span>
                        <span class="rm-val">{{ formatDuration(currentExamInfo.timeTaken) }}</span>
                    </div>
                </div>
            </div>
            
             <div v-if="currentExamInfo.status === 'pending_grading'" class="pending-box">
                 <el-result icon="info" title="正在批阅中" sub-title="请耐心等待老师批改试卷">
                    <template #extra>
                        <p>实际用时：{{ formatDuration(currentExamInfo.timeTaken) }}</p>
                    </template>
                 </el-result>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="infoDialogVisible = false">关闭</el-button>
                <el-button 
                    v-if="currentExamInfo?.status === 'in_progress'" 
                    type="primary" 
                    @click="startExamAction(currentExamInfo)"
                >
                    进入考试
                </el-button>
                <el-button 
                    v-if="currentExamInfo?.status === 'completed'" 
                    type="primary" 
                    plain
                    :disabled="!currentExamInfo.allowReview"
                    @click="handleViewPaper(currentExamInfo)"
                >
                    {{ currentExamInfo.allowReview ? '查看试卷' : '暂不可查看' }}
                </el-button>
            </div>
        </template>
    </el-dialog>

    <!-- Pre-Exam Check Dialog -->
    <el-dialog v-model="preExamDialogVisible" :show-close="false" width="600px" :close-on-click-modal="false">
        <div class="pre-exam-content">
             <div v-if="examToStart" class="pre-exam-info">
                <h3 class="pei-title">{{ examToStart.name }}</h3>
                <div class="pei-grid">
                    <div class="pei-item"><span class="label">学科：</span>{{ examToStart.subject }}</div>
                    <div class="pei-item"><span class="label">学期：</span>{{ getSemesterLabel(examToStart.semester) }}</div>
                    <div class="pei-item"><span class="label">时长：</span>{{ examToStart.duration }} 分钟</div>
                    <div class="pei-item"><span class="label">时间：</span>{{ formatDate(examToStart.startTime) }}</div>
                </div>
                <el-divider style="margin: 15px 0;" />
             </div>

            <el-alert
                type="warning"
                :closable="false"
                show-icon
                class="rule-alert"
            >
                <template #title>
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">考试规则与须知</div>
                </template>
                <template #default>
                    <div style="line-height: 1.8;">
                        <p>1. 考试期间请保持摄像头开启，系统将实时监控。</p>
                        <p>2. 禁止切屏，切屏超过3次将自动交卷。</p>
                        <p>3. 请确保网络环境稳定。</p>
                        <p>4. 考试开始后请点击“进入考试”按钮。</p>
                    </div>
                </template>
            </el-alert>
            
            <div class="camera-check-area">
                <div class="camera-preview-box">
                    <video ref="cameraVideoRef" autoplay playsinline muted class="camera-video"></video>
                    <div v-if="!isCameraReady" class="camera-overlay">
                        <el-icon class="camera-icon"><VideoCamera /></el-icon>
                        <p>摄像头未开启</p>
                    </div>
                </div>
                <div class="camera-status">
                    <el-tag :type="isCameraReady ? 'success' : 'danger'">
                        {{ isCameraReady ? '摄像头已就绪' : '未检测到摄像头' }}
                    </el-tag>
                </div>
            </div>
        </div>
        <template #footer>
            <el-button @click="preExamDialogVisible = false">取消</el-button>
            <el-button type="primary" :disabled="isCameraReady" @click="checkCamera">
                {{ isCameraReady ? '摄像头检测通过' : '开启摄像头检测' }}
            </el-button>
            <el-button type="success" :disabled="!isCameraReady" @click="realStartExam">
                进入考试
            </el-button>
        </template>
    </el-dialog>

    <!-- Exam Review Dialog (Read Only) -->
    <el-dialog v-model="examReviewVisible" fullscreen class="exam-review-dialog">
        <div class="exam-review-container" v-if="currentExamReview">
            <div class="review-header">
                <h2>{{ currentExamReview.name }} - 试卷详情</h2>
                <div class="rh-stats">
                    <el-tag type="success" size="large">得分：{{ currentExamReview.score }}</el-tag>
                    <el-button @click="examReviewVisible = false">返回</el-button>
                </div>
            </div>
            <div class="review-body">
                <div v-for="(q, idx) in examQuestions" :key="q.id" class="review-question-item">
                     <div class="rq-header">
                         <span class="rq-no">{{ idx + 1 }}.</span>
                         <el-tag size="small">{{ getQuestionTypeLabel(q.type) }}</el-tag>
                         <span class="rq-score">({{ q.score }}分)</span>
                         <el-tag 
                            size="small" 
                            :type="isReviewCorrect(q) ? 'success' : 'danger'"
                            class="rq-status"
                         >
                            {{ isReviewCorrect(q) ? '正确' : '错误' }}
                         </el-tag>
                     </div>
                     <div class="rq-content">{{ q.content }}</div>
                     
                     <div class="rq-options">
                         <div v-if="['single_choice', 'multiple_choice'].includes(q.type)">
                            <div v-for="opt in parseOptions(q.options)" :key="opt.key" 
                                 class="review-option" 
                                 :class="{ 
                                    'user-selected': isSelectedInReview(q, opt.key),
                                    'correct-answer': isCorrectOption(q, opt.key)
                                 }"
                            >
                                <span class="ro-key">{{ opt.key }}.</span> {{ opt.value }}
                                <el-icon v-if="isSelectedInReview(q, opt.key)" class="ro-icon"><User /></el-icon>
                                <el-icon v-if="isCorrectOption(q, opt.key)" class="ro-icon"><Check /></el-icon>
                            </div>
                         </div>
                         <div v-else-if="q.type === 'true_false'">
                            <div class="review-option" :class="{'user-selected': getReviewAnswer(q) === 'T', 'correct-answer': q.answer === 'T'}">正确</div>
                            <div class="review-option" :class="{'user-selected': getReviewAnswer(q) === 'F', 'correct-answer': q.answer === 'F'}">错误</div>
                         </div>
                         <div v-else>
                             <div class="text-answer-box">
                                 <p><strong>您的答案：</strong>{{ getReviewAnswer(q) || '未作答' }}</p>
                             </div>
                         </div>
                     </div>
                     
                     <div class="rq-analysis">
                         <p><strong>参考答案：</strong><span class="text-success">{{ q.answer }}</span></p>
                         <p><strong>解析：</strong>{{ q.analysis || '暂无解析' }}</p>
                     </div>
                </div>
            </div>
        </div>
    </el-dialog>

    <!-- Full Screen Exam Taking Interface -->
    <el-dialog 
        v-model="examTakingVisible" 
        fullscreen 
        :show-close="false" 
        class="exam-taking-dialog"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
        <div class="exam-taking-container" v-if="currentExamTaking">
            <!-- Watermark Layer -->
            <div class="watermark-layer">
                <div v-for="n in 20" :key="n" class="watermark-item">
                    {{ studentName }} - {{ studentId }}
                </div>
            </div>

            <!-- Top Header -->
            <div class="exam-header">
                <div class="eh-left">
                    <h2 class="exam-title">{{ currentExamTaking.name }}</h2>
                </div>
                <div class="eh-right">
                    <el-button type="primary" plain @click="toggleFullPaperMode">
                        {{ isFullPaperMode ? '逐题模式' : '整卷模式' }}
                    </el-button>
                    <el-button type="danger" @click="handleSubmitExam">交卷</el-button>
                </div>
            </div>

                    <div class="camera-monitor">
                        <video 
                            v-show="isExamCameraOn" 
                            ref="examVideoRef" 
                            autoplay 
                            playsinline 
                            muted 
                            disablePictureInPicture
                            class="monitor-video"
                            @contextmenu.prevent
                        ></video>
                        <div v-show="isExamCameraOn" class="monitor-badge">
                            <span class="dot-blink"></span>
                            <span>监考中</span>
                        </div>
                        <div v-if="!isExamCameraOn" class="camera-placeholder">
                            <el-icon><VideoCamera /></el-icon>
                            <span>监控中</span>
                        </div>
                    </div>

            <div class="exam-body">
                <!-- Left Sidebar: Info -->
                <div class="exam-sidebar-left">
                    <div class="es-section">
                        <div class="es-label">开始时间</div>
                        <div class="es-value">{{ formatDate(currentExamTaking.startTime).split(' ')[1] }}</div>
                    </div>
                    <div class="es-section">
                        <div class="es-label">考试时长</div>
                        <div class="es-value">{{ currentExamTaking.duration }} 分钟</div>
                    </div>
                    
                    <el-divider class="es-divider" />
                    
                    <div class="timer-box" :class="{ 'warning': remainingTime < 300 }">
                        <div class="timer-label">剩余时间</div>
                        <div class="timer-val">{{ formatTime(remainingTime) }}</div>
                    </div>
                    
                    <el-divider class="es-divider" />
                    
                    <div class="candidate-info">
                        <div class="ci-row">
                            <span class="ci-label">姓名</span>
                            <span class="ci-val">{{ studentName }}</span>
                        </div>
                        <div class="ci-row">
                            <span class="ci-label">学号</span>
                            <span class="ci-val">{{ studentId }}</span>
                        </div>
                        <div class="ci-row">
                            <span class="ci-label">科目</span>
                            <span class="ci-val">{{ currentExamTaking.subject }}</span>
                        </div>
                    </div>
                </div>

                <!-- Center: Question Content -->
                <div class="exam-content-area" id="exam-content-area">
                    <!-- Single Question Mode -->
                    <div v-if="!isFullPaperMode" class="single-question-view">
                         <div class="question-card">
                             <div class="qc-header">
                                 <span class="qc-no">第 {{ currentQuestionIndex + 1 }} 题</span>
                                 <el-tag>{{ getQuestionTypeLabel(currentQuestion.type) }}</el-tag>
                                 <span class="qc-score">({{ currentQuestion.score }}分)</span>
                             </div>
                             <div class="qc-content">{{ currentQuestion.content }}</div>
                             
                             <div class="qc-options">
                                 <!-- Choice Logic Same as PersonalizedBank -->
                                 <div v-if="currentQuestion.type === 'single_choice'" class="choice-group">
                                    <div v-for="opt in parseOptions(currentQuestion.options)" :key="opt.key" 
                                         class="choice-item" :class="{ selected: examAnswers[currentQuestion.id] === opt.key }"
                                         @click="examAnswers[currentQuestion.id] = opt.key">
                                        <span class="choice-key">{{ opt.key }}</span>
                                        <span class="choice-val">{{ opt.value }}</span>
                                    </div>
                                 </div>
                                 <div v-else-if="currentQuestion.type === 'multiple_choice'" class="choice-group">
                                    <div v-for="opt in parseOptions(currentQuestion.options)" :key="opt.key" 
                                         class="choice-item" :class="{ selected: examAnswers[currentQuestion.id]?.includes(opt.key) }"
                                         @click="toggleMultipleChoice(currentQuestion.id, opt.key)">
                                        <span class="choice-key">{{ opt.key }}</span>
                                        <span class="choice-val">{{ opt.value }}</span>
                                    </div>
                                 </div>
                                  <div v-else-if="currentQuestion.type === 'true_false'" class="choice-group horizontal">
                                    <div class="choice-item" :class="{ selected: examAnswers[currentQuestion.id] === 'T' }" @click="examAnswers[currentQuestion.id] = 'T'">
                                       <span class="choice-val">正确</span>
                                    </div>
                                    <div class="choice-item" :class="{ selected: examAnswers[currentQuestion.id] === 'F' }" @click="examAnswers[currentQuestion.id] = 'F'">
                                       <span class="choice-val">错误</span>
                                    </div>
                                 </div>
                                 <div v-else>
                                     <el-input type="textarea" :rows="6" v-model="examAnswers[currentQuestion.id]" placeholder="请输入答案..." />
                                 </div>
                             </div>
                         </div>
                         <div class="nav-buttons">
                             <el-button :disabled="currentQuestionIndex === 0" @click="currentQuestionIndex--">上一题</el-button>
                             <el-button v-if="currentQuestionIndex < examQuestions.length - 1" type="primary" @click="currentQuestionIndex++">下一题</el-button>
                             <el-button v-else type="success" @click="toggleFullPaperMode">整卷预览</el-button>
                         </div>
                    </div>

                    <!-- Full Paper Mode -->
                    <div v-else class="full-paper-view">
                        <div v-for="(q, idx) in examQuestions" :key="q.id" class="paper-question-item" :id="'pq-'+idx">
                             <div class="pq-header">
                                 <span class="pq-no">{{ idx + 1 }}.</span>
                                 <el-tag size="small">{{ getQuestionTypeLabel(q.type) }}</el-tag>
                                 <span class="pq-score">({{ q.score }}分)</span>
                             </div>
                             <div class="pq-body">
                                 <div class="pq-content">{{ q.content }}</div>
                                 <div class="pq-input">
                                      <!-- Simplified input for full view, reuse logic -->
                                      <div v-if="['single_choice', 'multiple_choice'].includes(q.type)">
                                          <!-- Render options briefly -->
                                           <div v-for="opt in parseOptions(q.options)" :key="opt.key" 
                                             class="mini-option" :class="{ selected: isSelected(q, opt.key) }"
                                             @click="handleOptionClick(q, opt.key)">
                                              <span class="mo-key">{{ opt.key }}.</span> {{ opt.value }}
                                           </div>
                                      </div>
                                      <div v-else-if="q.type === 'true_false'" class="tf-group">
                                          <el-radio-group v-model="examAnswers[q.id]">
                                              <el-radio label="T">正确</el-radio>
                                              <el-radio label="F">错误</el-radio>
                                          </el-radio-group>
                                      </div>
                                      <div v-else>
                                          <el-input type="textarea" v-model="examAnswers[q.id]" :rows="3" placeholder="请输入答案" />
                                      </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar: Question Nav -->
                <div class="exam-sidebar-right">
                    <div class="nav-card">
                        <div class="nc-title">题目列表</div>
                        <div class="nc-legend">
                            <span class="legend-item"><span class="dot done"></span>已答</span>
                            <span class="legend-item"><span class="dot current"></span>当前</span>
                        </div>
                        <div class="nc-grid">
                            <div v-for="(q, idx) in examQuestions" :key="q.id" 
                                class="nc-item"
                                :class="{ 
                                    'active': currentQuestionIndex === idx && !isFullPaperMode, 
                                    'done': isAnswered(q.id)
                                }"
                                @click="jumpToQuestion(idx)"
                            >
                                {{ idx + 1 }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, inject, watch } from 'vue'
import { VideoCamera, VideoPlay, User, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showMessage = inject('showMessage') || ElMessage

// --- Filters & List State ---
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const examList = ref([])

const filterForm = reactive({
  subject: '',
  semester: '', // Default to ALL
  status: ''
})

const studentName = '张三'
const studentId = '2021001001'

// --- Mock Data ---
const mockExams = [
  { id: 1, name: '2023-2024秋季高等数学期末考试', subject: '高等数学', semester: '2023_autumn', startTime: '2023-12-20 09:00:00', endTime: '2023-12-20 11:00:00', duration: 120, status: 'completed', score: 88, timeTaken: 6800, allowReview: true },
  { id: 2, name: '2023-2024秋季Java程序设计期末考试', subject: 'Java程序设计', semester: '2023_autumn', startTime: new Date().getTime() - 3600*1000, endTime: new Date().getTime() + 3600*1000, duration: 120, status: 'in_progress' }, // Ongoing
  { id: 3, name: '2023-2024秋季计算机网络期末考试', subject: '计算机网络', semester: '2023_autumn', startTime: '2024-01-05 14:00:00', endTime: '2024-01-05 16:00:00', duration: 120, status: 'not_started' },
  { id: 4, name: '2022-2023秋季数据结构期末考试', subject: '数据结构', semester: '2022_autumn', startTime: '2022-12-15 09:00:00', endTime: '2022-12-15 11:00:00', duration: 120, status: 'completed', score: 92, timeTaken: 7000, allowReview: false },
  { id: 5, name: '2023-2024春季大学英语四级模拟', subject: '大学英语', semester: '2023_spring', startTime: '2023-06-10 09:00:00', endTime: '2023-06-10 11:20:00', duration: 140, status: 'pending_grading', timeTaken: 8000 },
]
// --- Mock Questions for Review ---
const mockReviewQuestions = [
    { id: 1, type: 'single_choice', content: '函数 y=x^2 在 x=0 处的导数是？', options: '[{"key":"A","value":"0"},{"key":"B","value":"1"}]', score: 5, answer: 'A', analysis: 'x^2 导数为 2x，x=0时为0' },
    { id: 2, type: 'multiple_choice', content: '以下哪些是Java的关键字？', options: '[{"key":"A","value":"class"},{"key":"B","value":"void"},{"key":"C","value":"hello"}]', score: 5, answer: 'A,B', analysis: 'hello 不是关键字' },
    { id: 3, type: 'true_false', content: 'TCP协议是不可靠的传输协议。', score: 5, answer: 'F', analysis: 'TCP是可靠的' },
    { id: 4, type: 'short_answer', content: '请简述面向对象的三大特性。', score: 10, answer: '封装、继承、多态', analysis: '略' },
    { id: 5, type: 'single_choice', content: '1+1等于几？', options: '[{"key":"A","value":"1"},{"key":"B","value":"2"}]', score: 5, answer: 'B', analysis: '1+1=2' }
]
// Mock User Answers for Review
const mockUserAnswers = { 1: 'A', 2: ['A'], 3: 'F', 4: '封装继承多态', 5: 'A' } // Q2 partial, Q5 wrong

// --- Helpers ---
const formatDate = (ts) => {
    if(!ts) return ''
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
const formatDuration = (seconds) => {
    if(!seconds) return '0分钟'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}
const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
const getSemesterLabel = (val) => {
    const map = { '2023_autumn': '23-24 秋季', '2023_spring': '23-24 春季', '2022_autumn': '22-23 秋季' }
    return map[val] || val
}
const getStatusType = (s) => {
    const map = { 'not_started': 'info', 'in_progress': 'success', 'pending_grading': 'warning', 'completed': '' }
    return map[s]
}
const getStatusText = (s) => {
    const map = { 'not_started': '未开始', 'in_progress': '进行中', 'pending_grading': '待批阅', 'completed': '已完成' }
    return map[s]
}
const questionTypes = { 'single_choice': '单选题', 'multiple_choice': '多选题', 'true_false': '判断题', 'short_answer': '简答题' }
const getQuestionTypeLabel = (t) => questionTypes[t] || t
const parseOptions = (str) => {
    try { return JSON.parse(str) } catch { return [] }
}

// --- List Logic ---
const loadExamList = () => {
    loading.value = true
    setTimeout(() => {
        let list = mockExams.filter(e => {
            let match = true
            if(filterForm.subject && !e.subject.includes(filterForm.subject)) match = false
            if(filterForm.semester && e.semester !== filterForm.semester) match = false
            if(filterForm.status && e.status !== filterForm.status) match = false
            return match
        })
        total.value = list.length
        examList.value = list.slice((currentPage.value-1)*pageSize.value, currentPage.value*pageSize.value)
        loading.value = false
    }, 300)
}

const handleSearch = () => { currentPage.value = 1; loadExamList() }
const resetFilter = () => { 
    filterForm.subject = ''
    filterForm.semester = ''
    filterForm.status = ''
    handleSearch() 
}

// --- Detail & Info Logic ---
const infoDialogVisible = ref(false)
const currentExamInfo = ref(null)

const handleRowClick = (row) => {
    if(row.status === 'in_progress') handleTakeExam(row)
    else handleViewInfo(row)
}

const handleViewInfo = (row) => {
    currentExamInfo.value = row
    infoDialogVisible.value = true
}

const handleViewResult = (row) => {
    currentExamInfo.value = row
    infoDialogVisible.value = true
}

const startExamAction = (exam) => {
    infoDialogVisible.value = false
    handleTakeExam(exam)
}

// --- Pre-Exam Logic ---
const preExamDialogVisible = ref(false)
const isCameraReady = ref(false)
const hasPassedCameraCheck = ref(false)
const cameraVideoRef = ref(null)
const examToStart = ref(null)

const openPreExam = (exam) => {
    examToStart.value = exam
    preExamDialogVisible.value = true
    
    // Auto check if already passed before
    if (hasPassedCameraCheck.value) {
        checkCamera(true) // Silent check
    } else {
        isCameraReady.value = false
    }
}

const checkCamera = async (silent = false) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if(cameraVideoRef.value) {
            cameraVideoRef.value.srcObject = stream
        }
        isCameraReady.value = true
        hasPassedCameraCheck.value = true
        
        // If called from template click (Event object) or default false -> show message
        // If silent is true -> don't show
        const shouldShow = typeof silent === 'boolean' ? !silent : true
        
        if (shouldShow) {
            ElMessage.success('摄像头检测通过')
        }
    } catch (e) {
        ElMessage.error('无法访问摄像头，请检查权限')
    }
}

const realStartExam = () => {
    preExamDialogVisible.value = false
    // Stop local stream for now or keep it? 
    // In real app we might keep it. Here we just close dialog and start exam.
    // We will assume the exam interface will request it again or we reuse it (simpler to just request again or mock)
    handleTakeExam(examToStart.value, true)
}

// --- Exam Review Logic ---
const examReviewVisible = ref(false)
const currentExamReview = ref(null)

const handleViewPaper = (exam) => {
    currentExamReview.value = exam
    // Load questions and answers
    examQuestions.value = [...mockReviewQuestions]
    examAnswers.value = {...mockUserAnswers}
    examReviewVisible.value = true
}

const getReviewAnswer = (q) => {
    const ans = examAnswers.value[q.id]
    if(Array.isArray(ans)) return ans.join(',')
    return ans
}

const isReviewCorrect = (q) => {
    const user = getReviewAnswer(q)
    const correct = q.answer
    // Simple comparison
    if(q.type === 'multiple_choice') {
        return user === correct // assuming sorted
    }
    return user === correct
}

const isSelectedInReview = (q, key) => {
     if(q.type === 'single_choice') return examAnswers.value[q.id] === key
     if(q.type === 'multiple_choice') return examAnswers.value[q.id]?.includes(key)
     return false
}

const isCorrectOption = (q, key) => {
    if(q.type === 'single_choice') return q.answer === key
    if(q.type === 'multiple_choice') return q.answer.split(',').includes(key)
    return false
}

// --- Exam Taking Logic ---
const examTakingVisible = ref(false)
const currentExamTaking = ref(null)
const examQuestions = ref([])
const examAnswers = ref({})
const currentQuestionIndex = ref(0)
const isFullPaperMode = ref(false)
const remainingTime = ref(0)
let examTimer = null
let cheatCount = 0

// Camera Refs
const isExamCameraOn = ref(false)
const examVideoRef = ref(null)
let examMediaStream = null

// Mock Exam Questions
const mockQuestions = [
    { id: 1, type: 'single_choice', content: '函数 y=x^2 在 x=0 处的导数是？', options: '[{"key":"A","value":"0"},{"key":"B","value":"1"}]', score: 5 },
    { id: 2, type: 'multiple_choice', content: '以下哪些是Java的关键字？', options: '[{"key":"A","value":"class"},{"key":"B","value":"void"},{"key":"C","value":"hello"}]', score: 5 },
    { id: 3, type: 'true_false', content: 'TCP协议是不可靠的传输协议。', score: 5 },
    { id: 4, type: 'short_answer', content: '请简述面向对象的三大特性。', score: 10 },
    { id: 5, type: 'single_choice', content: '1+1等于几？', options: '[{"key":"A","value":"1"},{"key":"B","value":"2"}]', score: 5 }
]

const currentQuestion = ref({})

watch(currentQuestionIndex, (val) => {
    if(examQuestions.value.length > 0) {
        currentQuestion.value = examQuestions.value[val]
    }
})

const handleTakeExam = (exam, skipCheck = false) => {
    // Safety check: if already taking this exam, do nothing to prevent re-initialization
    if (examTakingVisible.value && currentExamTaking.value?.id === exam.id) {
        return
    }

    if(!skipCheck && !preExamDialogVisible.value && !examTakingVisible.value) {
        // Always go to pre-exam check first
        openPreExam(exam)
        return
    }

    currentExamTaking.value = exam
    // Initialize Mock Exam Data
    examQuestions.value = [...mockQuestions] // Deep copy in real app
    examAnswers.value = {}
    currentQuestionIndex.value = 0
    currentQuestion.value = examQuestions.value[0]
    isFullPaperMode.value = false
    remainingTime.value = exam.duration * 60 // seconds
    cheatCount = 0
    
    examTakingVisible.value = true
    
    startTimer()
    startAntiCheat()
    // Initialize exam camera (wait for DOM)
    setTimeout(() => {
        initExamCamera()
    }, 500)
    // enterFullScreen() // Removed as requested
}

const startTimer = () => {
    if(examTimer) clearInterval(examTimer)
    examTimer = setInterval(() => {
        remainingTime.value--
        if(remainingTime.value <= 0) {
            handleSubmitExam(true) // Force submit
        }
    }, 1000)
}

const enterFullScreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {})
    }
}

const initExamCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        examMediaStream = stream
        if (examVideoRef.value) {
            examVideoRef.value.srcObject = stream
        }
        isExamCameraOn.value = true
    } catch (e) {
        console.error('Failed to init exam camera:', e)
        isExamCameraOn.value = false
        ElMessage.warning('摄像头开启失败，请检查权限')
    }
}

const stopExamCamera = () => {
    if (examMediaStream) {
        examMediaStream.getTracks().forEach(track => track.stop())
        examMediaStream = null
    }
    isExamCameraOn.value = false
}

// Anti-Cheat
let faceCheckInterval = null

const startAntiCheat = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // Simulate real-time face verification
    faceCheckInterval = setInterval(() => {
        captureAndVerifyFace()
    }, 5000)
}

const stopAntiCheat = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (faceCheckInterval) clearInterval(faceCheckInterval)
}

// Backend Interface for Face Verification
const captureAndVerifyFace = () => {
    if (!examVideoRef.value || !isExamCameraOn.value) return

    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    ctx.drawImage(examVideoRef.value, 0, 0, canvas.width, canvas.height)
    
    // Get Base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // TODO: Send to backend
    // console.log('Capturing face image for verification...', imageData.substring(0, 50) + '...')
    // mockSendToBackend(imageData)
}

const handleVisibilityChange = () => {
    if (document.hidden && examTakingVisible.value) {
        cheatCount++
        ElMessageBox.alert(`检测到切屏行为！这是第 ${cheatCount} 次警告，超过 3 次将强制交卷。`, '警告', {
            confirmButtonText: '我已知晓',
            type: 'warning'
        }).then(() => {
            if (cheatCount >= 3) {
                handleSubmitExam(true)
            }
        })
    }
}

const toggleFullPaperMode = () => {
    isFullPaperMode.value = !isFullPaperMode.value
    if(isFullPaperMode.value) {
        // scroll to current
        setTimeout(() => {
             const el = document.getElementById(`pq-${currentQuestionIndex.value}`)
             if(el) el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }
}

const jumpToQuestion = (idx) => {
    currentQuestionIndex.value = idx
    if(isFullPaperMode.value) {
        const el = document.getElementById(`pq-${idx}`)
        if(el) el.scrollIntoView({ behavior: 'smooth' })
    }
}

const isAnswered = (qid) => {
    const ans = examAnswers.value[qid]
    return Array.isArray(ans) ? ans.length > 0 : !!ans
}

const toggleMultipleChoice = (qid, key) => {
   const arr = examAnswers.value[qid] || []
   if (arr.includes(key)) {
      examAnswers.value[qid] = arr.filter(k => k !== key)
   } else {
      examAnswers.value[qid] = [...arr, key]
   }
}

// Full paper mode helpers
const isSelected = (q, key) => {
    if(q.type === 'single_choice') return examAnswers.value[q.id] === key
    if(q.type === 'multiple_choice') return examAnswers.value[q.id]?.includes(key)
    return false
}
const handleOptionClick = (q, key) => {
    if(q.type === 'single_choice') examAnswers.value[q.id] = key
    if(q.type === 'multiple_choice') toggleMultipleChoice(q.id, key)
}

const handleSubmitExam = (force = false) => {
    // If called from template click event, force is an event object, treat as false
    const isForce = typeof force === 'boolean' ? force : false
    
    const title = isForce ? '考试结束' : '确认交卷'
    const msg = isForce ? '考试时间到或违规次数过多，系统已自动交卷。' : '确定要提交试卷吗？提交后无法修改。'
    
    ElMessageBox.confirm(msg, title, {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        type: isForce ? 'error' : 'warning',
        showCancelButton: !isForce,
        closeOnClickModal: false,
        closeOnPressEscape: false
    }).then(() => {
        // Submit Logic
        clearInterval(examTimer)
        stopAntiCheat()
        stopExamCamera()
        examTakingVisible.value = false
        
        // Update local status for demo
        const exam = examList.value.find(e => e.id === currentExamTaking.value.id)
        if(exam) {
            exam.status = 'pending_grading'
            exam.timeTaken = currentExamTaking.value.duration * 60 - remainingTime.value
        }
        
        ElMessageBox.alert(`交卷成功！\n用时：${formatDuration(currentExamTaking.value.duration * 60 - remainingTime.value)}`, '考试结束', {
            confirmButtonText: '返回列表',
            callback: () => {
                if (document.exitFullscreen) document.exitFullscreen().catch(e => {})
                loadExamList()
            }
        })
    }).catch(() => {})
}

onMounted(() => {
    loadExamList()
})

onUnmounted(() => {
    if(examTimer) clearInterval(examTimer)
    stopAntiCheat()
    stopExamCamera()
})
</script>

<style scoped>
.exam-list-container {
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
.filter-card { margin-bottom: 20px; }
.filter-form { display: flex; flex-wrap: wrap; gap: 10px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }

/* Pre-Exam Styles */
.pre-exam-content { padding: 20px; }
.pre-exam-info { margin-bottom: 20px; }
.pei-title { margin-top: 0; margin-bottom: 15px; text-align: center; color: #303133; }
.pei-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
.pei-item .label { color: #909399; }

.rule-alert { margin-bottom: 20px; }
.camera-check-area { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.camera-preview-box {
    width: 320px; height: 240px; background: #000; border-radius: 8px; overflow: hidden;
    position: relative; display: flex; align-items: center; justify-content: center;
}
.camera-video { width: 100%; height: 100%; object-fit: cover; }
.camera-overlay { 
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: #fff; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
}
.camera-icon { font-size: 40px; margin-bottom: 10px; }

/* Exam Review Styles */
.exam-review-dialog :deep(.el-dialog__body) { padding: 0 !important; height: 100%; }
.exam-review-container {
    height: 100vh; display: flex; flex-direction: column; background: #f5f7fa;
}
.review-header {
    height: 60px; background: white; padding: 0 30px; display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); z-index: 10;
}
.rh-stats { display: flex; align-items: center; gap: 20px; }
.review-body { flex: 1; overflow-y: auto; padding: 30px 20% 50px; }
.review-question-item {
    background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.rq-header { display: flex; align-items: center; margin-bottom: 20px; }
.rq-no { font-size: 20px; font-weight: bold; margin-right: 15px; }
.rq-score { color: #909399; margin-left: 10px; margin-right: auto; }
.rq-status { font-weight: bold; }
.rq-content { font-size: 16px; margin-bottom: 20px; line-height: 1.6; }
.review-option {
    padding: 10px 15px; border: 1px solid #EBEEF5; border-radius: 4px; margin-bottom: 8px;
    display: flex; align-items: center;
}
.user-selected { background-color: #fef0f0; border-color: #fab6b6; color: #F56C6C; }
.correct-answer { background-color: #f0f9eb; border-color: #e1f3d8; color: #67C23A; }
/* If both selected and correct, green wins visually or mix? Correct usually green. */
.user-selected.correct-answer { background-color: #f0f9eb; border-color: #e1f3d8; color: #67C23A; }
.ro-key { font-weight: bold; margin-right: 10px; width: 20px; }
.ro-icon { margin-left: auto; font-size: 18px; }
.rq-analysis {
    margin-top: 20px; padding: 15px; background: #fdf6ec; border-radius: 4px; color: #e6a23c;
}

/* Enhanced Exam Info Modal */
.info-title { font-size: 22px; margin-bottom: 20px; text-align: center; color: #303133; }
.info-desc { margin-bottom: 20px; }
.result-box {
    display: flex; align-items: center; justify-content: space-around; padding: 20px; background: #f8f9fa; border-radius: 8px;
}
.score-circle-lg {
    width: 100px; height: 100px; border-radius: 50%; border: 4px solid #67C23A;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.sc-val { font-size: 32px; font-weight: bold; color: #67C23A; }
.sc-label { font-size: 12px; color: #909399; }
.rm-item { display: flex; flex-direction: column; align-items: center; }
.rm-label { font-size: 13px; color: #909399; }
.rm-val { font-size: 18px; font-weight: bold; color: #303133; }
.dialog-footer { display: flex; justify-content: center; gap: 20px; }

/* Sidebar Enhancements */
.es-section { margin-bottom: 15px; }
.es-label { font-size: 13px; color: #909399; margin-bottom: 4px; }
.es-value { font-size: 16px; font-weight: 500; color: #303133; }
.es-divider { margin: 20px 0; }

.timer-box {
    text-align: center;
    padding: 15px;
    background: #ecf5ff;
    border-radius: 8px;
    border: 1px solid #d9ecff;
}
.timer-box.warning {
    background: #fef0f0;
    border-color: #fde2e2;
}
.timer-label { font-size: 12px; color: #909399; margin-bottom: 5px; }
.timer-val { font-size: 28px; font-weight: bold; color: #409EFF; font-family: monospace; }
.timer-box.warning .timer-val { color: #F56C6C; animation: pulse 1s infinite; }

.candidate-info { margin-top: 10px; }
.ci-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
.ci-label { color: #909399; }
.ci-val { font-weight: 500; color: #303133; }

/* Exam Taking Interface Styles */
.exam-taking-dialog :deep(.el-dialog__body) { padding: 0 !important; height: 100%; overflow: hidden; }
.exam-taking-container {
    height: 100vh; display: flex; flex-direction: column; background: #f5f7fa; position: relative;
}

.watermark-layer {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0;
    overflow: hidden; opacity: 0.03; display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr);
}
.watermark-item {
    display: flex; align-items: center; justify-content: center; transform: rotate(-30deg);
    font-size: 20px; font-weight: bold; color: #000;
}

.exam-header {
    height: 60px; background: white; padding: 0 30px; display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); z-index: 10; position: relative;
}
.eh-right { display: flex; align-items: center; gap: 20px; }
.camera-monitor { 
    width: 240px; 
    height: 180px; 
    background: #000; 
    border-radius: 0; 
    overflow: hidden; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
    position: fixed; 
    bottom: 0; 
    left: 0; 
    z-index: 2000; 
    border: none;
    border-top: 2px solid rgba(255,255,255,0.2);
    border-right: 2px solid rgba(255,255,255,0.2);
}
.monitor-video { width: 100%; height: 100%; object-fit: cover; }
.camera-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #909399; font-size: 12px; background: #333; }
.monitor-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(103, 194, 58, 0.8);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 3px;
    z-index: 10;
}
.dot-blink {
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: blink 1s infinite;
}
@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

.exam-body {
    flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1;
}

.exam-sidebar-left {
    width: 240px; background: white; border-right: 1px solid #EBEEF5; padding: 20px;
    display: flex; flex-direction: column;
}

.exam-content-area {
    flex: 1; overflow-y: auto; padding: 30px; scroll-behavior: smooth;
}

.exam-sidebar-right {
    width: 280px; background: white; border-left: 1px solid #EBEEF5; padding: 20px;
    display: flex; flex-direction: column;
}

/* Question Styles in Exam */
.question-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); min-height: 400px; }
.qc-header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f0f2f5; padding-bottom: 15px; }
.qc-no { font-size: 18px; font-weight: bold; margin-right: 15px; }
.qc-score { color: #909399; margin-left: auto; }
.qc-content { font-size: 16px; line-height: 1.6; margin-bottom: 30px; }

.choice-group { display: flex; flex-direction: column; gap: 15px; }
.choice-item {
    padding: 15px 20px; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center;
}
.choice-item:hover { border-color: #409EFF; background: #ecf5ff; }
.choice-item.selected { border-color: #409EFF; background: #ecf5ff; color: #409EFF; font-weight: bold; }
.choice-key { width: 30px; height: 30px; border-radius: 50%; background: #f0f2f5; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #606266; }
.choice-item.selected .choice-key { background: #409EFF; color: white; }

.nav-buttons { margin-top: 30px; display: flex; justify-content: space-between; }

/* Full Paper Mode */
.full-paper-view { padding-bottom: 50px; }
.paper-question-item { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.pq-header { display: flex; align-items: center; margin-bottom: 15px; }
.pq-no { font-weight: bold; margin-right: 10px; }
.mini-option { padding: 8px 12px; border: 1px solid #EBEEF5; margin-bottom: 5px; border-radius: 4px; cursor: pointer; }
.mini-option.selected { border-color: #409EFF; background: #ecf5ff; color: #409EFF; }

/* Right Nav Grid */
.nav-card { height: 100%; display: flex; flex-direction: column; }
.nc-title { font-weight: bold; margin-bottom: 15px; padding-left: 10px; border-left: 4px solid #409EFF; }
.nc-legend { display: flex; gap: 15px; margin-bottom: 15px; font-size: 12px; color: #606266; }
.legend-item { display: flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #dcdfe6; }
.dot.done { background: #409EFF; }
.dot.current { background: #E6A23C; }

.nc-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; overflow-y: auto; align-content: start; }
.nc-item {
    height: 36px; display: flex; align-items: center; justify-content: center;
    border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px;
}
.nc-item:hover { border-color: #409EFF; color: #409EFF; }
.nc-item.done { background: #ecf5ff; border-color: #b3d8ff; color: #409EFF; }
.nc-item.active { border-color: #E6A23C; color: #E6A23C; font-weight: bold; box-shadow: 0 0 0 1px #E6A23C; }

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
}
</style>
