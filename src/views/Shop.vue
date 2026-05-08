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

      <!-- 未选择商家时：显示搜索商家的输入框 -->
      <div v-if="!selectedShopId" class="search-box">
        <el-input v-model="shopKeyword" placeholder="搜索商家名称..." size="large" clearable @keyup.enter="searchShop" />
        <el-button type="primary" size="large" @click="searchShop">搜索商家</el-button>
        <el-button v-if="isShopSearch" size="large" @click="resetShopSearch">显示全部</el-button>
      </div>

      <!-- 商家列表 -->
      <div class="list">
        <template v-if="selectedShopId">
          <el-card v-for="shop in shopList.filter(s => s.id === selectedShopId)" :key="shop.id">
            <img :src="shop.logo ? 'http://localhost:8080' + shop.logo : 'https://picsum.photos/300/200'" class="shop-img" />
            <div class="text-center shop-name">{{ shop.name }}</div>
          </el-card>
          <el-button type="info" @click="backToList" style="margin-top:12px">← 返回商家列表</el-button>
        </template>
        <template v-else>
          <!-- 无搜索结果提示 -->
          <div v-if="isShopSearch && shopList.length === 0" class="no-result">
            😕 未找到匹配的商家
          </div>
          <el-card v-for="shop in shopList" :key="shop.id" @click="selectShop(shop)">
            <img :src="shop.logo ? 'http://localhost:8080' + shop.logo : 'https://picsum.photos/300/200'" class="shop-img" />
            <div class="text-center shop-name">{{ shop.name }}</div>
          </el-card>
        </template>
      </div>

      <!-- 选中商家后：显示商品 + 搜索菜品 -->
      <div v-if="currentShop.id" class="food-section">
        <h3 class="text-center sub-title">{{ currentShop.name }} - 商品</h3>
        
        <!-- 搜索菜品输入框 -->
        <div class="food-search-box">
          <el-input v-model="foodKeyword" placeholder="搜索该商家菜品..." size="large" clearable @keyup.enter="searchFood" />
          <el-button type="primary" size="large" @click="searchFood">搜索菜品</el-button>
          <el-button v-if="isFoodSearch" size="large" @click="resetFoodSearch">显示全部</el-button>
        </div>

        <!-- 无搜索结果提示 -->
        <div v-if="isFoodSearch && displayGoodsList.length === 0" class="no-result" style="padding:20px">
          该商家暂无此菜品
        </div>

        <div class="food-list">
          <el-card v-for="goods in displayGoodsList" :key="goods.id" class="food-card">
            <img :src="goods.img || 'https://picsum.photos/200/200'" class="food-img" />
            <div class="food-info">
              <div class="food-name">{{ goods.name }}</div>
              <div class="food-price">¥{{ goods.price }}</div>
            </div>
            <div class="num-control">
              <el-button size="small" circle class="btn-minus" :disabled="(goodsCount[goods.id] || 0) <= 0" @click="decreaseGoods(goods)">−</el-button>
              <span class="num">{{ goodsCount[goods.id] || 0 }}</span>
              <el-button size="small" circle type="primary" class="btn-plus" @click="increaseGoods(goods)">+</el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 店铺优惠券展示 -->
      <div v-if="currentShop.id" class="coupon-section">
        <h3 class="text-center sub-title">店铺优惠券</h3>
        <div v-if="availableCoupons.length === 0" style="text-align:center;color:#909399;padding:10px">暂无优惠券可领取</div>
        <div v-else class="shop-coupon-list">
          <div v-for="c in availableCoupons" :key="c.id" class="shop-coupon-item">
            <div class="sc-left">
              <div class="sc-value">¥{{ c.value }}</div>
              <div class="sc-type">{{ c.type }}</div>
            </div>
            <div class="sc-right">
              <div class="sc-name">{{ c.name }}</div>
              <el-button v-if="!c.claimed" size="small" type="success" @click="handleClaim(c.id)">领取</el-button>
              <el-button v-else size="small" disabled>已领取</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 店铺评价-->
      <div v-if="currentShop.id" class="evaluate-section">
        <h3 class="text-center sub-title">
          店铺评价 
          <span style="font-size:14px;color:#909399">（{{ evaluateData.length }}条）</span>
        </h3>
        
        <el-card v-if="evaluateData.length === 0" style="text-align:center;padding:20px;color:#909399">暂无评价</el-card>
        
        <div v-else class="evaluate-list">
          <el-card v-for="item in evaluateData" :key="item.evaluate.id" class="evaluate-item">
            <!-- 评价头部 -->
            <div class="ev-header">
              <div class="ev-user">
                <span class="ev-username">{{ item.evaluate.username || '匿名用户' }}</span>
                <el-tag v-if="item.evaluate.type === 2" size="mini" type="warning" style="margin-left:6px">追评</el-tag>
              </div>
              <div class="ev-right">
                <el-rate v-model="item.evaluate.score" disabled show-score text-color="#ff9900" score-template="{value}分" />
                <span class="ev-time">{{ formatTime(item.evaluate.createTime) }}</span>
              </div>
            </div>
            
            <!-- 评价内容 -->
            <div class="ev-content">{{ item.evaluate.content }}</div>
            
            <!-- 讨论区域 -->
            <div class="discussion-area">
              <!-- 已有讨论列表 -->
              <div v-if="item.discussions && item.discussions.length > 0" class="discussion-list">
                <div class="discussion-title">
                  💬 讨论（{{ item.discussionCount }}）
                  <el-button size="mini" type="text" @click="toggleDiscussionInput(item.evaluate.id)">
                    {{ showDiscussionInput === item.evaluate.id ? '收起' : '参与讨论' }}
                  </el-button>
                </div>
                <div v-for="d in item.discussions" :key="d.id" class="discussion-item">
                  <div class="discussion-header">
                    <div>
                      <span class="discussion-user">{{ d.username || '匿名用户' }}</span>
                      <span class="discussion-time">{{ formatTime(d.createTime) }}</span>
                    </div>
                    <!--删除讨论按钮 -->
                    <el-button 
                      v-if="d.userId === currentUserId"
                      size="mini" 
                      type="danger" 
                      @click="handleDeleteDiscussion(d, item.evaluate.id)"
                      style="padding:0 6px;font-size:11px"
                    >
                      删除
                    </el-button>
                  </div>
                  <div class="discussion-content">{{ d.content }}</div>
                </div>
              </div>
              
              <!-- 无讨论时显示 -->
              <div v-else class="discussion-empty">
                <span>暂无讨论</span>
                <el-button size="mini" type="text" @click="toggleDiscussionInput(item.evaluate.id)">
                  {{ showDiscussionInput === item.evaluate.id ? '收起' : '参与讨论' }}
                </el-button>
              </div>
              
              <!-- 讨论输入框 -->
              <div v-if="showDiscussionInput === item.evaluate.id" class="discussion-input-area">
                <el-input 
                  v-model="discussionContent" 
                  type="textarea" 
                  :rows="2" 
                  placeholder="写下你的看法..."
                  size="small"
                />
                <div style="margin-top:8px;text-align:right">
                  <el-button size="mini" @click="showDiscussionInput = null">取消</el-button>
                  <el-button size="mini" type="primary" @click="submitDiscussion(item.evaluate)">发布</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 底部购物车栏 -->
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
const goodsCount = ref({})
const evaluateList = ref([])
const availableCoupons = ref([])

