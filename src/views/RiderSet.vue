<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav">
      <el-menu-item @click="$router.push('/rider')">首页</el-menu-item>
      <el-menu-item @click="$router.push('/rider-order')">我的订单</el-menu-item>
      <el-menu-item @click="$router.push('/rider-set')">个人设置</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">个人设置</h2>
      <el-card class="card-container">
        <el-tabs type="border-card">
          <el-tab-pane label="个人信息">
            <el-form :model="infoForm" label-width="100px" style="max-width:500px;margin:20px auto">
              <el-form-item label="账号">
                <el-input v-model="infoForm.username" disabled />
              </el-form-item>
              <el-form-item label="姓名">
                <el-input v-model="infoForm.name" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="infoForm.phone" />
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="infoForm.address" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveInfo">保存信息</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="修改密码">
            <el-form :model="pwdForm" label-width="100px" style="max-width:500px;margin:20px auto">
              <el-form-item label="原密码">
                <el-input v-model="pwdForm.oldPwd" type="password" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="pwdForm.newPwd" type="password" />
              </el-form-item>
              <el-form-item label="确认密码">
                <el-input v-model="pwdForm.confirmPwd" type="password" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePwd">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const infoForm = ref({
  username: user.username || '',
  name: user.name || '',
  phone: user.phone || '',
  address: user.address || ''
})

const pwdForm = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })

const saveInfo = async () => {
  try {
    await request.post('/user/update', {
      id: user.id,
      name: infoForm.value.name,
      phone: infoForm.value.phone,
      address: infoForm.value.address
    })
    const updated = { ...user, ...infoForm.value }
    localStorage.setItem('user', JSON.stringify(updated))
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const updatePwd = async () => {
  const { oldPwd, newPwd, confirmPwd } = pwdForm.value
  if (!oldPwd || !newPwd || !confirmPwd) return ElMessage.error('请填写完整')
  if (newPwd !== confirmPwd) return ElMessage.error('两次密码不一致')
  try {
    const res = await request.post('/user/update-pwd', { id: user.id, oldPwd, newPwd })
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      setTimeout(() => logout(), 1500)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e) {
    ElMessage.error('原密码不正确')
  }
}

const logout = () => { localStorage.clear(); router.push('/login') }
</script>

<style scoped>
.wrap { width: 100%; min-height: 100vh; background: #f5f7fa; }
.nav { display: flex; justify-content: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border: none; }
.nav :deep(.el-menu-item) { color: #fff; font-weight: 700; }
.container { width: 90%; max-width: 800px; margin: 0 auto; padding: 32px 0; text-align: center; }
.title { font-size: 26px; font-weight: 800; color: #11998e; margin-bottom: 24px; }
.card-container { padding: 28px; border-radius: 20px; border: none; box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
</style>