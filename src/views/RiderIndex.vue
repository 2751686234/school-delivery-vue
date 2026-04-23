<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav">
      <el-menu-item @click="$router.push('/rider')">首页</el-menu-item>
      <el-menu-item @click="$router.push('/rider-order')">我的订单</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">外送员工作台</h2>

      <!-- 数据卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="card">今日接单<br/><b>{{ today }}</b></el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">累计接单<br/><b>{{ total }}</b></el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">今日收入<br/><b>¥{{ money }}</b></el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">累计收入<br/><b>¥{{ totalIncome }}</b></el-card>
        </el-col>
      </el-row>

      <!-- 骑手地图定位 -->
      <div class="map-box">
        <h3 style="text-align:center;margin:15px 0">我的实时位置</h3>
        <div id="container" style="width:100%;height:350px;border-radius:8px;"></div>
      </div>

      <!-- 可接单列表 -->
      <div style="margin-top:30px;">
        <h3 style="text-align:center;margin-bottom:15px;">可接单列表</h3>
        <el-table :data="list" border align="center">
          <el-table-column label="订单号" prop="orderNo"/>
          <el-table-column label="商家" prop="shopName"/>
          <el-table-column label="用户" prop="name"/>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const today = ref(0)
const total = ref(0)
const money = ref(0)
const totalIncome = ref(0)
const list = ref([])

// 骑手信息
const rider = JSON.parse(localStorage.getItem('user') || '{}')
const riderId = rider.id

// 加载统计
const loadOverview = async () => {
  try {
    const res = await request.get('/rider/overview', { params: { riderId } })
    const data = res.data || {}
    today.value = data.today || 0
    total.value = data.total || 0
    money.value = data.income || 0
    totalIncome.value = data.totalIncome || 0
  } catch (e) {
    ElMessage.error('加载统计失败')
  }
}

// 待接单
const loadOrders = async () => {
  try {
    const res = await request.get('/rider/waitOrders')
    list.value = res.data || []
  } catch (e) {
    ElMessage.error('加载订单失败')
  }
}

// 接单
const take = async (row) => {
  try {
    await request.post('/rider/takeOrder', {
      orderId: row.id,
      riderId: riderId
    })
    ElMessage.success('接单成功！快去取餐吧')
    list.value = list.value.filter(item => item.id !== row.id)
    loadOverview()
  } catch (err) {
    ElMessage.error('接单失败')
  }
}

// 初始化高德地图 + 正确定位（AMap 2.0 可用）
const initMap = () => {
  // 你的安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: "0e62d8862e80c72b38c88923d0140aef",
  };

  // 创建地图
  const map = new window.AMap.Map("container", {
    zoom: 16,
  });

  // 正确定位插件用法（2.0官方标准）
  window.AMap.plugin("AMap.Geolocation", function () {
    const geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    // 执行定位
    geolocation.getCurrentPosition(function (status, result) {
      if (status === "complete" && result.position) {
        const lng = result.position.lng;
        const lat = result.position.lat;

        // 移动到当前位置
        map.setCenter([lng, lat]);

        // 添加标记
        new window.AMap.Marker({
          position: [lng, lat],
          title: "我在这里",
          icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
        }).addTo(map);

        ElMessage.success("定位成功！");
      } else {
        ElMessage.error("定位失败：请允许浏览器位置权限");
      }
    });
  });
};

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  loadOverview()
  loadOrders()
  // 等待DOM渲染完成再加载地图
  setTimeout(()=>{
    initMap()
  },200)
})
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa;}
.nav{display:flex;justify-content:center;}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center;}
.title{font-size:24px;margin-bottom:20px;}
.card{padding:20px;font-size:16px;}
.map-box{margin-top:20px;}
</style>

<!-- 全局引入高德地图JS，放到 public/index.html -->