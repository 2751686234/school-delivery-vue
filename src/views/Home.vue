<template>
  <div class="home">
    <el-menu mode="horizontal" class="nav" default-active="1">
      <el-menu-item index="1" @click="handleNav('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="handleNav('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="handleNav('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="handleNav('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="handleNav('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <!-- 地址选择 -->
      <div class="address-bar">
        <el-icon><Location /></el-icon>
        <el-select v-model="address" size="small" class="select-address">
          <el-option label="学生公寓1号楼" value="1" />
          <el-option label="学生公寓2号楼" value="2" />
          <el-option label="学生公寓3号楼" value="3" />
          <el-option label="教学楼" value="4" />
        </el-select>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input v-model="keyword" placeholder="搜商家/菜品" size="large" @keyup.enter="handleSearch" />
        <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
      </div>

      <el-carousel height="180px" class="banner">
        <el-carousel-item><div class="banner-text">欢迎使用校园外卖</div></el-carousel-item>
        <el-carousel-item><div class="banner-text">新用户立减5元</div></el-carousel-item>
      </el-carousel>

      <div class="section">
        <div class="title text-center">精选商家</div>
        <div class="shop-list">
          <el-card v-for="shop in shopList" :key="shop.id" @click="goShopDetail(shop.id)">
            <div class="shop-item">
              <img 
                :src="shop.logo 
                  ? (shop.logo.startsWith('http') ? shop.logo : 'http://localhost:8080' + shop.logo) 
                  : 'https://picsum.photos/300/200'" 
                class="shop-pic" 
              />
              <div class="shop-info">
                <div class="shop-name">{{ shop.name }}</div>
                <div class="shop-desc">店铺正常营业</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const address = ref('1')
const keyword = ref('')
const shopList = ref([])

// 页面加载 → 自动读取数据库商家列表
onMounted(() => {
  loadShopList()
})

// 请求后端接口获取真实店铺
const loadShopList = async () => {
  try {
    const res = await request.get('/shop/list')
    shopList.value = res.data || []
  } catch (e) {
    console.error('加载商家失败', e)
  }
}

// 搜索功能
const handleSearch = () => {
  if (!keyword.value.trim()) {
    loadShopList()
    return
  }
  request.get('/shop/list', {
    params: { key: keyword.value.trim() }
  }).then(res => {
    shopList.value = res.data || []
    if (shopList.value.length === 0) {
      ElMessage.info('未找到匹配的商家')
    }
  }).catch(() => {
    ElMessage.error('搜索失败')
  })
}

const handleNav = (path) => {
  router.push(path).catch(() => {})
}

// 点击进入对应店铺详情
const goShopDetail = (shopId) => {
  router.push('/shop?shopId=' + shopId)
}
</script>

<style scoped>
.home { 
  width: 100%; 
  min-height: 100vh; 
  background: #f8f9fa; 
}

/* 导航栏：暖橙渐变 */
.nav { 
  width: 100%; 
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25);
}
.nav :deep(.el-menu-item) {
  color: #fff;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav :deep(.el-menu-item:hover),
.nav :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-bottom-color: #fff;
}

.container { 
  width: 95%; 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 24px 0; 
}

/* 地址栏：精致化 */
.address-bar { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  margin-bottom: 16px; 
  color: #ff6b35;
  font-weight: 500;
}
.select-address { 
  width: 180px; 
}
.select-address :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #fff;
  transition: all 0.3s;
}
.select-address :deep(.el-input__wrapper.is-focus) {
  border-color: #ff7e5f;
  box-shadow: 0 6px 16px rgba(255, 126, 95, 0.18);
}

/* 搜索框：加大按钮 */
.search-box { 
  display: flex; 
  gap: 12px; 
  margin-bottom: 24px; 
}
.search-box :deep(.el-input__wrapper) {
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  padding: 8px 16px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s;
}
.search-box :deep(.el-input__wrapper.is-focus) {
  border-color: #ff7e5f;
  box-shadow: 0 6px 20px rgba(255, 126, 95, 0.18);
}
.search-box .el-button {
  border-radius: 14px;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(255, 107, 53, 0.35);
  transition: all 0.3s;
}
.search-box .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(255, 107, 53, 0.45);
}

/* 轮播图：暖橙渐变 */
.banner { 
  border-radius: 16px; 
  overflow: hidden; 
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.banner-text { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  height: 100%; 
  color: #fff; 
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
}

.section { 
  margin-top: 28px; 
}
.title { 
  font-size: 22px; 
  font-weight: 800; 
  text-align: center; 
  color: #ff6b35;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

/* 商家列表：卡片式布局 */
.shop-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px; 
  margin-top: 12px; 
}
.shop-list :deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
}
.shop-list :deep(.el-card:hover) {
  transform: translateY(-6px);
  box-shadow: 0 14px 32px rgba(0,0,0,0.14);
}
.shop-item { 
  display: flex; 
  gap: 14px; 
  align-items: center; 
}
.shop-pic { 
  width: 100px; 
  height: 80px; 
  border-radius: 12px; 
  object-fit: cover; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.shop-info {
  flex: 1;
}
.shop-name { 
  font-weight: 700; 
  font-size: 16px;
  color: #2a3340;
  margin-bottom: 4px;
}
.shop-desc { 
  font-size: 13px; 
  color: #909399; 
}
.text-center { 
  text-align: center; 
}
</style>