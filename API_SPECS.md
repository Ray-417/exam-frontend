# 超星考试系统接口文档 (Exam System API Specs)

本文档汇总了系统各模块的前后端交互接口，用于指导前后端开发对接。

---

# 1. 认证模块 (Authentication)

负责用户的注册、登录、注销及凭证管理。

## 1.1 用户登录 (Login)

前端页面：`Login.vue`

### 接口定义
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student1" |
| `password` | string | 是 | 密码 | "123456" |

### 响应参数
#### 成功 (HTTP 200)
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1001,
      "username": "student1",
      "realName": "张三",
      "userType": "student",
      "avatar": "http://..."
    }
  }
}
```

#### 失败 (HTTP 401)
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

## 1.2 用户注册 (Register)

前端页面：`Register.vue`

### 接口定义
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student2" |
| `password` | string | 是 | 密码 | "password123" |
| `userType` | string | 是 | 用户类型 | "student", "teacher" |

### 响应参数
#### 成功 (HTTP 200)
```json
{ "code": 200, "message": "注册成功", "data": null }
```

## 1.3 重置密码 (Reset Password)

前端页面：`ForgotPassword.vue`

### 接口定义
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student1" |
| `newPassword` | string | 是 | 新密码 | "newpass123" |

### 响应参数
#### 成功 (HTTP 200)
```json
{ "code": 200, "message": "密码重置成功", "data": null }
```

---

# 2. 系统管理员模块 (System Administrator Module)

负责系统的基础配置、功能控制及组织架构管理。

## 2.1 个人信息与账号设置 (Common Profile & Settings)

*虽然为通用功能，但归档于基础系统服务中。*

### 2.1.1 获取个人信息
- **URL**: `/api/common/profile`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 200,
    "data": {
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin",
      "phone": "13800000000",
      "email": "admin@example.com",
      "avatarUrl": "",
      // 学生特有字段
      "studentNo": null,
      "className": null,
      // 教师特有字段
      "teacherNo": null,
      "deptName": null
    }
  }
  ```

### 2.1.2 修改个人信息
- **URL**: `/api/common/profile`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "phone": "13900000000",
    "email": "new@example.com"
  }
  ```

### 2.1.3 修改密码
- **URL**: `/api/common/password`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "oldPassword": "old_password",
    "newPassword": "new_password"
  }
  ```

## 2.2 功能模块管理 (Module Management)

前端页面：`admin/FunctionModule.vue`
**功能说明**：用于管理系统内各个功能模块的元数据，控制模块的启用/停用（功能开关），查看系统功能清单。

### 2.2.1 模块列表查询
- **URL**: `/api/system/modules`
- **Method**: `GET`
- **Query**:
  - `page` number 页码，默认 1
  - `size` number 每页数量，默认 10
  - `keyword` string 关键词
  - `category` string 分类
  - `status` string `enabled` | `disabled`

成功响应示例:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 101,
        "name": "考试管理",
        "code": "exam_mgmt",
        "category": "exam",
        "version": "1.0.0",
        "enabled": true,
        "showInMenu": true,
        "routePath": "/dashboard/teacher/exam-management",
        "allowedRoles": ["teacher", "admin"],
        "dependencies": ["question_bank"],
        "description": "教师端考试创建与发布",
        "updatedAt": "2025-01-01 12:00:00"
      }
    ],
    "total": 1
  }
}
```

### 2.2.2 新建模块
- **URL**: `/api/system/modules`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "题库管理",
  "code": "question_bank",
  "category": "question",
  "version": "1.0.0",
  "enabled": true,
  "showInMenu": true,
  "routePath": "/dashboard/teacher/question-bank",
  "allowedRoles": ["teacher", "admin"],
  "dependencies": [],
  "description": "题目资源维护"
}
```

### 2.2.3 编辑模块
- **URL**: `/api/system/modules/{id}`
- **Method**: `PUT`
- **Body**: 同新建模块字段

### 2.2.4 删除模块
- **URL**: `/api/system/modules/{id}`
- **Method**: `DELETE`

### 2.2.5 切换启用状态 (功能开关)
- **URL**: `/api/system/modules/{id}/status`
- **Method**: `PATCH`
- **Body**: `{ "enabled": false }`
- **描述**: 当设置为 `false` 时，系统应拦截对该模块路由的访问，并在菜单中隐藏该项。

### 2.2.6 字典查询 (分类与角色)
- **URL**: `/api/system/dictionaries/module-categories` `GET`
- **URL**: `/api/system/dictionaries/roles` `GET`

