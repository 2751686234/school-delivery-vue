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

        <el-form-item style="text-align:center; display:flex; justify-content:center; gap:16px;">
          <el-button class="link-button" @click="$router.push('/register')">用户注册</el-button>
          <el-button class="link-button" @click="$router.push('/shop-register')">商家注册</el-button>
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
    ElMessage.warning({
      message: '账号和密码不能为空！',
      duration: 1500,
      center: true
    })
    return
  }

  try {
    // 2. 请求后端，只提交账号密码，由后端返回真实角色
    const res = await axios.post('http://localhost:8080/user/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    console.log("后端返回：", res)

    const response = res?.data ?? res
    const isApiResponse = response && typeof response === 'object' && 'code' in response

    if (isApiResponse && response.code !== 200) {
    const msg = response.msg || ''
    // 禁用账户特殊提示
    if (msg.includes('禁用')) {
      ElMessage.error({ message: msg, duration: 3000, center: true })
      return
    }

    if (/密码/.test(msg)) {
      ElMessage.error({ message: '密码错误！', duration: 1500, center: true })
    } else if (/身份/.test(msg)) {
      ElMessage.error({ message: response.msg || '登录身份错误！', duration: 1500, center: true })
    } else if (/账号|用户名/.test(msg)) {
      ElMessage.error({ message: '账号不存在或密码错误！', duration: 1500, center: true })
    } else {
      ElMessage.error({ message: response.msg || '账号、密码错误！', duration: 1500, center: true })
    }
    return
  }

    const payload = isApiResponse ? response.data : response
    if (!payload) {
      ElMessage.error({ message: '账号、密码错误！', duration: 1500, center: true })
      return
    }

    const selectedRole = Number(loginForm.value.role)
    const actualRole = Number(payload.role)

    // 4. 身份判定：前端选中的身份必须与后端返回的真实身份一致
    if (selectedRole !== actualRole) {
      ElMessage.error({ message: '登录身份错误，请选择正确的身份登录', duration: 1500, center: true })
      return
    }

    // 5. 保存用户信息
    localStorage.setItem('user', JSON.stringify(payload))
    ElMessage.success({
      message: `欢迎，${payload.name || payload.username}！`,
      duration: 2000,
      center: true
    })

    // 6. 延迟跳转
    setTimeout(() => {
      if (actualRole === 1) router.push('/home')
      else if (actualRole === 2) router.push('/shop-admin')
      else if (actualRole === 3) router.push('/rider')
      else if (actualRole === 4) router.push('/admin')
      else router.push('/login')
    }, 2000)

  } catch (err) {
    console.error(err)
    ElMessage.error({ message: '登录失败，请检查后端服务', duration: 1500, center: true })
  }
}
</script>

<style scoped>
/* 页面背景：活力暖橙渐变 */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff9a56 100%);
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: bgFloat 25s linear infinite;
  z-index: 0;
}

@keyframes bgFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

.login-box {
  background: #ffffff;
  padding: 52px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 1;
  animation: cardSlideUp 0.6s ease-out;
}

@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-box:hover {
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.22);
  transform: translateY(-6px);
}

.login-title {
  text-align: center;
  margin-bottom: 44px;
}
.login-title h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #ff6b35;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0px rgba(255, 107, 53, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  padding: 8px 16px;
  border: 2px solid #f0f0f0;
}
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.18);
  border-color: #ff7e5f;
}

.login-btn {
  width: 100%;
  border-radius: 14px;
  height: 50px;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  letter-spacing: 1px;
}
.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.55);
}
.login-btn:active {
  transform: translateY(-1px);
}

.link-button {
  color: #ff6b35;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.link-button:hover {
  color: #e85a24;
  text-decoration: underline;
  letter-spacing: 0.5px;
}

@media (max-width: 576px) {
  .login-box {
    padding: 40px 28px;
    margin: 0 20px;
    border-radius: 20px;
  }
  .login-title h2 {
    font-size: 24px;
  }
  .login-btn {
    height: 48px;
  }
}
</style>