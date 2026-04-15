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
    <h2 class="title">全平台订单管理</h2>
    <el-card>
      <div style="display:flex;gap:10px;margin-bottom:15px;">
        <el-input v-model="no" placeholder="订单号" style="width:220px"/>
        <el-select v-model="status" placeholder="状态" style="width:150px">
          <el-option label="全部" value=""/>
          <el-option label="待接单" value="1"/>
          <el-option label="配送中" value="3"/>
          <el-option label="已完成" value="4"/>
        </el-select>
        <el-button type="primary" @click="refresh">搜索</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="orderNo" label="订单号"/>
        <el-table-column prop="userName" label="用户"/>
        <el-table-column prop="shopName" label="商家"/>
        <el-table-column prop="totalPrice" label="金额"/>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status==1?'warning':scope.row.status==3?'primary':'success'">
              {{ scope.row.status==1?'待接单':scope.row.status==3?'配送中':'已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间"/>
        <el-table-column label="操作">
          <el-button size="small" @click="detail">详情</el-button>
        </el-table-column>
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
const no = ref('')
const status = ref('')
const list = ref([
  { orderNo:'20240501001', userName:'张三', shopName:'校园汉堡店', totalPrice:35.8, status:1, createTime:'2024-05-01 12:30' },
  { orderNo:'20240501002', userName:'李四', shopName:'奶茶小铺', totalPrice:24.7, status:3, createTime:'2024-05-01 13:10' },
  { orderNo:'20240501003', userName:'王五', shopName:'校园汉堡店', totalPrice:15.9, status:4, createTime:'2024-05-01 11:20' },
])

const logout = () => { localStorage.clear(); router.push('/login') }
const refresh = () => ElMessage.success('查询成功')
const detail = () => ElMessage.info('打开订单详情')
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>