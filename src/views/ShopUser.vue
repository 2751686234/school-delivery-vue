<template>
  <div class="page-wrapper">
    <el-menu mode="horizontal" class="nav-bar">
      <el-menu-item index="1" @click="$router.push('/shop-admin')">商品管理</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop-order')">订单管理</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/shop-user')">客户管理</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/shop-finance')">财务管理</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/shop-marketing')">营销工具</el-menu-item>
      <el-menu-item index="6" @click="$router.push('/shop-data')">数据分析</el-menu-item>
      <el-menu-item index="7" @click="$router.push('/shop-set')">设置</el-menu-item>
      <el-menu-item index="8" @click="logout">退出</el-menu-item>
    </el-menu>

    <div class="page-container">
      <h2 class="page-title">客户管理</h2>
      <el-card class="card-container">
        <!-- 客户搜索 -->
        <el-input 
          v-model="searchKey" 
          placeholder="搜索客户姓名/手机号" 
          style="width: 300px; margin-bottom: 20px;"
          @keyup.enter="getUserList"
          clearable
        />

        <!-- 客户表格 -->
        <el-table :data="userList" border style="width: 100%;" align="center">
          <el-table-column prop="id" label="客户ID" align="center" />
          <el-table-column prop="username" label="账号" align="center" />
          <el-table-column prop="name" label="姓名" align="center" />
          <el-table-column prop="phone" label="手机号" align="center" />
          <el-table-column prop="address" label="常用地址" align="center" />
          <el-table-column prop="orderCount" label="下单次数" align="center" />
          <el-table-column prop="totalSpend" label="累计消费" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" @click="handleView(scope.row)">查看详情</el-button>
              <el-button type="primary" size="small" @click="handleSendMsg(scope.row)">发送通知</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 客户详情弹窗 -->
        <el-dialog v-model="showView" title="客户详情" width="500px">
          <el-descriptions :column="1" border align="center">
            <el-descriptions-item label="客户ID" align="center">{{ currentUser.id }}</el-descriptions-item>
            <el-descriptions-item label="账号" align="center">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名" align="center">{{ currentUser.name }}</el-descriptions-item>
            <el-descriptions-item label="手机号" align="center">{{ currentUser.phone }}</el-descriptions-item>
            <el-descriptions-item label="常用地址" align="center">{{ currentUser.address }}</el-descriptions-item>
            <el-descriptions-item label="下单次数" align="center">{{ currentUser.orderCount }}</el-descriptions-item>
            <el-descriptions-item label="累计消费" align="center">¥{{ currentUser.totalSpend }}</el-descriptions-item>
            <el-descriptions-item label="客户等级" align="center">
              <el-tag type="success">{{ getLevel(currentUser.totalSpend) }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <template #footer>
            <el-button @click="showView = false">关闭</el-button>
          </template>
        </el-dialog>

        <!-- 发送通知弹窗 -->
        <el-dialog v-model="showMsg" title="发送通知" width="400px">
          <el-form :model="msgForm" label-width="80px">
            <el-form-item label="通知内容">
              <el-input v-model="msgForm.content" type="textarea" :rows="4" placeholder="请输入通知内容" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showMsg = false">取消</el-button>
            <el-button type="primary" @click="sendMsg">发送</el-button>
          </template>
        </el-dialog>
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
const userList = ref([])
const searchKey = ref('')
const showView = ref(false)
const showMsg = ref(false)
const currentUser = ref({})
const msgForm = ref({ content: '' })

// 获取客户列表（支持搜索）
const getUserList = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/shop/user/list', {
      params: { 
        userId: user.id,
        keyword: searchKey.value
      }
    })
    userList.value = res.data || []
  } catch (err) {
    ElMessage.error('获取客户失败：' + err.message)
    userList.value = []
  }
}

// 页面加载
onMounted(() => {
  getUserList()
})

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 查看客户详情
const handleView = (row) => {
  currentUser.value = row
  showView.value = true
}

// 发送通知
const handleSendMsg = (row) => {
  currentUser.value = row
  showMsg.value = true
  msgForm.value.content = ''
}

// 提交通知
const sendMsg = () => {
  if (!msgForm.value.content) {
    ElMessage.error('请输入通知内容')
    return
  }
  ElMessage.success(`已向${currentUser.value.name}发送通知`)
  showMsg.value = false
}

// 获取客户等级
const getLevel = (totalSpend) => {
  if (totalSpend >= 500) return 'VIP客户'
  if (totalSpend >= 200) return '高级客户'
  if (totalSpend >= 100) return '普通客户'
  return '新客户'
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
.nav-bar {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
  text-align: center !important;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.25);
}
.nav-bar :deep(.el-menu-item) {
  color: #ecf0f1;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-bar :deep(.el-menu-item:hover),
.nav-bar :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.1);
  color: #3498db;
  border-bottom-color: #3498db;
}

.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
  text-align: center;
}
.page-title {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 1px;
}
.card-container {
  padding: 28px;
  text-align: left;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.card-container :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.card-container :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
</style>