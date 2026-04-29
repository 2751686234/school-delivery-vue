<template>
  <div class="shop-page">
    <el-menu mode="horizontal" class="nav" default-active="2">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">商家列表</h2>

      <!-- 商家列表 -->
      <div class="list">
        <template v-if="selectedShopId">
          <el-card v-for="shop in shopList.filter(s => s.id === selectedShopId)" :key="shop.id">
            <img 
              :src="shop.logo ? 'http://localhost:8080' + shop.logo : 'https://picsum.photos/300/200'" 
              class="shop-img" 
            />
            <div class="text-center shop-name">{{ shop.name }}</div>
          </el-card>
          <el-button type="info" @click="backToList" style="margin-top:12px">← 返回商家列表</el-button>
        </template>
        <template v-else>
          <el-card v-for="shop in shopList" :key="shop.id" @click="selectShop(shop)">
            <img 
              :src="shop.logo ? 'http://localhost:8080' + shop.logo : 'https://picsum.photos/300/200'" 
              class="shop-img" 
            />
            <div class="text-center shop-name">{{ shop.name }}</div>
          </el-card>
        </template>
      </div>

      <!-- 商品展示区 -->
      <div v-if="currentShop.id" class="food-section">
        <h3 class="text-center sub-title">{{ currentShop.name }} - 商品</h3>
        <div class="food-list">
          <el-card v-for="goods in goodsList" :key="goods.id" class="food-card">
            <img :src="goods.img || 'https://picsum.photos/200/200'" class="food-img" />
            <div class="food-info">
              <div class="food-name">{{ goods.name }}</div>
              <div class="food-price">¥{{ goods.price }}</div>
            </div>
            <!-- 加减按钮组 -->
            <div class="num-control">
              <el-button 
                size="small" 
                circle 
                class="btn-minus"
                :disabled="(goodsCount[goods.id] || 0) <= 0"
                @click="decreaseGoods(goods)"
              >−</el-button>
              <span class="num">{{ goodsCount[goods.id] || 0 }}</span>
              <el-button 
                size="small" 
                circle 
                type="primary"
                class="btn-plus"
                @click="increaseGoods(goods)"
              >+</el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 底部购物车栏（悬浮） -->
    <div class="cart-bar" v-if="currentShop.id && totalCount > 0">
      <div class="cart-bar-left">
        <el-badge :value="totalCount" class="cart-badge">
          <el-icon size="24" color="#ff6b35"><ShoppingCart /></el-icon>
        </el-badge>
        <div class="cart-summary">
          <span class="cart-total">合计：<b>¥{{ totalPrice }}</b></span>
        </div>
      </div>
      <el-button type="primary" class="cart-btn" @click="goToCart">去结算</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { addCart } from '@/api/cart'
import request from '@/utils/request'

const router = useRouter()
const shopList = ref([])
const currentShop = ref({})
const goodsList = ref([])
const selectedShopId = ref(null)
const goodsCount = ref({})  // { goodsId: count }

// 计算总数量
const totalCount = computed(() => {
  return Object.values(goodsCount.value).reduce((sum, c) => sum + c, 0)
})

// 计算总金额
const totalPrice = computed(() => {
  let total = 0
  for (const goods of goodsList.value) {
    const count = goodsCount.value[goods.id] || 0
    total += (goods.price || 0) * count
  }
  return total.toFixed(2)
})

// 获取商家列表
const getShopList = () => {
  request.get('/shop/list').then(res => {
    shopList.value = res.data
  })
}

// 加载当前用户在【当前店铺】的购物车数量
const loadCartCount = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id || !currentShop.value.id) return

    const res = await request.get('/cart/list', { params: { userId: user.id } })
    const cartList = res.data || []
    const countMap = {}
    for (const item of cartList) {
      if (item.shopId === currentShop.value.id) {
        countMap[item.goodsId] = item.num
      }
    }
    goodsCount.value = countMap
  } catch (e) {
    console.error('加载购物车数量失败', e)
  }
}

// 选择商家
const selectShop = async (shop) => {
  currentShop.value = shop
  selectedShopId.value = shop.id
  try {
    const res = await request.get('/user/goods/shop', { params: { shopId: shop.id } })
    goodsList.value = res.data || []
    // 加载购物车数量
    await loadCartCount()
  } catch (e) {
    ElMessage.error('加载商品失败')
  }
}

