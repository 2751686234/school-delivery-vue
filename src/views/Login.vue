<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-title">
        <h2>校园外卖配送系统</h2>
      </div>

      <el-form :model="loginForm" class="login-form">
        <el-form-item label="用户名">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="登录身份">
          <el-select v-model="loginForm.role" size="large" style="width:100%">
            <el-option label="用户" :value="1" />
            <el-option label="商家" :value="2" />
            <el-option label="外送员" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" size="large" class="login-btn">
            登录
          </el-button>
        </el-form-item>

        <el-form-item style="text-align:center">
          <el-button class="link-button" @click="$router.push('/register')">前往注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: '',
  role: 1
})

const handleLogin = async () => {
  // 1. 非空校验
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('账号和密码不能为空！')
    return
  }

  try {
    // 2. 请求后端，只提交账号密码，由后端返回真实角色
    const res = await axios.post('http://localhost:8080/user/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    console.log("后端返回：", res) // 调试用

    const response = res?.data ?? res
    const isApiResponse = response && typeof response === 'object' && 'code' in response

    if (isApiResponse && response.code !== 200) {
      const msg = response.msg || ''
      if (/密码/.test(msg)) {
        ElMessage.error('密码错误！')
      } else if (/身份/.test(msg)) {
        ElMessage.error(response.msg || '登录身份错误！')
      } else if (/账号|用户名/.test(msg)) {
        ElMessage.error('账号不存在或密码错误！')
      } else {
        ElMessage.error(response.msg || '账号、密码错误！')
      }
      return
    }

    const payload = isApiResponse ? response.data : response
    if (!payload) {
      ElMessage.error('账号、密码错误！')
      return
    }

    const selectedRole = Number(loginForm.value.role)
    const actualRole = Number(payload.role)

    // 4. 身份判定：前端选中的身份必须与后端返回的真实身份一致
    if (selectedRole !== actualRole) {
      ElMessage.error('登录身份错误，请选择正确的身份登录')
      return
    }

    // 5. 保存用户信息
    localStorage.setItem('user', JSON.stringify(payload))
    ElMessage.success(`欢迎，${payload.name || payload.username}！`)

    // 6. 强制延迟跳转，确保不被中断
    setTimeout(() => {
      if (actualRole === 1) router.push('/home')
      else if (actualRole === 2) router.push('/shop-admin')
      else if (actualRole === 3) router.push('/rider')
      else if (actualRole === 4) router.push('/admin')
      else router.push('/login')
    }, 300)

  } catch (err) {
    console.error(err)
    ElMessage.error('登录失败，请检查后端服务')
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 420px;
}
.login-title { text-align: center; margin-bottom: 30px; }
.login-btn { width: 100%; border-radius: 8px; }
.link-button {
  color: #409eff;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
}
</style>