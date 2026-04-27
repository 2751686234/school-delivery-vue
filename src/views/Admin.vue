<template>
  <div class="page-wrapper">
    <el-menu mode="horizontal" class="nav-bar" v-model="activeMenu" router>
      <el-menu-item index="/admin">首页</el-menu-item>
      <el-menu-item index="/admin-user">用户管理</el-menu-item>
      <el-menu-item index="/admin-shop">商店管理</el-menu-item>
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
            <div class="label">总商店数</div>
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
            <div class="text">商店管理</div>
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

/* 导航栏：深邃科技蓝渐变 */
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

.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 32px;
  text-align: center;
  color: #1a2a6c;
  letter-spacing: 1px;
}

/* 数据总览卡片：多彩渐变 */
.overview-card {
  padding: 32px 0;
  text-align: center;
  border-radius: 20px;
  border: none;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.overview-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
}
.overview-card .label {
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10px;
  font-weight: 600;
}
.overview-card .num {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
}
.el-col:nth-child(1) .overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.el-col:nth-child(2) .overview-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.el-col:nth-child(3) .overview-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.el-col:nth-child(4) .overview-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* 功能入口卡片 */
.func-card {
  padding: 36px 0;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border-radius: 20px;
  border: none;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.func-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 14px 36px rgba(0,0,0,0.14);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
.func-card .icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.func-card .text {
  font-size: 18px;
  font-weight: 700;
  color: #1a2a6c;
}
</style>