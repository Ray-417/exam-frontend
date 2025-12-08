<template>
  <div class="page-container">
    <div class="header">
      <h2>权限管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleAddRole">
          <el-icon><Plus /></el-icon> 新增角色
        </el-button>
      </div>
    </div>

    <!-- Role List Table -->
    <el-card class="role-list-card">
      <el-table :data="roleList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="角色字符" width="150">
          <template #default="scope">
            <el-tag>{{ scope.row.roleKey }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataScope" label="数据权限范围" width="250">
          <template #default="scope">
            <div v-if="scope.row.dataScope === '2'">
               <el-tag type="warning" effect="plain">自定义数据权限</el-tag>
               <el-tooltip content="点击查看具体部门" placement="top">
                  <el-button type="primary" link icon="Search" style="margin-left: 5px" />
               </el-tooltip>
            </div>
            <el-tag v-else type="info" effect="plain">{{ getDataScopeLabel(scope.row.dataScope) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="250">
          <template #default="scope">
            <el-button link type="primary" @click="handleEditRole(scope.row)">编辑</el-button>
            <el-button link type="primary" @click="handlePermission(scope.row)">菜单权限</el-button>
            <el-button link type="primary" @click="handleViewUsers(scope.row)">分配用户</el-button>
            <el-button link type="danger" @click="handleDeleteRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Role Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
    >
      <el-form :model="roleForm" :rules="rules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色字符" prop="roleKey">
          <el-input v-model="roleForm.roleKey" placeholder="请输入角色字符" />
        </el-form-item>
        <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="roleForm.dataScope" placeholder="请选择数据权限范围" @change="handleDataScopeChange">
            <el-option label="全部数据权限" value="1" />
            <el-option label="自定义数据权限" value="2" />
            <el-option label="本部门数据权限" value="3" />
            <el-option label="本部门及以下数据权限" value="4" />
            <el-option label="仅本人数据权限" value="5" />
          </el-select>
        </el-form-item>
        
        <!-- Custom Data Scope Tree -->
        <el-form-item label="数据范围" v-show="roleForm.dataScope === '2'">
           <div class="tree-border">
              <el-tree
                 ref="deptTreeRef"
                 :data="deptOptions"
                 show-checkbox
                 default-expand-all
                 node-key="id"
                 :props="{ label: 'name', children: 'children' }"
              />
           </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Permission Assignment Dialog -->
    <el-dialog
      v-model="permDialogVisible"
      title="分配菜单权限"
      width="600px"
    >
      <el-form label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="currentRole.roleName" disabled />
        </el-form-item>
        <el-form-item label="角色字符">
          <el-input v-model="currentRole.roleKey" disabled />
        </el-form-item>
        <el-form-item label="菜单权限">
          <div class="tree-border">
            <el-tree
              ref="menuTreeRef"
              :data="menuOptions"
              show-checkbox
              node-key="id"
              :props="{ label: 'name', children: 'children' }"
              default-expand-all
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// --- State ---
const loading = ref(false)
const roleList = ref([])
const dialogVisible = ref(false)
const permDialogVisible = ref(false)
const dialogType = ref('add')
const menuOptions = ref([])
const deptOptions = ref([]) // For Custom Data Scope
const roleFormRef = ref(null)
const menuTreeRef = ref(null)
const deptTreeRef = ref(null)

const roleForm = reactive({
  id: undefined,
  roleName: '',
  roleKey: '',
  dataScope: '1',
  status: 1,
  deptIds: []
})

const currentRole = ref({})

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入角色字符', trigger: 'blur' }],
  dataScope: [{ required: true, message: '请选择数据权限', trigger: 'change' }]
}

// --- Methods ---

const loadRoles = async () => {
  loading.value = true
  try {
    const resp = await request.get('/system/role/list')
    roleList.value = resp.data || []
  } catch (e) {
    // ElMessage.error(e.message || '加载角色列表失败') // handled
    roleList.value = []
  } finally {
    loading.value = false
  }
}

const loadMenuTree = async () => {
  try {
    const resp = await request.get('/system/menu/routes')
    menuOptions.value = resp.data || []
  } catch (e) {
    console.error(e)
    // ElMessage.error('加载菜单树失败') // handled
  }
}

const loadDeptTree = async () => {
  try {
    const resp = await request.get('/org/tree')
    deptOptions.value = resp.data || []
  } catch (e) {
    console.error(e)
    // ElMessage.error('加载部门树失败') // handled
  }
}

const getDataScopeLabel = (value) => {
  const map = {
    '1': '全部数据权限',
    '2': '自定义数据权限',
    '3': '本部门数据权限',
    '4': '本部门及以下数据权限',
    '5': '仅本人数据权限'
  }
  return map[value] || '未知'
}

const handleAddRole = async () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // Load dept tree for data scope selection if not loaded
  if (deptOptions.value.length === 0) {
    await loadDeptTree()
  }
  
  Object.assign(roleForm, {
    id: undefined,
    roleName: '',
    roleKey: '',
    dataScope: '1',
    status: 1,
    deptIds: []
  })
  
  nextTick(() => {
     roleFormRef.value?.clearValidate()
     deptTreeRef.value?.setCheckedKeys([])
  })
}

const handleEditRole = async (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  if (deptOptions.value.length === 0) {
    await loadDeptTree()
  }
  
  Object.assign(roleForm, { ...row, deptIds: row.deptIds || [] })
  
  nextTick(() => {
     roleFormRef.value?.clearValidate()
     if (roleForm.dataScope === '2') {
         deptTreeRef.value?.setCheckedKeys(roleForm.deptIds || [])
     }
  })
}

const handleDataScopeChange = (value) => {
    // If needed to reset tree selection when switching away from '2'
}

const submitRoleForm = async () => {
  if (!roleFormRef.value) return
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (roleForm.dataScope === '2') {
          roleForm.deptIds = deptTreeRef.value.getCheckedKeys()
      }
      
      try {
        if (dialogType.value === 'add') {
          await request.post('/system/role', roleForm)
          ElMessage.success('新增成功')
        } else {
          await request.put('/system/role', roleForm)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        loadRoles()
      } catch (e) {
        // ElMessage.error(e.message || (dialogType.value === 'add' ? '新增失败' : '修改失败')) // handled
      }
    }
  })
}

