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
                  <el-table-column prop="name" label="优惠券名称" align="center" />
                  <el-table-column prop="type" label="类型" align="center" />
                  <el-table-column prop="value" label="优惠金额" align="center" />
                  <el-table-column prop="count" label="发放数量" align="center" />
                  <el-table-column label="操作" align="center">
                    <template #default="scope">
                      <el-button size="mini" @click="handleEditCoupon(scope.row)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="handleDeleteCoupon(scope.row.id)">删除</el-button>
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
                  <el-table-column prop="condition" label="满减条件" align="center" />
                  <el-table-column prop="discount" label="减免金额" align="center" />
                  <el-table-column prop="status" label="状态" align="center">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                        {{ scope.row.status === 1 ? '生效中' : '已结束' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" align="center">
                    <template #default="scope">
                      <el-button size="mini" @click="handleEditDiscount(scope.row)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="handleDeleteDiscount(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 优惠券弹窗 -->
        <el-dialog v-model="showCouponDialog" title="{{ isCouponEdit ? '编辑优惠券' : '创建优惠券' }}" width="400px">
          <el-form :model="couponForm" label-width="100px">
            <el-form-item label="优惠券名称">
              <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
            </el-form-item>
            <el-form-item label="优惠类型">
              <el-radio-group v-model="couponForm.type">
                <el-radio label="满减券">满减券</el-radio>
                <el-radio label="折扣券">折扣券</el-radio>
                <el-radio label="无门槛券">无门槛券</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="优惠金额">
              <el-input v-model="couponForm.value" type="number" placeholder="请输入优惠金额/折扣" />
            </el-form-item>
            <el-form-item label="发放数量">
              <el-input v-model="couponForm.count" type="number" placeholder="请输入发放数量" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showCouponDialog = false">取消</el-button>
            <el-button type="primary" @click="submitCoupon">确认</el-button>
          </template>
        </el-dialog>

        <!-- 满减弹窗 -->
        <el-dialog v-model="showDiscountDialog" title="{{ isDiscountEdit ? '编辑满减' : '创建满减' }}" width="400px">
          <el-form :model="discountForm" label-width="100px">
            <el-form-item label="活动名称">
              <el-input v-model="discountForm.name" placeholder="请输入活动名称" />
            </el-form-item>
            <el-form-item label="满减条件">
              <el-input v-model="discountForm.condition" type="number" placeholder="满多少元减免" />
            </el-form-item>
            <el-form-item label="减免金额">
              <el-input v-model="discountForm.discount" type="number" placeholder="减免金额" />
            </el-form-item>
            <el-form-item label="活动状态">
              <el-radio-group v-model="discountForm.status">
                <el-radio label="1">生效中</el-radio>
                <el-radio label="0">已结束</el-radio>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
// 优惠券数据
const couponList = ref([
  { id: 1, name: '满30减5', type: '满减券', value: 5, count: 100 },
  { id: 2, name: '8折折扣券', type: '折扣券', value: 8, count: 50 },
  { id: 3, name: '无门槛10元券', type: '无门槛券', value: 10, count: 30 }
])
// 满减活动数据
const discountList = ref([
  { id: 1, name: '满50减10', condition: 50, discount: 10, status: 1 },
  { id: 2, name: '满80减20', condition: 80, discount: 20, status: 1 },
  { id: 3, name: '满100减30', condition: 100, discount: 30, status: 0 }
])

// 弹窗相关
const showCouponDialog = ref(false)
const showDiscountDialog = ref(false)
const isCouponEdit = ref(false)
const isDiscountEdit = ref(false)

// 表单数据
const couponForm = ref({ name: '', type: '满减券', value: '', count: '' })
const discountForm = ref({ name: '', condition: '', discount: '', status: 1 })

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 优惠券操作
const handleEditCoupon = (row) => {
  isCouponEdit.value = true
  couponForm.value = { ...row }
  showCouponDialog.value = true
}
const handleDeleteCoupon = (id) => {
  couponList.value = couponList.value.filter(item => item.id !== id)
  ElMessage.success('优惠券删除成功')
}
const submitCoupon = () => {
  if (!couponForm.value.name || !couponForm.value.value || !couponForm.value.count) {
    ElMessage.error('请填写完整信息')
    return
  }
  if (isCouponEdit.value) {
    const index = couponList.value.findIndex(item => item.id === couponForm.value.id)
    couponList.value[index] = { ...couponForm.value }
    ElMessage.success('优惠券编辑成功')
  } else {
    couponForm.value.id = couponList.value.length + 1
    couponList.value.push({ ...couponForm.value })
    ElMessage.success('优惠券创建成功')
  }
  showCouponDialog.value = false
  couponForm.value = { name: '', type: '满减券', value: '', count: '' }
  isCouponEdit.value = false
}

// 满减操作
const handleEditDiscount = (row) => {
  isDiscountEdit.value = true
  discountForm.value = { ...row }
  showDiscountDialog.value = true
}
const handleDeleteDiscount = (id) => {
  discountList.value = discountList.value.filter(item => item.id !== id)
  ElMessage.success('满减活动删除成功')
}
const submitDiscount = () => {
  if (!discountForm.value.name || !discountForm.value.condition || !discountForm.value.discount) {
    ElMessage.error('请填写完整信息')
    return
  }
  if (isDiscountEdit.value) {
    const index = discountList.value.findIndex(item => item.id === discountForm.value.id)
    discountList.value[index] = { ...discountForm.value }
    ElMessage.success('满减活动编辑成功')
  } else {
    discountForm.value.id = discountList.value.length + 1
    discountList.value.push({ ...discountForm.value })
    ElMessage.success('满减活动创建成功')
  }
  showDiscountDialog.value = false
  discountForm.value = { name: '', condition: '', discount: '', status: 1 }
  isDiscountEdit.value = false
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}
.nav-bar {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
  text-align: center !important;
}
.page-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
  text-align: center;
}
.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  text-align: center;
}
.card-container {
  padding: 20px;
  text-align: left;
}
.marketing-card {
  height: 100%;
  padding: 15px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}
.card-content {
  text-align: left;
}
</style>