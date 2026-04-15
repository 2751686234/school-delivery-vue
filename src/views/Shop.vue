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
          <img :src="shop.pic" class="shop-img" />
          <div class="text-center shop-name">{{ shop.name }}</div>
        </el-card>
      </div>

      <div v-if="currentShop.id" class="food-section">
        <h3 class="text-center sub-title">{{ currentShop.name }} - 菜品</h3>
        <div class="food-list">
          <el-card v-for="food in foodList" :key="food.id">
            <img :src="food.pic" class="food-img" />
            <div class="text-center food-name">{{ food.name }}</div>
            <div class="text-center food-price">¥{{ food.price }}</div>
            <el-button type="primary" size="small" block @click="addToCart(food)">
              加入购物车
            </el-button>
          </el-card>
        </div>

        <div class="comment-section" style="margin-top:30px;">
          <h4 class="text-center">用户评价</h4>
          <el-card v-for="item in comments" :key="item.id" class="comment">
            <div><strong>{{ item.user }}</strong> · 评分：{{ item.star }}⭐</div>
            <div style="margin-top:4px;">{{ item.content }}</div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addCart } from '@/api/cart'

const shopList = ref([
  { id:1, name:'校园汉堡店', pic:'https://picsum.photos/seed/shop1/300/200' },
])
const currentShop = ref({})
const foodList = ref([])
const comments = ref([
  { id:1, user:'小明', star:5, content:'味道很好，配送很快！' },
  { id:2, user:'小红', star:4, content:'分量很足，下次还点！' },
])

const selectShop = (shop) => {
  currentShop.value = shop
  foodList.value = [
    { id:1, name:'香辣鸡腿堡', price:15.9, pic:'https://picsum.photos/seed/f1/300/200' },
    { id:2, name:'薯条', price:6.0, pic:'https://picsum.photos/seed/f2/300/200' },
    { id:3, name:'可乐', price:4.0, pic:'https://picsum.photos/seed/f3/300/200' },
  ]
}

// ✅ 绝对不重名：addToCart
const addToCart = async (food) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await addCart({
      userId: user.id,
      shopId: currentShop.value.id,
      foodName: food.name,
      price: food.price,
      num: 1
    })
    ElMessage.success({ message: "已加入购物车", max:2, duration:1000 })
  } catch (e) {
    ElMessage.error("加入失败")
  }
}
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
.comment { margin-bottom:10px; }
</style>