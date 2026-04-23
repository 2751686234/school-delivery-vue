<template>
<div class="wrap">
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

  <div class="container">
    <h2 class="title">全平台订单管理</h2>
    <el-card>
      <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
        <el-input v-model="orderNo" placeholder="订单号" style="width:220px"/>
        <el-select v-model="status" placeholder="状态" style="width:150px">
          <el-option label="全部" value=""/>
          <el-option label="待接单" value="1"/>
          <el-option label="已接单" value="2"/>
          <el-option label="配送中" value="3"/>
          <el-option label="已完成" value="4"/>
          <el-option label="已取消" value="5"/>
        </el-select>
        <el-button type="primary" @click="loadList">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="orderNo" label="订单号"/>
        
        <!-- 用户名 -->
        <el-table-column prop="username" label="用户"/>
        <!-- 商店名 -->
        <el-table-column prop="shopName" label="商店"/>
        <!-- 电话 -->
        <el-table-column prop="phone" label="电话"/>
        
        <el-table-column prop="totalPrice" label="金额"/>
        <el-table-column prop="address" label="地址"/>
        
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag 
              :type="
                scope.row.status == 1 ? 'warning' : 
                scope.row.status == 2 ? 'info' :
                scope.row.status == 3 ? 'primary' : 
                scope.row.status == 4 ? 'success' : 'danger'
              "
            >
              {{ 
                scope.row.status == 1 ? '待接单' : 
                scope.row.status == 2 ? '已接单' : 
                scope.row.status == 3 ? '配送中' : 
                scope.row.status == 4 ? '已完成' : '已取消'
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="下单时间"/>
        <el-table-column label="操作" width="100">
          <el-button size="small" type="primary">详情</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path)

const orderNo = ref('')
const status = ref('')
const list = ref([])

const loadList = async () => {
  const res = await request.get('/admin/order/list', {
    params: { orderNo: orderNo.value, status: status.value }
  })
  list.value = res.data || []
}

const reset = () => {
  orderNo.value = ''
  status.value = ''
  loadList()
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0}
.title{font-size:24px;margin-bottom:20px;text-align:center}
</style>