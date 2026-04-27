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
.wrap {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
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

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
}
.title {
  font-size: 26px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 800;
  color: #1a2a6c;
  letter-spacing: 1px;
}
.container > .el-card {
  padding: 28px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.container > .el-card > div:first-child {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.container > .el-card > div:first-child :deep(.el-input__wrapper),
.container > .el-card > div:first-child :deep(.el-select__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.container > .el-card > div:first-child :deep(.el-input__wrapper.is-focus),
.container > .el-card > div:first-child :deep(.el-select__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.container > .el-card > div:first-child .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  transition: all 0.3s;
}
.container > .el-card > div:first-child .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
}
.container > .el-card > div:first-child .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}

/* 表格美化 */
.wrap :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.wrap :deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #1a2a6c;
  font-weight: 800;
  font-size: 15px;
}
.wrap :deep(.el-table--border::after),
.wrap :deep(.el-table--group::after) {
  background-color: transparent;
}
.wrap .el-button {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}
.wrap .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}
.wrap .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(52, 152, 219, 0.4);
}
</style>