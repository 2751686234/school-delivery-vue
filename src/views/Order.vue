<template>
  <div class="order-page">
    <el-menu mode="horizontal" class="nav" default-active="4">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">我的订单</h2>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="orderList.length === 0" class="empty">暂无订单</div>

      <div v-else v-for="order in orderList" :key="order.id" class="order-item">
        <el-card>
          <div><strong>订单号：{{ order.orderNo }}</strong></div>
          <div>商家：{{ order.shopName }}</div>
          <div>金额：¥{{ order.totalPrice }}</div>
          <div>地址：{{ order.address }}</div>
          <div>下单时间：{{ formatTime(order.createTime) }}</div>

          <!-- 配送进度 -->
          <div style="margin-top:10px;">
            <div style="font-weight:bold;margin-bottom:6px;">配送进度</div>
            <el-timeline>
              <el-timeline-item timestamp="下单成功" :type="order.status >= 1 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="商家接单" :type="order.status >= 2 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="骑手取餐/配送中" :type="order.status >= 3 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="已完成" :type="order.status >= 4 ? 'success' : 'info'" />
              <el-timeline-item timestamp="已取消" v-if="order.status ===5" type="danger" />
            </el-timeline>
          </div>

          <!-- 按钮组 -->
          <div style="margin-top:10px;display:flex;gap:8px;">
            <el-button v-if="order.status === 1" type="danger" size="small" @click="handleCancelOrder(order.id)">取消订单</el-button>
            <el-button type="info" size="small" @click="handleUserDeleteOrder(order.id)">删除订单记录</el-button>
            <el-button type="primary" size="small" @click="openDetail(order)">查看详情</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 订单详情弹窗：商品清单 -->
    <el-dialog v-model="showDetail" title="订单详情" width="700px" append-to-body>
      <!-- 订单基本信息 -->
      <el-descriptions :column="2" border size="small" style="margin-bottom:20px">
        <el-descriptions-item label="订单号" :span="2">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="商家名称">{{ currentDetail.shopName }}</el-descriptions-item>
        <el-descriptions-item label="商家电话">{{ currentDetail.shopPhone || '未获取' }}</el-descriptions-item>
        <el-descriptions-item label="骑手姓名">{{ currentDetail.riderName || '未接单' }}</el-descriptions-item>
        <el-descriptions-item label="骑手电话">{{ currentDetail.riderPhone || '未接单' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentDetail.address }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">{{ getStatusText(currentDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatTime(currentDetail.createTime) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 商品清单 -->
      <h4 style="margin-bottom:12px;color:#ff6b35;font-size:16px">商品清单</h4>
      <el-table :data="goodsList" border style="width:100%" align="center">
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
        订单总金额：<span style="color: #ff6b35; font-weight: bold;">¥{{ currentDetail.totalPrice }}</span>
      </div>

      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserOrderList, cancelOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const orderList = ref([])
const loading = ref(true)

// 详情弹窗
const showDetail = ref(false)
const currentDetail = ref(null)
const goodsList = ref([])

// 状态文本
const getStatusText = (status) => {
  const map = { 1: '待接单', 2: '已接单', 3: '配送中', 4: '已完成', 5: '已取消' }
  return map[status] || '未知'
}
const getStatusTagType = (status) => {
  if (status === 4) return 'success'
  if (status === 5) return 'danger'
  if (status === 1) return 'warning'
  return 'primary'
}

// 打开订单详情
const openDetail = async (order) => {
  try {
    currentDetail.value = order

    // 查询商品清单
    const res = await request.get('/order/goods/detail', {
      params: { orderId: order.id }
    })
    goodsList.value = res.data || []

    // 查询商家、骑手信息
    const info = await request.get('/order/extra/info', {
      params: { orderId: order.id }
    })
    currentDetail.value = { ...order, ...info.data }

    showDetail.value = true
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

// 取消订单
const handleCancelOrder = async (orderId) => {
  try {
    await cancelOrder(orderId)
    ElMessage.success('取消成功')
    getOrderList()
  } catch (err) {
    ElMessage.error('取消失败')
  }
}

// 删除订单
const handleUserDeleteOrder = async (orderId) => {
  try {
    await request.post('/order/user/delete', { orderId })
    ElMessage.success('删除成功')
    getOrderList()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 获取订单列表
const getOrderList = async () => {
  try {
    loading.value = true
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getUserOrderList(user.id)
    orderList.value = res.data || []
  } catch (err) {
    orderList.value = []
  } finally {
    loading.value = false
  }
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.order-page { 
  width: 100%; 
  min-height: 100vh; 
  background: #f8f9fa; 
}

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
  max-width: 1000px; 
  margin: 0 auto; 
  padding: 28px 0; 
}

.text-center { text-align: center; }

.container h2 {
  font-size: 26px;
  font-weight: 800;
  color: #ff6b35;
  margin-bottom: 28px;
  letter-spacing: 1px;
}

.order-item { margin-bottom: 20px; }
.order-item :deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transition: all 0.3s;
}
.order-item :deep(.el-card:hover) {
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.loading { text-align: center; padding: 40px; color: #909399; font-size: 16px; }
.empty { text-align: center; padding: 60px; color: #909399; font-size: 18px; font-weight: 500; }

/* 详情弹窗 */
.order-page :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}
.order-page :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  margin: 0;
  padding: 20px;
}
.order-page :deep(.el-dialog__title) {
  color: #ff6b35;
  font-weight: 700;
}
</style>