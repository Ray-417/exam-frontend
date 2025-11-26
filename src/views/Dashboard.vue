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
          <!-- Admin Menu -->
          <template v-if="userType === 'admin'">
            <el-menu-item index="/dashboard/admin/function-module">
              <el-icon><Menu /></el-icon>
              <span>功能模块管理</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/admin/org-management">
              <el-icon><OfficeBuilding /></el-icon>
              <span>组织机构管理</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/admin/permission">
              <el-icon><Lock /></el-icon>
              <span>权限管理</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/admin/audit-log">
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/admin/question-audit">
              <el-icon><Check /></el-icon>
              <span>题目审核</span>
            </el-menu-item>
          </template>

          <!-- Student Menu -->
          <template v-if="userType === 'student'">
            <el-menu-item index="/dashboard/student/exam-list">
              <el-icon><Monitor /></el-icon>
              <span>查看考试</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/student/practice">
              <el-icon><EditPen /></el-icon>
              <span>练题题库</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/student/personalized">
              <el-icon><DataAnalysis /></el-icon>
              <span>个性化题库</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/student/profile">
              <el-icon><User /></el-icon>
              <span>个人空间</span>
            </el-menu-item>
          </template>

          <!-- Teacher Menu -->
          <template v-if="userType === 'teacher'">
            <el-menu-item index="/dashboard/teacher/practice">
              <el-icon><EditPen /></el-icon>
              <span>练题题库</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/teacher/question-bank">
              <el-icon><Collection /></el-icon>
              <span>考题题库</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/teacher/exam-management">
              <el-icon><Calendar /></el-icon>
              <span>考试管理</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/teacher/score-management">
              <el-icon><TrendCharts /></el-icon>
              <span>成绩管理</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <el-icon class="toggle-sidebar" @click="toggleSidebar"><Fold /></el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRoute.meta.title || '未知页面' }}</el-breadcrumb-item>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Document, Collection, Files, Calendar, Edit, 
  DataAnalysis, PieChart, Setting, Fold, ArrowDown,
  Menu, OfficeBuilding, Lock, Check, Monitor, EditPen, User, TrendCharts
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)
const username = ref(localStorage.getItem('username') || '用户')
const userType = ref(localStorage.getItem('userType') || 'student')
const avatarUrl = ref('')

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('username')
    router.push('/login')
  } else if (command === 'profile') {
    // 跳转到个人信息页面
  } else if (command === 'settings') {
    // 跳转到账号设置页面
  }
}

onMounted(() => {
  // 检查登录状态
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }
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
</style>