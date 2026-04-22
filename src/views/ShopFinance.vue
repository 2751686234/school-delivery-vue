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
      <h2 class="page-title">财务管理</h2>
      <el-card class="card-container">
        <!-- 财务概览 -->
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">今日收入</div>
              <div class="value">¥{{ todayIncome }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">本月收入</div>
              <div class="value">¥{{ monthIncome }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">今日订单数</div>
              <div class="value">{{ todayOrder }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">本月订单数</div>
              <div class="value">{{ monthOrder }}</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 财务筛选 -->
        <div class="filter">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px; margin-right: 10px;"
          />
          <el-button type="primary" @click="searchFinance">查询</el-button>
          <el-button type="success" @click="exportExcel" style="margin-left: 10px;">导出报表</el-button>
        </div>

        <!-- 财务明细表格 -->
        <el-table :data="financeList" border style="width: 100%; margin-top: 20px;" align="center">
          <el-table-column prop="date" label="日期" align="center" />
          <el-table-column prop="orderNo" label="订单号" align="center" />
          <el-table-column prop="username" label="客户" align="center" />
          <el-table-column prop="amount" label="金额" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" @click="handleDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
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

// 🔥 修复：把页面使用的变量全部定义（解决所有报错）
const todayIncome = ref(0)
const monthIncome = ref(0)
const todayOrder = ref(0)
const monthOrder = ref(0)

const financeList = ref([])
const dateRange = ref([])

// 获取财务数据
const getFinance = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/shop/finance/overview', { params: { userId: user.id } })
    const data = res.data || {}
    
    // 安全赋值
    todayIncome.value = data.todayIncome ?? 0
    monthIncome.value = data.monthIncome ?? 0
    todayOrder.value = data.todayOrder ?? 0
    monthOrder.value = data.monthOrder ?? 0
  } catch (err) {
    ElMessage.error('获取财务数据失败')
  }
}

// 页面加载执行
onMounted(() => {
  getFinance()
})

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 查询财务明细
const searchFinance = () => {
  if (dateRange.value.length === 0) {
    ElMessage.error('请选择查询日期范围')
    return
  }
  ElMessage.success(`查询 ${dateRange.value[0]} 至 ${dateRange.value[1]} 的财务明细成功`)
}

// 导出报表
const exportExcel = () => {
  ElMessage.success('报表导出中，请稍后...')
}

// 查看详情
const handleDetail = (row) => {
  ElMessage.info(`订单 ${row.orderNo} 详情：客户${row.username}，消费${row.amount}元，${row.status}`)
}
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
.finance-card {
  text-align: center;
  padding: 20px 0;
}
.finance-card .title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.finance-card .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.filter {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>