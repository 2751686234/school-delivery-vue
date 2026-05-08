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
      <h2 class="page-title">营销工具</h2>
      <el-card class="card-container">
        <el-row :gutter="20">
          <!-- 优惠券管理 -->
          <el-col :span="12">
            <el-card shadow="hover" class="marketing-card">
              <div class="card-title">优惠券管理</div>
              <div class="card-content">
                <el-button type="primary" @click="showCouponDialog = true" style="margin-bottom: 10px;">创建优惠券</el-button>
                <el-table :data="couponList" border style="width: 100%;" align="center" size="small">
                  <el-table-column prop="name" label="名称" align="center" />
                  <el-table-column prop="type" label="类型" align="center" width="80" />
                  <el-table-column label="优惠详情" align="center" width="120">
                    <template #default="scope">
                      <span v-if="scope.row.type === '满减券'">满{{ scope.row.minAmount }}减{{ scope.row.value }}</span>
                      <span v-else-if="scope.row.type === '折扣券'">{{ scope.row.value }}折</span>
                      <span v-else>减¥{{ scope.row.value }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="count" label="发放" align="center" width="60" />
                  <el-table-column prop="remaining" label="剩余" align="center" width="60" />
                  <el-table-column label="操作" align="center" width="140">
                    <template #default="scope">
                      <el-button size="small" @click="handleEditCoupon(scope.row)">编辑</el-button>
                      <el-button size="small" type="danger" @click="handleDeleteCoupon(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>

          <!-- 满减活动 -->
          <el-col :span="12">
            <el-card shadow="hover" class="marketing-card">
              <div class="card-title">满减活动</div>
              <div class="card-content">
                <el-button type="primary" @click="showDiscountDialog = true" style="margin-bottom: 10px;">创建满减</el-button>
                <el-table :data="discountList" border style="width: 100%;" align="center" size="small">
                  <el-table-column prop="name" label="活动名称" align="center" />
                  <el-table-column prop="condition" label="满" align="center" width="80" />
                  <el-table-column prop="discount" label="减" align="center" width="80" />
                  <el-table-column prop="status" label="状态" align="center" width="80">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                        {{ scope.row.status === 1 ? '生效中' : '已结束' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" align="center" width="140">
                    <template #default="scope">
                      <el-button size="small" @click="handleEditDiscount(scope.row)">编辑</el-button>
                      <el-button size="small" type="danger" @click="handleDeleteDiscount(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 优惠券弹窗 -->
        <el-dialog v-model="showCouponDialog" :title="isCouponEdit ? '编辑优惠券' : '创建优惠券'" width="450px">
          <el-form :model="couponForm" label-width="120px">
            <el-form-item label="优惠券名称">
              <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
            </el-form-item>
            <el-form-item label="优惠类型">
              <el-radio-group v-model="couponForm.type" @change="onCouponTypeChange">
                <el-radio value="满减券">满减券</el-radio>
                <el-radio value="折扣券">折扣券</el-radio>
                <el-radio value="无门槛券">无门槛券</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 满减券：满多少减多少 -->
            <template v-if="couponForm.type === '满减券'">
              <el-form-item label="满减门槛（元）">
                <el-input v-model="couponForm.minAmount" type="number" placeholder="满多少元可用" />
              </el-form-item>
              <el-form-item label="减免金额（元）">
                <el-input v-model="couponForm.value" type="number" placeholder="减多少元" />
              </el-form-item>
            </template>

            <!-- 折扣券：折扣率 -->
            <template v-if="couponForm.type === '折扣券'">
              <el-form-item label="折扣率">
                <el-input v-model="couponForm.value" type="number" placeholder="如：9 代表9折，8.5代表8.5折" />
                <div style="font-size:12px;color:#909399;margin-top:4px">
                  当前折扣：<b>{{ couponForm.value }}折</b>（即打{{ couponForm.value }}折）
                </div>
              </el-form-item>
            </template>

            <!-- 无门槛券 -->
            <template v-if="couponForm.type === '无门槛券'">
              <el-form-item label="减免金额（元）">
                <el-input v-model="couponForm.value" type="number" placeholder="直接减多少元" />
              </el-form-item>
            </template>

            <el-form-item label="发放数量">
              <el-input v-model="couponForm.count" type="number" placeholder="发放总数量" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showCouponDialog = false">取消</el-button>
            <el-button type="primary" @click="submitCoupon">确认</el-button>
          </template>
        </el-dialog>

        <!-- 满减弹窗 -->
        <el-dialog v-model="showDiscountDialog" :title="isDiscountEdit ? '编辑满减' : '创建满减'" width="400px">
          <el-form :model="discountForm" label-width="100px">
            <el-form-item label="活动名称">
              <el-input v-model="discountForm.name" placeholder="请输入活动名称" />
            </el-form-item>
            <el-form-item label="满">
              <el-input v-model="discountForm.condition" type="number" placeholder="满多少元" />
            </el-form-item>
            <el-form-item label="减">
              <el-input v-model="discountForm.discount" type="number" placeholder="减多少元" />
            </el-form-item>
            <el-form-item label="活动状态">
              <el-radio-group v-model="discountForm.status">
                <el-radio :value="1">生效中</el-radio>
                <el-radio :value="0">已结束</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showDiscountDialog = false">取消</el-button>
            <el-button type="primary" @click="submitDiscount">确认</el-button>
          </template>
        </el-dialog>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const userId = user.id

const couponList = ref([])
const discountList = ref([])

const getCoupon = async () => {
  const res = await request.get('/shop/marketing/coupon/list', { params: { userId } })
  couponList.value = res.data
}
const getDiscount = async () => {
  const res = await request.get('/shop/marketing/discount/list', { params: { userId } })
  discountList.value = res.data
}
onMounted(() => { getCoupon(); getDiscount() })

const showCouponDialog = ref(false)
const showDiscountDialog = ref(false)
const isCouponEdit = ref(false)
const isDiscountEdit = ref(false)

const couponForm = ref({ name: '', type: '满减券', value: '', minAmount: '', count: '' })
const discountForm = ref({ name: '', condition: '', discount: '', status: 1 })

// 优惠券类型切换时，重置相关字段
const onCouponTypeChange = () => {
  couponForm.value.value = ''
  couponForm.value.minAmount = ''
}

// 提交优惠券
const submitCoupon = async () => {
  if (!couponForm.value.name || !couponForm.value.value || !couponForm.value.count) {
    return ElMessage.error('请填写完整信息')
  }
  
  const data = {
    userId,
    name: couponForm.value.name,
    type: couponForm.value.type,
    value: couponForm.value.value,
    count: couponForm.value.count,
    minAmount: couponForm.value.minAmount || 0
  }

  try {
    if (isCouponEdit.value) {
      await request.post('/shop/marketing/coupon/update', { ...data, id: couponForm.value.id })
      ElMessage.success('修改成功')
    } else {
      await request.post('/shop/marketing/coupon/add', data)
      ElMessage.success('创建成功')
    }
    showCouponDialog.value = false
    getCoupon()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 删除优惠券
const handleDeleteCoupon = async (id) => {
  await request.get('/shop/marketing/coupon/delete', { params: { userId, id } })
  ElMessage.success('删除成功')
  getCoupon()
}

// 提交满减
const submitDiscount = async () => {
  if (!discountForm.value.name || !discountForm.value.condition || !discountForm.value.discount) {
    return ElMessage.error('请填写完整信息')
  }
  try {
    if (isDiscountEdit.value) {
      await request.post('/shop/marketing/discount/update', {
        userId, id: discountForm.value.id,
        name: discountForm.value.name,
        condition: discountForm.value.condition,
        discount: discountForm.value.discount,
        status: discountForm.value.status
      })
      ElMessage.success('修改成功')
    } else {
      await request.post('/shop/marketing/discount/add', {
        userId,
        name: discountForm.value.name,
        condition: discountForm.value.condition,
        discount: discountForm.value.discount,
        status: discountForm.value.status
      })
      ElMessage.success('创建成功')
    }
    showDiscountDialog.value = false
    getDiscount()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 删除满减
const handleDeleteDiscount = async (id) => {
  await request.get('/shop/marketing/discount/delete', { params: { userId, id } })
  ElMessage.success('删除成功')
  getDiscount()
}

const handleEditCoupon = (row) => {
  isCouponEdit.value = true
  couponForm.value = { 
    id: row.id,
    name: row.name, 
    type: row.type, 
    value: row.value, 
    minAmount: row.minAmount || '', 
    count: row.count 
  }
  showCouponDialog.value = true
}

const handleEditDiscount = (row) => {
  isDiscountEdit.value = true
  discountForm.value = { 
    id: row.id,
    name: row.name, 
    condition: row.condition, 
    discount: row.discount, 
    status: row.status 
  }
  showDiscountDialog.value = true
}

const handleAddCoupon = () => {
  isCouponEdit.value = false
  couponForm.value = { name: '', type: '满减券', value: '', minAmount: '', count: '' }
  showCouponDialog.value = true
}

const handleAddDiscount = () => {
  isDiscountEdit.value = false
  discountForm.value = { name: '', condition: '', discount: '', status: 1 }
  showDiscountDialog.value = true
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.page-wrapper { width: 100%; min-height: 100vh; background: #f5f7fa; }
.nav-bar { width: 100%; display: flex !important; justify-content: center !important; background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); border: none; box-shadow: 0 4px 16px rgba(44,62,80,0.25); }
.nav-bar :deep(.el-menu-item) { color: #ecf0f1; font-weight: 600; }
.nav-bar :deep(.el-menu-item:hover), .nav-bar :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.1); color: #3498db; }
.page-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 30px 0; text-align: center; }
.page-title { font-size: 24px; margin-bottom: 24px; font-weight: 800; color: #2c3e50; letter-spacing: 1px; }
.card-container { padding: 28px; border-radius: 20px; border: none; box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
.marketing-card { height: 100%; padding: 20px; border-radius: 16px; border: none; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.card-title { font-size: 18px; font-weight: 800; margin-bottom: 18px; text-align: center; color: #2c3e50; }
.card-content { text-align: left; }
.card-content .el-button--primary { background: linear-gradient(135deg, #ff7e5f 0%, #ff6b35 100%); border: none; border-radius: 12px; font-weight: 600; }
</style>