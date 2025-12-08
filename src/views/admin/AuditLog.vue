<template>
  <div class="page-container">
    <div class="header">
      <h2>操作日志</h2>
    </div>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="系统模块" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入系统模块"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input
            v-model="queryParams.operName"
            placeholder="请输入操作人员"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="类型" prop="businessType">
          <el-select
            v-model="queryParams.businessType"
            placeholder="操作类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in sys_oper_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="操作状态"
            clearable
            style="width: 240px"
          >
            <el-option label="正常" :value="0" />
            <el-option label="异常" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间" style="width: 308px">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
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

    <!-- Toolbar -->
    <div class="table-toolbar">
      <el-button type="danger" plain :disabled="ids.length === 0" @click="handleDelete">
        <el-icon><Delete /></el-icon> 删除
      </el-button>
      <el-button type="danger" plain @click="handleClean">
        <el-icon><Delete /></el-icon> 清空
      </el-button>
      <el-button type="warning" plain @click="handleExport">
        <el-icon><Download /></el-icon> 导出
      </el-button>
    </div>

    <!-- Data Table -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="logList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="日志编号" align="center" prop="id" width="100" />
        <el-table-column label="系统模块" align="center" prop="title" />
        <el-table-column label="操作类型" align="center" prop="businessType">
          <template #default="scope">
            <el-tag :type="getBusinessTypeTag(scope.row.businessType)">
              {{ getBusinessTypeLabel(scope.row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="请求方式" align="center" prop="requestMethod" />
        <el-table-column label="操作人员" align="center" prop="operName" width="120" />
        <el-table-column label="主机" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
        <el-table-column label="操作状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作日期" align="center" prop="operTime" width="180">
          <template #default="scope">
            <span>{{ scope.row.operTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消耗时间" align="center" prop="costTime" width="100">
          <template #default="scope">
            <span>{{ scope.row.costTime }}毫秒</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">
              <el-icon><View /></el-icon> 详细
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="open" title="操作日志详细" width="700px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ getBusinessTypeLabel(form.businessType) }}</el-form-item>
            <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">
              <div class="code-box">{{ form.operParam }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">
              <div class="code-box">{{ form.jsonResult }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else style="color: #F56C6C">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消耗时间：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">
               <div class="code-box error-text">{{ form.errorMsg }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Download, View } from '@element-plus/icons-vue'
import request from '@/utils/request'

// --- Constants ---
const sys_oper_type = [
  { value: 1, label: '新增' },
  { value: 2, label: '修改' },
  { value: 3, label: '删除' },
  { value: 4, label: '授权' },
  { value: 5, label: '导出' },
  { value: 6, label: '导入' },
  { value: 7, label: '强退' },
  { value: 8, label: '生成代码' },
  { value: 9, label: '清空数据' }
]

// --- State ---
const loading = ref(true)
const ids = ref([])
const total = ref(0)
const logList = ref([])
const open = ref(false)
const dateRange = ref([])
const queryRef = ref(null)
const form = ref({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  }
})

const { queryParams } = toRefs(data)

// --- Methods ---

const getBusinessTypeLabel = (type) => {
  const found = sys_oper_type.find(item => item.value === type)
  return found ? found.label : '其他'
}

const getBusinessTypeTag = (type) => {
  switch (type) {
    case 1: return 'success' // 新增
    case 2: return 'warning' // 修改
    case 3: return 'danger'  // 删除
    case 4: return 'primary' // 授权
    default: return 'info'
  }
}

/** 查询登录日志 */
const getList = async () => {
  loading.value = true
  const params = { ...queryParams.value }
  if (dateRange.value && dateRange.value.length === 2) {
     params.beginTime = dateRange.value[0]
     params.endTime = dateRange.value[1]
  }
  
  try {
    const resp = await request.get('/monitor/operlog/list', { params })
    logList.value = resp.data?.list || []
    total.value = resp.data?.total || 0
  } catch (e) {
    logList.value = []
    total.value = 0
    // request.js already handles error message
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = []
  queryRef.value.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
}

/** 详细按钮操作 */
const handleView = (row) => {
  open.value = true
  form.value = row
}

/** 删除按钮操作 */
const handleDelete = async (row) => {
  const operIds = row.id || ids.value
  ElMessageBox.confirm(`是否确认删除日志编号为"${operIds}"的数据项？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
     try {
       await request.delete(`/monitor/operlog/${operIds}`)
       ElMessage.success('删除成功')
       getList()
     } catch (e) {
       // handled by interceptor
     }
  })
}

/** 清空按钮操作 */
const handleClean = () => {
  ElMessageBox.confirm('是否确认清空所有操作日志数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete('/monitor/operlog/clean')
      ElMessage.success('清空成功')
      getList()
    } catch (e) {
      // handled
    }
  })
}

const handleExport = () => {
  ElMessage.warning('演示环境暂不支持导出')
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
.header h2 {
  margin: 0;
  color: #303133;
}
.search-card {
  margin-bottom: 20px;
}
.table-toolbar {
  margin-bottom: 15px;
}
.table-card {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.code-box {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  max-height: 200px;
  overflow: auto;
  font-family: monospace;
  word-break: break-all;
}
.error-text {
    color: #F56C6C;
}
</style>
