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
  background: #f7f8fa;
}
.nav {
  width: 100%;
}
.container {
  width: 95%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}
.text-center {
  text-align: center;
}
.empty-cart {
  padding: 60px 0;
  color: #999;
  font-size: 16px;
}
.num-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.num {
  width: 20px;
}
.total-price {
  text-align: right;
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
}
.order-btn {
  max-width: 500px;
  margin: 20px auto 0;
}
</style>