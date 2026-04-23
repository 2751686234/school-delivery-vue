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
.shop-page { width:100%; min-height:100vh; background:#f7f8fa; }
.nav { width:100%; }
.container { width:95%; max-width:1200px; margin:0 auto; padding:20px 0; }
.text-center { text-align:center; }
.list { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
.shop-img { width:100%; height:110px; border-radius:8px; object-fit:cover; }
.shop-name { margin-top:8px; font-weight:bold; }
.food-section { margin-top:20px; }
.food-list { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.food-img { width:100%; height:100px; border-radius:8px; object-fit:cover; }
.food-price { color:#ff4d4f; font-weight:bold; margin:4px 0; }
</style>