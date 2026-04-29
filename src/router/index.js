import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 登录注册
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/shop-register', component: () => import('../views/ShopRegister.vue') },

  // ================== 用户端 ==================
  { 
    path: '/home', 
    component: () => import('../views/Home.vue'),
    meta: { role: 1 }
  },
  { 
    path: '/shop', 
    component: () => import('../views/Shop.vue'),
    meta: { role: 1 }
  },
  { 
    path: '/cart', 
    component: () => import('../views/Cart.vue'),
    meta: { role: 1 }
  },
  { 
    path: '/order', 
    component: () => import('../views/Order.vue'),
    meta: { role: 1 }
  },
  { 
    path: '/user', 
    component: () => import('../views/User.vue'),
    meta: { role: 1 }
  },
  { path: '/', redirect: '/home' },

  // ================== 商家端 ==================
  { 
    path: '/shop-admin', 
    component: () => import('../views/ShopAdmin.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-order', 
    component: () => import('../views/ShopOrder.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-user', 
    component: () => import('../views/ShopUser.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-finance', 
    component: () => import('../views/ShopFinance.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-marketing', 
    component: () => import('../views/ShopMarketing.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-data', 
    component: () => import('../views/ShopData.vue'),
    meta: { role: 2 }
  },
  { 
    path: '/shop-set', 
    component: () => import('../views/ShopSet.vue'),
    meta: { role: 2 }
  },

  // ================== 外送员端 ==================
  { 
    path: '/rider', 
    component: () => import('../views/RiderIndex.vue'),
    meta: { role: 3 }
  },
  { 
    path: '/rider-order', 
    component: () => import('../views/RiderOrder.vue'),
    meta: { role: 3 }
  },
  { 
    path: '/rider-set', 
    component: () => import('../views/RiderSet.vue'),
    meta: { role: 3 }
  },

  // ================== 管理员端 ==================
  { 
    path: '/admin', 
    component: () => import('../views/Admin.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-user', 
    component: () => import('../views/AdminUser.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-shop', 
    component: () => import('../views/AdminShop.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-goods', 
    component: () => import('../views/AdminGoods.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-order', 
    component: () => import('../views/AdminOrder.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-finance', 
    component: () => import('../views/AdminFinance.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-content', 
    component: () => import('../views/AdminContent.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-data', 
    component: () => import('../views/AdminData.vue'),
    meta: { role: 4 }
  },
  { 
    path: '/admin-setting', 
    component: () => import('../views/AdminSetting.vue'),
    meta: { role: 4 }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ================== 完整权限拦截 ==================
router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const whiteList = ['/login', '/register', '/shop-register']

  // 1. 白名单直接放行
  if (whiteList.includes(to.path)) {
    return next()
  }

  // 2. 未登录 → 去登录
  if (!userStr || userStr === 'undefined' || userStr === 'null') {
    return next('/login')
  }

  // 3. 已登录，解析用户信息
  const user = JSON.parse(userStr)
  const needRole = to.meta?.role

  // 4. 如果页面需要权限 → 校验身份
  if (needRole !== undefined) {
    if (user.role !== needRole) {
      return next('/login')
    }
  }

  // 5. 正常放行
  next()
})

export default router