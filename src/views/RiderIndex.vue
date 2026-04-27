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
.wrap {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏：活力青柠渐变 */
.nav {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(17, 153, 142, 0.25);
}
.nav :deep(.el-menu-item) {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav :deep(.el-menu-item:hover),
.nav :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-bottom-color: #fff;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
  text-align: center;
}
.title {
  font-size: 28px;
  margin-bottom: 28px;
  font-weight: 800;
  color: #11998e;
  letter-spacing: 1px;
}

/* 数据卡片：多彩渐变 */
.card {
  padding: 28px 20px;
  font-size: 16px;
  border-radius: 20px;
  border: none;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
}
.card b {
  font-size: 32px;
  display: block;
  margin-top: 8px;
  font-weight: 800;
}
.el-col:nth-child(1) .card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.el-col:nth-child(2) .card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.el-col:nth-child(3) .card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.el-col:nth-child(4) .card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* 地图区域 */
.map-box {
  margin-top: 32px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.map-box h3 {
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 800;
  color: #11998e;
}
#container {
  width: 100%;
  height: 380px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

/* 可接单列表 */
.container > div:last-child {
  margin-top: 36px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.container > div:last-child h3 {
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 800;
  color: #11998e;
}

/* 表格美化 */
.wrap :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.wrap :deep(.el-table th) {
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
  color: #11998e;
  font-weight: 800;
  font-size: 15px;
}
.wrap :deep(.el-table--border::after),
.wrap :deep(.el-table--group::after) {
  background-color: transparent;
}
.wrap .el-button--success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  padding: 0 20px;
  box-shadow: 0 4px 14px rgba(17, 153, 142, 0.35);
  transition: all 0.3s;
}
.wrap .el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(17, 153, 142, 0.45);
}
</style>