---

## 2.3 组织机构管理 (Organization Management)

**模块代码**: `sys_org`

### 2.3.0 数据库表设计 (Database Schema - 真实校园场景)

本设计采用 **“用户基础表 + 角色扩展表”** 的模式，既保证了认证信息的统一，又满足了不同角色（学生/教师）差异巨大的业务属性存储需求。

**表1: 基础用户表 (`sys_user`)**
负责账号认证与基础状态管理。

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | YES | Auto | 主键 |
| `username` | VARCHAR(50) | YES | - | 登录账号 (唯一) |
| `password` | VARCHAR(100)| YES | - | 加密密码 |
| `user_type`| VARCHAR(20) | YES | - | 用户类型: `student`, `teacher`, `admin` |
| `avatar` | VARCHAR(255)| NO | - | 头像URL |
| `status` | TINYINT | YES | 1 | 状态: 1-正常, 0-禁用 |
| `created_at`| DATETIME | YES | Now | 创建时间 |

**表2: 学生档案表 (`biz_student`)**
存储学生的学籍信息，**与组织机构强关联**。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | YES | **外键**: 关联 `sys_user.id` (1对1) |
| `student_no`| VARCHAR(50) | YES | 学号 (业务主键) |
| `real_name` | VARCHAR(50) | YES | 真实姓名 |
| `gender` | TINYINT | NO | 性别: 1-男, 2-女 |
| `class_id` | BIGINT | YES | **所属班级ID**: 关联 `sys_organization.id` |
| `major_code`| VARCHAR(50) | YES | 专业代码 |
| `enrollment_year`| INT | YES | 入学年份 (如 2023) |
| `politics_status`| VARCHAR(20)| NO | 政治面貌 |

**表3: 教师档案表 (`biz_teacher`)**
存储教师的人事信息。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | YES | **外键**: 关联 `sys_user.id` (1对1) |
| `teacher_no`| VARCHAR(50) | YES | 工号 |
| `real_name` | VARCHAR(50) | YES | 真实姓名 |
| `dept_id` | BIGINT | YES | **所属部门ID**: 关联 `sys_organization.id` |
| `title` | VARCHAR(50) | NO | 职称 (教授/讲师等) |
| `entry_date`| DATE | NO | 入职日期 |

**表4: 组织机构表 (`sys_organization`)**
树形结构存储学校-学院-系-班级。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | YES | 主键 |
| `parent_id` | BIGINT | NO | 父节点ID (根节点为NULL) |
| `name` | VARCHAR(100)| YES | 机构名称 |
| `code` | VARCHAR(50) | YES | 机构编码 |
| `type` | VARCHAR(20) | YES | 类型: `school`, `college`, `department`, `class` |
| `sort_order`| INT | YES | 同级排序权重 |
| `path` | VARCHAR(255)| NO | 层级路径 (辅助查询，如 `/1/3/31/`) |

---

### 2.3.1 组织机构管理接口 (Backend Implementation Notes)

> **注意 (Note for Backend Developer)**: 
> 本模块涉及树形结构的维护，特别是“拖拽排序”功能，请务必实现以下逻辑：
> 1.  **防环检测**: 移动节点时，目标父节点不能是当前节点或其子孙节点。
> 2.  **排序维护**: 同级节点需要维护 `sort_order`，建议使用拖拽后的前后节点位置重新计算排序值。
> 3.  **级联处理**: 删除机构时，若存在子机构或关联人员，应禁止删除或提示级联删除。

#### 2.3.1.1 移动/排序机构 (Move/Sort Org)
**前端拖拽操作对应的后端接口**。

- **URL**: `/api/org/move`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "draggingNodeId": 10,   // 被拖拽的节点 ID
    "dropNodeId": 5,        // 目标节点 ID (放置位置的参照物)
    "dropType": "inner"     // 放置类型: 'inner' (放入内部), 'before' (放之前), 'after' (放之后)
  }
  ```

#### 2.3.1.2 获取组织机构树 (Get Organization Tree)
- **Endpoint**: `GET /api/org/tree`
- **Description**: 获取完整的组织机构树状结构。
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": 1,
        "name": "总公司",
        "code": "HQ",
        "parentId": null,
        "children": [
          {
            "id": 2,
            "name": "技术部",
            "code": "TECH",
            "parentId": 1,
            "children": []
          }
        ]
      }
    ]
  }
  ```

