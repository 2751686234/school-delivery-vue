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
      <h2 class="page-title">订单管理</h2>
      <el-card class="card-container">
        <div class="filter">
          <el-select v-model="status" placeholder="筛选订单状态" style="width: 180px; margin-right: 10px;">
            <el-option label="全部订单" value=""></el-option>
            <el-option label="待接单" value="1"></el-option>
            <el-option label="已接单" value="2"></el-option>
            <el-option label="配送中" value="3"></el-option>
            <el-option label="已完成" value="4"></el-option>
            <el-option label="已取消" value="5"></el-option>
          </el-select>

          <el-input v-model="searchNo" placeholder="搜索订单号" style="width: 200px; margin-right: 10px;" />
          <el-input v-model="searchName" placeholder="搜索客户姓名" style="width: 200px; margin-right: 10px;" />

          <el-button type="primary" @click="searchOrder">搜索</el-button>
          <el-button style="margin-left:10px" @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="orderList" border style="width: 100%; margin-top: 20px;" align="center">
          <el-table-column prop="orderNo" label="订单号" align="center" />
          <el-table-column prop="name" label="客户姓名" align="center" />
          <el-table-column prop="phone" label="客户电话" align="center" />
          <el-table-column prop="address" label="配送地址" align="center" />
          <el-table-column prop="totalPrice" label="订单金额" align="center" />
          <el-table-column label="下单时间" align="center">
            <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" align="center">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleTake(scope.row)" v-if="scope.row.status === 1">
                接单
              </el-button>
              <el-button type="danger" size="small" @click="handleCancel(scope.row)" v-if="scope.row.status === 1">
                取消订单
              </el-button>
              <el-button size="small" @click="handleDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 订单详情弹窗：商品清单 -->
        <el-dialog v-model="showDetail" title="订单详情" width="700px">
          <!-- 订单基本信息 -->
          <el-descriptions :column="2" border size="small" style="margin-bottom:20px">
            <el-descriptions-item label="订单号" :span="2">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="客户姓名">{{ currentOrder.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getTagType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatTime(currentOrder.createTime) }}</el-descriptions-item>
          </el-descriptions>

          <!-- 商品清单 -->
          <h4 style="margin-bottom:12px;color:#2c3e50;font-size:16px">商品清单</h4>
          <el-table :data="orderDetail" border style="width: 100%;" align="center">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="goods_name" label="商品名称" align="center" />
            <el-table-column prop="num" label="数量" width="80" align="center" />
            <el-table-column prop="price" label="单价（¥）" width="120" align="center" />
            <el-table-column label="小计（¥）" width="120" align="center">
              <template #default="scope">
                {{ (scope.row.num * scope.row.price).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px; text-align: right; font-size: 18px;">
            订单总金额：<span style="color: red; font-weight: bold;">¥{{ currentOrder.totalPrice }}</span>
          </div>
          <template #footer>
            <el-button @click="showDetail = false">关闭</el-button>
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
import { getShopOrderList, takeOrder, cancelShopOrder } from '@/api/order'
import request from '@/utils/request'

const router = useRouter()
const orderList = ref([])
const status = ref('')
const searchNo = ref('')
const searchName = ref('')

const showDetail = ref(false)
const orderDetail = ref([])
const currentOrder = ref({})

// 原始订单列表
const originOrderList = ref([])

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const getStatusText = (status) => {
  switch (status) {
    case 1: return '待接单'
    case 2: return '已接单'
    case 3: return '配送中'
    case 4: return '已完成'
    case 5: return '已取消'
    default: return '未知状态'
  }
}

const getTagType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'primary'
    case 3: return 'primary'
    case 4: return 'success'
    case 5: return 'danger'
    default: return 'info'
  }
}

// 🔥 查看详情 — 从后端获取真实商品清单
const handleDetail = async (row) => {
  currentOrder.value = row
  try {
    const res = await request.get('/order/goods/detail', {
      params: { orderId: row.id }
    })
    orderDetail.value = res.data || []
  } catch (e) {
    ElMessage.error('加载商品清单失败')
    orderDetail.value = []
  }
  showDetail.value = true
}

const getShopOrders = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getShopOrderList(user.id)
    orderList.value = res.data || []
    originOrderList.value = res.data || []
    
    // 自动接单逻辑
    const settingRes = await request.get('/shop/setting/get', { params: { userId: user.id } })
    const autoAccept = settingRes.data?.autoAccept
    if (autoAccept == 1) {
      for (const order of orderList.value) {
        if (order.status === 1) {
          try {
            await takeOrder(order.id)
            order.status = 2
          } catch (e) { /* 忽略 */ }
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const handleTake = async (row) => {
  try {
    await takeOrder(row.id)
    row.status = 2
    ElMessage.success('接单成功，等待骑手取餐')
  } catch (err) {
    ElMessage.error('接单失败：' + err.message)
  }
}

const handleCancel = async (row) => {
  try {
    await cancelShopOrder(row.id)
    row.status = 5
    ElMessage.success('取消订单成功')
  } catch (err) {
    ElMessage.error('取消订单失败：' + err.message)
  }
}

const searchOrder = () => {
  let filterList = [...originOrderList.value]
  if (status.value) filterList = filterList.filter(item => item.status === Number(status.value))
  if (searchNo.value) filterList = filterList.filter(item => item.orderNo.includes(searchNo.value))
  if (searchName.value) filterList = filterList.filter(item => item.name && item.name.includes(searchName.value))
  orderList.value = filterList
  if (filterList.length === 0) ElMessage.info('未找到符合条件的订单')
}

const resetSearch = () => {
  status.value = ''
  searchNo.value = ''
  searchName.value = ''
  orderList.value = [...originOrderList.value]
  ElMessage.success('已重置搜索条件')
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => { getShopOrders() })
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

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
.filter {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 12px;
}
.filter :deep(.el-input__wrapper),
.filter :deep(.el-select__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.filter :deep(.el-input__wrapper.is-focus),
.filter :deep(.el-select__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.filter .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  transition: all 0.3s;
}
.filter .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
}
.filter .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}
.page-wrapper :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.page-wrapper :deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  color: #2c3e50;
  font-weight: 700;
}

/* 弹窗美化 */
.page-wrapper :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.page-wrapper :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  margin: 0;
  padding: 22px 24px;
}
.page-wrapper :deep(.el-dialog__title) {
  color: #2c3e50;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
}
</style>