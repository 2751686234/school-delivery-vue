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
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-checkbox v-model="isAllSelected" :indeterminate="isIndeterminate" @change="handleSelectAll">
            全选
          </el-checkbox>
          <el-button 
            type="danger" 
            size="small" 
            :disabled="selectedIds.length === 0"
            @click="batchDelete"
          >
            批量删除（{{ selectedIds.length }}）
          </el-button>
          <el-button 
            type="info" 
            size="small" 
            @click="clearAll"
          >
            清空购物车
          </el-button>
        </div>

        <el-table
          :data="cartList"
          border
          align="center"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <!-- 复选框列 -->
          <el-table-column type="selection" width="55" align="center" />

          <el-table-column prop="foodName" label="菜品" />
          <el-table-column prop="price" label="单价（¥）" />
          
          <!-- 数量列：可输入 + 加减按钮 -->
          <el-table-column label="数量" width="180">
            <template #default="scope">
              <div class="num-box">
                <el-button size="small" @click="decrease(scope.$index)">−</el-button>
                <el-input-number
                  v-model="scope.row.num"
                  :min="1"
                  :max="99"
                  size="small"
                  controls-position=""
                  :controls="false"
                  @change="(val) => onNumChange(scope.$index, val)"
                  class="num-input"
                />
                <el-button size="small" @click="increase(scope.$index)">+</el-button>
              </div>
            </template>
          </el-table-column>

          <!-- 小计 -->
          <el-table-column label="小计">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.num).toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
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

        <div class="bottom-bar">
          <div class="total-price">
            已选 <b>{{ selectedIds.length }}</b> 件，合计：<span>¥{{ selectedTotalPrice }}</span>
          </div>
          <el-button
            type="primary"
            size="large"
            class="order-btn"
            :disabled="selectedIds.length === 0"
            @click="toOrder"
          >
            结算下单（{{ selectedIds.length }}）
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCartList } from '@/api/cart'
import { createOrder } from '@/api/order'
import request from '@/utils/request'

const router = useRouter()
const cartList = ref([])

// 选中相关
const selectedIds = ref([])
const isAllSelected = ref(false)
const isIndeterminate = ref(false)
const tableRef = ref(null)

// 计算已选总价
const selectedTotalPrice = computed(() => {
  return cartList.value
    .filter(item => selectedIds.value.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.num, 0)
    .toFixed(2)
})

// 选中变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
  const total = cartList.value.length
  const selected = selectedIds.value.length
  isAllSelected.value = total > 0 && selected === total
  isIndeterminate.value = selected > 0 && selected < total
}

// 全选/取消全选
const handleSelectAll = (val) => {
  // 直接操作 el-table 的选中状态
  // 由于 el-table 的 selection 无法直接通过 ref 控制全选，我们手动管理选中逻辑
  if (tableRef.value) {
    if (val) {
      cartList.value.forEach(row => tableRef.value.toggleRowSelection(row, true))
    } else {
      tableRef.value.clearSelection()
    }
  }
}

// 加载购物车
const loadCart = async () => {
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
    const res = await getCartList(user.id)
    cartList.value = res.data || []
  } catch (err) {
    console.error('购物车报错：', err)
    cartList.value = []
  }
}

onMounted(() => {
  loadCart()
})

// 增加
const increase = async (index) => {
  const item = cartList.value[index]
  item.num++
  // 同步后端
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await request.post('/cart/add', {
      userId: user.id,
      shopId: item.shopId,
      goodsId: item.goodsId,
      num: 1
    })
  } catch (e) {
    item.num-- // 回滚
    ElMessage.error('更新失败')
  }
}

// 减少
const decrease = async (index) => {
  const item = cartList.value[index]
  if (item.num <= 1) return
  item.num--
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await request.post('/cart/add', {
      userId: user.id,
      shopId: item.shopId,
      goodsId: item.goodsId,
      num: -1
    })
  } catch (e) {
    item.num++ // 回滚
    ElMessage.error('更新失败')
  }
}