### 2.3.2 创建/更新组织机构 (Create/Update Org)
- **Endpoint**: `POST /api/org/save`
- **Request Body**:
  ```json
  {
    "id": null, // update时必填
    "name": "测试部",
    "code": "TEST",
    "parentId": 1,
    "type": "department", // company, department
    "sortOrder": 1,
    "leader": "张三", // 负责人
    "phone": "010-12345678", // 联系电话
    "status": "1", // 1:启用, 0:停用
    "description": "测试部门备注"
  }
  ```

### 2.3.3 删除组织机构 (Delete Org)
- **Endpoint**: `DELETE /api/org/{id}`

---

## 2.4 权限管理 (Permission Management)

**模块代码**: `sys_perm`

本模块采用 **RBAC (Role-Based Access Control)** 模型，并结合 **数据权限 (Data Scope)**，实现对“功能操作”和“数据范围”的双重控制。

### 2.4.0 数据库表设计 (Database Schema - RBAC模型)

**设计思路**: 
本系统采用标准的 **RBAC (Role-Based Access Control)** 模型，实现 **用户 (User) -> 角色 (Role) -> 权限 (Permission/Menu)** 的解耦授权。
- **用户 (User)**: 对应 `sys_user` 表 (以及扩展的 `biz_student`, `biz_teacher`)。
- **角色 (Role)**: 对应 `sys_role` 表，代表一类职能（如：教务处长、普通教师、学生）。
- **权限 (Menu/Permission)**: 对应 `sys_menu` 表，代表系统中的资源（菜单、按钮、API接口）。
- **关联关系**: 
    - `sys_user_role`: 多对多，一个用户可拥有多个角色。
    - `sys_role_menu`: 多对多，一个角色可拥有多个权限。

**表1: 角色表 (`sys_role`)**
定义身份集合，连接用户与权限。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | YES | 主键 |
| `role_name` | VARCHAR(30) | YES | 角色名称 (如: "教务管理员") |
| `role_key` | VARCHAR(30) | YES | 角色字符 (如: `admin`, `teacher`) |
| `data_scope`| CHAR(1) | YES | **数据范围**: `1`-全部, `2`-自定义, `3`-本部门, `4`-本部门及以下, `5`-仅本人 |
| `status` | TINYINT | YES | 1-正常, 0-停用 |
| `remark` | VARCHAR(500)| NO | 备注 |
| `created_at`| DATETIME | YES | 创建时间 |

**表2: 菜单权限表 (`sys_menu`)**
定义系统中的所有资源（菜单目录、功能页面、操作按钮）。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | YES | 主键 |
| `parent_id` | BIGINT | YES | 父菜单ID (根为0) |
| `name` | VARCHAR(50) | YES | 菜单名称 (如: "用户管理") |
| `type` | CHAR(1) | YES | 类型: `M`-目录, `C`-菜单, `F`-按钮 |
| `perms` | VARCHAR(100)| NO | **权限标识** (如: `system:user:list`) |
| `path` | VARCHAR(200)| NO | 路由地址 (Vue Router Path) |
| `component` | VARCHAR(200)| NO | 组件路径 (如: `views/admin/User`) |
| `icon` | VARCHAR(100)| NO | 图标 |
| `sort_order`| INT | YES | 排序 |
| `visible` | TINYINT | YES | 1-显示, 0-隐藏 |

**表3: 用户-角色关联表 (`sys_user_role`)**
**核心关联表**：实现用户与角色的绑定。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | YES | **外键**: 关联 `sys_user.id` |
| `role_id` | BIGINT | YES | **外键**: 关联 `sys_role.id` |

**表4: 角色-菜单关联表 (`sys_role_menu`)**
**核心关联表**：实现角色与权限的绑定。

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `role_id` | BIGINT | YES | **外键**: 关联 `sys_role.id` |
| `menu_id` | BIGINT | YES | **外键**: 关联 `sys_menu.id` |

---

### 2.4.1 获取权限菜单树 (Get Menu Tree)
用于前端动态生成左侧菜单栏和按钮权限校验。

