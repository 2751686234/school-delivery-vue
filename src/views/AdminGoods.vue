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
    <h2 class="title">平台商品管理</h2>
    <el-card>
      <div style="margin-bottom:15px">
        <el-input v-model="key" placeholder="商品名/商家" style="width:260px;margin-right:10px"/>
        <el-button type="primary" @click="refresh">搜索</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="id" label="ID"/>
        <el-table-column prop="name" label="商品名称"/>
        <el-table-column prop="shopName" label="所属商家"/>
        <el-table-column prop="price" label="价格"/>
        <el-table-column prop="stock" label="库存"/>
        <el-table-column prop="status" label="上架状态">
          <template #default="scope">
            <el-tag :type="scope.row.status==1?'success':'danger'">
              {{ scope.row.status==1?'上架':'下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="toggle(scope.row)">
              {{ scope.row.status==1?'下架':'上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="del(scope.row.id)">删除</el-button>
          </template>
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
const key = ref('')
const list = ref([
  { id:1, name:'香辣鸡腿堡', shopName:'校园汉堡店', price:15.9, stock:100, status:1 },
  { id:2, name:'珍珠奶茶', shopName:'奶茶小铺', price:12.9, stock:80, status:1 },
  { id:3, name:'薯条', shopName:'校园汉堡店', price:6.9, stock:200, status:0 },
])

const logout = () => { localStorage.clear(); router.push('/login') }
const refresh = () => ElMessage.success('搜索成功')
const del = (id) => { list.value = list.value.filter(x=>x.id!==id); ElMessage.success('删除成功') }
const toggle = (row) => { row.status = row.status==1?0:1; ElMessage.success('状态已更新') }
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>