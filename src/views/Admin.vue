<template>
  <div class="page-wrapper">
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

    <div class="page-container">
      <h2 class="page-title">管理员控制台</h2>

      <!-- 总览卡片 -->
      <el-row :gutter="20" style="margin-bottom:30px;">
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总用户数</div>
            <div class="num">1,286</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总商家数</div>
            <div class="num">32</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总商品数</div>
            <div class="num">186</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">今日订单</div>
            <div class="num">286</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 功能入口 → 现在可以正常点击跳转！ -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="func-card" @click="$router.push('/admin-user')">
            <div class="icon">👥</div>
            <div class="text">用户管理</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="func-card" @click="$router.push('/admin-shop')">
            <div class="icon">🏪</div>
            <div class="text">商家管理</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="func-card" @click="$router.push('/admin-goods')">
            <div class="icon">🍔</div>
            <div class="text">商品管理</div>
          </el-card>
        </el-col>

        <el-col :span="8" style="margin-top:20px;">
          <el-card class="func-card" @click="$router.push('/admin-order')">
            <div class="icon">📋</div>
            <div class="text">订单管理</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top:20px;">
          <el-card class="func-card" @click="$router.push('/admin-finance')">
            <div class="icon">💰</div>
            <div class="text">财务管理</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top:20px;">
          <el-card class="func-card" @click="$router.push('/admin-content')">
            <div class="icon">📢</div>
            <div class="text">内容管理</div>
          </el-card>
        </el-col>

        <el-col :span="8" style="margin-top:20px;">
          <el-card class="func-card" @click="$router.push('/admin-data')">
            <div class="icon">📊</div>
            <div class="text">数据分析</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top:20px;">
          <el-card class="func-card" @click="$router.push('/admin-setting')">
            <div class="icon">⚙️</div>
            <div class="text">系统设置</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
  text-align: center;
}
.page-title {
  font-size: 24px;
  font-weight:bold;
  margin-bottom: 30px;
  text-align: center;
}
.overview-card {
  padding:24px 0;
  text-align:center;
}
.overview-card .label { font-size:14px; color:#666; margin-bottom:8px; }
.overview-card .num { font-size:26px; font-weight:bold; }

.func-card {
  padding:30px 0;
  cursor:pointer;
  transition:0.3s;
}
.func-card:hover { transform:translateY(-4px); box-shadow:0 4px 12px #00000010; }
.func-card .icon { font-size:32px; margin-bottom:10px; }
.func-card .text { font-size:16px; font-weight:bold; }
</style>