- **URL**: `/api/system/menu/routes`
- **Method**: `GET`
- **Description**: 根据当前登录用户ID，查询其角色对应的所有菜单和按钮权限。
- **Response**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "name": "System",
        "path": "/system",
        "hidden": false,
        "children": [
          {
            "name": "User",
            "path": "user",
            "component": "admin/User",
            "meta": { "title": "用户管理", "icon": "user", "roles": ["admin"] }
          }
        ]
      }
    ]
  }
  ```

### 2.4.2 角色管理接口 (Role Management)

1.  **获取角色列表**: `GET /api/system/role/list`
2.  **新增角色**: `POST /api/system/role`
3.  **修改角色**: `PUT /api/system/role`
    *   *注意*: 修改角色时，可同时更新 `data_scope` (数据权限)。
4.  **删除角色**: `DELETE /api/system/role/{roleId}`
5.  **获取角色详情**: `GET /api/system/role/{roleId}`

### 2.4.4 角色成员管理 (Role-User Management)

1.  **获取角色下的用户列表 (Allocated Users)**:
    - **URL**: `/api/system/role/{roleId}/allocated-users`
    - **Method**: `GET`
    - **Params**: `pageNum`, `pageSize`, `username`, `realName`

2.  **获取未分配该角色的用户列表 (Unallocated Users)**:
    - **URL**: `/api/system/role/{roleId}/unallocated-users`
    - **Method**: `GET`
    - **Params**: `pageNum`, `pageSize`, `username`, `realName`, `orgId`

3.  **批量授权用户 (Grant Role)**:
    - **URL**: `/api/system/role/users`
    - **Method**: `POST`
    - **Body**: `{ "roleId": 1, "userIds": [1001, 1002] }`

4.  **批量取消授权 (Revoke Role)**:
    - **URL**: `/api/system/role/users`
    - **Method**: `DELETE`
    - **Body**: `{ "roleId": 1, "userIds": [1001, 1002] }`


### 2.4.3 授权接口 (Authorization)

1.  **查询角色持有的菜单ID**: `GET /api/system/menu/role/{roleId}`
2.  **给角色分配菜单权限**: `PUT /api/system/role/auth`
    *   **Body**: `{ "roleId": 1, "menuIds": [1, 101, 102] }`
3.  **给用户分配角色**: `PUT /api/system/user/auth`
    *   **Body**: `{ "userId": 1001, "roleIds": [2] }`

---

## 2.5 操作日志 (Audit Log)

**模块代码**: `sys_log`

记录系统中所有关键操作的日志，用于审计和追踪。

### 2.5.0 数据库表设计 (`sys_oper_log`)

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `title` | VARCHAR(50) | 模块标题 (如: 用户管理) |
| `business_type` | INT | 业务类型 (0=其它, 1=新增, 2=修改, 3=删除, 4=授权, 5=导出, 6=导入, 7=强退, 8=生成代码, 9=清空数据) |
| `method` | VARCHAR(100) | 方法名称 |
| `request_method`| VARCHAR(10) | 请求方式 (GET, POST, PUT, DELETE) |
| `oper_name` | VARCHAR(50) | 操作人员 |
| `oper_url` | VARCHAR(255) | 请求URL |
| `oper_ip` | VARCHAR(128) | 主机地址 |
| `oper_location` | VARCHAR(255) | 操作地点 |
| `oper_param` | TEXT | 请求参数 |
| `json_result` | TEXT | 返回参数 |
| `status` | INT | 操作状态 (0=正常, 1=异常) |
| `error_msg` | VARCHAR(2000)| 错误消息 |
| `oper_time` | DATETIME | 操作时间 |
| `cost_time` | BIGINT | 消耗时间 (毫秒) |

### 2.5.1 获取操作日志列表
- **URL**: `/api/monitor/operlog/list`
- **Method**: `GET`
- **Params**:
    - `pageNum`: 页码
    - `pageSize`: 每页数量
    - `title`: 模块标题 (可选)
    - `operName`: 操作人员 (可选)
    - `businessType`: 业务类型 (可选)
    - `status`: 状态 (可选)
    - `beginTime`: 开始时间 (可选)
    - `endTime`: 结束时间 (可选)

### 2.5.2 删除操作日志
- **URL**: `/api/monitor/operlog/{operIds}`
- **Method**: `DELETE`

### 2.5.3 清空操作日志
- **URL**: `/api/monitor/operlog/clean`
- **Method**: `DELETE`

---

## 2.6 系统拦截器与安全规范 (System Interceptors & Security)

为了配合前端的模块禁用功能，后端需要实现以下拦截逻辑：

1.  **模块状态检查拦截器 (Module Status Interceptor)**:
    *   **机制**: 在所有业务接口请求前，检查该接口所属的“模块”是否处于启用状态。
    *   **实现建议**:
        *   定义一个注解 `@ModuleCheck(moduleCode = "sys_org")`。
        *   在Controller方法或类上使用该注解。
        *   拦截器读取注解，查询数据库或缓存中的模块状态配置。
        *   如果模块被禁用 (status = 0)，直接返回 `403 Forbidden`，错误信息 `"该功能模块已被禁用"`.
    *   **配置接口**: 提供 `/api/system/module-config` 接口供前端初始化时获取所有禁用模块列表。

2.  **前端交互配合**:
    *   登录成功后，前端会调用配置接口获取禁用模块列表，并存储在本地。
    *   路由跳转时，前端路由守卫会检查目标路由的 `moduleCode` 是否在禁用列表中。
    *   菜单渲染时，前端会根据禁用列表给菜单项添加禁用样式（灰色、禁止符号）。

3.  **数据一致性**:
    *   当管理员在“功能模块管理”中修改模块状态后，应刷新后端缓存。
    *   建议通过WebSocket或轮询机制通知在线用户配置已变更，或者简单地让用户下次刷新页面/重新登录时生效。

---

# 3. 教师模块 (Teacher Module)

## 3.1 题目审核管理 (Question Audit Management)

**模块代码**: `tch_audit`

用于**教务老师**审核其他老师或学生提交的试题。审核通过后，试题将进入正式题库 (`biz_question_bank`)。
**注意**: 管理员无权进行业务审核。

### 3.1.0 数据库表设计 (`biz_question_audit`)

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `submitter_id` | BIGINT | 提交人ID (关联 `sys_user.id`) |
| `submit_time` | DATETIME | 提交时间 |
| `type` | VARCHAR(20) | 题目类型 (single, multiple, judge, short_answer) |
| `content` | TEXT | 题目内容 (JSON格式, 包含题干、选项) |
| `answer` | TEXT | 参考答案 |
| `difficulty` | TINYINT | 难度 (1-5) |
| `subject_id` | BIGINT | 所属科目/课程ID |
| `status` | TINYINT | 状态: 0-待审核, 1-审核通过, 2-驳回 |
| `audit_comment` | VARCHAR(500)| 审核意见 |
| `auditor_id` | BIGINT | 审核人ID |
| `audit_time` | DATETIME | 审核时间 |

### 3.1.1 获取审核列表
- **URL**: `/api/audit/question/list`
- **Method**: `GET`
- **Params**:
    - `pageNum`: 页码
    - `pageSize`: 每页数量
    - `status`: 状态 (0:待审核, 1:通过, 2:驳回)
    - `submitterName`: 提交人姓名
    - `beginTime`: 提交开始时间
    - `endTime`: 提交结束时间

### 3.1.2 审核题目
- **URL**: `/api/audit/question/process`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "ids": [101, 102],
    "status": 1, // 1:通过, 2:驳回
    "comment": "题目描述清晰，符合要求"
  }
  ```

