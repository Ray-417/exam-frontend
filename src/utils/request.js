import axios from 'axios'
// 注意：若项目用了Element Plus，需引入ElMessage
import { ElMessage } from 'element-plus'
// 若用了路由，需引入router（根据项目实际情况，没有则注释）
import router from '@/router'

// Create an axios instance
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 优先用环境变量，兜底用/api
    timeout: 5000 // Request timeout
})

// Request interceptor（请求拦截器：携带Token）
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token') // 从本地存储取Token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}` // 按后端要求的格式携带
        }
        return config
    },
    error => {
        console.log(error)
        return Promise.reject(error)
    }
)

// Response interceptor（响应拦截器：处理错误、401）
service.interceptors.response.use(
    response => {
        const res = response.data
        // 非200状态码抛错
        if (res.code !== 200) {
            console.error('API Error:', res.message)
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res.data // 只返回接口数据部分
        }
    },
    error => {
        console.log('err' + error)
        // 401：未登录/Token失效，跳登录页
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            router.push('/login')
        }
        // 全局错误提示
        ElMessage({
            message: error.message || 'Request Error',
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service