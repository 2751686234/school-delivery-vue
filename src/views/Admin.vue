<template>
  <div class="page-wrapper">
    <el-menu mode="horizontal" class="nav-bar" v-model="activeMenu" router>
      <el-menu-item index="/admin">首页</el-menu-item>
      <el-menu-item index="/admin-user">用户管理</el-menu-item>
      <el-menu-item index="/admin-shop">商家管理</el-menu-item>
      <el-menu-item index="/admin-goods">商品管理</el-menu-item>
      <el-menu-item index="/admin-order">订单管理</el-menu-item>
      <el-menu-item index="/admin-finance">财务管理</el-menu-item>
      <el-menu-item index="/admin-content">内容管理</el-menu-item>
      <el-menu-item index="/admin-data">数据分析</el-menu-item>
      <el-menu-item index="/admin-setting">系统设置</el-menu-item>
      <el-menu-item @click="logout">退出</el-menu-item>
    </el-menu>

    <div class="page-container">
      <h2 class="page-title">管理员控制台</h2>

      <!-- 数据总览 -->
      <el-row :gutter="20" style="margin-bottom: 30px">
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总用户数</div>
            <div class="num">{{ stats.userCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总商家数</div>
            <div class="num">{{ stats.shopCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">总商品数</div>
            <div class="num">{{ stats.goodsCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="label">今日订单</div>
            <div class="num">{{ stats.todayOrderCount }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 功能入口 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="func-card" @click="go('/admin-user')">
            <div class="icon">👥</div>
            <div class="text">用户管理</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="func-card" @click="go('/admin-shop')">
            <div class="icon">🏪</div>
            <div class="text">商家管理</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="func-card" @click="go('/admin-goods')">
            <div class="icon">🍔</div>
            <div class="text">商品管理</div>
          </el-card>
        </el-col>

        <el-col :span="8" style="margin-top: 20px">
          <el-card class="func-card" @click="go('/admin-order')">
            <div class="icon">📋</div>
            <div class="text">订单管理</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top: 20px">
          <el-card class="func-card" @click="go('/admin-finance')">
            <div class="icon">💰</div>
            <div class="text">财务管理</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top: 20px">
          <el-card class="func-card" @click="go('/admin-content')">
            <div class="icon">📢</div>
            <div class="text">内容管理</div>
          </el-card>
        </el-col>

        <el-col :span="8" style="margin-top: 20px">
          <el-card class="func-card" @click="go('/admin-data')">
            <div class="icon">📊</div>
            <div class="text">数据分析</div>
          </el-card>
        </el-col>
        <el-col :span="8" style="margin-top: 20px">
          <el-card class="func-card" @click="go('/admin-setting')">
            <div class="icon">⚙️</div>
            <div class="text">系统设置</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const activeMenu = ref(router.currentRoute.value.path)

const stats = ref({
  userCount: 0,
  shopCount: 0,
  goodsCount: 0,
  todayOrderCount: 0
})

// 跳转
const go = (path) => {
  router.push(path)
}

// 加载统计数据
const loadAdminStats = async () => {
  try {
    const res = await request.get('/admin/home/stats')
    stats.value = res.data
  } catch (e) {
    ElMessage.error('加载统计失败')
  }
}

// 退出登录
const logout = () => {
  localStorage.clear()
  ElMessage.success('退出成功')
  router.push('/login')
}

onMounted(() => {
  loadAdminStats()
})
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}
.nav-bar {
  display: flex;
  justify-content: center;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
}
.page-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}
.overview-card {
  padding: 28px 0;
  text-align: center;
}
.overview-card .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.overview-card .num {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}
.func-card {
  padding: 32px 0;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}
.func-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.func-card .icon {
  font-size: 36px;
  margin-bottom: 10px;
}
.func-card .text {
  font-size: 16px;
  font-weight: bold;
}
</style>