### 3.1.3 查看题目详情
- **URL**: `/api/audit/question/{id}`
- **Method**: `GET`

## 3.2 题库管理 (Question Bank Management)

**模块代码**: `tch_bank`

教师和管理员用于维护系统题库，支持增删改查及批量导入。

### 3.2.0 数据库表设计 (`biz_question`)

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | YES | 主键 |
| `type` | VARCHAR(20) | YES | 题目类型: `single_choice`, `multiple_choice`, `true_false`, `fill_blank`, `short_answer`, `programming` |
| `content` | TEXT | YES | 题目内容 (JSON/HTML) |
| `options` | TEXT | NO | 选项内容 (JSON数组: `[{"key":"A","value":"..."}]`) |
| `answer` | TEXT | YES | 参考答案 |
| `analysis` | TEXT | NO | 解析 |
| `difficulty` | TINYINT | YES | 难度: 1-5 |
| `subject` | VARCHAR(50) | YES | 所属科目 |
| `knowledge_points`| VARCHAR(255)| NO | 知识点 (逗号分隔) |
| `creator_id` | BIGINT | YES | 创建人ID |
| `create_time` | DATETIME | YES | 创建时间 |
| `status` | TINYINT | YES | 状态: 1-正常, 0-禁用 |

### 3.2.1 获取题目列表
- **URL**: `/api/questions`
- **Method**: `GET`
- **Params**: `page`, `size`, `type`, `keyword`, `difficulty`, `subject`

