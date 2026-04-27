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
.wrap {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏：与工作台统一 */
.nav {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(17, 153, 142, 0.25);
}
.nav :deep(.el-menu-item) {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav :deep(.el-menu-item:hover),
.nav :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-bottom-color: #fff;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
  text-align: center;
}
.title {
  font-size: 28px;
  margin-bottom: 28px;
  font-weight: 800;
  color: #11998e;
  letter-spacing: 1px;
}

/* 表格容器美化 */
.container {
  padding: 32px 0;
}
.container > .el-table {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* 表格美化（复用工作台样式） */
.wrap :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.wrap :deep(.el-table th) {
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
  color: #11998e;
  font-weight: 800;
  font-size: 15px;
}
.wrap :deep(.el-table--border::after),
.wrap :deep(.el-table--group::after) {
  background-color: transparent;
}

/* 状态标签颜色强化 */
.wrap :deep(.el-tag--warning) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  padding: 0 14px;
  border-radius: 10px;
}
.wrap :deep(.el-tag--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  padding: 0 14px;
  border-radius: 10px;
}
.wrap :deep(.el-tag--success) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  padding: 0 14px;
  border-radius: 10px;
}
.wrap :deep(.el-tag--info) {
  background: linear-gradient(135deg, #a8a8a8 0%, #c9c9c9 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  padding: 0 14px;
  border-radius: 10px;
}

/* 操作按钮 */
.wrap .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  padding: 0 20px;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
  transition: all 0.3s;
}
.wrap .el-button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.45);
}
.wrap .el-button--primary:disabled {
  background: #d1d5db;
  box-shadow: none;
}
</style>