// 搜索商家
const shopKeyword = ref('')
const isShopSearch = ref(false)

// 搜索菜品
const foodKeyword = ref('')
const isFoodSearch = ref(false)
const displayGoodsList = ref([])

// 计算总数量
const totalCount = computed(() => Object.values(goodsCount.value).reduce((sum, c) => sum + c, 0))

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
    isShopSearch.value = false
  })
}

// 搜索商家
const searchShop = () => {
  const kw = shopKeyword.value.trim()
  if (!kw) {
    getShopList()
    return
  }
  isShopSearch.value = true
  request.get('/shop/list', { params: { key: kw } }).then(res => {
    shopList.value = res.data || []
    if (shopList.value.length === 0) {
      ElMessage.info('未找到匹配的商家')
    }
  }).catch(() => {
    ElMessage.error('搜索失败')
  })
}

const resetShopSearch = () => {
  shopKeyword.value = ''
  isShopSearch.value = false
  getShopList()
}

// 搜索菜品（只搜索当前商家的商品）
const searchFood = () => {
  const kw = foodKeyword.value.trim()
  if (!kw) {
    resetFoodSearch()
    return
  }
  isFoodSearch.value = true
  displayGoodsList.value = goodsList.value.filter(g => 
    g.name && g.name.includes(kw)
  )
  if (displayGoodsList.value.length === 0) {
    ElMessage.info('该商家暂无此菜品')
  }
}

const resetFoodSearch = () => {
  foodKeyword.value = ''
  isFoodSearch.value = false
  displayGoodsList.value = [...goodsList.value]
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
      if (item.shopId === currentShop.value.id) countMap[item.goodsId] = item.num
    }
    goodsCount.value = countMap
  } catch (e) { console.error(e) }
}

// 评价数据（含讨论）
const evaluateData = ref([])

// 讨论输入
const showDiscussionInput = ref(null)
const discussionContent = ref('')

// 加载评价（含讨论）
const loadEvaluates = async (shopId) => {
  try {
    const res = await request.get('/evaluate/listWithDiscussion', { params: { shopId } })
    evaluateData.value = res.data || []
  } catch (e) {
    evaluateData.value = []
  }
}

