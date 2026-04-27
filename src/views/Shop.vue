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
      <div class="list">
        <el-card v-for="shop in shopList" :key="shop.id" @click="selectShop(shop)">
          <img 
            :src="shop.logo ? 'http://localhost:8080' + shop.logo : 'https://picsum.photos/300/200'" 
            class="shop-img" 
          />
          <div class="text-center shop-name">{{ shop.name }}</div>
        </el-card>
      </div>

      <div v-if="currentShop.id" class="food-section">
        <h3 class="text-center sub-title">{{ currentShop.name }} - 商品</h3>
        <div class="food-list">
          <el-card v-for="goods in goodsList" :key="goods.id">
            <img :src="goods.img" class="food-img" />
            <div class="text-center food-name">{{ goods.name }}</div>
            <div class="text-center food-price">¥{{ goods.price }}</div>
            <el-button type="primary" size="small" block @click="openBuyDialog(goods)">
              加入购物车
            </el-button>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 购买弹窗 -->
    <el-dialog v-model="showBuyDialog" title="选择购买数量" width="400px">
      <div style="text-align:center; padding: 10px 0;">
        <h3>{{ currentGoods.name }}</h3>
        <p style="color:red; font-size:18px;">¥{{ currentGoods.price }}</p>
      </div>

      <el-form label-width="100px">
        <el-form-item label="购买数量">
          <el-input-number v-model="buyNum" :min="1" :max="99" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showBuyDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddCart">确认加入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addCart } from '@/api/cart'
import request from '@/utils/request'

const shopList = ref([])
const currentShop = ref({})
const goodsList = ref([])

// 弹窗
const showBuyDialog = ref(false)
const currentGoods = ref({})
const buyNum = ref(1)

// 获取商家列表
const getShopList = () => {
  request.get('/shop/list').then(res => {
    shopList.value = res.data
  })
}

// 选择商家 → 加载该商家的商品
const selectShop = async (shop) => {
  currentShop.value = shop
  const res = await request.get('/user/goods/shop', {
    params: { shopId: shop.id }
  })
  goodsList.value = res.data
}

// 打开弹窗
const openBuyDialog = (goods) => {
  currentGoods.value = goods
  buyNum.value = 1
  showBuyDialog.value = true
}

// 确认加入购物车（带数量）
const confirmAddCart = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) {
      ElMessage.warning("请先登录！")
      return
    }
    if (!currentShop.value.id) {
      ElMessage.warning("请先选择商家！")
      return
    }
    
    await addCart({
      userId: user.id,
      shopId: currentShop.value.id,
      goodsId: currentGoods.value.id,
      num: buyNum.value
    })
    
    showBuyDialog.value = false
    ElMessage.success("已加入购物车")
  } catch (e) {
    console.error("加购失败：", e)
    ElMessage.error("加入失败")
  }
}

onMounted(() => getShopList())
</script>

<style scoped>
.shop-page { 
  width: 100%; 
  min-height: 100vh; 
  background: #f8f9fa; 
}

/* 导航栏：统一风格 */
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

.text-center { 
  text-align: center; 
}

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
.food-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
  gap: 18px; 
}
.food-list :deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.3s;
  overflow: hidden;
}
.food-list :deep(.el-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
}
.food-img { 
  width: 100%; 
  height: 130px; 
  border-radius: 12px; 
  object-fit: cover; 
  margin-bottom: 10px;
}
.food-name {
  font-weight: 700;
  font-size: 15px;
  color: #2a3340;
  margin-bottom: 6px;
}
.food-price { 
  color: #ff6b35; 
  font-weight: 800; 
  font-size: 18px;
  margin: 6px 0 12px 0; 
}
.food-list .el-button {
  border-radius: 12px;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);
  transition: all 0.3s;
}
.food-list .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.45);
}

/* 弹窗美化 */
.shop-page :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}
.shop-page :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  margin: 0;
  padding: 20px;
}
.shop-page :deep(.el-dialog__title) {
  color: #ff6b35;
  font-weight: 700;
}
</style>