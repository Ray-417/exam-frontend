import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/ForgotPassword.vue'),
      meta: { title: '忘记密码' }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
      children: [
        // Admin Routes
        {
          path: 'admin/function-module',
          name: 'AdminFunctionModule',
          component: () => import('../views/admin/FunctionModule.vue'),
          meta: { title: '功能模块管理', roles: ['admin'] }
        },
        {
          path: 'admin/org-management',
          name: 'AdminOrgManagement',
          component: () => import('../views/admin/OrgManagement.vue'),
          meta: { title: '组织机构管理', roles: ['admin'] }
        },
        {
          path: 'admin/permission',
          name: 'AdminPermission',
          component: () => import('../views/admin/Permission.vue'),
          meta: { title: '权限管理', roles: ['admin'] }
        },
        {
          path: 'admin/audit-log',
          name: 'AdminAuditLog',
          component: () => import('../views/admin/AuditLog.vue'),
          meta: { title: '操作日志', roles: ['admin'] }
        },
        {
          path: 'admin/question-audit',
          name: 'AdminQuestionAudit',
          component: () => import('../views/admin/QuestionAudit.vue'),
          meta: { title: '题目上传申请审核', roles: ['admin'] }
        },
        // Student Routes
        {
          path: 'student/exam-list',
          name: 'StudentExamList',
          component: () => import('../views/student/ExamList.vue'),
          meta: { title: '查看考试', roles: ['student'] }
        },
        {
          path: 'student/practice',
          name: 'StudentPractice',
          component: () => import('../views/student/PracticeBank.vue'),
          meta: { title: '练题题库查看', roles: ['student'] }
        },
        {
          path: 'student/personalized',
          name: 'StudentPersonalized',
          component: () => import('../views/student/PersonalizedBank.vue'),
          meta: { title: '个性化题库', roles: ['student'] }
        },
        {
          path: 'student/profile',
          name: 'StudentProfile',
          component: () => import('../views/student/UserProfile.vue'),
          meta: { title: '个人空间', roles: ['student'] }
        },
        // Teacher Routes
        {
          path: 'teacher/practice',
          name: 'TeacherPractice',
          component: () => import('../views/teacher/PracticeBank.vue'),
          meta: { title: '练题题库查看', roles: ['teacher'] }
        },
        {
          path: 'teacher/question-bank',
          name: 'TeacherQuestionBank',
          component: () => import('../views/teacher/QuestionBank.vue'),
          meta: { title: '考题题库查看', roles: ['teacher'] }
        },
        {
          path: 'teacher/exam-management',
          name: 'TeacherExamManagement',
          component: () => import('../views/teacher/ExamManagement.vue'),
          meta: { title: '考试管理', roles: ['teacher'] }
        },
        {
          path: 'teacher/score-management',
          name: 'TeacherScoreManagement',
          component: () => import('../views/teacher/ScoreManagement.vue'),
          meta: { title: '成绩管理', roles: ['teacher'] }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const userType = localStorage.getItem('userType')
  
  // Set document title
  document.title = to.meta.title ? `${to.meta.title} - 在线考试系统` : '在线考试系统'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.roles && (!userType || !to.meta.roles.includes(userType))) {
    // Redirect to default page based on role if permission denied or mismatch
    if (userType === 'admin') next({ name: 'AdminFunctionModule' })
    else if (userType === 'teacher') next({ name: 'TeacherPractice' })
    else if (userType === 'student') next({ name: 'StudentExamList' })
    else next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