// 输入框改变数量
const onNumChange = async (index, val) => {
  const item = cartList.value[index]
  const oldNum = item.num
  if (val < 1) {
    item.num = 1
    return
  }
  if (val > 99) {
    item.num = 99
    return
  }
  // 计算差值
  const diff = val - oldNum
  if (diff === 0) return

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (diff > 0) {
      await request.post('/cart/add', {
        userId: user.id,
        shopId: item.shopId,
        goodsId: item.goodsId,
        num: diff
      })
    } else {
      // 减少：需要处理可能删除的情况
      if (val <= 0) {
        // 删除该条
        await request.delete('/cart/delete', { params: { id: item.id } })
        cartList.value.splice(index, 1)
      } else {
        await request.post('/cart/add', {
          userId: user.id,
          shopId: item.shopId,
          goodsId: item.goodsId,
          num: diff
        })
      }
    }
  } catch (e) {
    item.num = oldNum // 回滚
    ElMessage.error('更新失败')
  }
}

// 删除单条
const del = async (index) => {
  try {
    const item = cartList.value[index]
    await request.delete('/cart/delete', { params: { id: item.id } })
    cartList.value.splice(index, 1)
    ElMessage.success({ message: "删除成功", duration: 500, center: true })
  } catch (err) {
    ElMessage.error("删除失败")
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 件商品？`, '提示')
    
    // 逐个删除
    for (const id of selectedIds.value) {
      await request.delete('/cart/delete', { params: { id } })
    }
    
    // 重新加载购物车
    await loadCart()
    selectedIds.value = []
    isAllSelected.value = false
    isIndeterminate.value = false
    
    ElMessage.success(`已删除 ${selectedIds.value.length} 件商品`)
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 清空购物车
const clearAll = async () => {
  try {
    await ElMessageBox.confirm('确定清空购物车？', '提示')
    const user = JSON.parse(localStorage.getItem('user'))
    await request.delete('/cart/clear', { params: { userId: user.id } })
    cartList.value = []
    selectedIds.value = []
    isAllSelected.value = false
    isIndeterminate.value = false
    ElMessage.success('购物车已清空')
  } catch (e) {
    // 取消操作不处理
  }
}

// 结算下单（只传选中的商品）
const toOrder = async () => {
  const selectedItems = cartList.value.filter(item => selectedIds.value.includes(item.id))
  if (selectedItems.length === 0) {
    ElMessage.warning({ message: "请先选择商品", duration: 1000 })
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) {
      ElMessage.error("请先登录")
      return
    }

    const shopId = selectedItems[0].shopId
    if (!shopId) {
      ElMessage.error("店铺异常")
      return
    }

    const address = user.address
    if (!address) {
      ElMessage.error("请先在个人中心设置收货地址")
      return
    }

    // 计算选中商品总价
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.num, 0).toFixed(2)

    // 创建订单（后端会清空整个购物车）
    await createOrder({
      userId: user.id,
      shopId: Number(shopId),
      address: address,
      totalPrice: total
    })

    // 双重保障：清空购物车
    await request.delete('/cart/clear', { params: { userId: user.id } })
    
    // 清空前端数据
    cartList.value = []
    selectedIds.value = []
    isAllSelected.value = false
    isIndeterminate.value = false
    
    ElMessage.success("下单成功！")
    router.push('/order')
    
  } catch (err) {
    console.error("下单失败", err)
    ElMessage.error("下单失败，请重试")
  }
}
</script>

<style scoped>
.cart-page {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

/* 导航栏 */
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 0;
}

.text-center { text-align: center; }

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

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.toolbar :deep(.el-checkbox__label) {
  font-weight: 600;
  color: #2a3340;
}
.toolbar .el-button--danger {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(235, 51, 73, 0.3);
  transition: all 0.3s;
}
.toolbar .el-button--danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(235, 51, 73, 0.4);
}
.toolbar .el-button--info {
  background: linear-gradient(135deg, #606c88 0%, #3f4c6b 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(96, 108, 136, 0.3);
  transition: all 0.3s;
}
.toolbar .el-button--info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(96, 108, 136, 0.4);
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

/* 数量控制 */
.num-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.num-box .el-button {
  border-radius: 10px;
  width: 32px;
  height: 32px;
  padding: 0;
  font-weight: 700;
}
.num-input {
  width: 60px;
}
.num-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 0 8px;
  text-align: center;
}
.num-input :deep(.el-input__inner) {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
}

/* 底部栏 */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.total-price {
  font-size: 16px;
  color: #666;
}
.total-price b {
  color: #ff6b35;
  font-size: 18px;
}
.total-price span {
  font-size: 24px;
  font-weight: 800;
  color: #ff6b35;
}
.order-btn {
  height: 48px;
  padding: 0 36px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%);
  border: none;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  transition: all 0.3s;
}
.order-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.55);
}
</style>