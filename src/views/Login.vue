<template>
  <div class="login-container">
    <ParticlesBackground color="rgba(255, 255, 255, 0.6)" :count="100" />
    <div class="login-box">
      <div class="login-header">
        <img src="../assets/logo.svg" alt="Logo" class="logo" />
        <h1 class="title">超星考试系统</h1>
        <p class="subtitle">智慧教学管理平台</p>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名 (admin/teacher/student)" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            :prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
        <div class="extra-actions">
          <el-button link type="info" @click="router.push('/forgot-password')">忘记密码？</el-button>
          <el-button link type="primary" @click="router.push('/register')">注册新账号</el-button>
        </div>
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
import ParticlesBackground from '../components/ParticlesBackground.vue'

const router = useRouter()
const showMessage = inject('showMessage')
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 简单的角色判断逻辑
        let userType = 'student'
        if (loginForm.username.includes('admin')) {
          userType = 'admin'
        } else if (loginForm.username.includes('teacher')) {
          userType = 'teacher'
        }
        
        // 存储token
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('userType', userType)
        localStorage.setItem('username', loginForm.username)
        
        showMessage('登录成功，欢迎回来！', 'success')
        
        // 根据角色跳转
        if (userType === 'admin') {
          router.push({ name: 'AdminFunctionModule' })
        } else if (userType === 'teacher') {
          router.push({ name: 'TeacherPractice' })
        } else {
          router.push({ name: 'StudentExamList' })
        }
      } catch (error) {
        showMessage('登录失败: ' + (error.message || '未知错误'), 'error')
      } finally {
        loading.value = false
      }
    }
  })
}
const loginFormRef = ref(null)
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.extra-actions {
  display: flex;
  justify-content: space-between;
  margin-top: -10px;
  margin-bottom: 20px;
  padding: 0 4px;
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
