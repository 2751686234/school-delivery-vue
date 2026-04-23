<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav">
      <el-menu-item @click="$router.push('/rider')">首页</el-menu-item>
      <el-menu-item @click="$router.push('/rider-order')">我的订单</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">我的配送订单</h2>

      <el-table :data="list" border align="center">
        <el-table-column label="订单号" prop="orderNo"/>
        <el-table-column label="商家" prop="shopName"/>
        <el-table-column label="用户" prop="name"/>
        <el-table-column label="地址" prop="address"/>
        
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 1 ? 'warning' 
                    : scope.row.status === 2 ? 'primary' 
                    : scope.row.status === 4 ? 'success' 
                    : 'info'">
              {{ scope.row.status === 1 ? '待取餐' 
                : scope.row.status === 2 ? '配送中' 
                : scope.row.status === 4 ? '已完成' 
                : '未知状态' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="next(scope.row)"
              :disabled="scope.row.status === 4">
              
              {{ scope.row.status === 1 ? '取餐' 
                : scope.row.status === 2 ? '送达' 
                : '已完成' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const list = ref([])

// 获取当前骑手ID
const rider = JSON.parse(localStorage.getItem('user') || '{}')
const riderId = rider.id

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// ======================
// ✅ 加载【当前骑手的所有订单】
// ======================
const loadMyOrders = async () => {
  try {
    const res = await request.get('/rider/myOrders', {
      params: { riderId }
    })
    list.value = res.data || []
  } catch (e) {
    ElMessage.error('加载订单失败')
  }
}

// ======================
// ✅ 取餐 / 送达（状态流转）
// ======================
const next = async (row) => {
  try {
    if (row.status === 1) {
      // 待取餐 → 点击 → 变为 配送中（status=2）
      await request.post('/rider/takeOrder', {
        orderId: row.id,
        riderId: riderId
      })
      row.status = 2
      ElMessage.success('取餐成功，开始配送')
    } 
    else if (row.status === 2) {
      // 配送中 → 点击 → 变为 已完成（status=4）
      await request.post('/rider/completeOrder', {
        orderId: row.id
      })
      row.status = 4
      ElMessage.success('订单已送达！')
    }
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadMyOrders()
})
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa;}
.nav{display:flex;justify-content:center;}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center;}
.title{font-size:24px;margin-bottom:20px;}
</style>