// 切换讨论输入框
const toggleDiscussionInput = (evaluateId) => {
  if (showDiscussionInput.value === evaluateId) {
    showDiscussionInput.value = null
    discussionContent.value = ''
  } else {
    showDiscussionInput.value = evaluateId
    discussionContent.value = ''
  }
}

// 提交讨论
const submitDiscussion = async (evaluate) => {
  if (!discussionContent.value.trim()) {
    ElMessage.warning('请输入讨论内容')
    return
  }
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.post('/evaluate/discussion/add', {
      evaluateId: evaluate.id,
      userId: user.id,
      shopId: evaluate.shopId,
      content: discussionContent.value
    })
    if (res.code === 200) {
      ElMessage.success('讨论成功')
      showDiscussionInput.value = null
      discussionContent.value = ''
      // 重新加载评价（刷新讨论）
      await loadEvaluates(currentShop.value.id)
    } else {
      ElMessage.error(res.msg || '讨论失败')
    }
  } catch (e) {
    ElMessage.error('讨论失败')
  }
}
//AI辅助生成：豆包, 2026-4-19 16:00-16:30
// 修改 selectShop 中调用 loadEvaluates
const selectShop = async (shop) => {
  currentShop.value = shop
  selectedShopId.value = shop.id
  isFoodSearch.value = false
  foodKeyword.value = ''
  try {
    const res = await request.get('/user/goods/shop', { params: { shopId: shop.id } })
    goodsList.value = res.data || []
    displayGoodsList.value = [...goodsList.value]
    await loadCartCount()
    await loadEvaluates(shop.id) 
    await loadCoupons(shop.id)
  } catch (e) { ElMessage.error('加载商品失败') }
}
// 获取当前用户ID
const currentUserId = ref(null)

//删除讨论
const handleDeleteDiscussion = async (discussion, evaluateId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.post('/evaluate/discussion/delete', {
      id: discussion.id,
      userId: user.id
    })
    if (res.code === 200) {
      ElMessage.success('讨论已删除')
      // 重新加载评价刷新讨论
      await loadEvaluates(currentShop.value.id)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (e) {
    ElMessage.error('删除失败')
  }
}
// 加载可领取优惠券
const loadCoupons = async (shopId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/user/coupon/available', { params: { shopId, userId: user.id } })
    availableCoupons.value = res.data || []
  } catch (e) { availableCoupons.value = [] }
}

// 领取优惠券
const handleClaim = async (couponId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.post('/user/coupon/claim', { userId: user.id, couponId })
    if (res.code === 200) {
      ElMessage.success('领取成功！')
      loadCoupons(currentShop.value.id)
    } else {
      ElMessage.warning(res.msg)
    }
  } catch (e) { ElMessage.error('领取失败') }
}

// 返回商家列表
const backToList = () => {
  selectedShopId.value = null
  currentShop.value = {}
  goodsList.value = []
  displayGoodsList.value = []
  goodsCount.value = {}
}

// + 增加商品
const increaseGoods = async (goods) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) { ElMessage.warning('请先登录'); return }
    await addCart({ userId: user.id, shopId: currentShop.value.id, goodsId: goods.id, num: 1 })
    goodsCount.value = { ...goodsCount.value, [goods.id]: (goodsCount.value[goods.id] || 0) + 1 }
  } catch (e) { ElMessage.error('加入失败') }
}

// − 减少商品
const decreaseGoods = async (goods) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) return
    const currentCount = goodsCount.value[goods.id] || 0
    if (currentCount <= 0) return
    if (currentCount === 1) {
      const res = await request.get('/cart/list', { params: { userId: user.id } })
      const cartList = res.data || []
      const cartItem = cartList.find(c => c.goodsId === goods.id && c.shopId === currentShop.value.id)
      if (cartItem) await request.delete('/cart/delete', { params: { id: cartItem.id } })
    } else {
      await addCart({ userId: user.id, shopId: currentShop.value.id, goodsId: goods.id, num: -1 })
    }
    const newCount = Math.max(0, currentCount - 1)
    goodsCount.value = { ...goodsCount.value, [goods.id]: newCount }
  } catch (e) { ElMessage.error('操作失败') }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const goToCart = () => router.push('/cart')

// 初始化时设置
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  currentUserId.value = user.id
  getShopList()
})
</script>

