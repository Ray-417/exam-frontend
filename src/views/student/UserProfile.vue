<template>
  <div class="user-profile-container">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card user-info-card">
          <div class="user-header">
            <el-avatar :size="100" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
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
import { ref, reactive, inject } from 'vue'
import { User, Message, School, Timer } from '@element-plus/icons-vue'

const showMessage = inject('showMessage')

const activeTab = ref('basic')

const userInfo = reactive({
  name: '张三',
  role: 'student',
  studentId: '2023001',
  email: 'zhangsan@example.com',
  class: '计算机科学与技术2301班',
  registerTime: '2023-09-01'
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
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
}

.user-info-card {
  text-align: center;
  margin-bottom: 20px;
}

.user-header {
  padding: 20px 0;
  border-bottom: 1px solid #EBEEF5;
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
