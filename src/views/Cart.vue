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
        <div class="toolbar">
          <el-checkbox v-model="isAllSelected" :indeterminate="isIndeterminate" @change="handleSelectAll">
            全选
          </el-checkbox>
          <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="batchDelete">
            批量删除（{{ selectedIds.length }}）
          </el-button>
          <el-button type="info" size="small" @click="clearAll">清空购物车</el-button>
        </div>

        <el-table ref="tableRef" :data="cartList" border align="center" style="width: 100%;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="foodName" label="菜品" />
          <el-table-column prop="price" label="单价（¥）" />
          <el-table-column label="数量" width="180">
            <template #default="scope">
              <div class="num-box">
                <el-button size="small" @click="decrease(scope.$index)">−</el-button>
                <el-input-number v-model="scope.row.num" :min="1" :max="99" size="small" :controls="false" @change="(val) => onNumChange(scope.$index, val)" class="num-input" />
                <el-button size="small" @click="increase(scope.$index)">+</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="小计">
            <template #default="scope">¥{{ (scope.row.price * scope.row.num).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" size="small" @click="del(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="bottom-bar">
          <div class="total-price">
            已选 <b>{{ selectedIds.length }}</b> 件，合计：<span>¥{{ selectedTotalPrice }}</span>
          </div>
          <el-button type="primary" size="large" class="order-btn" :disabled="selectedIds.length === 0" @click="showCheckoutDialog">
            结算下单（{{ selectedIds.length }}）
          </el-button>
        </div>
      </div>
    </div>

    <!-- 结算弹窗：选择优惠券 + 满减 + 支付方式 -->
    <el-dialog v-model="checkoutVisible" title="结算确认" width="550px" :close-on-click-modal="false">
      <div v-if="checkoutLoading" style="text-align:center;padding:30px">加载中...</div>
      <div v-else>
        <!-- 订单金额 -->
        <div class="checkout-summary">
          <div class="summary-row">
            <span>商品合计</span>
            <span>¥{{ selectedTotalPrice }}</span>
          </div>
          <div class="summary-row" v-if="selectedDiscountAmount > 0">
            <span>满减优惠</span>
            <span style="color:#e6a23c">-¥{{ selectedDiscountAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row" v-if="selectedCouponDiscount > 0">
            <span>优惠券优惠</span>
            <span style="color:#e6a23c">-¥{{ selectedCouponDiscount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额</span>
            <span style="color:#ff6b35;font-size:22px;font-weight:800">¥{{ finalPayPrice.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 选择优惠券 -->
        <div class="section-title">选择优惠券</div>
        <div v-if="myCoupons.length === 0" class="no-data">暂无可用优惠券</div>
        <div v-else class="coupon-list">
          <div v-for="c in myCoupons" :key="c.id" 
               class="coupon-item" 
               :class="{ active: selectedCouponId === c.id }"
               @click="selectCoupon(c)">
            <div class="coupon-left">
              <div class="coupon-value">¥{{ c.value }}</div>
              <div class="coupon-type">{{ c.type }}</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ c.name }}</div>
            </div>
            <div class="coupon-check">
              <el-radio :model-value="selectedCouponId === c.id" :label="c.id" @click.stop="selectCoupon(c)">&nbsp;</el-radio>
            </div>
          </div>
          <div v-if="selectedCouponId" style="margin-top:8px">
            <el-button size="small" type="info" @click="selectedCouponId = null; selectedCouponDiscount = 0; calcFinalPrice()">不使用优惠券</el-button>
          </div>
        </div>

        <!-- 满减活动 -->
        <div class="section-title">满减活动</div>
        <div v-if="discounts.length === 0" class="no-data">暂无满减活动</div>
        <div v-else class="discount-list">
          <div v-for="d in discounts" :key="d.id" 
               class="discount-item"
               :class="{ matched: selectedTotalPrice >= d.condition }">
            <div class="discount-info">
              <span class="discount-tag" v-if="selectedTotalPrice >= d.condition">可享</span>
              <span class="discount-tag no" v-else>差¥{{ (d.condition - selectedTotalPrice).toFixed(2) }}</span>
              <span>{{ d.name }} — 满¥{{ d.condition }}减¥{{ d.discount }}</span>
            </div>
          </div>
        </div>

        <!-- 选择支付方式 -->
        <div class="section-title">选择支付方式</div>
        <el-radio-group v-model="paymentMethod" class="payment-group">
          <el-radio value="微信支付" class="payment-item">
            <span class="payment-icon">💳</span> 微信支付
          </el-radio>
          <el-radio value="支付宝" class="payment-item">
            <span class="payment-icon">🔵</span> 支付宝
          </el-radio>
          <el-radio value="余额支付" class="payment-item">
            <span class="payment-icon">💰</span> 余额支付
          </el-radio>
          <el-radio value="校园卡" class="payment-item">
            <span class="payment-icon">🎓</span> 校园卡支付
          </el-radio>
        </el-radio-group>
      </div>

      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmOrder">确认支付 ¥{{ finalPayPrice.toFixed(2) }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCartList } from '@/api/cart'
import { createOrder } from '@/api/order'
import { getUserCoupons, getShopDiscounts } from '@/api/coupon'
import request from '@/utils/request'

const router = useRouter()
const cartList = ref([])
const selectedIds = ref([])
const isAllSelected = ref(false)
const isIndeterminate = ref(false)
const tableRef = ref(null)

// 结算弹窗
const checkoutVisible = ref(false)
const checkoutLoading = ref(false)
const submitting = ref(false)

// 优惠券相关
const myCoupons = ref([])
const selectedCouponId = ref(null)
const selectedCouponDiscount = ref(0)

// 满减相关
const discounts = ref([])
const selectedDiscountId = ref(null)
const selectedDiscountAmount = ref(0)

// 支付方式
const paymentMethod = ref('微信支付')

// 计算已选总价
const selectedTotalPrice = computed(() => {
  return cartList.value
    .filter(item => selectedIds.value.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.num, 0)
})

// 计算最终实付
const finalPayPrice = computed(() => {
  let price = selectedTotalPrice.value
  price -= selectedDiscountAmount.value
  price -= selectedCouponDiscount.value
  return Math.max(0, price)
})

// 选中变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
  const total = cartList.value.length
  const selected = selectedIds.value.length
  isAllSelected.value = total > 0 && selected === total
  isIndeterminate.value = selected > 0 && selected < total
}

const handleSelectAll = (val) => {
  if (tableRef.value) {
    if (val) cartList.value.forEach(row => tableRef.value.toggleRowSelection(row, true))
    else tableRef.value.clearSelection()
  }
}

const loadCart = async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    const user = JSON.parse(userStr)
    const res = await getCartList(user.id)
    cartList.value = res.data || []
  } catch (err) {
    cartList.value = []
  }
}

onMounted(() => { loadCart() })

const increase = async (index) => {
  const item = cartList.value[index]
  item.num++
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await request.post('/cart/add', { userId: user.id, shopId: item.shopId, goodsId: item.goodsId, num: 1 })
  } catch (e) { item.num-- }
}

