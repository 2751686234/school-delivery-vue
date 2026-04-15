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
    <h2 class="title">商家管理</h2>
    <el-card>
      <div style="margin-bottom:15px">
        <el-input v-model="key" placeholder="搜索商家名" style="width:260px;margin-right:10px"/>
        <el-button type="primary" @click="refresh">搜索</el-button>
        <el-button type="success" @click="add">新增商家</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="id" label="ID"/>
        <el-table-column prop="name" label="商家名称"/>
        <el-table-column prop="username" label="登录账号"/>
        <el-table-column prop="phone" label="联系电话"/>
        <el-table-column prop="address" label="地址"/>
        <el-table-column prop="status" label="审核状态">
          <template #default="scope">
            <el-tag :type="scope.row.status==1?'success':scope.row.status==2?'warning':'danger'">
              {{ scope.row.status==1?'已通过':scope.row.status==2?'待审核':'已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="pass(scope.row)">通过</el-button>
            <el-button size="small" type="danger" @click="refuse(scope.row)">拒绝</el-button>
            <el-button size="small" @click="edit(scope.row)">编辑</el-button>
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
  { id:1, name:'校园汉堡店', username:'shop01', phone:'13900139000', address:'食堂三楼', status:1 },
  { id:2, name:'奶茶小铺', username:'shop02', phone:'13800138000', address:'公寓楼下', status:2 },
  { id:3, name:'炸鸡店', username:'shop03', phone:'13700137000', address:'校门口', status:0 },
])

const logout = () => { localStorage.clear(); router.push('/login') }
const refresh = () => ElMessage.success('搜索成功')
const add = () => ElMessage.success('打开新增商家表单')
const edit = (row) => ElMessage.info('编辑商家：'+row.name)
const pass = (row) => { row.status=1; ElMessage.success('审核通过') }
const refuse = (row) => { row.status=0; ElMessage.success('已拒绝') }
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>