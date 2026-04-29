<template>
  <div class="register-page">
    <div class="register-box" style="max-width:600px">
      <h2 class="text-center" style="color:#2c3e50;margin-bottom:24px">商家注册</h2>
      <el-form :model="form" label-width="120px">
        <!-- 账号信息 -->
        <h3 style="color:#2c3e50;margin:12px 0 8px;font-size:16px">账号信息</h3>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="6-16位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPwd" type="password" />
        </el-form-item>

        <!-- 商家信息 -->
        <h3 style="color:#2c3e50;margin:12px 0 8px;font-size:16px">商家信息</h3>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>

        <!-- 店铺信息 -->
        <h3 style="color:#2c3e50;margin:12px 0 8px;font-size:16px">店铺信息</h3>
        <el-form-item label="店铺名称">
          <el-input v-model="form.shopName" />
        </el-form-item>
        <el-form-item label="店铺电话">
          <el-input v-model="form.shopPhone" />
        </el-form-item>
        <el-form-item label="店铺地址">
          <el-input v-model="form.shopAddress" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model.number="form.lng" placeholder="如: 116.396428" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model.number="form.lat" placeholder="如: 39.90923" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.businessTime" placeholder="如: 09:00-22:00" />
        </el-form-item>
        <el-form-item label="店铺简介">
          <el-input v-model="form.desc" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleRegister" size="large" class="w-full">立即注册</el-button>
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
import request from '@/utils/request'

const router = useRouter()
const form = ref({
  username: '', password: '', confirmPwd: '',
  name: '', phone: '',
  shopName: '', shopPhone: '', shopAddress: '',
  lng: null, lat: null,
  businessTime: '', desc: ''
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.password || !form.value.shopName) {
    return ElMessage.error('请填写完整信息')
  }
  if (form.value.password !== form.value.confirmPwd) {
    return ElMessage.error('两次密码不一致')
  }

  try {
    const res = await request.post('/shop/register', form.value)
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (e) {
    ElMessage.error('注册失败')
  }
}
</script>

<style scoped>
.register-page {
  width: 100vw; min-height: 100vh; display: flex;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}
.register-box {
  background: #fff; padding: 40px; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%;
}
.w-full { width: 100%; }
.link-button { color: #409eff; background: transparent; border: none; padding: 0; font-size: 14px; }
.text-center { text-align: center; }
</style>