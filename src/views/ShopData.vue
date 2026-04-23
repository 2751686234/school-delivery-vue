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
        <!-- 筛选 -->
        <div class="filter">
          <el-select v-model="dateType" placeholder="选择时间范围" style="width:180px;margin-right:10px">
            <el-option label="今日" value="today"></el-option>
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
            <el-option label="本年" value="year"></el-option>
          </el-select>
          <el-button type="primary" @click="searchData">查询</el-button>
        </div>

        <!-- 数据卡片 -->
        <el-row :gutter="20" style="margin:20px 0">
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">总订单数</div><div class="value">{{ totalOrder }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">总销售额</div><div class="value">¥{{ totalSales }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">总客户数</div><div class="value">{{ totalUser }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">客单价</div><div class="value">¥{{ averagePrice }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">复购率</div><div class="value">{{ repeatRate }}%</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="hover" class="data-card"><div class="title">商品销量</div><div class="value">{{ totalGoodsSales }}</div></el-card></el-col>
        </el-row>

        <!--  近7日销量趋势折线图 -->
        <el-card style="margin-bottom:20px;padding:20px">
          <div class="chart-title">近7日销量趋势</div>
          <div id="trendChart" style="width:100%;height:360px"></div>
        </el-card>

        <!-- 商品销量排行 TOP10 -->
        <el-card style="padding:20px">
          <div class="chart-title">商品销量排行 TOP10</div>
          <el-table :data="goodsRank" border style="width:100%;margin-top:10px" align="center">
            <el-table-column prop="ranking" label="排名" align="center" width="80" />
            <el-table-column prop="name" label="商品名称" align="center" />
            <el-table-column prop="sales" label="销量" align="center" />
            <el-table-column prop="income" label="销售额" align="center" />
            <el-table-column prop="ratio" label="占比" align="center">
              <template #default="scope">{{ scope.row.ratio }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import * as echarts from 'echarts'

const router = useRouter()

const totalOrder = ref(0)
const totalSales = ref(0)
const totalUser = ref(0)
const averagePrice = ref(0)
const repeatRate = ref(0)
const totalGoodsSales = ref(0)
const goodsRank = ref([])
const dateType = ref('month')
let trendChart = null

const getData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) { ElMessage.error('请先登录'); return }

    const res = await request.get('/shop/data/overview', {
      params: { userId: user.id, dateType: dateType.value }
    })
    const d = res.data || {}

    totalOrder.value = d.totalOrder || 0
    totalSales.value = d.totalSales || 0
    totalUser.value = d.totalUser || 0
    averagePrice.value = d.averagePrice || 0
    repeatRate.value = d.repeatRate || 0
    totalGoodsSales.value = d.totalGoodsSales || 0

    // 商品排行
    goodsRank.value = (d.goodsRank || []).map((it, i) => ({
      ...it, ranking: i + 1, ratio: (it.ratio || 0).toFixed(1)
    }))

    // 绘制图表
    nextTick(() => renderChart(d.trend || []))

  } catch (e) { ElMessage.error('获取数据失败') }
}

// 绘制折线图
const renderChart = (trend) => {
  const dom = document.getElementById('trendChart')
  if (!dom) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(dom)

  const dates = trend.map(t => t.date)
  const counts = trend.map(t => t.orderCount)
  const sales = trend.map(t => t.sales)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数', '销售额'] },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { type: 'value', name: '订单数' },
      { type: 'value', name: '销售额', position: 'right' }
    ],
    series: [
      { name: '订单数', type: 'line', data: counts, smooth: true },
      { name: '销售额', type: 'line', yAxisIndex: 1, data: sales, smooth: true }
    ]
  }
  trendChart.setOption(option)
}

onMounted(() => getData())
const searchData = () => getData()
const logout = () => { localStorage.clear(); router.push('/login') }
</script>

<style scoped>
.page-wrapper { width:100%; min-height:100vh; background:#f5f7fa }
.nav-bar { width:100%; display:flex; justify-content:center }
.page-container { width:90%; max-width:1400px; margin:0 auto; padding:30px 0 }
.page-title { font-size:22px; margin-bottom:20px; text-align:center }
.card-container { padding:20px; text-align:left }
.filter { display:flex; align-items:center }
.data-card { text-align:center; padding:16px 0 }
.data-card .title { font-size:14px; color:#666; margin-bottom:6px }
.data-card .value { font-size:20px; font-weight:bold }
.chart-title { font-size:16px; font-weight:bold; margin-bottom:12px; text-align:center }
</style>