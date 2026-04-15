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
      <div v-for="order in orderList" :key="order.id" class="order-item">
        <el-card>
          <div><strong>订单号：{{ order.orderNo }}</strong></div>
          <div>金额：¥{{ order.totalPrice }}</div>
          <div>地址：{{ order.address }}</div>

          <div style="margin-top:10px;">
            <div style="font-weight:bold;margin-bottom:6px;">配送进度</div>
            <el-timeline>
              <el-timeline-item timestamp="下单成功" :type="order.step >=1 ?'primary':'gray'" />
              <el-timeline-item timestamp="商家接单" :type="order.step >=2 ?'primary':'gray'" />
              <el-timeline-item timestamp="配送中" :type="order.step >=3 ?'primary':'gray'" />
              <el-timeline-item timestamp="已送达" :type="order.step >=4 ?'success':'gray'" />
            </el-timeline>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserOrderList } from '@/api/order'

const orderList = ref([])

onMounted(async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getUserOrderList(user.id)
    orderList.value = res.data
  } catch (err) {
    orderList.value = []
  }
})
</script>

<style scoped>
.order-page { width:100%; min-height:100vh; background:#f7f8fa; }
.nav { width:100%; }
.container { width:95%; max-width:1000px; margin:0 auto; padding:20px 0; }
.text-center { text-align:center; }
.order-item { margin-bottom:16px; }
</style>