### 3.2.2 创建题目
- **URL**: `/api/questions`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "type": "single_choice",
    "content": "Java中int占用几个字节？",
    "options": [{"key":"A","value":"2"},{"key":"B","value":"4"}],
    "answer": "B",
    "difficulty": 1,
    "subject": "Java"
  }
  ```

### 3.2.3 更新题目
- **URL**: `/api/questions/{id}`
- **Method**: `PUT`

### 3.2.4 删除题目
- **URL**: `/api/questions/{id}`
- **Method**: `DELETE`

### 3.2.5 批量导入
- **URL**: `/api/questions/import`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Params**: `file` (Excel/Word)

## 3.3 试卷管理 (Paper Management)

**模块代码**: `tch_paper`

### 3.3.0 数据库表设计 (`biz_paper` & `biz_paper_question`)

**表1: 试卷主表 (`biz_paper`)**
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `name` | VARCHAR(100)| 试卷名称 |
| `subject` | VARCHAR(50) | 科目 |
| `total_score` | INT | 总分 |
| `pass_score` | INT | 及格分 |
| `question_count`| INT | 题目数量 |
| `status` | TINYINT | 状态: 0-草稿, 1-已发布/使用 |
| `creator_id` | BIGINT | 创建人 |

**表2: 试卷-题目关联表 (`biz_paper_question`)**
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `paper_id` | BIGINT | 试卷ID |
| `question_id` | BIGINT | 题目ID |
| `score` | INT | 该题在试卷中的分值 |
| `sort_order` | INT | 题目排序 |

### 3.3.1 获取试卷列表
- **URL**: `/api/papers`
- **Method**: `GET`

### 3.3.2 创建试卷 (组卷)
- **URL**: `/api/papers`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Java期中试卷",
    "subject": "Java",
    "questions": [
      { "id": 101, "score": 5 },
      { "id": 102, "score": 5 }
    ]
  }
  ```

### 3.3.3 智能组卷
- **URL**: `/api/papers/auto-generate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "subject": "Java",
    "difficulty": 3,
    "totalScore": 100,
    "typeDistribution": { "single_choice": 10, "short_answer": 2 }
  }
  ```

## 3.4 考试管理 (Exam Management)

**模块代码**: `tch_exam`

### 3.4.0 数据库表设计 (`biz_exam`)

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `name` | VARCHAR(100)| 考试名称 |
| `paper_id` | BIGINT | 关联试卷ID |
| `start_time` | DATETIME | 开始时间 |
| `end_time` | DATETIME | 结束时间 |
| `duration` | INT | 考试时长(分钟) |
| `status` | TINYINT | 状态: 0-未开始, 1-进行中, 2-已结束 |
| `creator_id` | BIGINT | 创建人 |

### 3.4.1 获取考试列表
- **URL**: `/api/exams`
- **Method**: `GET`
- **Params**: `status` (upcoming, ongoing, finished)

### 3.4.2 创建/发布考试
- **URL**: `/api/exams`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Java期末考试",
    "paperId": 101,
    "startTime": "2023-12-20 09:00:00",
    "duration": 120
  }
  ```

### 3.4.3 监考看板数据
- **URL**: `/api/monitor/{examId}`
- **Method**: `GET`


## 3.5 成绩管理 (Score Management)

**模块代码**: `tch_score`

### 3.5.0 数据库表设计 (`biz_exam_record` & `biz_exam_answer`)

**表1: 考试记录表 (`biz_exam_record`)**
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `exam_id` | BIGINT | 考试ID |
| `student_id` | BIGINT | 学生ID |
| `score` | INT | 总分 |
| `status` | TINYINT | 状态: 0-进行中, 1-已提交, 2-已批改 |
| `start_time` | DATETIME | 开始答题时间 |
| `submit_time` | DATETIME | 交卷时间 |

**表2: 答题明细表 (`biz_exam_answer`)**
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | 主键 |
| `record_id` | BIGINT | 考试记录ID |
| `question_id` | BIGINT | 题目ID |
| `student_answer`| TEXT | 学生答案 |
| `score` | INT | 得分 |
| `is_correct` | BOOLEAN | 是否正确 (客观题自动判断) |
| `comment` | VARCHAR(500)| 评语 |

### 3.5.1 获取成绩列表
- **URL**: `/api/scores`
- **Method**: `GET`
- **Params**: `examId`, `classId`, `keyword`

### 3.5.2 获取考生答卷详情 (阅卷)
- **URL**: `/api/scores/{examId}/student/{studentId}`
- **Method**: `GET`

### 3.5.3 提交阅卷结果
- **URL**: `/api/scores/{examId}/student/{studentId}`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "totalScore": 88,
    "questions": [
      { "id": 4, "givenScore": 8, "comment": "回答基本正确" }
    ]
  }
  ```

