<template>
  <div class="order-page">
    <el-menu mode="horizontal" class="nav" default-active="4">
      <el-menu-item index="1" @click="$router.push('/home')">首页</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop')">商家</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/cart')">购物车</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/order')">订单</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/user')">我的</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="text-center">我的订单</h2>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="orderList.length === 0" class="empty">暂无订单</div>

      <div v-else v-for="order in orderList" :key="order.id" class="order-item">
        <el-card>
          <div><strong>订单号：{{ order.orderNo }}</strong></div>
          <div>商家：{{ order.shopName }}</div>
          <div>金额：¥{{ order.totalPrice }}</div>
          <div>地址：{{ order.address }}</div>
          <div>下单时间：{{ formatTime(order.createTime) }}</div>

          <!-- 配送进度 -->
          <div style="margin-top:10px;">
            <div style="font-weight:bold;margin-bottom:6px;">配送进度</div>
            <el-timeline>
              <el-timeline-item timestamp="下单成功" :type="order.status >= 1 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="商家接单" :type="order.status >= 2 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="骑手取餐/配送中" :type="order.status >= 3 ? 'primary' : 'info'" />
              <el-timeline-item timestamp="已完成" :type="order.status >= 4 ? 'success' : 'info'" />
              <el-timeline-item timestamp="已取消" v-if="order.status ===5" type="danger" />
            </el-timeline>
          </div>

          <!-- 按钮组 -->
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <el-button v-if="order.status === 1" type="danger" size="small" @click="handleCancelOrder(order.id)">取消订单</el-button>
            <el-button type="info" size="small" @click="handleUserDeleteOrder(order.id)">删除订单记录</el-button>
            <el-button type="primary" size="small" @click="openDetail(order)">查看详情</el-button>
            
            <!-- 已完成订单 → 评价/追评/查看评价 -->
            <template v-if="order.status === 4">
              <!-- 关键修复：从 evalStatusMap 中取状态 -->
              <el-button 
                v-if="!getEvalFirst(order.id)" 
                type="success" size="small" 
                @click="openEvaluate(order, 1)">
                评价
              </el-button>
              <el-button 
                v-else 
                type="warning" size="small" 
                @click="openEvaluate(order, 2)">
                追评
              </el-button>
              <el-button 
                v-if="getEvalCount(order.id) > 0"
                type="info" size="small" 
                @click="viewOrderEvaluates(order)">
                查看评价({{ getEvalCount(order.id) }})
              </el-button>
            </template>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="showDetail" title="订单详情" width="700px" append-to-body>
      <el-descriptions :column="2" border size="small" style="margin-bottom:20px">
        <el-descriptions-item label="订单号" :span="2">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="商家名称">{{ currentDetail.shopName }}</el-descriptions-item>
        <el-descriptions-item label="商家电话">{{ currentDetail.shopPhone || '未获取' }}</el-descriptions-item>
        <el-descriptions-item label="骑手姓名">{{ currentDetail.riderName || '未接单' }}</el-descriptions-item>
        <el-descriptions-item label="骑手电话">{{ currentDetail.riderPhone || '未接单' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentDetail.address }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">{{ getStatusText(currentDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentDetail.paymentMethod || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额" v-if="currentDetail.discountAmount > 0">
          <span style="color:#e6a23c">-¥{{ currentDetail.discountAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="实付金额">
          <span style="color:#ff6b35;font-weight:800">¥{{ currentDetail.finalPrice || currentDetail.totalPrice }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatTime(currentDetail.createTime) }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-bottom:12px;color:#ff6b35;font-size:16px">商品清单</h4>
      <el-table :data="goodsList" border style="width:100%" align="center">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="goods_name" label="商品名称" align="center" />
        <el-table-column prop="num" label="数量" width="80" align="center" />
        <el-table-column prop="price" label="单价（¥）" width="120" align="center" />
        <el-table-column label="小计（¥）" width="120" align="center">
          <template #default="scope">{{ (scope.row.num * scope.row.price).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
      <div style="margin-top:20px;text-align:right;font-size:18px;">
        订单总金额：<span style="color:#ff6b35;font-weight:bold;">¥{{ currentDetail.totalPrice }}</span>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 评价/追评弹窗 -->
    <el-dialog v-model="showEvaluateDialog" :title="evaluateType === 1 ? '评价订单' : '追评'" width="450px">
      <div v-if="evaluateType === 2" style="margin-bottom:16px;padding:10px;background:#fff7e6;border-radius:8px;font-size:14px;color:#e6a23c">
        您已评价过此订单，本次为追评
      </div>
      <el-form :model="evaluateForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="evaluateForm.score" :max="5" show-score />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="evaluateForm.content" type="textarea" :rows="4" placeholder="请描述您的用餐体验..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEvaluateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEvaluate">提交{{ evaluateType === 2 ? '追评' : '评价' }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看评价弹窗 -->
    <el-dialog v-model="showViewEvalDialog" title="我的评价" width="550px">
      <div v-if="viewEvalList.length === 0" style="text-align:center;padding:20px;color:#909399">暂无评价</div>
      
      <div v-else>
        <template v-for="(ev, idx) in viewEvalList" :key="ev.id">
          <div class="eval-card-item" :style="{ 
            marginLeft: ev.type === 2 ? '24px' : '0', 
            borderLeft: ev.type === 2 ? '3px solid #e6a23c' : 'none', 
            paddingLeft: ev.type === 2 ? '12px' : '0' 
          }">
            <div class="eval-header">
              <div class="eval-user">
                <span class="eval-username">{{ ev.username || '我' }}</span>
                <el-tag v-if="ev.type === 1" size="mini" type="success" style="margin-left:6px">首次评价</el-tag>
                <el-tag v-else size="mini" type="warning" style="margin-left:6px">追评</el-tag>
              </div>
              <div class="eval-right">
                <el-rate :model-value="ev.score" disabled show-score text-color="#ff9900" score-template="{value}分" />
                <span class="eval-time">{{ formatTime(ev.createTime) }}</span>
              </div>
            </div>
            <div class="eval-content">{{ ev.content }}</div>
            <!-- 删除评价按钮 -->
            <div style="text-align:right;margin-top:6px">
              <el-button 
                size="mini" 
                type="danger" 
                @click="handleDeleteEvaluate(ev)"
              >
                删除
              </el-button>
            </div>
            <!-- 追评分隔 -->
            <div v-if="ev.type === 1 && idx < viewEvalList.length - 1 && viewEvalList[idx + 1].type === 2" 
                style="text-align:center;color:#e6a23c;margin:8px 0;font-size:13px">
              ⬇ 追评
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="showViewEvalDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { getUserOrderList, cancelOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import { addEvaluate } from '@/api/coupon'
import request from '@/utils/request'

const orderList = ref([])
const loading = ref(true)

// 详情弹窗
const showDetail = ref(false)
const currentDetail = ref(null)
const goodsList = ref([])

//评价状态存储：直接用 reactive Map
// { [orderId]: { first: boolean, count: number } }
const evalStatusMap = reactive({})

// 评价弹窗
const showEvaluateDialog = ref(false)
const evaluateForm = ref({ orderId: null, shopId: null, score: 5, content: '' })
const evaluateType = ref(1) // 1-首次 2-追评

// 查看评价弹窗
const showViewEvalDialog = ref(false)
const viewEvalList = ref([])

// 状态文本
const getStatusText = (status) => {
  const map = { 1: '待接单', 2: '已接单', 3: '配送中', 4: '已完成', 5: '已取消' }
  return map[status] || '未知'
}
const getStatusTagType = (status) => {
  if (status === 4) return 'success'
  if (status === 5) return 'danger'
  if (status === 1) return 'warning'
  return 'primary'
}

// 获取订单是否有首次评价（从 evalStatusMap 中读取）
const getEvalFirst = (orderId) => {
  return evalStatusMap[orderId]?.first === true
}

//获取订单评价数量
const getEvalCount = (orderId) => {
  return evalStatusMap[orderId]?.count || 0
}

// 查询单个订单的评价状态
const loadSingleEvalStatus = async (orderId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/evaluate/check', {
      params: { orderId, userId: user.id }
    })
    const count = res.data || 0
    // 直接修改 reactive 对象，触发响应式更新
    evalStatusMap[orderId] = {
      first: count > 0,
      count: count
    }
    console.log(`✅ 评价状态已刷新 orderId=${orderId}, count=${count}, first=${count > 0}`)
    return true
  } catch (e) {
    console.error('加载评价状态失败', e)
    evalStatusMap[orderId] = { first: false, count: 0 }
    return false
  }
}
//删除评价
const handleDeleteEvaluate = async (ev) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.post('/evaluate/delete', {
      id: ev.id,
      userId: user.id
    })
    if (res.code === 200) {
      ElMessage.success('评价已删除')
      // 刷新当前查看的评价列表
      viewEvalList.value = viewEvalList.value.filter(e => e.id !== ev.id)
      // 刷新评价状态
      await loadSingleEvalStatus(ev.orderId)
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (e) {
    ElMessage.error('删除失败')
  }
}
// 批量加载所有已完成订单的评价状态
const loadAllEvalStatus = async () => {
  const completedOrders = orderList.value.filter(o => o.status === 4)
  if (completedOrders.length === 0) return
  
  // 并行加载提高效率
  const promises = completedOrders.map(o => loadSingleEvalStatus(o.id))
  await Promise.all(promises)
  console.log('✅ 所有评价状态加载完成', JSON.parse(JSON.stringify(evalStatusMap)))
}

