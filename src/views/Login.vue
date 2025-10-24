<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="../assets/logo.svg" alt="Logo" class="logo" />
        <h1 class="title">超星考试系统</h1>
        <p class="subtitle">智慧教学管理平台</p>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名" 
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="userType">
          <el-select v-model="loginForm.userType" placeholder="请选择用户类型" style="width: 100%" size="large">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} 超星考试系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const showMessage = inject('showMessage')
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  userType: 'student'
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  loading.value = true
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中应该调用后端API
    // const response = await axios.post('/api/login', loginForm)
    
    // 存储token
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('userType', loginForm.userType)
    localStorage.setItem('username', loginForm.username)
    
    showMessage('登录成功', 'success')
    router.push('/dashboard')
  } catch (error) {
    showMessage('登录失败: ' + (error.message || '未知错误'), 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  background-size: cover;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

@media (max-width: 768px) {
  .login-box {
    width: 90%;
    max-width: 400px;
    padding: 30px;
  }
}
</style>