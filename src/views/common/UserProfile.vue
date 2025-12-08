<template>
  <div class="page-container">
    <h2>个人信息</h2>
    <el-card>
      <el-form :model="userInfo" label-width="100px" style="max-width: 500px">
        <el-form-item label="头像">
          <el-avatar :size="64" :src="userInfo.avatarUrl">{{ userInfo.username?.charAt(0) }}</el-avatar>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="userInfo.realName" disabled />
        </el-form-item>
        <el-form-item label="角色">
           <el-tag>{{ getUserRoleLabel(userInfo.role) }}</el-tag>
        </el-form-item>
        
        <!-- Role Specific Fields -->
        <template v-if="userInfo.role === 'student'">
            <el-form-item label="学号">
               <el-input v-model="userInfo.studentNo" disabled />
            </el-form-item>
            <el-form-item label="班级">
               <el-input v-model="userInfo.className" disabled />
            </el-form-item>
        </template>
        
        <template v-if="userInfo.role === 'teacher'">
            <el-form-item label="工号">
               <el-input v-model="userInfo.teacherNo" disabled />
            </el-form-item>
            <el-form-item label="部门">
               <el-input v-model="userInfo.deptName" disabled />
            </el-form-item>
        </template>
        
        <el-form-item label="手机号码">
          <el-input v-model="userInfo.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userInfo.email" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const userInfo = ref({
    username: '',
    realName: '',
    role: '',
    phone: '',
    email: '',
    avatarUrl: '',
    // Student specific
    studentNo: '',
    className: '',
    // Teacher specific
    teacherNo: '',
    deptName: ''
})

const getUserRoleLabel = (role) => {
    const map = {
        'admin': '系统管理员',
        'teacher': '教师',
        'student': '学生'
    }
    return map[role] || role
}

const loadUserInfo = async () => {
    // Mock Data
    const role = localStorage.getItem('userType')
    const username = localStorage.getItem('username')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    userInfo.value = {
        username: username || 'admin',
        realName: role === 'student' ? '张同学' : (role === 'teacher' ? '李老师' : '管理员'),
        role: role,
        phone: '13800138000',
        email: 'test@example.com',
        avatarUrl: '',
        studentNo: '2023001',
        className: '软件工程2101',
        teacherNo: 'T001',
        deptName: '计算机学院'
    }
}

const saveProfile = async () => {
    // Mock API call
    ElMessage.success('保存成功')
}

onMounted(() => {
    loadUserInfo()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
