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
      <h2 class="page-title">数据分析</h2>
      <el-card class="card-container">
        <!-- 数据筛选 -->
        <div class="filter">
          <el-select v-model="dateType" placeholder="选择时间范围" style="width: 180px; margin-right: 10px;">
            <el-option label="今日" value="today"></el-option>
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
            <el-option label="本年" value="year"></el-option>
          </el-select>
          <el-button type="primary" @click="searchData">查询</el-button>
        </div>

        <!-- 数据概览 -->
        <el-row :gutter="20" style="margin: 20px 0;">
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">总订单数</div>
              <div class="value">{{ totalOrder }}</div>
            </el-card>
          </el-col>
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">总销售额</div>
              <div class="value">¥{{ totalSales }}</div>
            </el-card>
          </el-col>
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">总客户数</div>
              <div class="value">{{ totalUser }}</div>
            </el-card>
          </el-col>
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">客单价</div>
              <div class="value">¥{{ averagePrice }}</div>
            </el-card>
          </el-col>
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">复购率</div>
              <div class="value">{{ repeatRate }}%</div>
            </el-card>
          </el-col>
          <el-col :span="4">
            <el-card shadow="hover" class="data-card">
              <div class="title">商品销量</div>
              <div class="value">{{ totalGoodsSales }}</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 销量趋势图 -->
        <el-card style="margin-bottom: 20px; padding:20px;">
          <div class="chart-title">近7日销量趋势</div>
          <div style="width:100%; height:360px; background:#fafafa; display:flex; align-items:center; justify-content:center; border-radius:8px;">
            <div style="font-size:16px; color:#666">
              折线图区域：近7日订单量 / 销售额趋势展示
            </div>
          </div>
        </el-card>

        <!-- 商品销量排行 -->
        <el-card style="padding:20px;">
          <div class="chart-title">商品销量排行TOP10</div>
          <el-table :data="goodsRank" border style="width:100%; margin-top:10px;" align="center">
            <el-table-column prop="ranking" label="排名" align="center" width="80" />
            <el-table-column prop="name" label="商品名称" align="center" />
            <el-table-column prop="sales" label="销量" align="center" />
            <el-table-column prop="income" label="销售额" align="center" />
            <el-table-column prop="ratio" label="占比" align="center" />
          </el-table>
        </el-card>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 数据概览
const totalOrder = ref(528)
const totalSales = ref(8652.8)
const totalUser = ref(126)
const averagePrice = ref(16.4)
const repeatRate = ref(32.6)
const totalGoodsSales = ref(1268)

// 时间筛选
const dateType = ref('month')

// 商品销量排行
const goodsRank = ref([
  { ranking: 1, name: '香辣鸡腿堡', sales: 268, income: 4279.2, ratio: '49.5%' },
  { ranking: 2, name: '珍珠奶茶', sales: 186, income: 2405.4, ratio: '27.8%' },
  { ranking: 3, name: '上校鸡块', sales: 152, income: 1352.8, ratio: '15.6%' },
  { ranking: 4, name: '薯条', sales: 124, income: 855.6, ratio: '9.9%' },
  { ranking: 5, name: '可乐', sales: 98, income: 480.2, ratio: '5.5%' }
])

// 查询数据
const searchData = () => {
  ElMessage.success(`已切换为【${dateType.value === 'today' ? '今日' :
    dateType.value === 'week' ? '本周' :
    dateType.value === 'month' ? '本月' : '本年'}】数据`)
}

// 退出
const logout = () => {
  localStorage.clear()
  router.push('/login')
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
  max-width: 1400px;
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
}
.data-card {
  text-align: center;
  padding: 16px 0;
}
.data-card .title {
  font-size:14px;
  color:#666;
  margin-bottom:6px;
}
.data-card .value {
  font-size:20px;
  font-weight:bold;
}
.chart-title {
  font-size:16px;
  font-weight:bold;
  margin-bottom:12px;
  text-align:center;
}
</style>