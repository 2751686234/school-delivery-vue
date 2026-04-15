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
    <h2 class="title">用户管理</h2>
    <el-card>
      <div style="margin-bottom:15px;">
        <el-input v-model="key" placeholder="搜索姓名/账号" style="width:260px;margin-right:10px"/>
        <el-button type="primary" @click="refresh">搜索</el-button>
      </div>

      <el-table :data="list" border align="center">
        <el-table-column prop="id" label="ID"/>
        <el-table-column prop="username" label="账号"/>
        <el-table-column prop="name" label="姓名"/>
        <el-table-column prop="phone" label="手机"/>
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.role==1?'success':scope.row.role==2?'primary':'warning'">
              {{ scope.row.role==1?'用户':scope.row.role==2?'商家':'管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status==1?'success':'danger'">
              {{ scope.row.status==1?'正常':'禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(scope.row.id)">删除</el-button>
            <el-button size="small" :type="scope.row.status==1?'info':'success'" @click="toggle(scope.row)">
              {{ scope.row.status==1?'禁用':'启用' }}
            </el-button>
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
  { id:1, username:'student', name:'张三', phone:'13800138000', role:1, status:1 },
  { id:2, username:'shop01', name:'美食店', phone:'13900139000', role:2, status:1 },
  { id:3, username:'admin', name:'管理员', phone:'13000130000', role:4, status:1 },
  { id:4, username:'user02', name:'李四', phone:'13700137000', role:1, status:0 },
])

const logout = () => { localStorage.clear(); router.push('/login') }
const refresh = () => ElMessage.success('搜索成功')
const edit = (row) => ElMessage.info('编辑用户：'+row.name)
const del = (id) => { list.value = list.value.filter(x=>x.id!==id); ElMessage.success('删除成功') }
const toggle = (row) => { row.status = row.status==1?0:1; ElMessage.success('状态已更新') }
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>