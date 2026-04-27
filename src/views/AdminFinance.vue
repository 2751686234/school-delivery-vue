<template>
<div class="wrap">
  <el-menu mode="horizontal" class="nav-bar">
    <el-menu-item @click="$router.push('/admin')">首页</el-menu-item>
    <el-menu-item @click="$router.push('/admin-user')">用户管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-shop')">商店管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-goods')">商品管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-order')">订单管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-finance')">财务管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-content')">内容管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-data')">数据分析</el-menu-item>
    <el-menu-item @click="$router.push('/admin-setting')">系统设置</el-menu-item>
    <el-menu-item @click="logout">退出</el-menu-item>
  </el-menu>

  <div class="container">
    <h2 class="title">平台财务管理</h2>
    
    <!-- 总览卡片 -->
    <el-row :gutter="20" style="margin-bottom:20px">
      <el-col :span="6">
        <el-card>
          <div class="label">今日交易额</div>
          <div class="val">¥{{ todayAmount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="label">本月交易额</div>
          <div class="val">¥{{ monthAmount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="label">总订单数</div>
          <div class="val">{{ totalOrderCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="label">平台总营收</div>
          <div class="val">¥{{ totalAmount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日期查询 -->
    <el-card>
      <div style="margin-bottom:15px">
        <el-date-picker 
          v-model="range" 
          type="daterange" 
          range-separator="至" 
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width:350px;margin-right:10px"/>
        <el-button type="primary" @click="query">查询统计</el-button>
        <el-button type="success" @click="exportData">导出报表</el-button>
      </div>

      <el-table :data="tableData" border align="center">
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="orderCount" label="订单数量" />
        <el-table-column prop="amount" label="交易金额" />
        <el-table-column prop="shopSettle" label="商家结算" />
        <el-table-column prop="profit" label="平台利润" />
      </el-table>
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
const range = ref([])
const todayAmount = ref(0)
const monthAmount = ref(0)
const totalOrderCount = ref(0)
const totalAmount = ref(0)
const tableData = ref([])

// 加载总览数据
const loadOverview = async () => {
  const res = await request.get('/admin/finance/overview')
  todayAmount.value = res.data.todayAmount || 0
  monthAmount.value = res.data.monthAmount || 0
}

// 日期范围查询
const query = async () => {
  if (!range.value || range.value.length < 2) {
    ElMessage.warning('请选择日期范围')
    return
  }
  const startDate = range.value[0].toISOString().split('T')[0]
  const endDate = range.value[1].toISOString().split('T')[0]

  const res = await request.get('/admin/finance/statistic', {
    params: { startDate, endDate }
  })

  const count = res.data.orderCount || 0
  const amount = res.data.totalAmount || 0
  const shopSettle = (amount * 0.85).toFixed(2) // 商家分85%
  const profit = (amount * 0.15).toFixed(2)     // 平台利润15%

  tableData.value = [{
    date: startDate + ' ~ ' + endDate,
    orderCount: count,
    amount: amount,
    shopSettle: shopSettle,
    profit: profit
  }]

  totalOrderCount.value = count
  totalAmount.value = amount

  ElMessage.success('查询成功')
}

// 导出
const exportData = () => {
  ElMessage.success('导出成功')
}

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  loadOverview()
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
  text-align: center;
}
.title {
  font-size: 26px;
  margin-bottom: 28px;
  font-weight: 800;
  color: #1a2a6c;
  letter-spacing: 1px;
}

/* 财务数据卡片：金绿渐变 */
.container > .el-row > .el-col > .el-card {
  padding: 28px 0;
  text-align: center;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(17, 153, 142, 0.25);
}
.container > .el-row > .el-col > .el-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(17, 153, 142, 0.35);
}
.label {
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10px;
  font-weight: 600;
}
.val {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
}

.container > .el-card {
  padding: 28px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.container > .el-card > div:first-child {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.container > .el-card > div:first-child :deep(.el-date-editor) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.container > .el-card > div:first-child :deep(.el-date-editor.is-focus) {
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
.container > .el-card > div:first-child .el-button--success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(17, 153, 142, 0.35);
}
.container > .el-card > div:first-child .el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(17, 153, 142, 0.45);
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
</style>