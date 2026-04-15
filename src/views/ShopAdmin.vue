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
      <h2 class="page-title">商品管理</h2>
      <el-card class="card-container">
        <!-- 商品搜索 + 新增按钮 -->
        <div class="search-add">
          <el-input v-model="searchKey" placeholder="搜索商品名称" style="width: 300px; margin-right: 10px;" />
          <el-button type="primary" @click="showAddDialog = true">新增商品</el-button>
        </div>

        <!-- 商品表格 -->
        <el-table :data="goodsList" border style="width: 100%; margin-top: 20px;" align="center">
          <el-table-column prop="id" label="商品ID" align="center" />
          <el-table-column prop="name" label="商品名称" align="center" />
          <el-table-column prop="price" label="商品价格" align="center" />
          <el-table-column prop="stock" label="库存" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
              <el-button size="small" @click="handleStatus(scope.row)">
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增/编辑商品弹窗 -->
        <el-dialog v-model="showAddDialog" title="{{ isEdit ? '编辑商品' : '新增商品' }}" width="500px">
          <el-form :model="form" label-width="100px">
            <el-form-item label="商品名称">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="商品价格">
              <el-input v-model="form.price" type="number" placeholder="请输入商品价格" />
            </el-form-item>
            <el-form-item label="商品库存">
              <el-input v-model="form.stock" type="number" placeholder="请输入商品库存" />
            </el-form-item>
            <el-form-item label="商品图片">
              <el-upload action="#" :file-list="fileList" list-type="picture-card">
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
            <el-form-item label="商品状态">
              <el-radio-group v-model="form.status">
                <el-radio label="1">上架</el-radio>
                <el-radio label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
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
// 模拟商品数据
const goodsList = ref([
  { id: 1, name: '香辣鸡腿堡', price: 15.9, stock: 100, status: 1 },
  { id: 2, name: '上校鸡块', price: 8.9, stock: 80, status: 1 },
  { id: 3, name: '珍珠奶茶', price: 12.9, stock: 120, status: 0 },
  { id: 4, name: '薯条', price: 6.9, stock: 90, status: 1 }
])
const searchKey = ref('')
const showAddDialog = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', price: '', stock: '', status: 1 })
const fileList = ref([])

// 退出登录
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  showAddDialog.value = true
}

// 删除商品
const handleDelete = (id) => {
  goodsList.value = goodsList.value.filter(item => item.id !== id)
  ElMessage.success('删除成功')
}

// 上下架商品
const handleStatus = (row) => {
  row.status = row.status === 1 ? 0 : 1
  ElMessage.success(`${row.status === 1 ? '上架' : '下架'}成功`)
}

// 提交表单（新增/编辑）
const submitForm = () => {
  if (isEdit.value) {
    const index = goodsList.value.findIndex(item => item.id === form.value.id)
    goodsList.value[index] = { ...form.value }
    ElMessage.success('编辑商品成功')
  } else {
    form.value.id = goodsList.value.length + 1
    goodsList.value.push({ ...form.value })
    ElMessage.success('新增商品成功')
  }
  showAddDialog.value = false
  form.value = { name: '', price: '', stock: '', status: 1 }
  fileList.value = []
  isEdit.value = false
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
.search-add {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>