### 3.5.4 成绩统计
- **URL**: `/api/scores/stats`
- **Method**: `GET`
- **Params**: `examId`

---

# 4. 同学模块 (Student Module)

## 1. 公共定义 (Common Definitions)

### 1.1 题型定义 (Question Types)
| Key | Label | Description |
| :--- | :--- | :--- |
| `single_choice` | 单选题 | 选项为 JSON 字符串，答案为单个 Key (e.g. "A") |
| `multiple_choice` | 多选题 | 选项为 JSON 字符串，答案为逗号分隔 Key (e.g. "A,B") |
| `true_false` | 判断题 | 答案为 "T" (正确) 或 "F" (错误) |
| `fill_blank` | 填空题 | 答案为文本 |
| `short_answer` | 简答题 | 答案为文本 |
| `programming` | 编程题 | 答案为代码文本 |

### 1.2 考试状态 (Exam Status)
| Key | Label | Description |
| :--- | :--- | :--- |
| `not_started` | 未开始 | 当前时间 < 开始时间 |
| `in_progress` | 进行中 | 开始时间 <= 当前时间 <= 结束时间 |
| `pending_grading` | 待批阅 | 考试结束，等待教师批改 |
| `completed` | 已完成 | 批改完成，可查看成绩 |

---

## 4.1 考试中心 (Exam Center)
**前端文件**: `src/views/student/ExamList.vue`

### 4.1.1 获取考试列表
*   **接口描述**: 分页获取当前学生的考试列表，支持筛选。
*   **Method**: `GET`
*   **URL**: `/api/student/exams`
*   **请求参数 (Query)**:
    *   `page`: `number` (页码, default: 1)
    *   `pageSize`: `number` (每页数量, default: 10)
    *   `subject`: `string` (可选, 学科名称模糊搜索)
    *   `semester`: `string` (可选, 学期 ID, e.g., "2023_autumn")
    *   `status`: `string` (可选, 考试状态)
*   **响应结果 (Response)**:
    ```json
    {
      "code": 200,
      "data": {
        "total": 100,
        "list": [
          {
            "id": 1,
            "name": "2023-2024秋季高等数学期末考试",
            "subject": "高等数学",
            "semester": "2023_autumn",
            "startTime": "2023-12-20 09:00:00", // Timestamp or ISO String
            "endTime": "2023-12-20 11:00:00",
            "duration": 120, // 分钟
            "status": "completed",
            "score": 88, // 仅 completed 状态有值
            "allowReview": true // 是否允许查看试卷
          }
        ]
      }
    }
    ```

### 4.1.2 获取考试详情/开始考试数据
*   **接口描述**: 进入考试前或查看详情时调用，获取考试规则及试卷内容（如果是开始考试）。
*   **Method**: `GET`
*   **URL**: `/api/student/exams/{id}/detail`
*   **请求参数**: `id` (考试ID)
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": {
        "examInfo": { ... }, // 考试基本信息
        "questions": [ // 仅在开始考试时返回
           {
             "id": 101,
             "type": "single_choice",
             "content": "题目内容...",
             "options": "[{\"key\":\"A\",\"value\":\"选项A\"}...]", // 建议后端直接转为 JSON Array 返回，前端目前处理了 String parsing
             "score": 5
           }
        ]
      }
    }
    ```

### 4.1.3 提交试卷
*   **接口描述**: 学生交卷。
*   **Method**: `POST`
*   **URL**: `/api/student/exams/{id}/submit`
*   **请求体 (Body)**:
    ```json
    {
      "answers": {
        "101": "A",
        "102": "A,B",
        "103": "Some text answer..."
      },
      "timeTaken": 3600 // 实际用时 (秒)
    }
    ```

### 4.1.4 查看试卷/成绩单
*   **接口描述**: 考试完成后查看试卷详情（含用户答案、正确答案、解析）。
*   **Method**: `GET`
*   **URL**: `/api/student/exams/{id}/result`
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": {
        "score": 88,
        "questions": [
          {
            "id": 101,
            "type": "single_choice",
            "content": "...",
            "options": "...",
            "score": 5,
            "userAnswer": "A",
            "correctAnswer": "A",
            "analysis": "解析内容...",
            "isCorrect": true
          }
        ]
      }
    }
    ```

