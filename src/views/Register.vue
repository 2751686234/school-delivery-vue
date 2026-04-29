<template>
  <div class="register-page">
    <div class="register-box">
      <div class="register-title">
        <h2>用户注册</h2>
      </div>

      <el-form :model="registerForm" @submit.prevent="handleRegister" class="register-form">
        <el-form-item label="姓名">
          <el-input v-model="registerForm.name" placeholder="请输入姓名" size="large" />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入账号" size="large" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" size="large" />
        </el-form-item>

        <el-form-item label="地址">
          <el-input v-model="registerForm.address" placeholder="请输入地址" size="large" />
        </el-form-item>

        <el-form-item label="注册身份">
          <el-select v-model="registerForm.role" size="large" style="width:100%">
            <el-option label="用户" :value="1" />
            <el-option label="配送员" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" size="large" class="register-btn">注册</el-button>
        </el-form-item>

        <el-form-item style="text-align:center">
          <el-button class="link-button" @click="$router.push('/login')">已有账号？返回登录</el-button>
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
const registerForm = ref({
  name: '',
  username: '',
  password: '',
  phone: '',
  address: '',
  role: 1
})

const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.username || !registerForm.value.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    await axios.post('http://localhost:8080/user/register', registerForm.value)
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (e) {
    ElMessage.error('注册失败')
  }
}
</script>

<style scoped>
.register-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
}

.register-btn {
  width: 100%;
  border-radius: 8px;
}
.link-button {
  color: #409eff;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
}
</style>