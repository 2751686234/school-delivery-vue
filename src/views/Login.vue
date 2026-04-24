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

    console.log("后端返回：", res) // 调试用

    const response = res?.data ?? res
    const isApiResponse = response && typeof response === 'object' && 'code' in response

    if (isApiResponse && response.code !== 200) {
      const msg = response.msg || ''
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
    //用完整对象写法，延长显示时间到2秒
    ElMessage.success({
      message: `欢迎，${payload.name || payload.username}！`,
      duration: 2000, // 延长到2秒，给足够的显示时间
      center: true
    })

    // 6. 延迟跳转时间和提示显示时间对齐（2秒后再跳转）
    setTimeout(() => {
      if (actualRole === 1) router.push('/home')
      else if (actualRole === 2) router.push('/shop-admin')
      else if (actualRole === 3) router.push('/rider')
      else if (actualRole === 4) router.push('/admin')
      else router.push('/login')
    }, 2000) // 和上面的duration保持一致

  } catch (err) {
    console.error(err)
    ElMessage.error({ message: '登录失败，请检查后端服务', duration: 1500, center: true })
  }
}
</script>

<style scoped>
/* 页面背景：更柔和的渐变 */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5b86e5 0%, #36d1dc 100%);
  background-attachment: fixed;
}

/* 登录卡片：更精致的阴影、圆角、间距 */
.login-box {
  background: #ffffff;
  padding: 48px 36px;
  border-radius: 20px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}
.login-box:hover {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 标题：优化间距、字体 */
.login-title {
  text-align: center;
  margin-bottom: 40px;
}
.login-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2a3340;
  letter-spacing: 1px;
}

/* 表单间距优化 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 登录按钮：圆角、微动效 */
.login-btn {
  width: 100%;
  border-radius: 10px;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.login-btn:hover {
  transform: translateY(-1px);
}

/* 注册链接：更美观的文字按钮 */
.link-button {
  color: #409eff;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.link-button:hover {
  color: #2962ff;
  text-decoration: underline;
}
</style>