const handleDeleteRole = (row) => {
  ElMessageBox.confirm(`确认删除角色 "${row.roleName}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/system/role/${row.id}`)
      ElMessage.success('删除成功')
      loadRoles()
    } catch (e) {
      // ElMessage.error(e.message || '删除失败') // handled
    }
  })
}

const handleStatusChange = async (row) => {
  const originalStatus = row.status === 1 ? 0 : 1
  try {
    // Use PUT to update status as per spec generic update, or if there's a specific endpoint
    // Spec says: "修改角色时，可同时更新 data_scope". It implies PUT /api/system/role is for all updates.
    await request.put('/system/role', { ...row })
    ElMessage.success(`已${row.status === 1 ? '启用' : '停用'}角色 ${row.roleName}`)
  } catch (e) {
    row.status = originalStatus // Revert
    // ElMessage.error(e.message || '状态更新失败') // handled
  }
}

// --- Permission Logic ---

const handlePermission = async (row) => {
  currentRole.value = { ...row }
  permDialogVisible.value = true
  
  // Ensure menu tree is loaded
  if (menuOptions.value.length === 0) {
    await loadMenuTree()
  }
  
  try {
    const resp = await request.get(`/system/menu/role/${row.id}`)
    const checkedKeys = resp.data || [] // Assuming returns array of menuIds
    
    nextTick(() => {
      menuTreeRef.value.setCheckedKeys(checkedKeys)
    })
  } catch (e) {
    console.error(e)
    // ElMessage.error('加载角色权限失败') // handled
    // Reset if failed
    nextTick(() => {
      menuTreeRef.value?.setCheckedKeys([])
    })
  }
}

const submitPermForm = async () => {
  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  
  try {
    await request.put('/system/role/auth', {
      roleId: currentRole.value.id,
      menuIds: allKeys
    })
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
  } catch (e) {
    // ElMessage.error(e.message || '权限分配失败') // handled
  }
}

// --- User Assignment Logic (Navigation) ---
const handleViewUsers = (row) => {
    router.push({ name: 'AdminRoleUsers', params: { roleId: row.id } })
}

onMounted(() => {
  loadRoles()
})

</script>

<style scoped>
.page-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header h2 {
  margin: 0;
  color: #303133;
}
.role-list-card {
  margin-bottom: 20px;
}
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #ffffff;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
}
</style>
