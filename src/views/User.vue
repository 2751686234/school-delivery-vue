<template>
  <div class="user-page">
    <el-menu mode="horizontal" class="nav" default-active="5">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">个人中心</h2>

      <!-- 用户信息卡片 -->
      <el-card class="info-card" shadow="hover">
        <div class="info-row">
          <div class="label">账号</div>
          <div class="value">{{ userInfo.username }}</div>
        </div>

        <div class="info-row">
          <div class="label">姓名</div>
          <div class="value">{{ userInfo.name }}</div>
        </div>

        <div class="info-row">
          <div class="label">手机号</div>
          <div class="value">{{ userInfo.phone }}</div>
        </div>

        <div class="info-row">
          <div class="label">角色</div>
          <div class="value">{{ roleMap[userInfo.role] }}</div>
        </div>

        <div class="info-row">
          <div class="label">地址</div>
          <div class="value">{{ userInfo.address }}</div>
        </div>

        <div class="info-row">
          <div class="label">注册时间</div>
          <div class="value">{{ formatTime(userInfo.createTime) }}</div>
        </div>

        <div class="button-group">
          <el-button type="primary" @click="openEditDialog">修改信息</el-button>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </el-card>
    </div>

    <!-- 修改信息弹窗 -->
    <el-dialog title="修改个人信息" v-model="dialogVisible" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editForm.address" placeholder="请输入地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const userInfo = ref({})
const dialogVisible = ref(false)
const editForm = ref({
  name: '',
  phone: '',
  address: ''
})

// 角色映射
const roleMap = {
  1: '用户',
  2: '商家',
  3: '配送员',
  4: '管理员'
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString()
}

// 页面加载获取用户信息
onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  userInfo.value = JSON.parse(userStr)
  // 初始化编辑表单
  editForm.value.name = userInfo.value.name || ''
  editForm.value.phone = userInfo.value.phone || ''
  editForm.value.address = userInfo.value.address || ''
})

// 打开编辑弹窗
const openEditDialog = () => {
  editForm.value.name = userInfo.value.name || ''
  editForm.value.phone = userInfo.value.phone || ''
  editForm.value.address = userInfo.value.address || ''
  dialogVisible.value = true
}

// 提交修改
const submitEdit = async () => {
  try {
    const res = await request({
      url: '/user/update',
      method: 'post',
      data: {
        id: userInfo.value.id,
        name: editForm.value.name,
        phone: editForm.value.phone,
        address: editForm.value.address
      }
    })
     ElMessage.success({
        message: '修改成功',
        duration: 2000, 
        center: true 
      })
    
    // 更新本地用户信息
    const newUserInfo = { ...userInfo.value, ...editForm.value }
    localStorage.setItem('user', JSON.stringify(newUserInfo))
    userInfo.value = newUserInfo
    dialogVisible.value = false

  } catch (err) {
    console.error(err)
    ElMessage.error('修改失败，请检查网络或后端服务')
  }
}

// 退出登录
const handleLogout = () => {
  ElMessage.success('已退出登录')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.user-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f8fa;
}
.nav {
  width: 100%;
}
.container {
  width: 95%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}
.text-center {
  text-align: center;
  margin-bottom: 24px;
}
.info-card {
  border-radius: 12px;
}
.info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child {
  border-bottom: none;
}
.label {
  width: 80px;
  color: #666;
  font-weight: 500;
}
.value {
  flex: 1;
  color: #333;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>