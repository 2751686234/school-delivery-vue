<template>
  <div class="cart-page">
    <el-menu mode="horizontal" class="nav" default-active="3">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">购物车</h2>

      <div v-if="cartList.length === 0" class="empty-cart text-center">
        购物车是空的，快去点餐吧~
      </div>

      <div v-else>
        <el-table
          :data="cartList"
          border
          align="center"
          style="width: 100%;"
        >
          <el-table-column prop="foodName" label="菜品" />
          <el-table-column prop="price" label="单价" />
          <el-table-column label="数量">
            <template #default="scope">
              <div class="num-box">
                <el-button size="small" @click="minus(scope.$index)">-</el-button>
                <span class="num">{{ scope.row.num }}</span>
                <el-button size="small" @click="plus(scope.$index)">+</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="del(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="total-price">
          合计：<span>¥{{ totalPrice }}</span>
        </div>

        <el-button
          type="primary"
          block
          size="default"
          class="order-btn"
          @click="toOrder"
        >
          结算下单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCartList } from '@/api/cart'
import { createOrder } from '@/api/order'
import request from '@/utils/request'

const router = useRouter()
const cartList = ref([])

onMounted(async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      ElMessage.warning('请先登录')
      return
    }

    const user = JSON.parse(userStr)
    if (!user.id) {
      ElMessage.warning('登录信息异常')
      return
    }

    console.log('正在加载购物车，用户ID：', user.id)

    // 调用后端接口
    const res = await getCartList(user.id)
    console.log('购物车返回：', res)

    // 关键修复：后端返回 null 时，给个空数组，不崩溃
    cartList.value = res.data || []
  } catch (err) {
    console.error('购物车报错：', err)
    cartList.value = []
  }
})

const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cartList.value))
}

const plus = (index) => {
  cartList.value[index].num++
  saveCart()
}

const minus = (index) => {
  if (cartList.value[index].num <= 1) return
  cartList.value[index].num--
  saveCart()
}

//删除购物车 
const del = async (index) => {
  try {
    let cartItem = cartList.value[index]
    await request({
      url: "/cart/delete",
      method: "delete",
      params: { id: cartItem.id }
    })
    cartList.value.splice(index, 1)
    ElMessage.success({
      message: "删除成功",
      duration: 500,
      center: true,
      showClose: false
    })
  } catch (err) {
    ElMessage.error("删除失败")
  }
}

const totalPrice = computed(() => {
  return cartList.value
    .reduce((sum, item) => sum + item.price * item.num, 0)
    .toFixed(2)
})

// 对接后端创建订单
const toOrder = async () => {
  if (cartList.value.length === 0) {
    ElMessage.warning({ message: "请先选择菜品", max: 2, duration: 1000 })
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) {
      ElMessage.error("请先登录")
      return
    }

    // 1. 从购物车里拿 shopId
    const shopId = cartList.value[0].shopId
    if (!shopId) {
      ElMessage.error("店铺异常，请重新进入店铺下单")
      return
    }

    // 2. 地址不能为空！
    const address = user.address

    // 3. 传参确保 全部不为空、类型正确
    await createOrder({
      userId: user.id,
      shopId: Number(shopId),
      address: address,
      totalPrice: totalPrice.value
    })

    cartList.value = []
    ElMessage.success("下单成功！")
    router.push('/order')
  } catch (err) {
    console.error("下单失败", err)
    ElMessage.error("下单失败")
  }
}
</script>

<style scoped>
.cart-page {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

/* 导航栏：与首页统一 */
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
  max-width: 1000px;
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
  margin-bottom: 28px;
  letter-spacing: 1px;
}

.empty-cart {
  padding: 80px 0;
  color: #909399;
  font-size: 18px;
  font-weight: 500;
}

/* 表格美化 */
.cart-page :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border: none;
}
.cart-page :deep(.el-table th) {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  color: #ff6b35;
  font-weight: 700;
}
.cart-page :deep(.el-table--border::after),
.cart-page :deep(.el-table--group::after) {
  background-color: transparent;
}

.num-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.num-box .el-button {
  border-radius: 10px;
  width: 32px;
  height: 32px;
  padding: 0;
  font-weight: 700;
}
.num {
  width: 24px;
  font-weight: 600;
  font-size: 16px;
}

.total-price {
  text-align: right;
  margin-top: 24px;
  font-size: 20px;
  font-weight: 800;
  color: #ff6b35;
}
.total-price span {
  font-size: 28px;
}

.order-btn {
  max-width: 500px;
  margin: 32px auto 0;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  transition: all 0.3s;
}
.order-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.55);
}
</style>