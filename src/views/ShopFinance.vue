<template>
  <div class="page-wrapper">
    <el-menu mode="horizontal" class="nav-bar">
      <el-menu-item index="1" @click="$router.push('/shop-admin')">商品管理</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/shop-order')">订单管理</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/shop-user')">客户管理</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/shop-finance')">财务管理</el-menu-item>
      <el-menu-item index="5" @click="$router.push('/shop-marketing')">营销工具</el-menu-item>
      <el-menu-item index="6" @click="$router.push('/shop-data')">数据分析</el-menu-item>
      <el-menu-item index="7" @click="$router.push('/shop-set')">设置</el-menu-item>
      <el-menu-item index="8" @click="logout">退出</el-menu-item>
    </el-menu>

    <div class="page-container">
      <h2 class="page-title">财务管理</h2>
      <el-card class="card-container">
        <!-- 财务概览 -->
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">今日收入</div>
              <div class="value">¥{{ todayIncome }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">本月收入</div>
              <div class="value">¥{{ monthIncome }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">今日订单数</div>
              <div class="value">{{ todayOrder }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="finance-card">
              <div class="title">本月订单数</div>
              <div class="value">{{ monthOrder }}</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 财务筛选 -->
        <div class="filter">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 300px; margin-right: 10px;"
          />
          <el-button type="primary" @click="searchFinance">查询</el-button>
          <el-button type="success" @click="exportExcel" style="margin-left: 10px;">导出报表</el-button>
        </div>

        <!-- 财务明细表格 -->
        <el-table :data="financeList" border style="width: 100%; margin-top: 20px;" align="center">
          <el-table-column prop="createTime" label="下单时间" align="center" />
          <el-table-column prop="orderNo" label="订单号" align="center" />
          <el-table-column prop="name" label="客户" align="center" />
          <el-table-column prop="totalPrice" label="金额" align="center" />
          <el-table-column prop="status" label="订单状态" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" @click="handleDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 账单详情弹窗 -->
      <el-dialog v-model="showDetail" title="账单详情" width="500px">
        <el-descriptions :column="1" border size="medium" align="center">
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ currentOrder.name || '未知客户' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.phone || '无' }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color:red;font-weight:bold">¥{{ currentOrder.totalPrice }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
        </el-descriptions>

        <template #footer>
          <el-button @click="showDetail = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

// 统计数据
const todayIncome = ref(0)
const monthIncome = ref(0)
const todayOrder = ref(0)
const monthOrder = ref(0)

// 列表与筛选
const financeList = ref([])
const dateRange = ref([])

// 详情弹窗
const showDetail = ref(false)
const currentOrder = ref({})

// 获取商家ID
const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id

// 获取财务总览
const getFinanceOverview = async () => {
  try {
    const res = await request.get('/shop/finance/overview', {
      params: { userId }
    })
    const data = res.data || {}
    todayIncome.value = data.todayIncome ?? 0
    monthIncome.value = data.monthIncome ?? 0
    todayOrder.value = data.todayOrder ?? 0
    monthOrder.value = data.monthOrder ?? 0
  } catch (err) {
    ElMessage.error('获取财务统计失败')
  }
}

// 获取财务明细
const getFinanceList = async (startDate = '', endDate = '') => {
  try {
    const params = { userId }
    if (startDate && endDate) {
      params.startDate = startDate
      params.endDate = endDate
    }
    const res = await request.get('/shop/finance/list', { params })
    financeList.value = res.data || []
  } catch (err) {
    ElMessage.error('获取财务明细失败')
  }
}

// 页面初始化
onMounted(() => {
  if (!userId) {
    ElMessage.error('请先登录')
    return
  }
  getFinanceOverview()
  getFinanceList()
})

// 日期查询
const searchFinance = () => {
  if (!dateRange.value || dateRange.value.length < 2) {
    ElMessage.warning('请选择日期范围')
    return
  }
  const [start, end] = dateRange.value
  getFinanceList(start, end)
  ElMessage.success('查询成功')
}

// 导出报表（真实实现）
const exportExcel = async () => {
  try {
    // 支持按筛选条件导出
    const params = { userId }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const res = await request({
      url: '/shop/finance/export',
      method: 'get',
      params,
      responseType: 'blob'
    })

    // 下载文件
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `商家财务报表_${new Date().getTime()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('报表导出成功！')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

// 查看订单详情 → 弹窗
const handleDetail = (row) => {
  currentOrder.value = row
  showDetail.value = true
}

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

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
.nav-bar {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.25);
}
.nav-bar :deep(.el-menu-item) {
  color: #ecf0f1;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-bar :deep(.el-menu-item:hover),
.nav-bar :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.1);
  color: #3498db;
  border-bottom-color: #3498db;
}

.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
}
.page-title {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 1px;
}
.card-container {
  padding: 28px;
  text-align: left;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}

/* 财务数据卡片：渐变背景 */
.finance-card {
  text-align: center;
  padding: 24px 0;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  transition: all 0.3s;
}
.finance-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}
.finance-card .title {
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10px;
  font-weight: 600;
}
.finance-card .value {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
}

.filter {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 12px;
}
.filter :deep(.el-input__wrapper),
.filter :deep(.el-date-editor) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.filter :deep(.el-input__wrapper.is-focus),
.filter :deep(.el-date-editor.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.filter .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  transition: all 0.3s;
}
.filter .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
}
.filter .el-button--success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(17, 153, 142, 0.35);
}
.filter .el-button:hover {
  transform: translateY(-2px);
}
</style>