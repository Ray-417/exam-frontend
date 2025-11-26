import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'ExamList' }
      },
      {
        path: 'exam-list',
        name: 'ExamList',
        component: () => import('../views/exam/ExamList.vue'),
        meta: { title: '考试列表' }
      },
      {
        path: 'exam-detail/:id',
        name: 'ExamDetail',
        component: () => import('../views/exam/ExamDetail.vue'),
        meta: { title: '考试详情' }
      },
      {
        path: 'question-bank',
        name: 'QuestionBank',
        component: () => import('../views/question/QuestionBank.vue'),
        meta: { title: '题库管理' }
      },
      {
        path: 'paper-management',
        name: 'PaperManagement',
        component: () => import('../views/paper/PaperManagement.vue'),
        meta: { title: '试卷管理' }
      },
      {
        path: 'exam-management',
        name: 'ExamManagement',
        component: () => import('../views/exam/ExamManagement.vue'),
        meta: { title: '考试管理' }
      },
      {
        path: 'grading',
        name: 'GradingManagement',
        component: () => import('../views/grading/GradingManagement.vue'),
        meta: { title: '阅卷管理' }
      },
      {
        path: 'results',
        name: 'ResultsManagement',
        component: () => import('../views/results/ResultsManagement.vue'),
        meta: { title: '成绩管理' }
      },
      {
        path: 'statistics',
        name: 'StatisticsAnalysis',
        component: () => import('../views/statistics/StatisticsAnalysis.vue'),
        meta: { title: '统计分析' }
      },
      {
        path: 'system-management',
        name: 'SystemManagement',
        component: () => import('../views/system/SystemManagement.vue'),
        meta: { title: '系统管理' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/user/UserManagement.vue'),
        meta: { title: '用户管理' }
      }
    ]
  },
  {
    path: '/take-exam/:id',
    name: 'TakeExam',
    component: () => import('../views/exam/TakeExam.vue'),
    meta: { requiresAuth: true, title: '参加考试' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
