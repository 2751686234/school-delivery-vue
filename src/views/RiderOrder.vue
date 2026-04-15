<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav">
      <el-menu-item @click="$router.push('/rider')">首页</el-menu-item>
      <el-menu-item @click="$router.push('/rider-order')">我的订单</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">我的配送订单</h2>

      <el-table :data="list" border align="center">
        <el-table-column label="订单号" prop="orderNo"/>
        <el-table-column label="商家" prop="shopName"/>
        <el-table-column label="用户" prop="userName"/>
        <el-table-column label="地址" prop="address"/>
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'warning' : scope.row.status == 2 ? 'primary' : 'success'">
              {{ scope.row.status ==1 ? '待取餐' : scope.row.status ==2 ? '配送中' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="primary" @click="next(scope.row)">
              {{ scope.row.status ==1 ? '取餐' : scope.row.status ==2 ? '送达' : '已完成' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()

const list = ref([
  { orderNo:'20240501001', shopName:'校园汉堡店', userName:'张三', address:'学生公寓1号楼302', status:1 },
  { orderNo:'20240501002', shopName:'奶茶小铺', userName:'李四', address:'学生公寓2号楼501', status:2 },
])

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const next = (row) => {
  if(row.status == 1){
    row.status = 2
    ElMessage.success('已取餐，开始配送')
  }else if(row.status == 2){
    row.status = 3
    ElMessage.success('已送达！')
  }
}
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa;}
.nav{display:flex;justify-content:center;}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center;}
.title{font-size:24px;margin-bottom:20px;}
</style>