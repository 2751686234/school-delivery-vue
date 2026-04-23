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
      <el-col :span="6"><el-card><div class="k">总用户</div><div class="v">1286</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="k">总商家</div><div class="v">32</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="k">总订单</div><div class="v">8652</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="k">月销售额</div><div class="v">¥8.6万</div></el-card></el-col>
    </el-row>

    <el-card style="padding:20px;margin-bottom:20px">
      <div class="sub-title">近7日订单量趋势</div>
      <div style="width:100%;height:300px;background:#fafafa;border-radius:8px;display:flex;align-items:center;justify-content:center">
        折线图区域：订单量 / 销售额 / 活跃用户走势
      </div>
    </el-card>

    <el-card style="padding:20px">
      <div class="sub-title">商品销量TOP10</div>
      <el-table :data="goods" border align="center">
        <el-table-column prop="ranking" label="排名"/>
        <el-table-column prop="name" label="商品"/>
        <el-table-column prop="sales" label="销量"/>
        <el-table-column prop="income" label="销售额"/>
      </el-table>
    </el-card>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const goods = ref([
  { ranking:1, name:'香辣鸡腿堡', sales:268, income:4279 },
  { ranking:2, name:'珍珠奶茶', sales:186, income:2405 },
  { ranking:3, name:'薯条', sales:152, income:1352 },
])
const logout = () => { localStorage.clear(); router.push('/login') }
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1400px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
.sub-title{font-size:16px;font-weight:bold;margin-bottom:15px;text-align:center}
.k{color:#666;margin-bottom:6px}
.v{font-size:20px;font-weight:bold}
</style>