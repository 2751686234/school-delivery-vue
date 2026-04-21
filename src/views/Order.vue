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

      <div v-else-if="orderList.length === 0" class="empty">
        暂无订单
      </div>

      <div v-else v-for="order in orderList" :key="order.id" class="order-item">
        <el-card>
          <div><strong>订单号：{{ order.orderNo }}</strong></div>
          <div>金额：¥{{ order.totalPrice }}</div>
          <div>商家：{{ order.shopName }}</div>
          <div>地址：{{ order.address }}</div>

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

          <el-button 
            v-if="order.status === 1" 
            type="danger" 
            size="small" 
            @click="handleCancelOrder(order.id)"
            style="margin-top:10px;"
          >
            取消订单
          </el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserOrderList, cancelOrder } from '@/api/order'
import { ElMessage } from 'element-plus'

const orderList = ref([])
const loading = ref(true)

// 取消订单
const handleCancelOrder = async (orderId) => {
  try {
    await cancelOrder(orderId)
    ElMessage.success('订单取消成功')
    getOrderList()
  } catch (err) {
    ElMessage.error('取消订单失败')
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

onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.order-page { width:100%; min-height:100vh; background:#f7f8fa; }
.nav { width:100%; }
.container { width:95%; max-width:1000px; margin:0 auto; padding:20px 0; }
.text-center { text-align:center; }
.order-item { margin-bottom:16px; }
.loading { text-align:center; padding:20px; }
.empty { text-align:center; padding:40px; color:#999; }
</style>