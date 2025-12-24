<template>
  <div class="dashboard-container">
    <el-container class="dashboard-layout">
      <el-aside width="220px" class="sidebar">
        <div class="logo-container">
          <img src="../assets/logo.svg" alt="Logo" class="logo" />
          <h2 class="logo-text">超星考试系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :router="true"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#1890ff"
        >
          <!-- Common Home -->
          <el-menu-item index="/dashboard/home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <!-- Admin Menu -->
          <template v-if="userType === 'admin'">
            <el-menu-item 
              index="/dashboard/admin/function-module"
              :class="{ 'is-disabled-module': isModuleDisabled('sys_module') }"
              @click="handleMenuClick($event, 'sys_module')"
            >
              <el-icon><Menu /></el-icon>
              <span>功能模块管理</span>
              <el-icon v-if="isModuleDisabled('sys_module')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/admin/org-management"
              :class="{ 'is-disabled-module': isModuleDisabled('sys_org') }"
              @click="handleMenuClick($event, 'sys_org')"
            >
              <el-icon><OfficeBuilding /></el-icon>
              <span>组织机构管理</span>
              <el-icon v-if="isModuleDisabled('sys_org')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/admin/permission"
              :class="{ 'is-disabled-module': isModuleDisabled('sys_perm') }"
              @click="handleMenuClick($event, 'sys_perm')"
            >
              <el-icon><Lock /></el-icon>
              <span>权限管理</span>
              <el-icon v-if="isModuleDisabled('sys_perm')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/admin/audit-log"
              :class="{ 'is-disabled-module': isModuleDisabled('sys_log') }"
              @click="handleMenuClick($event, 'sys_log')"
            >
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
              <el-icon v-if="isModuleDisabled('sys_log')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
          </template>

          <!-- Student Menu -->
          <template v-if="userType === 'student'">
            <el-menu-item 
              index="/dashboard/student/exam-list"
              :class="{ 'is-disabled-module': isModuleDisabled('stu_exam') }"
              @click="handleMenuClick($event, 'stu_exam')"
            >
              <el-icon><Monitor /></el-icon>
              <span>查看考试</span>
              <el-icon v-if="isModuleDisabled('stu_exam')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/student/practice"
              :class="{ 'is-disabled-module': isModuleDisabled('stu_practice') }"
              @click="handleMenuClick($event, 'stu_practice')"
            >
              <el-icon><EditPen /></el-icon>
              <span>练题题库</span>
              <el-icon v-if="isModuleDisabled('stu_practice')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/student/personalized"
              :class="{ 'is-disabled-module': isModuleDisabled('stu_personalized') }"
              @click="handleMenuClick($event, 'stu_personalized')"
            >
              <el-icon><DataAnalysis /></el-icon>
              <span>个性化题库</span>
              <el-icon v-if="isModuleDisabled('stu_personalized')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/student/profile"
              :class="{ 'is-disabled-module': isModuleDisabled('stu_profile') }"
              @click="handleMenuClick($event, 'stu_profile')"
            >
              <el-icon><User /></el-icon>
              <span>个人空间</span>
              <el-icon v-if="isModuleDisabled('stu_profile')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
          </template>

          <!-- Teacher Menu -->
          <template v-if="userType === 'teacher'">
            <el-menu-item 
              index="/dashboard/teacher/practice"
              :class="{ 'is-disabled-module': isModuleDisabled('tch_practice') }"
              @click="handleMenuClick($event, 'tch_practice')"
            >
              <el-icon><EditPen /></el-icon>
              <span>练题题库</span>
              <el-icon v-if="isModuleDisabled('tch_practice')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/teacher/question-bank"
              :class="{ 'is-disabled-module': isModuleDisabled('tch_bank') }"
              @click="handleMenuClick($event, 'tch_bank')"
            >
              <el-icon><Collection /></el-icon>
              <span>考题题库</span>
              <el-icon v-if="isModuleDisabled('tch_bank')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/teacher/exam-management"
              :class="{ 'is-disabled-module': isModuleDisabled('tch_exam') }"
              @click="handleMenuClick($event, 'tch_exam')"
            >
              <el-icon><Calendar /></el-icon>
              <span>考试管理</span>
              <el-icon v-if="isModuleDisabled('tch_exam')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/teacher/score-management"
              :class="{ 'is-disabled-module': isModuleDisabled('tch_score') }"
              @click="handleMenuClick($event, 'tch_score')"
            >
              <el-icon><TrendCharts /></el-icon>
              <span>成绩管理</span>
              <el-icon v-if="isModuleDisabled('tch_score')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
            <el-menu-item 
              index="/dashboard/teacher/question-audit"
              :class="{ 'is-disabled-module': isModuleDisabled('tch_audit') }"
              @click="handleMenuClick($event, 'tch_audit')"
            >
              <el-icon><Check /></el-icon>
              <span>题目审核</span>
              <el-icon v-if="isModuleDisabled('tch_audit')" class="disabled-icon"><CircleClose /></el-icon>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <el-icon class="toggle-sidebar" @click="toggleSidebar"><Fold /></el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: homePath }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.path !== '/dashboard/home'">{{ currentRoute.meta.title || '未知页面' }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="avatarUrl">{{ username.charAt(0) }}</el-avatar>
                <span class="username">{{ username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Document, Collection, Files, Calendar, Edit, 
  DataAnalysis, PieChart, Setting, Fold, ArrowDown,
  Menu, OfficeBuilding, Lock, Check, Monitor, EditPen, User, TrendCharts, CircleClose, House
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)
const username = ref(localStorage.getItem('username') || '用户')
const userType = ref(localStorage.getItem('userType') || 'student')
const avatarUrl = ref(localStorage.getItem('userAvatar') || '')
const disabledModules = ref((localStorage.getItem('disabledModules') || '').split(','))

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const homePath = computed(() => '/dashboard/home')

const isModuleDisabled = (moduleCode) => {
  return disabledModules.value.includes(moduleCode)
}

const handleMenuClick = (e, moduleCode) => {
  if (isModuleDisabled(moduleCode)) {
    // 阻止默认点击行为 (Element Plus Menu 可能内部处理跳转，这里主要用于视觉反馈逻辑辅助，实际拦截由Router守卫负责)
    e.preventDefault()
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('username')
    localStorage.removeItem('userAvatar')
    router.push('/login')
  } else if (command === 'profile') {
    if (userType.value === 'student') {
      router.push({ name: 'StudentProfile', query: { tab: 'basic' } })
    } else {
      router.push({ name: 'UserProfile' })
    }
  } else if (command === 'settings') {
    if (userType.value === 'student') {
      router.push({ name: 'StudentProfile', query: { tab: 'security' } })
    } else {
      router.push({ name: 'AccountSettings' })
    }
  }
}

const updateUserInfo = () => {
  avatarUrl.value = localStorage.getItem('userAvatar') || ''
  username.value = localStorage.getItem('username') || '用户'
}

onMounted(() => {
  // 检查登录状态
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }
  window.addEventListener('user-info-update', updateUserInfo)
})

onUnmounted(() => {
  window.removeEventListener('user-info-update', updateUserInfo)
})
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100vw;
}

.dashboard-layout {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: #fff;
  background-color: #002140;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar {
  font-size: 20px;
  margin-right: 16px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-container {
  background-color: #f0f2f5;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    height: 100%;
    transform: translateX(0);
    transition: transform 0.3s;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .main-container {
    margin-left: 0;
  }
}

/* 模块禁用样式 */
.is-disabled-module {
  color: #a8abb2 !important; /* 灰色文字 */
  cursor: not-allowed !important; /* 禁止符号 */
  pointer-events: none; /* 禁用点击事件 */
  position: relative;
}

.is-disabled-module:hover {
  background-color: transparent !important;
}

.disabled-icon {
  position: absolute;
  right: 10px;
  color: #f56c6c; /* 红色禁止图标 */
}
</style>