// 打开评价弹窗
const openEvaluate = (order, type) => {
  evaluateType.value = type
  evaluateForm.value = {
    orderId: order.id,
    shopId: order.shopId,
    score: 5,
    content: ''
  }
  showEvaluateDialog.value = true
}

// 提交评价
const submitEvaluate = async () => {
  if (!evaluateForm.value.content.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await addEvaluate({
      orderId: evaluateForm.value.orderId,
      userId: user.id,
      shopId: evaluateForm.value.shopId,
      score: evaluateForm.value.score,
      content: evaluateForm.value.content
    })
    
    if (res.code === 200) {
      ElMessage.success(evaluateType.value === 2 ? '追评成功' : '评价成功')
      showEvaluateDialog.value = false
      
      // 🔥 关键修复：立即刷新该订单的评价状态
      await loadSingleEvalStatus(evaluateForm.value.orderId)
    } else {
      ElMessage.error(res.msg || '评价失败')
    }
  } catch (e) {
    ElMessage.error('评价失败')
  }
}

// 查看该订单的所有评价
const viewOrderEvaluates = async (order) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    console.log(`🔍 查看评价: orderId=${order.id}, userId=${user.id}`)
    
    const res = await request.get('/evaluate/order/list', {
      params: { orderId: order.id, userId: user.id }
    })
    
    viewEvalList.value = res.data || []
    console.log('✅ 加载评价列表成功', viewEvalList.value.length, '条')
    
    if (viewEvalList.value.length === 0) {
      ElMessage.info('暂无评价记录')
      return
    }
    
    showViewEvalDialog.value = true
  } catch (e) {
    console.error('加载评价失败', e)
    ElMessage.error('加载评价失败')
  }
}