---

## 4.2 练题题库模块 (Practice Bank Module)
**前端文件**: `src/views/student/PracticeBank.vue`

### 4.2.1 获取公共题目列表
*   **接口描述**: 获取用于练习的公共题目池。
*   **Method**: `GET`
*   **URL**: `/api/student/questions`
*   **请求参数 (Query)**:
    *   `page`: `number`
    *   `pageSize`: `number`
    *   `type`: `string` (题型)
    *   `difficulty`: `number` (1-5)
    *   `subject`: `string`
    *   `keyword`: `string`
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": {
        "total": 50,
        "list": [
          {
            "id": 201,
            "type": "single_choice",
            "subject": "Java",
            "difficulty": 2,
            "content": "...",
            "options": "..."
          }
        ]
      }
    }
    ```

### 4.2.2 上传题目 (学生贡献)
*   **接口描述**: 学生上传题目，需教师审核。
*   **Method**: `POST`
*   **URL**: `/api/student/questions/upload`
*   **请求体 (Body)**:
    ```json
    {
      "subject": "Java",
      "type": "single_choice",
      "difficulty": 3,
      "content": "题目内容",
      "options": "[...]",
      "answer": "A",
      "analysis": "解析"
    }
    ```

### 4.2.3 添加题目到收藏/题集
*   **接口描述**: 将公共题目添加到个人的某个题集中。
*   **Method**: `POST`
*   **URL**: `/api/student/collections/{collectionId}/questions`
*   **请求体**:
    ```json
    {
      "questionId": 201
    }
    ```

---

## 4.3 个性化题库模块 (Personalized Bank Module)
**前端文件**: `src/views/student/PersonalizedBank.vue`

### 4.3.1 获取我的题集列表
*   **接口描述**: 获取学生创建的所有题集（包含默认的错题集）。
*   **Method**: `GET`
*   **URL**: `/api/student/collections`
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": [
        { "id": 1, "name": "我的错题集", "count": 12, "isDefault": true },
        { "id": 2, "name": "Java复习", "count": 5, "isDefault": false }
      ]
    }
    ```

### 4.3.2 创建新题集
*   **Method**: `POST`
*   **URL**: `/api/student/collections`
*   **请求体**: `{ "name": "新题集名称" }`

### 4.3.3 删除题集
*   **Method**: `DELETE`
*   **URL**: `/api/student/collections/{id}`

### 4.3.4 获取题集内的题目
*   **Method**: `GET`
*   **URL**: `/api/student/collections/{id}/questions`
*   **请求参数**: `page`, `pageSize`, `type`, `subject`

### 4.3.5 从题集中移除题目
*   **Method**: `DELETE`
*   **URL**: `/api/student/collections/{collectionId}/questions/{questionId}`

### 4.3.6 批量移除题目
*   **Method**: `DELETE`
*   **URL**: `/api/student/collections/{collectionId}/questions/batch`
*   **请求体**: `{ "questionIds": [101, 102] }`

---

## 4.4 个人空间模块 (User Profile Module)
**前端文件**: `src/views/student/UserProfile.vue`

### 4.4.1 获取个人信息
*   **Method**: `GET`
*   **URL**: `/api/student/profile`
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": {
        "name": "张三",
        "studentId": "2023001",
        "email": "zhangsan@example.com",
        "phone": "13800000000",
        "class": "计科2301",
        "bio": "个人简介...",
        "avatar": "http://..." // Base64 或 URL
      }
    }
    ```

### 4.4.2 更新基本资料
*   **Method**: `PUT`
*   **URL**: `/api/student/profile`
*   **请求体**:
    ```json
    {
      "name": "张三",
      "email": "new@example.com",
      "phone": "13900000000",
      "bio": "New Bio"
    }
    ```

### 4.4.3 修改密码
*   **Method**: `POST`
*   **URL**: `/api/user/password/change`
*   **请求体**:
    ```json
    {
      "oldPassword": "...",
      "newPassword": "..."
    }
    ```

### 4.4.4 上传头像
*   **接口描述**: 上传用户头像图片。
*   **Method**: `POST`
*   **URL**: `/api/user/avatar`
*   **Content-Type**: `multipart/form-data`
*   **请求参数**: `file` (图片文件)
*   **响应结果**:
    ```json
    {
      "code": 200,
      "data": {
        "url": "http://server/uploads/avatar/xxx.jpg"
      }
    }
    ```
