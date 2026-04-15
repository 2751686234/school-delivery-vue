<template>
<div class="wrap">
  <el-menu mode="horizontal" class="nav-bar">
    <el-menu-item @click="$router.push('/admin')">首页</el-menu-item>
    <el-menu-item @click="$router.push('/admin-user')">用户管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-shop')">商家管理</el-menu-item>
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
    <el-row :gutter="20" style="margin-bottom:20px">
      <el-col :span="6"><el-card><div class="label">今日交易额</div><div class="val">¥3286.5</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="label">本月交易额</div><div class="val">¥86942.3</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="label">商家结算总额</div><div class="val">¥62180.7</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="label">平台利润</div><div class="val">¥24761.6</div></el-card></el-col>
    </el-row>

    <el-card>
      <div style="margin-bottom:15px">
        <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width:350px;margin-right:10px"/>
        <el-button type="primary" @click="refresh">查询</el-button>
        <el-button type="success">导出报表</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="date" label="日期"/>
        <el-table-column prop="orderCount" label="订单数"/>
        <el-table-column prop="amount" label="交易金额"/>
        <el-table-column prop="shopSettle" label="商家结算"/>
        <el-table-column prop="profit" label="平台利润"/>
      </el-table>
    </el-card>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
const range = ref([])
const list = ref([
  { date:'2024-05-01', orderCount:128, amount:3286.5, shopSettle:2365.2, profit:921.3 },
  { date:'2024-04-30', orderCount:116, amount:2966.8, shopSettle:2120.4, profit:846.4 },
])
const logout = () => { localStorage.clear(); router.push('/login') }
const refresh = () => ElMessage.success('查询成功')
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1400px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
.label{font-size:14px;color:#666;margin-bottom:6px}
.val{font-size:20px;font-weight:bold}
</style>