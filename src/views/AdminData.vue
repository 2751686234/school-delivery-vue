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
    <h2 class="title">平台数据分析</h2>

    <el-row :gutter="20" style="margin-bottom:20px">
      <el-col :span="6">
        <el-card><div class="k">总用户</div><div class="v">{{ data.userTotal }}</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><div class="k">总商家</div><div class="v">{{ data.shopTotal }}</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><div class="k">总订单</div><div class="v">{{ data.orderTotal }}</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><div class="k">月销售额</div><div class="v">¥{{ data.monthAmount }}</div></el-card>
      </el-col>
    </el-row>

    <!-- 图表区域（安全不报错） -->
    <el-card style="padding:20px;margin-bottom:20px">
      <div class="sub-title">近7日订单量 & 销售额趋势</div>
      <div ref="chart" style="width:100%;height:300px"></div>
    </el-card>

    <!-- 商品销量 TOP10 -->
    <el-card style="padding:20px">
      <div class="sub-title">商品销量TOP10</div>
      <el-table :data="goodsTop" border align="center">
        <el-table-column label="排名" width="80">
          <template #default="scope">{{ scope.$index+1 }}</template>
        </el-table-column>
        <el-table-column prop="name" label="商品"/>
        <el-table-column prop="sales" label="销量"/>
        <el-table-column prop="income" label="销售额"/>
      </el-table>
    </el-card>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const data = ref({ userTotal:0, shopTotal:0, orderTotal:0, monthAmount:0 })
const goodsTop = ref([])
const chart = ref(null)
let myChart = null

// 加载数据（安全不报错）
const loadAll = async () => {
  try {
    // 总览统计
    let res = await request.get('/admin/data/dashboard')
    data.value = res.data

    // 商品排行
    let top = await request.get('/admin/data/goodsTop')
    goodsTop.value = top.data

    // 7日数据
    let day7 = await request.get('/admin/data/7day')
    
    // 只有存在 echarts 才渲染图表
    await nextTick()
    if (window.echarts && chart.value) {
      initChart(day7.data)
    }
  } catch (e) {
    console.log("数据加载异常", e)
  }
}

// 图表初始化（安全版）
const initChart = (list) => {
  if (!window.echarts) return
  myChart = window.echarts.init(chart.value)
  let x = list.map(i => i.date ? i.date.substring(5) : "-")
  let order = list.map(i => i.orderCount || 0)
  let sales = list.map(i => i.sales || 0)

  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数','销售额'] },
    xAxis: { data: x },
    yAxis: [{},{ type: 'value' }],
    series: [
      { name:'订单数', type:'line', data:order, smooth:true },
      { name:'销售额', type:'bar', data:sales, yAxisIndex:1 }
    ]
  })
}

const logout = () => { localStorage.clear(); router.push('/login') }
onMounted(() => loadAll())
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

/* 数据卡片：多彩渐变 */
.container > .el-row > .el-col > .el-card {
  padding: 28px 0;
  text-align: center;
  border-radius: 20px;
  border: none;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.container > .el-row > .el-col > .el-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
}
.k {
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10px;
  font-weight: 600;
}
.v {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
}
.el-col:nth-child(1) .el-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.el-col:nth-child(2) .el-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.el-col:nth-child(3) .el-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.el-col:nth-child(4) .el-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* 图表卡片 */
.container > .el-card {
  padding: 28px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}
.sub-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1a2a6c;
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