<template>
<div class="wrap">
  <el-menu mode="horizontal" class="nav-bar" v-model="activeMenu" router>
    <el-menu-item index="/admin">首页</el-menu-item>
    <el-menu-item index="/admin-user">用户管理</el-menu-item>
    <el-menu-item index="/admin-shop">商店管理</el-menu-item>
    <el-menu-item index="/admin-goods">商品管理</el-menu-item>
    <el-menu-item index="/admin-order">订单管理</el-menu-item>
    <el-menu-item index="/admin-finance">财务管理</el-menu-item>
    <el-menu-item index="/admin-content">内容管理</el-menu-item>
    <el-menu-item index="/admin-data">数据分析</el-menu-item>
    <el-menu-item index="/admin-setting">系统设置</el-menu-item>
    <el-menu-item @click="logout">退出</el-menu-item>
  </el-menu>

  <div class="container">
    <h2 class="title">全平台订单管理</h2>
    <el-card>
      <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
        <el-input v-model="orderNo" placeholder="订单号" style="width:220px"/>
        <el-select v-model="status" placeholder="状态" style="width:150px">
          <el-option label="全部" value=""/>
          <el-option label="待接单" value="1"/>
          <el-option label="已接单" value="2"/>
          <el-option label="配送中" value="3"/>
          <el-option label="已完成" value="4"/>
          <el-option label="已取消" value="5"/>
        </el-select>
        <el-button type="primary" @click="loadList">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="orderNo" label="订单号" width="200"/>
        <el-table-column prop="username" label="用户" width="100"/>
        <el-table-column prop="shopName" label="商店" width="120"/>
        <el-table-column prop="phone" label="电话" width="120"/>
        
        <!-- 金额列：显示实付 -->
        <el-table-column label="金额" width="140" align="center">
          <template #default="scope">
            <div>原价：¥{{ scope.row.totalPrice }}</div>
            <div v-if="scope.row.discountAmount > 0" style="font-size:12px;color:#e6a23c;">
              优惠：-¥{{ scope.row.discountAmount }}
            </div>
            <div style="color:#ff6b35;font-weight:700;font-size:15px;">
              实付：¥{{ scope.row.finalPrice || scope.row.totalPrice }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="paymentMethod" label="支付方式" width="100"/>
        <el-table-column prop="address" label="地址" width="150"/>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="
                scope.row.status == 1 ? 'warning' : 
                scope.row.status == 2 ? 'info' :
                scope.row.status == 3 ? 'primary' : 
                scope.row.status == 4 ? 'success' : 'danger'
              "
            >
              {{ 
                scope.row.status == 1 ? '待接单' : 
                scope.row.status == 2 ? '已接单' : 
                scope.row.status == 3 ? '配送中' : 
                scope.row.status == 4 ? '已完成' : '已取消'
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="下单时间" width="170"/>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <!-- 订单详情弹窗 -->
  <el-dialog v-model="showDetail" title="订单详情" width="700px">
    <!-- 订单基本信息 -->
    <el-descriptions :column="2" border size="small" style="margin-bottom:20px">
      <el-descriptions-item label="订单号" :span="2">{{ currentOrder.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="用户账号">{{ currentOrder.username }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
      <el-descriptions-item label="商家名称">{{ currentOrder.shopName }}</el-descriptions-item>
      <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="currentOrder.status == 4 ? 'success' : currentOrder.status == 5 ? 'danger' : 'primary'">
          {{ currentOrder.status == 1 ? '待接单' : currentOrder.status == 2 ? '已接单' : currentOrder.status == 3 ? '配送中' : currentOrder.status == 4 ? '已完成' : '已取消' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '未设置' }}</el-descriptions-item>
      <el-descriptions-item label="商品总价">
        <span>¥{{ currentOrder.totalPrice }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="优惠金额" v-if="currentOrder.discountAmount > 0">
        <span style="color:#e6a23c">-¥{{ currentOrder.discountAmount }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="实付金额">
        <span style="color:#ff6b35;font-weight:800;font-size:18px">
          ¥{{ currentOrder.finalPrice || currentOrder.totalPrice }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="下单时间">{{ formatTime(currentOrder.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="接单时间" v-if="currentOrder.acceptTime">{{ formatTime(currentOrder.acceptTime) }}</el-descriptions-item>
      <el-descriptions-item label="完成时间" v-if="currentOrder.finishTime">{{ formatTime(currentOrder.finishTime) }}</el-descriptions-item>
    </el-descriptions>

    <!-- 商品清单 -->
    <h4 style="margin-bottom:12px;color:#1a2a6c;font-size:16px">商品清单</h4>
    <el-table :data="goodsList" border style="width:100%" align="center" v-loading="detailLoading">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="goods_name" label="商品名称" align="center" />
      <el-table-column prop="num" label="数量" width="80" align="center" />
      <el-table-column prop="price" label="单价（¥）" width="120" align="center" />
      <el-table-column label="小计（¥）" width="120" align="center">
        <template #default="scope">{{ (scope.row.num * scope.row.price).toFixed(2) }}</template>
      </el-table-column>
    </el-table>

    <div style="margin-top:20px;text-align:right;font-size:16px;">
      商品总价：<span style="color:#333;font-weight:bold;">¥{{ currentOrder.totalPrice }}</span>
      <span v-if="currentOrder.discountAmount > 0" style="color:#e6a23c;margin-left:12px;">
        优惠：-¥{{ currentOrder.discountAmount }}
      </span>
      <span style="color:#ff6b35;font-weight:bold;font-size:20px;margin-left:16px;">
        实付：¥{{ currentOrder.finalPrice || currentOrder.totalPrice }}
      </span>
    </div>

    <template #footer>
      <el-button @click="showDetail = false">关闭</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path)

const orderNo = ref('')
const status = ref('')
const list = ref([])

// 详情弹窗
const showDetail = ref(false)
const currentOrder = ref({})
const goodsList = ref([])
const detailLoading = ref(false)

const loadList = async () => {
  const res = await request.get('/admin/order/list', {
    params: { orderNo: orderNo.value, status: status.value }
  })
  list.value = res.data || []
}

const reset = () => {
  orderNo.value = ''
  status.value = ''
  loadList()
}

// 查看详情
const openDetail = async (row) => {
  currentOrder.value = row
  showDetail.value = true
  detailLoading.value = true
  
  try {
    // 查询商品清单
    const res = await request.get('/order/goods/detail', {
      params: { orderId: row.id }
    })
    goodsList.value = res.data || []
  } catch (e) {
    goodsList.value = []
    ElMessage.error('加载商品清单失败')
  } finally {
    detailLoading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.wrap {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
.nav-bar {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #1a2a6c 0%, #2c3e50 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(26, 42, 108, 0.25);
}
.nav-bar :deep(.el-menu-item) {
  color: #ecf0f1;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-bar :deep(.el-menu-item:hover),
.nav-bar :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.12);
  color: #3498db;
  border-bottom-color: #3498db;
}

.container {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 0;
}
.title {
  font-size: 26px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 800;
  color: #1a2a6c;
  letter-spacing: 1px;
}
.container > .el-card {
  padding: 28px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.container > .el-card > div:first-child {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.container > .el-card > div:first-child :deep(.el-input__wrapper),
.container > .el-card > div:first-child :deep(.el-select__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.container > .el-card > div:first-child :deep(.el-input__wrapper.is-focus),
.container > .el-card > div:first-child :deep(.el-select__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.container > .el-card > div:first-child .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  transition: all 0.3s;
}
.container > .el-card > div:first-child .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
}
.container > .el-card > div:first-child .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}

/* 表格美化 */
.wrap :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.wrap :deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #1a2a6c;
  font-weight: 800;
  font-size: 15px;
}
.wrap :deep(.el-table--border::after),
.wrap :deep(.el-table--group::after) {
  background-color: transparent;
}
.wrap .el-button {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}
.wrap .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}
.wrap .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(52, 152, 219, 0.4);
}

/* 弹窗美化 */
.wrap :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.wrap :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin: 0;
  padding: 22px 24px;
}
.wrap :deep(.el-dialog__title) {
  color: #1a2a6c;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
}
</style>