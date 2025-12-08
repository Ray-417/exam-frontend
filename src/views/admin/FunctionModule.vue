<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">功能模块管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>新建模块
        </el-button>
        <el-button @click="loadModules">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="模块名称/编码/路由" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="选择分类" clearable style="width: 180px">
            <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 160px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="modules" border style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="code" label="编码" min-width="140" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="启用" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.enabled" @change="val => handleToggleStatus(scope.row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="routePath" label="路由路径" min-width="180" />
        <el-table-column prop="showInMenu" label="菜单显示" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.showInMenu ? 'success' : 'info'">{{ scope.row.showInMenu ? '显示' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见角色" min-width="180">
          <template #default="scope">
            <el-tag v-for="r in scope.row.allowedRoles" :key="r" type="info" style="margin-right: 6px">{{ roleLabel(r) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="依赖模块" min-width="200">
          <template #default="scope">
            <el-tag v-for="d in scope.row.dependencies" :key="d" type="warning" style="margin-right: 6px">{{ d }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.mode === 'create' ? '新建模块' : '编辑模块'" width="700px">
      <el-form :model="dialog.form" :rules="dialog.rules" ref="dialogFormRef" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialog.form.name" placeholder="模块名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="dialog.form.code" placeholder="唯一编码，如 exam_mgmt" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="dialog.form.category" placeholder="选择分类">
            <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="dialog.form.version" placeholder="如 1.0.0" />
        </el-form-item>
        <el-form-item label="路由路径" prop="routePath">
          <el-input v-model="dialog.form.routePath" placeholder="如 /dashboard/admin/function-module" />
        </el-form-item>
        <el-form-item label="菜单显示" prop="showInMenu">
          <el-switch v-model="dialog.form.showInMenu" />
        </el-form-item>
        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="dialog.form.enabled" />
        </el-form-item>
        <el-form-item label="可见角色" prop="allowedRoles">
          <el-select v-model="dialog.form.allowedRoles" multiple placeholder="选择角色">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="依赖模块" prop="dependencies">
          <el-select v-model="dialog.form.dependencies" multiple filterable placeholder="选择依赖">
            <el-option v-for="m in moduleCodeOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="模块说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" :loading="dialog.saving" @click="saveModule">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const showMessage = inject('showMessage')

const filters = reactive({ keyword: '', category: '', status: '' })
const categoryOptions = ref([
  { label: '考试', value: 'exam' },
  { label: '题库', value: 'question' },
  { label: '成绩', value: 'score' },
  { label: '统计分析', value: 'analytics' },
  { label: '系统', value: 'system' }
])

const roleOptions = ref([
  { label: '管理员', value: 'admin' },
  { label: '教师', value: 'teacher' },
  { label: '学生', value: 'student' }
])

const modules = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })

const dialog = reactive({
  visible: false,
  mode: 'create',
  saving: false,
  form: {
    id: null,
    name: '',
    code: '',
    category: '',
    version: '1.0.0',
    enabled: true,
    showInMenu: true,
    routePath: '',
    allowedRoles: [],
    dependencies: [],
    description: ''
  },
  rules: {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    routePath: [{ required: true, message: '请输入路由路径', trigger: 'blur' }]
  }
})

const dialogFormRef = ref(null)

const moduleCodeOptions = computed(() => modules.value.map(m => m.code))

const roleLabel = (v) => {
  const r = roleOptions.value.find(i => i.value === v)
  return r ? r.label : v
}

const loadModules = async () => {
  try {
    const resp = await request.get('/system/modules', {
      params: {
        page: pagination.page,
        size: pagination.size,
        keyword: filters.keyword,
        category: filters.category,
        status: filters.status
      }
    })
    const list = resp.data?.list || []
    const total = resp.data?.total || 0
    modules.value = list
    pagination.total = total
  } catch (e) {
    modules.value = []
    pagination.total = 0
    // showMessage(e.message || '加载失败', 'error') // handled by request
  }
}

const updateLocalDisabledModules = () => {
  const disabled = modules.value.filter(m => !m.enabled).map(m => m.code)
  localStorage.setItem('disabledModules', disabled.join(','))
  // Dispatch event so other components can listen if they want (optional)
  window.dispatchEvent(new Event('storage'))
}

const handleSearch = () => {
  pagination.page = 1
  loadModules()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.category = ''
  filters.status = ''
  handleSearch()
}

const handleSizeChange = () => {
  pagination.page = 1
  loadModules()
}

const handleCurrentChange = () => {
  loadModules()
}

const openCreateDialog = () => {
  dialog.mode = 'create'
  Object.assign(dialog.form, {
    id: null,
    name: '',
    code: '',
    category: '',
    version: '1.0.0',
    enabled: true,
    showInMenu: true,
    routePath: '',
    allowedRoles: [],
    dependencies: [],
    description: ''
  })
  dialog.visible = true
}

const openEditDialog = (row) => {
  dialog.mode = 'edit'
  Object.assign(dialog.form, row)
  dialog.visible = true
}

const handleDelete = async (row) => {
  try {
    await request.delete(`/system/modules/${row.id}`)
    showMessage('删除成功', 'success')
    loadModules()
  } catch (e) {
    // handled
  }
}

const handleToggleStatus = async (row, val) => {
  try {
    // Call backend API
    await request.patch(`/system/modules/${row.id}/status`, { enabled: val })
    
    // Update local state
    row.enabled = val
    updateLocalDisabledModules()
    showMessage('状态已更新 (请刷新页面查看左侧菜单变化)', 'success')
  } catch (e) {
    row.enabled = !val // Revert on error
    // handled
  }
}

const saveModule = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    dialog.saving = true
    try {
      if (dialog.mode === 'create') {
        await request.post('/system/modules', dialog.form)
      } else {
        await request.put(`/system/modules/${dialog.form.id}`, dialog.form)
      }
      showMessage('保存成功', 'success')
      dialog.visible = false
      loadModules()
    } catch (e) {
      // handled
    } finally {
      dialog.saving = false
    }
  })
}

onMounted(() => {
  loadModules()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}
.filter-card {
  margin-bottom: 16px;
}
.filter-form {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.dialog-footer {
  display: inline-flex;
  gap: 8px;
}
</style>
