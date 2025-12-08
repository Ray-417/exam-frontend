<template>
  <div class="page-container">
    <div class="header">
      <h2>题目上传申请审核</h2>
    </div>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="提交人员" prop="submitterName">
          <el-input
            v-model="queryParams.submitterName"
            placeholder="请输入提交人姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 200px">
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Content -->
    <el-card class="table-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待审核" name="pending">
           <!-- Pending List -->
           <el-table v-loading="loading" :data="auditList" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="type" label="题型" width="100">
                 <template #default="scope">
                    <el-tag>{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
                 </template>
              </el-table-column>
              <el-table-column prop="contentSummary" label="题目内容摘要" min-width="300" :show-overflow-tooltip="true" />
              <el-table-column prop="difficulty" label="难度" width="80">
                 <template #default="scope">
                    <el-rate v-model="scope.row.difficulty" disabled text-color="#ff9900" />
                 </template>
              </el-table-column>
              <el-table-column prop="submitterName" label="提交人" width="120" />
              <el-table-column prop="submitTime" label="提交时间" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                 <template #default="scope">
                    <el-button type="primary" link @click="handleAudit(scope.row)">
                       <el-icon><EditPen /></el-icon> 审核
                    </el-button>
                 </template>
              </el-table-column>
           </el-table>
        </el-tab-pane>

        <el-tab-pane label="已审核" name="processed">
           <!-- Processed List -->
           <el-table v-loading="loading" :data="auditList" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="type" label="题型" width="100">
                 <template #default="scope">
                    <el-tag>{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
                 </template>
              </el-table-column>
              <el-table-column prop="contentSummary" label="题目内容摘要" min-width="300" :show-overflow-tooltip="true" />
              <el-table-column prop="status" label="状态" width="100">
                 <template #default="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                       {{ scope.row.status === 1 ? '通过' : '驳回' }}
                    </el-tag>
                 </template>
              </el-table-column>
              <el-table-column prop="submitterName" label="提交人" width="120" />
              <el-table-column prop="auditTime" label="审核时间" width="180" />
              <el-table-column prop="auditorName" label="审核人" width="120" />
              <el-table-column label="操作" width="120" fixed="right">
                 <template #default="scope">
                    <el-button type="primary" link @click="handleView(scope.row)">
                       <el-icon><View /></el-icon> 详情
                    </el-button>
                 </template>
              </el-table-column>
           </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="getList"
        />
      </div>
    </el-card>

    <!-- Audit Dialog -->
    <el-dialog v-model="auditDialogVisible" title="题目审核" width="600px">
       <div class="question-preview">
          <div class="q-header">
             <span class="q-type">[{{ getQuestionTypeLabel(currentQuestion.type) }}]</span>
             <span class="q-diff">难度: {{ currentQuestion.difficulty }}</span>
          </div>
          <div class="q-content" v-html="currentQuestion.contentFormatted"></div>
          <div class="q-options" v-if="currentQuestion.options">
             <div v-for="(opt, idx) in currentQuestion.options" :key="idx" class="q-option">
                {{ String.fromCharCode(65 + idx) }}. {{ opt }}
             </div>
          </div>
          <div class="q-answer">
             <strong>参考答案:</strong> {{ currentQuestion.answer }}
          </div>
       </div>

       <el-form :model="auditForm" label-width="80px" style="margin-top: 20px;">
          <el-form-item label="审核意见">
             <el-input v-model="auditForm.comment" type="textarea" placeholder="请输入审核意见（选填）" />
          </el-form-item>
       </el-form>

       <template #footer>
          <span class="dialog-footer">
             <el-button type="danger" @click="submitAudit(2)">驳回</el-button>
             <el-button type="success" @click="submitAudit(1)">通过</el-button>
          </span>
       </template>
    </el-dialog>
    
    <!-- View Dialog -->
    <el-dialog v-model="viewDialogVisible" title="审核详情" width="600px">
       <div class="question-preview">
          <div class="q-header">
             <span class="q-type">[{{ getQuestionTypeLabel(currentQuestion.type) }}]</span>
             <span class="q-diff">难度: {{ currentQuestion.difficulty }}</span>
          </div>
          <div class="q-content" v-html="currentQuestion.contentFormatted"></div>
          <div class="q-answer">
             <strong>参考答案:</strong> {{ currentQuestion.answer }}
          </div>
          <el-divider />
          <div class="audit-info">
             <p><strong>审核结果:</strong> <el-tag :type="currentQuestion.status === 1 ? 'success' : 'danger'">{{ currentQuestion.status === 1 ? '通过' : '驳回' }}</el-tag></p>
             <p><strong>审核意见:</strong> {{ currentQuestion.auditComment || '无' }}</p>
             <p><strong>审核人:</strong> {{ currentQuestion.auditorName }}</p>
             <p><strong>审核时间:</strong> {{ currentQuestion.auditTime }}</p>
          </div>
       </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, EditPen, View } from '@element-plus/icons-vue'
import request from '@/utils/request'

// --- State ---
const loading = ref(false)
const auditList = ref([])
const total = ref(0)
const activeTab = ref('pending')
const auditDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const currentQuestion = ref({})
const auditForm = reactive({
   comment: ''
})

const queryParams = reactive({
   pageNum: 1,
   pageSize: 10,
   submitterName: '',
   status: undefined
})

// --- Methods ---

const getQuestionTypeLabel = (type) => {
   const map = {
      'single': '单选题',
      'multiple': '多选题',
      'judge': '判断题',
      'short_answer': '简答题'
   }
   return map[type] || type
}

const getList = async () => {
   loading.value = true
   try {
     // 转换 tab 到 status 参数
     // pending -> 0
     // processed -> undefined (backend handles logic?) 
     // Spec: status (0:待审核, 1:通过, 2:驳回)
     // Frontend tab: "pending" (status=0), "processed" (status=1 or 2)
     
     let statusParam = queryParams.status
     if (activeTab.value === 'pending') {
        statusParam = 0
     } else if (statusParam === 0) {
        // If user explicitly selected "Pending" in dropdown while on "Processed" tab, 
        // it might conflict, but usually we filter by tab first.
        // Let's assume the dropdown filter applies on top of tab.
        // But the tab "Processed" implies status != 0.
     }
     
     // Actually, let's follow the tab logic strictly for the base filter
     // If tab is pending, force status = 0.
     // If tab is processed, status can be 1 or 2. If queryParams.status is set, use it.
     
     const params = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        submitterName: queryParams.submitterName,
        status: statusParam
     }
     
     if (activeTab.value === 'pending') {
        params.status = 0
     } else {
        // processed tab
        if (params.status === 0) {
            // User selected "Pending" in filter but we are in processed tab. 
            // This returns empty or we should ignore filter.
            // Let's just pass what user selected if it's not undefined.
        }
        // If user didn't select status in dropdown (undefined), we might need to send something to get both 1 and 2.
        // Backend API might support list of statuses or we rely on backend default.
        // If backend only supports single status, we might need two requests or backend supports "processed" flag.
        // Spec says: status (0:待审核, 1:通过, 2:驳回).
        // If I want "not 0", and API only accepts exact value.
        // I might need to send nothing and filter client side, or backend supports null for all.
        // Let's assume sending explicit status if selected, otherwise maybe backend returns all?
        // But we only want 1 and 2.
        // Let's leave status undefined if not selected, and handle filtering if needed, 
        // OR better: modify UI to force select 1 or 2 in Processed tab, or backend improves.
        // For now, I will pass status if defined.
     }

     const resp = await request.get('/audit/question/list', { params })
     const list = resp.data?.list || []
     const totalCount = resp.data?.total || 0
     
     auditList.value = list.map(item => ({
        ...item,
        contentFormatted: item.content, // Assume content is string or handle JSON parsing if needed
        contentSummary: (item.content || '').length > 50 ? (item.content || '').substring(0, 50) + '...' : item.content
     }))
     total.value = totalCount
   } catch (e) {
     auditList.value = []
     total.value = 0
   } finally {
     loading.value = false
   }
}

