<template>
  <div class="user-profile-container">
    <div class="page-header">
      <h2 class="page-title">个人空间</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card user-info-card">
          <div class="user-header">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :http-request="customUpload"
              :before-upload="beforeAvatarUpload"
            >
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatar" />
                <div class="avatar-mask">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </el-upload>
            <h2 class="username">{{ userInfo.name }}</h2>
            <p class="role-tag"><el-tag>{{ userInfo.role === 'student' ? '学生' : '未知' }}</el-tag></p>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <el-icon><User /></el-icon>
              <span>学号: {{ userInfo.studentId }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Message /></el-icon>
              <span>邮箱: {{ userInfo.email }}</span>
            </div>
            <div class="detail-item">
              <el-icon><School /></el-icon>
              <span>班级: {{ userInfo.class }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Timer /></el-icon>
              <span>注册时间: {{ userInfo.registerTime }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16" :xs="24">
        <el-card class="box-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="basic">
              <el-form :model="form" label-width="80px" class="profile-form">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input v-model="form.bio" type="textarea" :rows="4" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSaveProfile">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="安全设置" name="security">
              <el-form :model="securityForm" label-width="100px" class="profile-form">
                <el-form-item label="当前密码">
                  <el-input v-model="securityForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码">
                  <el-input v-model="securityForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认新密码">
                  <el-input v-model="securityForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { User, Message, School, Timer, Camera } from '@element-plus/icons-vue'

const route = useRoute()
const showMessage = inject('showMessage')

const activeTab = ref('basic')

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
})

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const userInfo = reactive({
  name: '张三',
  role: 'student',
  studentId: '2023001',
  email: 'zhangsan@example.com',
  class: '计算机科学与技术2301班',
  registerTime: '2023-09-01',
  avatar: localStorage.getItem('userAvatar') || defaultAvatar
})

const form = reactive({
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  bio: '好好学习，天天向上。'
})

const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSaveProfile = () => {
  showMessage('个人资料保存成功', 'success')
  // 更新显示的名称
  userInfo.name = form.name
  userInfo.email = form.email
}

const handleChangePassword = () => {
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    showMessage('两次输入的密码不一致', 'error')
    return
  }
  if (!securityForm.oldPassword) {
    showMessage('请输入当前密码', 'warning')
    return
  }
  showMessage('密码修改成功，请重新登录', 'success')
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    showMessage('头像必须是 JPG 或 PNG 格式!', 'error')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    showMessage('头像大小不能超过 2MB!', 'error')
    return false
  }
  return true
}

const customUpload = (options) => {
  const { file } = options
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    // 模拟上传成功
    setTimeout(() => {
      userInfo.avatar = reader.result
      localStorage.setItem('userAvatar', reader.result)
      // 触发全局事件通知 Dashboard 更新头像
      window.dispatchEvent(new Event('user-info-update'))
      showMessage('头像上传成功', 'success')
    }, 500)
  }
}

const handleAvatarSuccess = () => {
  // This is handled in customUpload
}
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #E4E7ED;
}

.page-title { 
  font-size: 24px; 
  color: #303133; 
  margin: 0; 
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
}

.user-info-card {
  text-align: center;
  margin-bottom: 20px;
}

.user-header {
  padding: 20px 0;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  display: inline-block;
  cursor: pointer;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}

.avatar-wrapper:hover .avatar-mask {
  opacity: 1;
}

.avatar-mask .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.username {
  margin: 10px 0 5px;
  font-size: 20px;
  color: #303133;
}

.role-tag {
  margin: 0;
}

.user-details {
  padding: 20px 0;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.detail-item .el-icon {
  margin-right: 10px;
  font-size: 16px;
}

.profile-form {
  padding: 20px 0;
  max-width: 500px;
}
</style>
