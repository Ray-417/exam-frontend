import axios from 'axios'

// Create an axios instance
const service = axios.create({
  baseURL: '/api', // Base URL for API
  timeout: 5000 // Request timeout
})

// Request interceptor
service.interceptors.request.use(
  config => {
    // Add token header if available (mock logic for now)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    // You can customize the status code check here
    if (res.code !== 200) {
      console.error('API Error:', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.data
    }
  },
  error => {
    console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service
