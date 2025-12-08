<template>
  <div class="page-container">
    <div class="header">
      <div class="header-left">
        <el-button link @click="$router.push({ name: 'AdminPermission' })">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <h2 style="margin-left: 10px; display: inline-block;">角色成员管理 - {{ roleName }}</h2>
      </div>
      <div class="actions">
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon> 添加成员
        </el-button>
      </div>
    </div>

    <el-card>
       <div class="filter-container" style="margin-bottom: 20px;">
           <el-input v-model="queryParams.username" placeholder="请输入用户名" style="width: 200px; margin-right: 10px;" @keyup.enter="handleQuery" />
           <el-input v-model="queryParams.realName" placeholder="请输入真实姓名" style="width: 200px; margin-right: 10px;" @keyup.enter="handleQuery" />
           <el-button type="primary" @click="handleQuery">搜索</el-button>
           <el-button @click="resetQuery">重置</el-button>
       </div>

       <el-table v-loading="loading" :data="userList" border style="width: 100%">
          <el-table-column prop="id" label="用户ID" width="100" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="realName" label="真实姓名" />
          <el-table-column prop="orgName" label="所属部门" />
          <el-table-column prop="phonenumber" label="手机号码" width="150" />
          <el-table-column prop="status" label="状态" width="100">
             <template #default="scope">
                <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
                   {{ scope.row.status === '1' ? '正常' : '停用' }}
                </el-tag>
             </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
             <template #default="scope">
                <el-button link type="danger" @click="handleRemove(scope.row)">
                   <el-icon><Delete /></el-icon> 取消授权
                </el-button>
             </template>
          </el-table-column>
       </el-table>
       
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

    <!-- Add User Dialog -->
    <el-dialog v-model="dialogVisible" title="选择用户" width="800px">
       <el-row :gutter="20">
          <!-- Org Tree -->
          <el-col :span="6">
             <el-input v-model="filterOrgText" placeholder="请输入部门名称" style="margin-bottom: 10px;" />
             <el-tree
                ref="orgTreeRef"
                :data="orgOptions"
                :props="{ label: 'name', children: 'children' }"
                :filter-node-method="filterOrgNode"
                default-expand-all
                highlight-current
                @node-click="handleOrgNodeClick"
             />
          </el-col>
          <!-- User List -->
          <el-col :span="18">
             <el-table 
                ref="multipleTableRef"
                :data="unassignedUserList" 
                @selection-change="handleSelectionChange"
                height="400px"
             >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="realName" label="真实姓名" />
                <el-table-column prop="orgName" label="部门" />
             </el-table>
          </el-col>
       </el-row>
       <template #footer>
          <span class="dialog-footer">
             <el-button @click="dialogVisible = false">取消</el-button>
             <el-button type="primary" @click="submitAddUser">确定</el-button>
          </span>
       </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const roleId = route.params.roleId
const roleName = ref('') // Should fetch from API or pass via query

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const filterOrgText = ref('')
const orgTreeRef = ref(null)
const orgOptions = ref([])
const unassignedUserList = ref([])
const multipleSelection = ref([])

const queryParams = reactive({
   pageNum: 1,
   pageSize: 10,
   username: '',
   realName: ''
})

// --- Methods ---

const getList = async () => {
   loading.value = true
   try {
     const resp = await request.get(`/system/role/${roleId}/allocated-users`, {
       params: queryParams
     })
     userList.value = resp.data?.list || []
     total.value = resp.data?.total || 0
   } catch (e) {
     console.error(e)
     userList.value = []
     total.value = 0
     // ElMessage.error(e.message || '加载用户列表失败') // handled
   } finally {
     loading.value = false
   }
}

const getRoleDetail = async () => {
    // Optional: Fetch role name if needed
    try {
        const resp = await request.get(`/system/role/${roleId}`)
        roleName.value = resp.data?.roleName || roleId
    } catch (e) {
        // Ignore error
    }
}

const handleQuery = () => {
   queryParams.pageNum = 1
   getList()
}

const resetQuery = () => {
   queryParams.username = ''
   queryParams.realName = ''
   handleQuery()
}

const handleRemove = (row) => {
   ElMessageBox.confirm(`确认取消用户 "${row.username}" 的授权吗？`, '警告', {
      type: 'warning'
   }).then(async () => {
      try {
          await request.delete('/system/role/users', {
              data: { roleId, userIds: [row.id] }
          })
          ElMessage.success('取消授权成功')
          getList()
      } catch (e) {
          // ElMessage.error(e.message || '取消授权失败') // handled
      }
   })
}

const loadOrgTree = async () => {
    try {
        const resp = await request.get('/org/tree')
        orgOptions.value = resp.data || []
    } catch (e) {
        console.error(e)
    }
}

const handleAddUser = () => {
   dialogVisible.value = true
   if (orgOptions.value.length === 0) {
       loadOrgTree()
   }
   loadUnassignedUsers()
}

const loadUnassignedUsers = async () => {
    try {
        const resp = await request.get(`/system/role/${roleId}/unallocated-users`, {
            params: {
                username: queryParams.username, // Reuse filters or add new ones
                realName: queryParams.realName
            }
        })
        unassignedUserList.value = resp.data?.list || []
    } catch (e) {
        unassignedUserList.value = []
    }
}

const handleSelectionChange = (val) => {
   multipleSelection.value = val
}

const submitAddUser = async () => {
   if (multipleSelection.value.length === 0) {
      ElMessage.warning('请选择用户')
      return
   }
   const userIds = multipleSelection.value.map(u => u.id)
   try {
       await request.post('/system/role/users', {
           roleId,
           userIds
       })
       ElMessage.success(`成功添加 ${userIds.length} 名用户`)
       dialogVisible.value = false
       getList()
   } catch (e) {
       // ElMessage.error(e.message || '添加失败') // handled
   }
}

// Org Tree Logic
watch(filterOrgText, (val) => {
   orgTreeRef.value.filter(val)
})

const filterOrgNode = (value, data) => {
   if (!value) return true
   return data.name.includes(value)
}

const handleOrgNodeClick = (data) => {
   // Filter unassigned users by org
   // Ideally call API with orgId
   // loadUnassignedUsers(data.id)
   console.log('Selected Org:', data.name)
}

onMounted(() => {
   getList()
   getRoleDetail()
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
.header-left {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
