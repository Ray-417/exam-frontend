# 认证模块接口文档

本文档描述了前端（Vue）与后端（Spring Boot）交互所需的认证模块接口。

## 1. 用户登录 (Login)

前端页面：`Login.vue`

### 接口定义
- **URL**: `/api/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数 (Request Body)
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student1" |
| `password` | string | 是 | 密码 | "123456" |

### 响应参数 (Response Body)
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
      "userType": "student", // 关键字段：前端根据此字段判断跳转逻辑
      "avatar": "http://..."
    }
  }
}
```

#### 失败 (HTTP 400/401/500)
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 2. 用户注册 (Register)

前端页面：`Register.vue`

### 接口定义
- **URL**: `/api/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数 (Request Body)
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student2" |
| `password` | string | 是 | 密码 | "password123" |
| `userType` | string | 是 | 用户类型 | "student", "teacher" |

### 响应参数 (Response Body)
#### 成功 (HTTP 200)
```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

#### 失败
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

## 3. 重置密码 (Reset Password)

前端页面：`ForgotPassword.vue`
*注：目前设计为直接重置，生产环境建议配合短信/邮箱验证码流程。*

### 接口定义
- **URL**: `/api/reset-password`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 请求参数 (Request Body)
| 字段名 | 类型 | 必选 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `username` | string | 是 | 用户名 | "student1" |
| `newPassword` | string | 是 | 新密码 | "newpass123" |

### 响应参数 (Response Body)
#### 成功 (HTTP 200)
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

#### 失败
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```
