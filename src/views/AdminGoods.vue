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
    <h2 class="title">平台商品管理</h2>
    <el-card>
      <div style="margin-bottom:15px; text-align: left;">
        <el-input v-model="key" placeholder="搜索商品名称" style="width:280px;margin-right:10px"/>
        <el-button type="primary" @click="loadList">搜索</el-button>
        <el-button @click="key=''; loadList()">重置</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="商品名称"/>
        <el-table-column label="商品图片">
          <template #default="scope">
            <img 
              :src="scope.row.img" 
              style="width:40px;height:40px;border-radius:4px;object-fit:cover"
              v-if="scope.row.img"
            />
            <img 
              src="https://img.icons8.com/fluency/48/food.png" 
              style="width:40px;height:40px;border-radius:4px" 
              v-else 
            />
          </template>
        </el-table-column>

        <el-table-column prop="shopName" label="所属商店"/>
        <el-table-column prop="price" label="价格"/>
        
        <el-table-column prop="status" label="上架状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status==1?'success':'danger'">
              {{ scope.row.status==1?'上架':'下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200">
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path)

const key = ref('')
const list = ref([])

// 加载列表
const loadList = async () => {
  const res = await request.get('/admin/goods/list', { params: { key: key.value } })
  list.value = res.data || []
}

// 上下架切换
const toggle = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  await request.post('/admin/goods/updateStatus', { id: row.id, status: newStatus })
  row.status = newStatus
  ElMessage.success('状态已更新')
}

// 删除
const del = async (id) => {
  await ElMessageBox.confirm('确定删除该商品？')
  await request.post('/admin/goods/delete', { id })
  ElMessage.success('删除成功')
  loadList()
}

// 退出
const logout = () => {
  localStorage.clear();
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