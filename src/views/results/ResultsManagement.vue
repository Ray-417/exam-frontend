<template>
  <div class="results-management-container">
    <div class="page-header">
      <h2 class="page-title">成绩管理</h2>
      <div>
        <el-button type="primary" @click="exportResults">
          <el-icon><Download /></el-icon>导出成绩
        </el-button>
      </div>
    </div>
    
    <el-card class="filter-card">
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="考试名称">
            <el-select v-model="filterForm.examId" placeholder="选择考试" clearable>
              <el-option v-for="item in examOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="filterForm.classId" placeholder="选择班级" clearable>
              <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="学号/姓名">
            <el-input v-model="filterForm.keyword" placeholder="输入学号或姓名" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <div class="results-content" v-if="currentExam.id">
      <el-card class="exam-info-card">
        <template #header>
          <div class="card-header">
            <span>{{ currentExam.name }}</span>
            <el-tag type="success">已完成</el-tag>
          </div>
        </template>
        <div class="exam-info">
          <div class="info-item">
            <span class="label">考试科目：</span>
            <span class="value">{{ currentExam.subject }}</span>
          </div>
          <div class="info-item">
            <span class="label">考试时间：</span>
            <span class="value">{{ currentExam.examTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">总分：</span>
            <span class="value">{{ currentExam.totalScore }}分</span>
          </div>
          <div class="info-item">
            <span class="label">参考人数：</span>
            <span class="value">{{ currentExam.studentCount }}人</span>
          </div>
          <div class="info-item">
            <span class="label">平均分：</span>
            <span class="value">{{ currentExam.averageScore }}分</span>
          </div>
          <div class="info-item">
            <span class="label">最高分：</span>
            <span class="value">{{ currentExam.highestScore }}分</span>
          </div>
          <div class="info-item">
            <span class="label">最低分：</span>
            <span class="value">{{ currentExam.lowestScore }}分</span>
          </div>
          <div class="info-item">
            <span class="label">及格率：</span>
            <span class="value">{{ currentExam.passRate }}%</span>
          </div>
        </div>
      </el-card>
      
      <div class="charts-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>分数分布</span>
                </div>
              </template>
              <div class="chart-placeholder">
                <div class="chart-mock">
                  <div class="chart-bar" style="height: 30%; background-color: #67C23A;">
                    <div class="chart-label">90-100</div>
                  </div>
                  <div class="chart-bar" style="height: 60%; background-color: #409EFF;">
                    <div class="chart-label">80-89</div>
                  </div>
                  <div class="chart-bar" style="height: 80%; background-color: #E6A23C;">
                    <div class="chart-label">70-79</div>
                  </div>
                  <div class="chart-bar" style="height: 40%; background-color: #F56C6C;">
                    <div class="chart-label">60-69</div>
                  </div>
                  <div class="chart-bar" style="height: 20%; background-color: #909399;">
                    <div class="chart-label">0-59</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>班级平均分对比</span>
                </div>
              </template>
              <div class="chart-placeholder">
                <div class="chart-mock horizontal">
                  <div class="chart-row">
                    <div class="chart-label">计科1班</div>
                    <div class="chart-bar-h" style="width: 85%; background-color: #409EFF;">85</div>
                  </div>
                  <div class="chart-row">
                    <div class="chart-label">计科2班</div>
                    <div class="chart-bar-h" style="width: 78%; background-color: #409EFF;">78</div>
                  </div>
                  <div class="chart-row">
                    <div class="chart-label">软工1班</div>
                    <div class="chart-bar-h" style="width: 82%; background-color: #409EFF;">82</div>
                  </div>
                  <div class="chart-row">
                    <div class="chart-label">软工2班</div>
                    <div class="chart-bar-h" style="width: 80%; background-color: #409EFF;">80</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <el-card class="results-table-card">
        <template #header>
          <div class="card-header">
            <span>成绩列表</span>
          </div>
        </template>
        <el-table :data="resultsList" border style="width: 100%">
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="className" label="班级" width="120" />
          <el-table-column prop="score" label="成绩" width="100">
            <template #default="scope">
              <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="排名" width="80" />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
                {{ scope.row.status === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button link type="primary" @click="viewDetail(scope.row)">查看详情</el-button>
              <el-button link type="primary" @click="adjustScore(scope.row)">调整分数</el-button>
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
      </el-card>
    </div>
    
    <div class="no-exam-selected" v-else>
      <el-empty description="请选择一个考试查看成绩" />
    </div>
    
    <!-- 调整分数对话框 -->
    <el-dialog v-model="adjustScoreDialog.visible" title="调整分数" width="500px">
      <el-form :model="adjustScoreDialog.form" label-width="100px">
        <el-form-item label="学生">
          <span>{{ adjustScoreDialog.form.name }} ({{ adjustScoreDialog.form.studentId }})</span>
        </el-form-item>
        <el-form-item label="原始分数">
          <span>{{ adjustScoreDialog.form.originalScore }}</span>
        </el-form-item>
        <el-form-item label="调整后分数">
          <el-input-number v-model="adjustScoreDialog.form.newScore" :min="0" :max="currentExam.totalScore" />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input v-model="adjustScoreDialog.form.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustScoreDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdjustScore">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { Download, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMessage = inject('showMessage')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选表单
const filterForm = reactive({
  examId: '',
  classId: '',
  keyword: ''
})

// 考试选项
const examOptions = ref([
  { id: 1, name: '计算机网络期末考试' },
  { id: 2, name: 'Java程序设计期中考试' },
  { id: 3, name: '数据结构期末考试' }
])

// 班级选项
const classOptions = ref([
  { id: 1, name: '计科1班' },
  { id: 2, name: '计科2班' },
  { id: 3, name: '软工1班' },
  { id: 4, name: '软工2班' }
])

// 当前选中的考试
const currentExam = ref({})

// 成绩列表
const resultsList = ref([])

// 调整分数对话框
const adjustScoreDialog = reactive({
  visible: false,
  form: {
    studentId: '',
    name: '',
    originalScore: 0,
    newScore: 0,
    reason: ''
  }
})

// 模拟数据 - 考试信息
const mockExamInfo = {
  id: 1,
  name: '计算机网络期末考试',
  subject: '计算机网络',
  examTime: '2023-10-20 14:00-16:00',
  totalScore: 100,
  studentCount: 120,
  averageScore: 78.5,
  highestScore: 98,
  lowestScore: 45,
  passRate: 85.2
}

// 模拟数据 - 成绩列表
const mockResults = [
  { studentId: '2023001', name: '张三', className: '计科1班', score: 92, rank: 1, submitTime: '2023-10-20 15:45:22', status: 'normal' },
  { studentId: '2023002', name: '李四', className: '计科1班', score: 88, rank: 3, submitTime: '2023-10-20 15:50:36', status: 'normal' },
  { studentId: '2023003', name: '王五', className: '计科2班', score: 76, rank: 8, submitTime: '2023-10-20 15:55:18', status: 'normal' },
  { studentId: '2023004', name: '赵六', className: '软工1班', score: 90, rank: 2, submitTime: '2023-10-20 15:58:47', status: 'normal' },
  { studentId: '2023005', name: '钱七', className: '软工2班', score: 85, rank: 4, submitTime: '2023-10-20 15:59:59', status: 'abnormal' },
  { studentId: '2023006', name: '孙八', className: '计科1班', score: 72, rank: 10, submitTime: '2023-10-20 15:48:33', status: 'normal' },
  { studentId: '2023007', name: '周九', className: '计科2班', score: 81, rank: 5, submitTime: '2023-10-20 15:52:41', status: 'normal' },
  { studentId: '2023008', name: '吴十', className: '软工1班', score: 79, rank: 6, submitTime: '2023-10-20 15:56:27', status: 'normal' },
  { studentId: '2023009', name: '郑十一', className: '软工2班', score: 65, rank: 12, submitTime: '2023-10-20 15:57:38', status: 'normal' },
  { studentId: '2023010', name: '王十二', className: '计科1班', score: 77, rank: 7, submitTime: '2023-10-20 15:59:12', status: 'normal' }
]

// 获取分数样式类
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-medium'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 加载成绩列表
const loadResultsList = () => {
  // 模拟API请求
  setTimeout(() => {
    if (filterForm.examId) {
      currentExam.value = { ...mockExamInfo }
      
      // 过滤
      let filteredResults = [...mockResults]
      
      if (filterForm.classId) {
        const className = classOptions.value.find(c => c.id === filterForm.classId)?.name
        filteredResults = filteredResults.filter(r => r.className === className)
      }
      
      if (filterForm.keyword) {
        const keyword = filterForm.keyword.toLowerCase()
        filteredResults = filteredResults.filter(r => 
          r.studentId.toLowerCase().includes(keyword) || 
          r.name.toLowerCase().includes(keyword)
        )
      }
      
      total.value = filteredResults.length
      
      // 分页
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      resultsList.value = filteredResults.slice(start, end)
    } else {
      currentExam.value = {}
      resultsList.value = []
      total.value = 0
    }
  }, 500)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadResultsList()
}

// 重置过滤条件
const resetFilter = () => {
  filterForm.classId = ''
  filterForm.keyword = ''
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = () => {
  loadResultsList()
}

// 处理每页数量变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadResultsList()
}

// 导出成绩
const exportResults = () => {
  if (!currentExam.value.id) {
    showMessage('请先选择一个考试', 'warning')
    return
  }
  showMessage('成绩导出功能待实现', 'info')
}

// 查看详情
const viewDetail = (row) => {
  router.push(`/dashboard/results/detail/${row.studentId}?examId=${currentExam.value.id}`)
}

// 调整分数
const adjustScore = (row) => {
  adjustScoreDialog.form = {
    studentId: row.studentId,
    name: row.name,
    originalScore: row.score,
    newScore: row.score,
    reason: ''
  }
  adjustScoreDialog.visible = true
}

// 确认调整分数
const confirmAdjustScore = () => {
  if (!adjustScoreDialog.form.reason) {
    showMessage('请输入调整原因', 'warning')
    return
  }
  
  // 模拟API请求
  setTimeout(() => {
    // 更新列表中的分数
    const index = resultsList.value.findIndex(r => r.studentId === adjustScoreDialog.form.studentId)
    if (index !== -1) {
      resultsList.value[index].score = adjustScoreDialog.form.newScore
      // 重新排序和计算排名（实际应用中应该由后端处理）
    }
    
    showMessage('分数调整成功', 'success')
    adjustScoreDialog.visible = false
  }, 500)
}

onMounted(() => {
  // 默认选择第一个考试
  if (examOptions.value.length > 0) {
    filterForm.examId = examOptions.value[0].id
    loadResultsList()
  }
})
</script>

<style scoped>
.results-management-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-info-card {
  margin-bottom: 20px;
}

.exam-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 230px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-mock {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.chart-bar {
  width: 60px;
  background-color: var(--el-color-primary);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
}

.chart-label {
  position: absolute;
  bottom: -25px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chart-mock.horizontal {
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
}

.chart-row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.chart-row .chart-label {
  position: static;
  width: 80px;
  text-align: right;
  margin-right: 10px;
}

.chart-bar-h {
  height: 30px;
  background-color: var(--el-color-primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
  transition: width 0.3s;
}

.results-table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.no-exam-selected {
  margin-top: 100px;
}

.score-excellent {
  color: #67C23A;
  font-weight: bold;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
}

.score-medium {
  color: #E6A23C;
}

.score-pass {
  color: #F56C6C;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
}
</style>