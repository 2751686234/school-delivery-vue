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
        <el-input v-model="keyword" placeholder="搜索商家名称" size="large" @keyup.enter="handleSearch" />
        <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
      </div>

      <!-- ==================== 轮播图（type=1） ==================== -->
      <el-carousel height="180px" class="banner" v-if="banners.length > 0" indicator-position="outside">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" :style="{ background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' }">
            <div v-if="banner.image" class="banner-img-wrapper">
              <img :src="banner.image" class="banner-img" />
            </div>
            <div class="banner-text">
              <div class="banner-title">{{ banner.title }}</div>
              <div class="banner-desc" v-if="banner.content">{{ banner.content }}</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 无轮播图时的默认占位 -->
      <el-carousel height="180px" class="banner" v-else>
        <el-carousel-item>
          <div class="banner-text" style="background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);">
            欢迎使用校园外卖
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- ==================== 公告（type=2） ==================== -->
      <div class="section" v-if="notices.length > 0">
        <div class="section-title">
          <span class="title-icon">📢</span>
          <span>平台公告</span>
        </div>
        <div class="notice-list">
          <el-card v-for="notice in notices" :key="notice.id" class="notice-card" @click="showNoticeDetail(notice)">
            <div class="notice-item">
              <div class="notice-tag">公告</div>
              <div class="notice-title">{{ notice.title }}</div>
              <div class="notice-time">{{ formatTime(notice.createTime) }}</div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- ==================== 活动（type=3） ==================== -->
      <div class="section" v-if="activities.length > 0">
        <div class="section-title">
          <span class="title-icon">🎉</span>
          <span>精彩活动</span>
        </div>
        <div class="activity-list">
          <el-card v-for="act in activities" :key="act.id" class="activity-card" @click="showNoticeDetail(act)">
            <div class="activity-item">
              <div v-if="act.image" class="activity-img-wrapper">
                <img :src="act.image" class="activity-img" />
              </div>
              <div class="activity-info">
                <div class="activity-title">{{ act.title }}</div>
                <div class="activity-desc">{{ act.content }}</div>
                <div class="activity-time">{{ formatTime(act.createTime) }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- ==================== 精选商家 ==================== -->
      <div class="section">
        <div class="section-title">
          <span class="title-icon">🏪</span>
          <span>{{ isSearchMode ? '搜索结果' : '精选商家' }}</span>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="isSearchMode" class="search-result-info">
          共找到 <b>{{ shopList.length }}</b> 家商家
          <el-button type="info" size="small" @click="resetSearch" style="margin-left:12px">返回全部</el-button>
        </div>

        <!-- 无结果提示 -->
        <div v-if="shopList.length === 0 && isSearchMode" class="no-result">
          QAQ 无该店家，换个关键词试试~
        </div>
        <div v-else-if="shopList.length === 0 && !isSearchMode" class="no-result">
          暂无营业中的商家
        </div>

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

    <!-- 公告/活动详情弹窗 -->
    <el-dialog v-model="showDetail" :title="detailItem.title" width="600px">
      <div v-if="detailItem.image" style="text-align:center;margin-bottom:16px">
        <img :src="detailItem.image" style="max-width:100%;max-height:300px;border-radius:12px;object-fit:cover" />
      </div>
      <div style="font-size:14px;color:#666;line-height:1.8;white-space:pre-wrap">{{ detailItem.content }}</div>
      <div style="margin-top:12px;font-size:12px;color:#999;text-align:right">
        发布时间：{{ formatTime(detailItem.createTime) }}
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
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
const isSearchMode = ref(false)

// 内容管理数据
const banners = ref([])      // 轮播图 type=1
const notices = ref([])      // 公告 type=2
const activities = ref([])   // 活动 type=3

// 详情弹窗
const showDetail = ref(false)
const detailItem = ref({})

// 加载内容管理数据
const loadContent = async () => {
  try {
    // 并行加载三种类型
    const [bannerRes, noticeRes, activityRes] = await Promise.all([
      request.get('/notice/listByType', { params: { type: 1 } }),
      request.get('/notice/listByType', { params: { type: 2 } }),
      request.get('/notice/listByType', { params: { type: 3 } })
    ])
    banners.value = bannerRes.data || []
    notices.value = noticeRes.data || []
    activities.value = activityRes.data || []
    
    console.log('📢 轮播图:', banners.value.length, '条')
    console.log('📋 公告:', notices.value.length, '条')
    console.log('🎉 活动:', activities.value.length, '条')
  } catch (e) {
    console.error('加载内容失败', e)
  }
}

// 页面加载
onMounted(() => {
  loadShopList()
  loadContent()
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
    isSearchMode.value = false
    loadShopList()
    return
  }
  
  isSearchMode.value = true
  
  request.get('/shop/list', {
    params: { key: keyword.value.trim() }
  }).then(res => {
    shopList.value = res.data || []
    
    if (shopList.value.length === 0) {
      ElMessage.info('无该店家，换个关键词试试~')
    }
  }).catch(() => {
    ElMessage.error('搜索失败')
  })
}

// 重置搜索
const resetSearch = () => {
  keyword.value = ''
  isSearchMode.value = false
  loadShopList()
}

// 查看公告/活动详情
const showNoticeDetail = (item) => {
  detailItem.value = item
  showDetail.value = true
}

const handleNav = (path) => {
  router.push(path).catch(() => {})
}

const goShopDetail = (shopId) => {
  router.push('/shop?shopId=' + shopId)
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
.home { width: 100%; min-height: 100vh; background: #f8f9fa; }

/* 导航栏 */
.nav { width: 100%; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; box-shadow: 0 4px 16px rgba(255,107,53,0.25); }
.nav :deep(.el-menu-item) { color: #fff; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.3s; }
.nav :deep(.el-menu-item:hover), .nav :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; border-bottom-color: #fff; }

.container { width: 95%; max-width: 1200px; margin: 0 auto; padding: 24px 0; }

/* 地址栏 */
.address-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #ff6b35; font-weight: 500; }
.select-address { width: 180px; }
.select-address :deep(.el-input__wrapper) { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 2px solid #fff; transition: all 0.3s; }

/* 搜索框 */
.search-box { display: flex; gap: 12px; margin-bottom: 24px; }
.search-box :deep(.el-input__wrapper) { border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 8px 16px; border: 2px solid #f0f0f0; transition: all 0.3s; }
.search-box :deep(.el-input__wrapper.is-focus) { border-color: #ff7e5f; box-shadow: 0 6px 20px rgba(255,126,95,0.18); }
.search-box .el-button { border-radius: 14px; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; font-weight: 600; box-shadow: 0 6px 18px rgba(255,107,53,0.35); transition: all 0.3s; }
.search-box .el-button:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(255,107,53,0.45); }

/* 轮播图 */
.banner { border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin-bottom: 20px; }
.banner-item { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.banner-img-wrapper { position: absolute; width: 100%; height: 100%; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-text { 
  position: relative; z-index: 1; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  height: 100%; color: #fff; font-size: 24px; font-weight: 700; letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.banner-title { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
.banner-desc { font-size: 14px; font-weight: 400; opacity: 0.9; }

/* 分区标题 */
.section { margin-top: 28px; }
.section-title { 
  display: flex; align-items: center; gap: 8px; 
  font-size: 20px; font-weight: 800; color: #2c3e50; 
  margin-bottom: 16px; padding-bottom: 10px; 
  border-bottom: 3px solid #ff6b35;
}
.title-icon { font-size: 24px; }
.search-result-info { text-align: center; margin-bottom: 12px; color: #666; font-size: 14px; }
.search-result-info b { color: #ff6b35; }
.no-result { text-align: center; padding: 30px; color: #909399; font-size: 16px; }

/* 公告列表 */
.notice-list { display: flex; flex-direction: column; gap: 10px; }
.notice-card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: all 0.3s; cursor: pointer; }
.notice-card:hover { transform: translateX(6px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.notice-card :deep(.el-card__body) { padding: 14px 18px; }
.notice-item { display: flex; align-items: center; gap: 12px; }
.notice-tag { 
  padding: 4px 10px; border-radius: 6px; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: #fff; font-size: 12px; font-weight: 700; white-space: nowrap;
}
.notice-title { flex: 1; font-weight: 600; font-size: 15px; color: #2c3e50; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notice-time { font-size: 12px; color: #999; white-space: nowrap; }

/* 活动列表 */
.activity-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.activity-card { border-radius: 16px; border: none; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: all 0.3s; cursor: pointer; overflow: hidden; }
.activity-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.14); }
.activity-item { display: flex; gap: 14px; }
.activity-img-wrapper { width: 120px; height: 90px; flex-shrink: 0; }
.activity-img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
.activity-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.activity-title { font-weight: 700; font-size: 16px; color: #2c3e50; margin-bottom: 4px; }
.activity-desc { font-size: 13px; color: #666; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.activity-time { font-size: 11px; color: #999; margin-top: 6px; }

/* 商家列表 */
.shop-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 12px; }
.shop-list :deep(.el-card) { border-radius: 16px; border: none; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: all 0.3s; cursor: pointer; overflow: hidden; }
.shop-list :deep(.el-card:hover) { transform: translateY(-6px); box-shadow: 0 14px 32px rgba(0,0,0,0.14); }
.shop-item { display: flex; gap: 14px; align-items: center; }
.shop-pic { width: 100px; height: 80px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.shop-info { flex: 1; }
.shop-name { font-weight: 700; font-size: 16px; color: #2a3340; margin-bottom: 4px; }
.shop-desc { font-size: 13px; color: #909399; }
</style>