const decrease = async (index) => {
  const item = cartList.value[index]
  if (item.num <= 1) return
  item.num--
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await request.post('/cart/add', { userId: user.id, shopId: item.shopId, goodsId: item.goodsId, num: -1 })
  } catch (e) { item.num++ }
}

const onNumChange = async (index, val) => {
  const item = cartList.value[index]
  const oldNum = item.num
  if (val < 1) { item.num = 1; return }
  const diff = val - oldNum
  if (diff === 0) return
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (val <= 0) {
      await request.delete('/cart/delete', { params: { id: item.id } })
      cartList.value.splice(index, 1)
    } else {
      await request.post('/cart/add', { userId: user.id, shopId: item.shopId, goodsId: item.goodsId, num: diff })
    }
  } catch (e) { item.num = oldNum }
}

const del = async (index) => {
  try {
    const item = cartList.value[index]
    await request.delete('/cart/delete', { params: { id: item.id } })
    cartList.value.splice(index, 1)
  } catch (err) { ElMessage.error("删除失败") }
}

const batchDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 件商品？`, '提示')
    for (const id of selectedIds.value) {
      await request.delete('/cart/delete', { params: { id } })
    }
    await loadCart()
    selectedIds.value = []
    ElMessage.success('删除成功')
  } catch (e) { if (e !== 'cancel') ElMessage.error('批量删除失败') }
}

const clearAll = async () => {
  try {
    await ElMessageBox.confirm('确定清空购物车？', '提示')
    const user = JSON.parse(localStorage.getItem('user'))
    await request.delete('/cart/clear', { params: { userId: user.id } })
    cartList.value = []
    selectedIds.value = []
    ElMessage.success('购物车已清空')
  } catch (e) { /* 取消 */ }
}

// 打开结算弹窗
const showCheckoutDialog = async () => {
  const selectedItems = cartList.value.filter(item => selectedIds.value.includes(item.id))
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }

  checkoutVisible.value = true
  checkoutLoading.value = true

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const shopId = selectedItems[0].shopId

    selectedCouponId.value = null
    selectedCouponDiscount.value = 0
    selectedDiscountId.value = null
    selectedDiscountAmount.value = 0
    paymentMethod.value = '微信支付'

    const [couponRes, discountRes] = await Promise.all([
      getUserCoupons(user.id, shopId),
      getShopDiscounts(shopId)
    ])
    myCoupons.value = couponRes.data || []
    discounts.value = discountRes.data || []

    calcDiscount()
  } catch (e) {
    ElMessage.error('加载结算信息失败')
  } finally {
    checkoutLoading.value = false
  }
}

// 计算满减优惠
const calcDiscount = () => {
  let bestDiscount = { id: null, amount: 0 }
  for (const d of discounts.value) {
    if (selectedTotalPrice.value >= d.condition) {
      if (d.discount > bestDiscount.amount) {
        bestDiscount = { id: d.id, amount: d.discount }
      }
    }
  }
  selectedDiscountId.value = bestDiscount.id
  selectedDiscountAmount.value = bestDiscount.amount
}

// 选择优惠券
const selectCoupon = (coupon) => {
  if (selectedCouponId.value === coupon.id) {
    selectedCouponId.value = null
    selectedCouponDiscount.value = 0
  } else {
    selectedCouponId.value = coupon.id
    if (coupon.type === '无门槛券' || coupon.type === '满减券') {
      selectedCouponDiscount.value = Number(coupon.value)
    } else if (coupon.type === '折扣券') {
      const rate = Number(coupon.value) / 10
      selectedCouponDiscount.value = selectedTotalPrice.value * (1 - rate)
    }
    if (selectedCouponDiscount.value > selectedTotalPrice.value) {
      selectedCouponDiscount.value = selectedTotalPrice.value
    }
  }
  calcFinalPrice()
}

const calcFinalPrice = () => {
  calcDiscount()
}

// 确认下单
const confirmOrder = async () => {
  submitting.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const selectedItems = cartList.value.filter(item => selectedIds.value.includes(item.id))
    const shopId = selectedItems[0].shopId
    const address = user.address

    if (!address) {
      ElMessage.error('请先在个人中心设置收货地址')
      submitting.value = false
      return
    }

    const res = await request.post('/order/create', {
      userId: user.id,
      shopId: Number(shopId),
      address: address,
      totalPrice: selectedTotalPrice.value,
      couponId: selectedCouponId.value,
      discountId: selectedDiscountId.value,
      discountAmount: (selectedCouponDiscount.value + selectedDiscountAmount.value),
      paymentMethod: paymentMethod.value,
      finalPrice: finalPayPrice.value
    })

    if (res.code === 200) {
      await request.delete('/cart/clear', { params: { userId: user.id } })
      cartList.value = []
      selectedIds.value = []
      checkoutVisible.value = false
      ElMessage.success(`下单成功！${paymentMethod.value}支付¥${finalPayPrice.value.toFixed(2)}`)
      router.push('/order')
    } else {
      ElMessage.error(res.msg || '下单失败')
    }
  } catch (e) {
    ElMessage.error('下单失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cart-page { width: 100%; min-height: 100vh; background: #f8f9fa; }
.nav { width: 100%; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; box-shadow: 0 4px 16px rgba(255,107,53,0.25); }
.nav :deep(.el-menu-item) { color: #fff; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.3s; }
.nav :deep(.el-menu-item:hover), .nav :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; border-bottom-color: #fff; }
.container { width: 95%; max-width: 1100px; margin: 0 auto; padding: 28px 0; }
.text-center { text-align: center; }
.container h2 { font-size: 26px; font-weight: 800; color: #ff6b35; margin-bottom: 28px; letter-spacing: 1px; }
.empty-cart { padding: 80px 0; color: #909399; font-size: 18px; font-weight: 500; }
.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 12px 16px; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.cart-page :deep(.el-table) { border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: none; }
.cart-page :deep(.el-table th) { background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%); color: #ff6b35; font-weight: 700; }
.cart-page :deep(.el-table--border::after), .cart-page :deep(.el-table--group::after) { background-color: transparent; }
.num-box { display: flex; align-items: center; justify-content: center; gap: 6px; }
.num-box .el-button { border-radius: 10px; width: 32px; height: 32px; padding: 0; font-weight: 700; }
.num-input { width: 60px; }
.num-input :deep(.el-input__wrapper) { border-radius: 10px; padding: 0 8px; text-align: center; }
.num-input :deep(.el-input__inner) { text-align: center; font-weight: 700; font-size: 16px; }
.bottom-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; padding: 16px 24px; background: #fff; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.total-price { font-size: 16px; color: #666; }
.total-price b { color: #ff6b35; font-size: 18px; }
.total-price span { font-size: 24px; font-weight: 800; color: #ff6b35; }
.order-btn { height: 48px; padding: 0 36px; border-radius: 14px; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; font-size: 17px; font-weight: 700; box-shadow: 0 8px 24px rgba(255,107,53,0.4); transition: all 0.3s; }
.order-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(255,107,53,0.55); }

/* 结算弹窗样式 */
.checkout-summary { background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; }
.summary-row.total { border-top: 1px solid #eee; margin-top: 8px; padding-top: 12px; }
.section-title { font-weight: 700; font-size: 16px; color: #2c3e50; margin: 16px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #ff6b35; }
.no-data { color: #909399; padding: 12px 0; text-align: center; }
.coupon-list { max-height: 200px; overflow-y: auto; }
.coupon-item { display: flex; align-items: center; padding: 10px 12px; border: 2px solid #eee; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.3s; }
.coupon-item.active { border-color: #ff6b35; background: #fff5f0; }
.coupon-left { width: 70px; text-align: center; }
.coupon-value { font-size: 20px; font-weight: 800; color: #ff6b35; }
.coupon-type { font-size: 11px; color: #999; }
.coupon-right { flex: 1; padding: 0 12px; }
.coupon-name { font-weight: 600; font-size: 14px; }
.coupon-check { width: 30px; }
.discount-list { margin-bottom: 10px; }
.discount-item { padding: 10px 12px; border-radius: 10px; margin-bottom: 6px; background: #f8f9fa; }
.discount-item.matched { background: #f0f9eb; border: 1px solid #b3e19d; }
.discount-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-right: 8px; background: #67c23a; color: #fff; }
.discount-tag.no { background: #909399; }
.payment-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.payment-item { display: flex; align-items: center; padding: 12px 16px; border: 2px solid #eee; border-radius: 12px; }
.payment-icon { margin-right: 6px; font-size: 18px; }
</style>