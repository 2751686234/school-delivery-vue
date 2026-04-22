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
        <!-- 订单筛选 -->
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
          <el-button type="primary" @click="searchOrder">搜索</el-button>
        </div>

        <!-- 订单表格 -->
        <el-table :data="orderList" border style="width: 100%; margin-top: 20px;" align="center">
          <el-table-column prop="orderNo" label="订单号" align="center" />
          <el-table-column prop="username" label="客户姓名" align="center" />
          <el-table-column prop="phone" label="客户电话" align="center" />
          <el-table-column prop="address" label="配送地址" align="center" />
          <el-table-column prop="totalPrice" label="订单金额" align="center" />
          <el-table-column prop="createTime" label="下单时间" align="center" />
          <el-table-column prop="status" label="订单状态" align="center">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <!-- 待接单：接单/取消 -->
              <el-button type="primary" size="small" @click="handleTake(scope.row)" v-if="scope.row.status === 1">
                接单
              </el-button>
              <el-button type="danger" size="small" @click="handleCancel(scope.row)" v-if="scope.row.status === 1">
                取消订单
              </el-button>
              <!-- 待取餐/配送中：查看详情 -->
              <el-button size="small" @click="handleDetail(scope.row)" v-else>
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 订单详情弹窗 -->
        <el-dialog v-model="showDetail" title="订单详情" width="600px">
          <el-table :data="orderDetail" border style="width: 100%;" align="center">
            <el-table-column prop="name" label="商品名称" align="center" />
            <el-table-column prop="num" label="商品数量" align="center" />
            <el-table-column prop="price" label="商品单价" align="center" />
            <el-table-column prop="total" label="小计" align="center" />
          </el-table>
          <div style="margin-top: 20px; text-align: right;">
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

const router = useRouter()
const orderList = ref([])
const status = ref('')
const searchNo = ref('')
const showDetail = ref(false)
const orderDetail = ref([])
const currentOrder = ref({})

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 获取订单状态文本
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

// 获取标签类型
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

// 查看详情
const handleDetail = (row) => {
  currentOrder.value = row
  // 模拟订单详情
  orderDetail.value = [
    { name: '香辣鸡腿堡', num: 2, price: 15.9, total: 31.8 },
    { name: '珍珠奶茶', num: 1, price: 12.9, total: 12.9 }
  ]
  showDetail.value = true
}
// 页面加载时获取本店订单
const getShopOrders = async () => {
  try {
    // 从本地获取登录的用户ID（你一定有）
    const user = JSON.parse(localStorage.getItem('user'))
    const userId = user.id

    // 传入 userId，后端自动获取 shopId
    const res = await getShopOrderList(userId)
    orderList.value = res.data || []
  } catch (err) {
    ElMessage.error('获取订单失败：' + err.message)
    orderList.value = []
  }
}

// 接单（调用接口修改状态为2-待取餐）
const handleTake = async (row) => {
  try {
    await takeOrder(row.id)
    row.status = 2
    ElMessage.success('接单成功，等待骑手取餐')
  } catch (err) {
    ElMessage.error('接单失败：' + err.message)
  }
}

// 取消订单（调用接口修改状态为5-已取消）
const handleCancel = async (row) => {
  try {
    await cancelShopOrder(row.id)
    row.status = 5
    ElMessage.success('取消订单成功')
  } catch (err) {
    ElMessage.error('取消订单失败：' + err.message)
  }
}

// 搜索订单（真实接口筛选）
const searchOrder = () => {
  // 基于状态/订单号筛选（前端临时筛选，建议后端实现）
  let filterList = [...orderList.value]
  if (status.value) {
    filterList = filterList.filter(item => item.status === Number(status.value))
  }
  if (searchNo.value) {
    filterList = filterList.filter(item => item.orderNo.includes(searchNo.value))
  }
  orderList.value = filterList
  ElMessage.success('搜索成功')
}

onMounted(() => {
  getShopOrders()
})

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
}
.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
  text-align: center;
}
.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  text-align: center;
}
.card-container {
  padding: 20px;
  text-align: left;
}
.filter {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>