// 返回商家列表
const backToList = () => {
  selectedShopId.value = null
  currentShop.value = {}
  goodsList.value = []
  goodsCount.value = {}
}

// + 增加商品
const increaseGoods = async (goods) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) {
      ElMessage.warning('请先登录')
      return
    }
    // 调用后端加入购物车（数量+1）
    await addCart({
      userId: user.id,
      shopId: currentShop.value.id,
      goodsId: goods.id,
      num: 1
    })
    // 前端乐观更新
    goodsCount.value = { ...goodsCount.value, [goods.id]: (goodsCount.value[goods.id] || 0) + 1 }
  } catch (e) {
    ElMessage.error('加入失败')
  }
}

// − 减少商品
const decreaseGoods = async (goods) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) return

    const currentCount = goodsCount.value[goods.id] || 0
    if (currentCount <= 0) return

    if (currentCount === 1) {
      // 数量为1时 → 直接获取购物车ID并删除
      const res = await request.get('/cart/list', { params: { userId: user.id } })
      const cartList = res.data || []
      const cartItem = cartList.find(c => c.goodsId === goods.id && c.shopId === currentShop.value.id)
      if (cartItem) {
        await request.delete('/cart/delete', { params: { id: cartItem.id } })
      }
    } else {
      // 数量>1时 → 调用 addCart 传 -1 减少
      await addCart({
        userId: user.id,
        shopId: currentShop.value.id,
        goodsId: goods.id,
        num: -1
      })
    }
    // 前端减少计数
    const newCount = Math.max(0, currentCount - 1)
    goodsCount.value = { ...goodsCount.value, [goods.id]: newCount }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 去购物车
const goToCart = () => {
  router.push('/cart')
}

onMounted(() => {
  getShopList()
})
</script>

<style scoped>
.shop-page { 
  width: 100%; 
  min-height: 100vh; 
  background: #f8f9fa;
  padding-bottom: 80px; /* 为底部悬浮栏留空间 */
}

/* 导航栏 */
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
  padding: 28px 0; 
}

.text-center { text-align: center; }

.container h2 {
  font-size: 26px;
  font-weight: 800;
  color: #ff6b35;
  margin-bottom: 24px;
  letter-spacing: 1px;
}

/* 商家列表 */
.list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 18px; 
}
.list :deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
}
.list :deep(.el-card:hover) {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 14px 32px rgba(0,0,0,0.14);
}
.shop-img { 
  width: 100%; 
  height: 140px; 
  border-radius: 12px 12px 0 0; 
  object-fit: cover; 
  margin: -16px -16px 12px -16px;
}
.shop-name { 
  margin-top: 8px; 
  font-weight: 700; 
  font-size: 16px;
  color: #2a3340;
}

/* 商品区域 */
.food-section { 
  margin-top: 32px; 
}
.sub-title {
  font-size: 22px;
  font-weight: 800;
  color: #ff6b35;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

/* 商品网格 */
.food-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
  gap: 16px; 
}

/* 商品卡片 */
.food-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.3s;
  overflow: hidden;
  cursor: default;
}
.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
}
.food-img { 
  width: 100%; 
  height: 120px; 
  object-fit: cover; 
  border-radius: 12px;
  margin-bottom: 8px;
}
.food-info {
  padding: 0 4px;
  margin-bottom: 10px;
}
.food-name {
  font-weight: 700;
  font-size: 15px;
  color: #2a3340;
  margin-bottom: 4px;
}
.food-price { 
  color: #ff6b35; 
  font-weight: 800; 
  font-size: 18px;
}

/* 加减按钮 */
.num-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}
.num {
  min-width: 20px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #2a3340;
}
.btn-minus, .btn-plus {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
}
.btn-minus {
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #666;
}
.btn-plus {
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 107, 53, 0.3);
}
.btn-plus:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.45);
}

/* 底部购物车悬浮栏 */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
}
.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cart-badge :deep(.el-badge__content) {
  background: #ff6b35;
}
.cart-summary {
  font-size: 14px;
  color: #666;
}
.cart-total b {
  font-size: 18px;
  color: #ff6b35;
}
.cart-btn {
  height: 44px;
  padding: 0 32px;
  border-radius: 22px;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}
.cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(255, 107, 53, 0.55);
}
</style>