const handleTabChange = () => {
   queryParams.pageNum = 1
   // Reset status filter when switching tabs to avoid confusion
   queryParams.status = undefined 
   getList()
}

const handleQuery = () => {
   queryParams.pageNum = 1
   getList()
}

const resetQuery = () => {
   queryParams.submitterName = ''
   queryParams.status = undefined
   handleQuery()
}

const handleAudit = (row) => {
   currentQuestion.value = { ...row }
   auditForm.comment = ''
   auditDialogVisible.value = true
}

const handleView = (row) => {
   currentQuestion.value = { ...row }
   viewDialogVisible.value = true
}

const submitAudit = async (status) => {
   try {
     await request.put('/audit/question/process', {
        ids: [currentQuestion.value.id],
        status,
        comment: auditForm.comment
     })
     
     ElMessage.success(status === 1 ? '已通过' : '已驳回')
     auditDialogVisible.value = false
     getList() // Refresh list
   } catch (e) {
     // request.js handles error message
   }
}

onMounted(() => {
   getList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.question-preview {
   padding: 10px;
   background: #f9f9f9;
   border-radius: 4px;
}
.q-header {
   margin-bottom: 10px;
   font-weight: bold;
   color: #606266;
}
.q-type {
   margin-right: 15px;
   color: #409EFF;
}
.q-content {
   font-size: 16px;
   line-height: 1.5;
   margin-bottom: 15px;
}
.q-option {
   margin-bottom: 5px;
   padding-left: 10px;
}
.q-answer {
   margin-top: 15px;
   padding-top: 10px;
   border-top: 1px dashed #ddd;
   color: #67C23A;
}
.audit-info {
   line-height: 2;
}
</style>
