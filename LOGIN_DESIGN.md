# 登录功能前后端交互设计方案 (Login Authentication Design)

## 1. 设计思路 (Design Philosophy)

为了提升用户体验并增强安全性，我们采用 **"后端鉴权，前端路由"** 的策略。
即：前端只负责收集用户凭证（账号密码），后端负责验证身份并返回用户角色（Role）和权限（Permissions），前端根据后端返回的角色信息，决定跳转到哪个特定的管理界面。

---

## 2. 接口交互流程 (Interaction Flow)

### Step 1: 前端发送请求 (Frontend Request)
前端将用户输入的账号和密码封装成 JSON 对象发送给后端。

- **接口地址**: `POST /api/auth/login`
- **Content-Type**: `application/json`
- **请求参数 (Request Body)**:
  ```json
  {
    "username": "student123",
    "password": "encrypted_password_string" // 建议前端进行md5或sha256加密后再传输，或使用HTTPS
  }
  ```
  > **注意**: 不需要传输 `userType`，后端应根据 `username` 在数据库中查找并确定该用户的身份。

### Step 2: 后端处理与返回 (Backend Processing & Response)
后端验证账号密码通过后，生成 Token (JWT)，并从数据库中查询该用户的角色信息。

- **成功响应 (200 OK)**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",  // 身份令牌
      "userInfo": {
        "id": 1001,
        "username": "student123",
        "nickname": "张三",
        "avatar": "https://example.com/avatar.jpg",
        "role": "student"  // 关键字段：student | teacher | admin
      }
    }
  }
  ```

### Step 3: 前端逻辑处理 (Frontend Logic)
前端收到响应后，执行以下操作：
1. **存储 Token**: 将 `token` 存入 `localStorage` 或 `Pinia/Vuex`，用于后续接口的请求头鉴权。
2. **存储用户信息**: 将 `userInfo` 存入状态管理库，以便在页面右上角显示头像和昵称。
3. **路由跳转 (Redirect)**: 根据 `role` 字段判断跳转目标。

#### 伪代码示例 (Pseudo Code):
```javascript
const handleLogin = async () => {
  const res = await api.login(form);
  if (res.code === 200) {
    const { role } = res.data.userInfo;
    
    // 存储 Token
    localStorage.setItem('token', res.data.token);
    
    // 角色跳转逻辑
    switch (role) {
      case 'student':
        router.push('/student/dashboard'); // 跳转学生端首页
        break;
      case 'teacher':
        router.push('/teacher/dashboard'); // 跳转教师端首页
        break;
      case 'admin':
        router.push('/admin/dashboard');   // 跳转管理员端首页
        break;
      default:
        router.push('/403'); // 无权限或角色未知
    }
  }
}
```

---

## 3. 路由设计建议 (Route Structure)

建议在 Vue Router 中将不同角色的路由分开管理，便于进行权限控制。

```javascript
// router/index.js

const routes = [
  { path: '/login', component: Login },
  
  // 学生端路由
  {
    path: '/student',
    component: Layout,
    meta: { roles: ['student'] },
    children: [
      { path: 'dashboard', component: StudentDashboard },
      { path: 'exam-list', component: ExamList }
    ]
  },
  
  // 教师端路由
  {
    path: '/teacher',
    component: Layout,
    meta: { roles: ['teacher'] },
    children: [
      { path: 'dashboard', component: TeacherDashboard },
      { path: 'exam-publish', component: ExamPublish }
    ]
  },
  
  // 管理员端路由
  {
    path: '/admin',
    component: Layout,
    meta: { roles: ['admin'] },
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'user-manage', component: UserManage }
    ]
  }
];
```
