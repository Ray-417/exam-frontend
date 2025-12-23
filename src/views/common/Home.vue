<template>
  <div class="home-container">
    <!-- Carousel Banner -->
    <el-carousel trigger="click" height="300px" class="banner-carousel">
      <el-carousel-item v-for="(item, index) in bannerItems" :key="index">
        <div class="banner-item" :style="{ backgroundImage: 'url(' + item.image + ')' }">
          <div class="banner-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- Notice Bar -->
    <div class="notice-bar">
      <div class="notice-title"><el-icon><Bell /></el-icon> 通知公告</div>
      <div class="notice-content">
        <div class="notice-item">
          <span class="tag">系统</span>
          <span class="text">系统将于本周日凌晨 2:00 进行例行维护，请提前保存数据。</span>
          <span class="date">2024-05-20</span>
        </div>
        <div class="notice-item">
          <span class="tag type-exam">考试</span>
          <span class="text">2024学年第一学期期末考试安排已发布，请同学们及时查看。</span>
          <span class="date">2024-05-18</span>
        </div>
      </div>
    </div>

    <!-- Quick Access Grid -->
    <div class="quick-access-section">
      <h3 class="section-title">快捷功能</h3>
      <div class="access-grid">
        <div 
          v-for="action in currentRoleActions" 
          :key="action.path" 
          class="access-card"
          @click="$router.push(action.path)"
        >
          <div class="icon-wrapper" :style="{ backgroundColor: action.color }">
            <el-icon><component :is="action.icon" /></el-icon>
          </div>
          <span class="action-name">{{ action.name }}</span>
        </div>
      </div>
    </div>

    <!-- Data Overview (Optional - Role Specific) -->
    <div class="data-overview" v-if="userType === 'teacher'">
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>待办审核</template>
                    <div class="stat-value">12 <span class="unit">个</span></div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>进行中考试</template>
                    <div class="stat-value">3 <span class="unit">场</span></div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>本周新增题目</template>
                    <div class="stat-value">58 <span class="unit">道</span></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Bell, User, Reading, Edit, Calendar, DataAnalysis, 
  Files, Setting, Monitor, Check, Collection, TrendCharts
} from '@element-plus/icons-vue'

const userType = ref(localStorage.getItem('userType') || 'student')

// Banner Data
const bannerItems = [
  {
    title: '欢迎使用超星考试系统',
    subtitle: '高效 · 智能 · 公平',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' // Placeholder
  },
  {
    title: '全新的个性化题库',
    subtitle: '针对性练习，快速提升成绩',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' // Placeholder
  },
  {
    title: '严格的考试监控',
    subtitle: '保障每一场考试的公平公正',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' // Placeholder
  }
]

// Role Actions Configuration
const roleActions = {
  admin: [
    { name: '用户管理', path: '/dashboard/admin/org-management', icon: 'User', color: '#409EFF' },
    { name: '角色权限', path: '/dashboard/admin/permission', icon: 'Files', color: '#67C23A' },
    { name: '系统日志', path: '/dashboard/admin/audit-log', icon: 'DataAnalysis', color: '#E6A23C' },
    { name: '功能配置', path: '/dashboard/admin/function-module', icon: 'Setting', color: '#909399' }
  ],
  teacher: [
    { name: '发布考试', path: '/dashboard/teacher/exam-management', icon: 'Calendar', color: '#409EFF' },
    { name: '题目审核', path: '/dashboard/teacher/question-audit', icon: 'Check', color: '#F56C6C' },
    { name: '题库管理', path: '/dashboard/teacher/question-bank', icon: 'Collection', color: '#67C23A' },
    { name: '成绩分析', path: '/dashboard/teacher/score-management', icon: 'TrendCharts', color: '#E6A23C' }
  ],
  student: [
    { name: '我的考试', path: '/dashboard/student/exam-list', icon: 'Monitor', color: '#409EFF' },
    { name: '自由练题', path: '/dashboard/student/practice', icon: 'Edit', color: '#67C23A' },
    { name: '个性化推荐', path: '/dashboard/student/personalized', icon: 'Reading', color: '#E6A23C' },
    { name: '个人空间', path: '/dashboard/student/profile', icon: 'Setting', color: '#909399' }
  ]
}

const currentRoleActions = computed(() => {
  return roleActions[userType.value] || []
})

</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Banner */
.banner-carousel {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}
.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.banner-item::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}
.banner-content {
  position: relative;
  text-align: center;
  color: #fff;
  z-index: 1;
}
.banner-content h3 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: bold;
}
.banner-content p {
  font-size: 18px;
  opacity: 0.9;
}

/* Notice Bar */
.notice-bar {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.notice-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  color: #303133;
  margin-right: 30px;
  min-width: 100px;
}
.notice-title .el-icon {
  margin-right: 6px;
  color: #E6A23C;
  font-size: 18px;
}
.notice-content {
  flex: 1;
  overflow: hidden;
}
.notice-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
.notice-item:last-child {
  margin-bottom: 0;
}
.notice-item .tag {
  background: #f0f9eb;
  color: #67C23A;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}
.notice-item .tag.type-exam {
  background: #ecf5ff;
  color: #409EFF;
}
.notice-item .text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 20px;
  cursor: pointer;
}
.notice-item .text:hover {
  color: #409EFF;
}
.notice-item .date {
  color: #909399;
  font-size: 12px;
}

/* Quick Access */
.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}
.access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.access-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.access-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
  font-size: 24px;
}
.action-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* Data Overview */
.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    text-align: center;
    padding: 10px 0;
}
.stat-value .unit {
    font-size: 14px;
    color: #909399;
    font-weight: normal;
    margin-left: 4px;
}
</style>
