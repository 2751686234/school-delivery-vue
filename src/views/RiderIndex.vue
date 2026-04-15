<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav">
      <el-menu-item @click="$router.push('/rider')">首页</el-menu-item>
      <el-menu-item @click="$router.push('/rider-order')">我的订单</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">外送员工作台</h2>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="card">今日接单<br/><b>{{ today }}</b></el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">累计接单<br/><b>{{ total }}</b></el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">今日收入<br/><b>¥{{ money }}</b></el-card>
        </el-col>
      </el-row>

      <div style="margin-top:30px;">
        <h3 style="text-align:center;margin-bottom:15px;">可接单列表</h3>
        <el-table :data="list" border align="center">
          <el-table-column label="订单号" prop="orderNo"/>
          <el-table-column label="商家" prop="shopName"/>
          <el-table-column label="用户" prop="userName"/>
          <el-table-column label="地址" prop="address"/>
          <el-table-column label="金额" prop="totalPrice"/>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="success" size="small" @click="take(scope.row)">立即接单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const today = ref(12)
const total = ref(156)
const money = ref(86.5)

const list = ref([
  { orderNo:'20240501001', shopName:'校园汉堡店', userName:'张三', address:'学生公寓1号楼302', totalPrice:35.8 },
  { orderNo:'20240501002', shopName:'奶茶小铺', userName:'李四', address:'学生公寓2号楼501', totalPrice:24.7 },
])

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const take = (row) => {
  alert('接单成功！快去取餐吧')
  list.value = list.value.filter(x=>x.orderNo !== row.orderNo)
}
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa;}
.nav{display:flex;justify-content:center;}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center;}
.title{font-size:24px;margin-bottom:20px;}
.card{padding:20px;font-size:16px;}
</style>