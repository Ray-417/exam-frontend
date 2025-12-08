<template>
  <div class="forgot-container">
    <ParticlesBackground color="rgba(255, 255, 255, 0.6)" :count="80" />
    <div class="forgot-box">
      <div class="forgot-header">
        <h1 class="title">重置密码</h1>
        <p class="subtitle">请输入您的注册邮箱或手机号</p>
      </div>
      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" class="forgot-form">
        <el-form-item prop="account">
          <el-input 
            v-model="forgotForm.account" 
            placeholder="邮箱 / 手机号" 
            prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <el-form-item v-if="step === 2" prop="code">
          <div class="code-container">
             <el-input 
              v-model="forgotForm.code" 
              placeholder="验证码" 
              prefix-icon="Key"
              size="large"
            />
            <el-button :disabled="timer > 0" @click="sendCode" class="send-btn">
              {{ timer > 0 ? `${timer}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="step === 3" prop="newPassword">
           <el-input 
            v-model="forgotForm.newPassword" 
            type="password"
            placeholder="新密码" 
            prefix-icon="Lock"
            size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleAction" class="action-button">
            {{ actionText }}
          </el-button>
        </el-form-item>
        
        <div class="extra-actions">
          <el-button link type="info" @click="router.push('/login')">返回登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Key, Lock } from '@element-plus/icons-vue'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import request from '@/utils/request'

const router = useRouter()
const showMessage = inject('showMessage')
const loading = ref(false)
const forgotFormRef = ref(null)
const step = ref(1) // 1: input account, 2: verify code, 3: set new password
const timer = ref(0)

const forgotForm = reactive({
  account: '',
  code: '',
  newPassword: ''
})

const forgotRules = {
  account: [
    { required: true, message: '请输入邮箱或手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const actionText = computed(() => {
  switch(step.value) {
    case 1: return '下一步'
    case 2: return '验证'
    case 3: return '重置密码'
    default: return '提交'
  }
})

const sendCode = () => {
  timer.value = 60
  showMessage('验证码已发送 (模拟: 123456)', 'success')
  const interval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

const handleAction = async () => {
  if (!forgotFormRef.value) return

  const fieldsToValidate = []
  if (step.value === 1) fieldsToValidate.push('account')
  if (step.value === 2) fieldsToValidate.push('code')
  if (step.value === 3) fieldsToValidate.push('newPassword')

  await forgotFormRef.value.validateField(fieldsToValidate, async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (step.value === 1) {
        step.value = 2
        sendCode()
      } else if (step.value === 2) {
        // 模拟验证码验证
        if (forgotForm.code !== '123456') {
          throw new Error('验证码错误')
        }
        step.value = 3
      } else if (step.value === 3) {
        await request.post('/auth/reset-password', {
          username: forgotForm.account,
          newPassword: forgotForm.newPassword
        })
        
        showMessage('密码重置成功，请重新登录', 'success')
        router.push('/login')
      }
    } catch (error) {
      // request.js 拦截器已处理错误提示 (API调用错误)
      // 本地校验错误 (如验证码) 仍需显示
      if (step.value !== 3 || !error.response) {
         showMessage(error.message || '操作失败', 'error')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.forgot-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  position: relative;
  overflow: hidden;
}

.forgot-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.forgot-header {
  text-align: center;
  margin-bottom: 30px;
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

.forgot-form {
  margin-bottom: 20px;
}

.action-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.code-container {
    display: flex;
    gap: 10px;
}

.send-btn {
    width: 120px;
}

.extra-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .forgot-box {
    width: 90%;
    padding: 30px;
  }
}
</style>