// 打开订单详情
const openDetail = async (order) => {
  try {
    currentDetail.value = order
    const res = await request.get('/order/goods/detail', { params: { orderId: order.id } })
    goodsList.value = res.data || []
    const info = await request.get('/order/extra/info', { params: { orderId: order.id } })
    currentDetail.value = { ...order, ...info.data }
    showDetail.value = true
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

// 取消订单
const handleCancelOrder = async (orderId) => {
  try {
    await cancelOrder(orderId)
    ElMessage.success('取消成功')
    getOrderList()
  } catch (err) {
    ElMessage.error('取消失败')
  }
}

// 删除订单
const handleUserDeleteOrder = async (orderId) => {
  try {
    await request.post('/order/user/delete', { orderId })
    ElMessage.success('删除成功')
    getOrderList()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 获取订单列表
const getOrderList = async () => {
  try {
    loading.value = true
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await getUserOrderList(user.id)
    orderList.value = res.data || []
    
    //加载完后刷新评价状态
    await nextTick()
    await loadAllEvalStatus()
    
  } catch (err) {
    orderList.value = []
  } finally {
    loading.value = false
  }
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => { getOrderList() })
</script>

<style scoped>
.order-page { width: 100%; min-height: 100vh; background: #f8f9fa; }
.nav { width: 100%; background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; box-shadow: 0 4px 16px rgba(255,107,53,0.25); }
.nav :deep(.el-menu-item) { color: #fff; font-weight: 600; }
.nav :deep(.el-menu-item:hover), .nav :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; }
.container { width: 95%; max-width: 1000px; margin: 0 auto; padding: 28px 0; }
.text-center { text-align: center; }
.container h2 { font-size: 26px; font-weight: 800; color: #ff6b35; margin-bottom: 28px; letter-spacing: 1px; }
.order-item { margin-bottom: 20px; }
.order-item :deep(.el-card) { border-radius: 16px; border: none; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.loading { text-align: center; padding: 40px; color: #909399; font-size: 16px; }
.empty { text-align: center; padding: 60px; color: #909399; font-size: 18px; font-weight: 500; }
.order-page :deep(.el-dialog) { border-radius: 20px; overflow: hidden; }
.order-page :deep(.el-dialog__header) { background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%); margin: 0; padding: 20px; }
.order-page :deep(.el-dialog__title) { color: #ff6b35; font-weight: 700; }

/* 查看评价样式 */
.eval-card-item { padding: 0; }
.eval-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.eval-user { display: flex; align-items: center; }
.eval-username { font-weight: 700; font-size: 15px; color: #2c3e50; }
.eval-right { display: flex; align-items: center; gap: 12px; }
.eval-time { font-size: 12px; color: #999; }
.eval-content { font-size: 14px; color: #333; line-height: 1.6; padding: 4px 0 8px; }
</style>