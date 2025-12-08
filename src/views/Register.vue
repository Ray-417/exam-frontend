<template>
  <div class="register-container">
    <ParticlesBackground color="rgba(255, 255, 255, 0.6)" :count="100" />
    <div class="register-box">
      <div class="register-header">
        <img src="../assets/logo.svg" alt="Logo" class="logo" />
        <h1 class="title">注册新账号</h1>
        <p class="subtitle">加入超星考试系统</p>
      </div>
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="用户名" 
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="密码" 
            prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
      <el-form-item prop="email">
        <el-input 
          v-model="registerForm.email" 
          placeholder="邮箱 (选填)" 
          :prefix-icon="Message"
          size="large"
        />
      </el-form-item>
      <el-form-item prop="userType" label="用户类型">
        <el-select v-model="registerForm.userType" placeholder="请选择用户类型" size="large">
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
        </el-select>
      </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" class="register-button">立即注册</el-button>
        </el-form-item>
        <div class="extra-actions">
          <span class="has-account">已有账号？ <el-button link type="primary" @click="router.push('/login')">立即登录</el-button></span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message } from '@element-plus/icons-vue'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import request from '@/utils/request'

const router = useRouter()
const showMessage = inject('showMessage')
const loading = ref(false)
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  userType: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await request.post('/auth/register', {
        username: registerForm.username,
        password: registerForm.password,
        userType: registerForm.userType,
        email: registerForm.email
      })
      
      showMessage('注册成功，请登录', 'success')
      router.push('/login')
    } catch (error) {
      // request.js 拦截器已处理错误提示
      // showMessage('注册失败: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  position: relative;
  overflow: hidden;
}

.register-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.register-form {
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.extra-actions {
  text-align: center;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .register-box {
    width: 90%;
    padding: 30px;
  }
}
</style>
