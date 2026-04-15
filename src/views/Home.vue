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
        <el-input v-model="keyword" placeholder="搜商家/菜品" size="large" />
        <el-button type="primary" size="large">搜索</el-button>
      </div>

      <el-carousel height="180px" class="banner">
        <el-carousel-item><div class="banner-text">欢迎使用校园外卖</div></el-carousel-item>
        <el-carousel-item><div class="banner-text">新用户立减5元</div></el-carousel-item>
      </el-carousel>

      <div class="section">
        <div class="title text-center">精选商家</div>
        <div class="shop-list">
          <el-card v-for="shop in shopList" :key="shop.id" @click="handleNav('/shop')">
            <div class="shop-item">
              <img :src="shop.pic" class="shop-pic" />
              <div class="shop-info">
                <div class="shop-name">{{ shop.name }}</div>
                <div class="shop-desc">月售{{ shop.sale }} · 好评{{ shop.star }}%</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'

const router = useRouter()
const address = ref('1')
const keyword = ref('')
const shopList = [
  { id:1, name:'校园汉堡店', pic:'https://picsum.photos/seed/shop1/300/200', sale:'328', star:'97' },
  { id:2, name:'蜜雪冰城', pic:'https://picsum.photos/seed/shop2/300/200', sale:'561', star:'98' },
]

const handleNav = (path) => {
  router.push(path).catch(() => {})
}
</script>

<style scoped>
.home { width:100%; min-height:100vh; background:#f7f8fa; }
.nav { width:100%; }
.container { width:95%; max-width:1200px; margin:0 auto; padding:20px 0; }
.address-bar { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.select-address { width:180px; }
.search-box { display:flex; gap:10px; margin-bottom:20px; }
.banner { border-radius:12px; overflow:hidden; }
.banner-text { display:flex; align-items:center; justify-content:center; height:100%; color:#fff; background:linear-gradient(90deg,#4e59ff,#7240ff); }
.section { margin-top:20px; }
.title { font-size:18px; font-weight:bold; text-align:center; }
.shop-list { display:grid; gap:12px; margin-top:12px; }
.shop-item { display:flex; gap:12px; align-items:center; }
.shop-pic { width:90px; height:70px; border-radius:8px; object-fit:cover; }
.shop-name { font-weight:bold; }
.shop-desc { font-size:12px; color:#666; }
.text-center { text-align:center; }
</style>