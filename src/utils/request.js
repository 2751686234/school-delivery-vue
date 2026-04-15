import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000
})

request.interceptors.request.use(config => {
  return config
})

request.interceptors.response.use(
  res => res.data,
  err => {
    console.error('请求失败', err)
    return Promise.reject(err)
  }
)

export default request