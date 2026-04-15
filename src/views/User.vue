<template>
  <div class="user-page">
    <el-menu mode="horizontal" class="nav" default-active="5">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">个人中心</h2>
      <el-descriptions :column="1" border align="center" class="info">
        <el-descriptions-item label="账号">{{ username }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ roleText }}</el-descriptions-item>
        <el-descriptions-item label="地址">学生公寓</el-descriptions-item>
      </el-descriptions>
      <el-button type="danger" block size="default" class="logout-btn" @click="logout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const username = localStorage.getItem('user')
const role = localStorage.getItem('role')
const roleText = role ==1 ?'学生' : role ==2 ?'商家' : role ==3 ?'配送员' :'管理员'
const logout = () => { localStorage.clear(); router.push('/login') }
</script>

<style scoped>
.user-page { width:100%; min-height:100vh; background:#f7f8fa; }
.nav { width:100%; }
.container { width:95%; max-width:600px; margin:0 auto; padding:20px 0; }
.text-center { text-align:center; }
.logout-btn { max-width:400px; margin:20px auto 0; }
</style>