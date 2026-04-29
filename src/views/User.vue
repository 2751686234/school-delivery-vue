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
          <el-button type="warning" @click="openPwdDialog">修改密码</el-button>
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

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" v-model="showPwdDialog" width="400px">
      <el-form :model="pwdForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdForm.newPwd" type="password" placeholder="6-16位字母/数字" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPwdDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPwd">确定修改</el-button>
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

// 修改密码
const showPwdDialog = ref(false)
const pwdForm = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })

const openPwdDialog = () => {
  pwdForm.value = { oldPwd: '', newPwd: '', confirmPwd: '' }
  showPwdDialog.value = true
}

const submitPwd = async () => {
  const { oldPwd, newPwd, confirmPwd } = pwdForm.value
  if (!oldPwd || !newPwd || !confirmPwd) {
    return ElMessage.error('请填写完整')
  }
  if (newPwd !== confirmPwd) {
    return ElMessage.error('两次密码不一致')
  }
  try {
    const res = await request.post('/user/update-pwd', {
      id: userInfo.value.id,
      oldPwd,
      newPwd
    })
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      showPwdDialog.value = false
      setTimeout(() => handleLogout(), 1500)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('原密码不正确')
  }
}

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
  background: #f8f9fa;
}

/* 导航栏：与全端统一的暖橙渐变 */
.nav {
  width: 100%;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25);
}
.nav :deep(.el-menu-item) {
  color: #fff;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav :deep(.el-menu-item:hover),
.nav :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-bottom-color: #fff;
}

.container {
  width: 95%;
  max-width: 600px;
  margin: 0 auto;
  padding: 28px 0;
}

.text-center {
  text-align: center;
  margin-bottom: 28px;
  font-size: 26px;
  font-weight: 800;
  color: #ff6b35;
  letter-spacing: 1px;
}

/* 信息卡片：精致化 */
.info-card {
  border-radius: 20px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  padding: 12px 20px;
  transition: all 0.3s;
}
.info-card:hover {
  box-shadow: 0 16px 40px rgba(0,0,0,0.14);
  transform: translateY(-4px);
}

.info-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
}
.info-row:last-of-type {
  border-bottom: none;
}
.label {
  width: 90px;
  color: #909399;
  font-weight: 700;
  font-size: 15px;
}
.value {
  flex: 1;
  color: #2a3340;
  font-size: 16px;
  font-weight: 500;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 2px dashed #f0f0f0;
}
.button-group .el-button {
  border-radius: 14px;
  height: 44px;
  padding: 0 28px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  transition: all 0.3s;
}
.button-group .el-button--primary {
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  box-shadow: 0 6px 18px rgba(255, 107, 53, 0.35);
}
.button-group .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(255, 107, 53, 0.45);
}
.button-group .el-button--warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 6px 18px rgba(245, 87, 108, 0.35);
}
.button-group .el-button--warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(245, 87, 108, 0.45);
}
.button-group .el-button--danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  box-shadow: 0 6px 18px rgba(238, 90, 90, 0.35);
}
.button-group .el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(238, 90, 90, 0.45);
}

/* 弹窗美化 */
.user-page :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.user-page :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  margin: 0;
  padding: 22px 24px;
}
.user-page :deep(.el-dialog__title) {
  color: #ff6b35;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
}
.user-page :deep(.el-dialog__body) {
  padding: 28px 24px 20px;
}
.user-page :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #f0f0f0;
  padding: 8px 16px;
  transition: all 0.3s;
}
.user-page :deep(.el-input__wrapper.is-focus) {
  border-color: #ff7e5f;
  box-shadow: 0 6px 18px rgba(255, 126, 95, 0.18);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
.dialog-footer .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 24px;
  font-weight: 600;
}
.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);
}
.dialog-footer .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.45);
}

/* 响应式适配 */
@media (max-width: 576px) {
  .container {
    padding: 20px 0;
  }
  .info-card {
    padding: 8px 16px;
    border-radius: 16px;
  }
  .text-center {
    font-size: 22px;
    margin-bottom: 20px;
  }
  .info-row {
    padding: 14px 0;
  }
  .label {
    width: 80px;
    font-size: 14px;
  }
  .value {
    font-size: 15px;
  }
  .button-group {
    flex-direction: column;
    gap: 12px;
  }
  .button-group .el-button {
    width: 100%;
  }
}
</style>