<style scoped>
.shop-page { width: 100%; min-height: 100vh; background: #f8f9fa; padding-bottom: 80px; }
.nav { width: 100%; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; box-shadow: 0 4px 16px rgba(255,107,53,0.25); }
.nav :deep(.el-menu-item) { color: #fff; font-weight: 600; }
.nav :deep(.el-menu-item:hover), .nav :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; }
.container { width: 95%; max-width: 1200px; margin: 0 auto; padding: 28px 0; }
.text-center { text-align: center; }
.container h2 { font-size: 26px; font-weight: 800; color: #ff6b35; margin-bottom: 24px; letter-spacing: 1px; }

/* 搜索框 */
.search-box, .food-search-box { display: flex; gap: 12px; margin-bottom: 20px; }
.search-box :deep(.el-input__wrapper), .food-search-box :deep(.el-input__wrapper) { border-radius: 14px; padding: 8px 16px; border: 2px solid #f0f0f0; }
.search-box :deep(.el-input__wrapper.is-focus), .food-search-box :deep(.el-input__wrapper.is-focus) { border-color: #ff7e5f; }
.search-box .el-button, .food-search-box .el-button { border-radius: 14px; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; font-weight: 600; }
.no-result { text-align: center; padding: 30px; color: #909399; font-size: 16px; }

/* 商家列表 */
.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
.list :deep(.el-card) { border-radius: 16px; border: none; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: all 0.3s; cursor: pointer; overflow: hidden; }
.list :deep(.el-card:hover) { transform: translateY(-6px) scale(1.02); box-shadow: 0 14px 32px rgba(0,0,0,0.14); }
.shop-img { width: 100%; height: 140px; object-fit: cover; margin: -16px -16px 12px -16px; }
.shop-name { margin-top: 8px; font-weight: 700; font-size: 16px; color: #2a3340; }

/* 商品 */
.food-section { margin-top: 32px; }
.sub-title { font-size: 22px; font-weight: 800; color: #ff6b35; margin-bottom: 20px; }
.food-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.food-card { border-radius: 16px; border: none; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; }
.food-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
.food-img { width: 100%; height: 120px; object-fit: cover; border-radius: 12px; margin-bottom: 8px; }
.food-info { padding: 0 4px; margin-bottom: 10px; }
.food-name { font-weight: 700; font-size: 15px; color: #2a3340; margin-bottom: 4px; }
.food-price { color: #ff6b35; font-weight: 800; font-size: 18px; }
.num-control { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 0; }
.num { min-width: 20px; text-align: center; font-weight: 700; font-size: 16px; color: #2a3340; }
.btn-minus, .btn-plus { width: 32px; height: 32px; padding: 0; font-size: 16px; font-weight: 700; }
.btn-minus { background: #f0f0f0; border: 1px solid #ddd; color: #666; }
.btn-plus { background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; color: #fff; box-shadow: 0 4px 10px rgba(255,107,53,0.3); }

/* 优惠券 */
.coupon-section { margin-top: 32px; }
.shop-coupon-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.shop-coupon-item { display: flex; align-items: center; padding: 12px 16px; border: 2px solid #ffe0d0; border-radius: 12px; background: #fff8f5; }
.sc-left { width: 60px; text-align: center; }
.sc-value { font-size: 18px; font-weight: 800; color: #ff6b35; }
.sc-type { font-size: 11px; color: #999; }
.sc-right { flex: 1; display: flex; align-items: center; justify-content: space-between; padding-left: 12px; }
.sc-name { font-weight: 600; font-size: 14px; color: #2a3340; }

/* 评价 */
.evaluate-section { margin-top: 32px; }
.evaluate-item { margin-bottom: 12px; }
.evaluate-item :deep(.el-card__body) { padding: 16px; }
.ev-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.ev-user { display: flex; align-items: center; }
.ev-username { font-weight: 700; font-size: 15px; color: #2c3e50; }
.ev-right { display: flex; align-items: center; gap: 12px; }
.ev-time { font-size: 12px; color: #999; }
.ev-content { font-size: 14px; color: #333; line-height: 1.6; }
/* 讨论区域 */
.discussion-area { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e8e8e8; }
.discussion-title {  font-size: 13px; font-weight: 600; color: #666; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
.discussion-list { margin-bottom: 8px; }
.discussion-item { padding: 8px 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 6px; }
.discussion-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.discussion-user { font-weight: 600; font-size: 13px; color: #409eff; }
.discussion-time { font-size: 11px; color: #999; }
.discussion-content { font-size: 13px; color: #333; line-height: 1.5; }
.discussion-empty { font-size: 13px; color: #999; display: flex; justify-content: space-between; align-items: center; }
.discussion-input-area { margin-top: 8px; }
/* 底部购物车 */
.cart-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: #fff; box-shadow: 0 -4px 20px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; z-index: 1000; }
.cart-bar-left { display: flex; align-items: center; gap: 12px; }
.cart-badge :deep(.el-badge__content) { background: #ff6b35; }
.cart-summary { font-size: 14px; color: #666; }
.cart-total b { font-size: 18px; color: #ff6b35; }
.cart-btn { height: 44px; padding: 0 32px; border-radius: 22px; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; font-size: 16px; font-weight: 700; box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
.cart-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,107,53,0.55); }
</style>