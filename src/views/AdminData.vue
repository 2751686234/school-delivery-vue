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
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1400px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
.sub-title{font-size:16px;font-weight:bold;margin-bottom:15px}
.k{color:#666;margin-bottom:6px}
.v{font-size:20px;font-weight:bold;color:#1989fa}
</style>