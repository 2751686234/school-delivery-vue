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
        <div class="search-add">

          <el-input
            v-model="searchKey"
            placeholder="搜索商品名称"
            style="width: 300px; margin-right: 10px;"
            @keyup.enter="getGoodsList"/>

          <el-button type="primary" @click="getGoodsList">搜索</el-button>
          <el-button style="margin-left:10px" @click="resetSearch">重置</el-button>

          <el-button type="primary" style="margin-left:10px" @click="showAddDialog = true">新增商品</el-button>
        </div>

        <el-table 
          :data="goodsList" 
          border 
          style="width: 100%; margin-top: 20px;" 
          align="center"
          @sort-change="handleSortChange"
        >
         
          <el-table-column prop="id" label="商品ID" align="center" sortable="custom" />
          <el-table-column prop="name" label="商品名称" align="center" sortable="custom" />

          <el-table-column label="商品图片" align="center">
            <template #default="scope">
              <img
                :src="scope.row.img"
                class="goods-img"
                @click="previewImg(scope.row.img)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="price" label="商品价格" align="center" sortable="custom" />
          
          <el-table-column prop="status" label="状态" align="center" sortable="custom">
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
              <el-button size="small" @click="handleStatus(scope.row.id)">
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-image-viewer
          v-if="showPreview"
          :url-list="[previewUrl]"
          @close="showPreview = false"
        />

        <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑商品' : '新增商品'" width="500px">
          <el-form :model="form" label-width="100px">
            <el-form-item label="商品名称">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="商品价格">
              <el-input v-model="form.price" type="number" placeholder="请输入商品价格" />
            </el-form-item>

            <el-form-item label="商品图片">
              <el-upload
                :auto-upload="false"
                :file-list="fileList"
                list-type="picture-card"
                @change="handleManualUpload"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>

            <el-form-item label="商品状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">上架</el-radio>
                <el-radio :value="0">下架</el-radio>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const goodsList = ref([])
const searchKey = ref('')

// 排序字段
const sort = ref({
  prop: '',
  order: ''
})

const showAddDialog = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', price: '', status: 1, img: '' })
const fileList = ref([])

const showPreview = ref(false)
const previewUrl = ref('')
const previewImg = (url) => {
  previewUrl.value = url
  showPreview.value = true
}

// 排序变化触发
const handleSortChange = ({ prop, order }) => {
  sort.value.prop = prop
  sort.value.order = order
  getGoodsList()
}

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id

// 带搜索 + 排序的查询
const getGoodsList = () => {
  request.get('/goods/list', {
    params: {
      userId,
      name: searchKey.value,
      sortProp: sort.value.prop,
      sortOrder: sort.value.order
    }
  }).then(res => {
    goodsList.value = res.data
    if (res.data.length === 0 && searchKey.value) {
      ElMessage.info('未找到相关商品')
    }
  })
}

const resetSearch = () => {
  searchKey.value = ''
  sort.value.prop = ''
  sort.value.order = ''
  getGoodsList()
  ElMessage.success('已重置搜索')
}

onMounted(() => getGoodsList())

const handleManualUpload = async (uploadFile) => {
  try {
    const formData = new FormData()
    formData.append('file', uploadFile.raw)
    const res = await request.post('/file/upload', formData)
    if (res.code === 200) {
      form.value.img = res.data
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('上传失败')
    }
  } catch (err) {
    ElMessage.error('上传失败')
  }
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  fileList.value = row.img ? [{ url: row.img }] : []
  showAddDialog.value = true
}

const handleDelete = async (id) => {
  await request.get('/goods/delete', { params: { id, userId } })
  ElMessage.success('删除成功')
  getGoodsList()
}

const handleStatus = async (id) => {
  await request.get('/goods/status', { params: { id, userId } })
  ElMessage.success('操作成功')
  getGoodsList()
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await request.post('/goods/update?userId=' + userId, form.value)
    } else {
      await request.post('/goods/add?userId=' + userId, form.value)
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')

    showAddDialog.value = false
    form.value = { name: '', price: '', status: 1, img: '' }
    fileList.value = []
    isEdit.value = false
    getGoodsList()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

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

/* 导航栏：专业深蓝渐变 */
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
  text-align: center;
}
.page-title {
  font-size: 24px;
  margin-bottom: 24px;
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
.search-add {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.search-add :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.search-add :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.search-add .el-button {
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  transition: all 0.3s;
}
.search-add .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
}
.search-add .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}

/* 表格美化 */
.page-wrapper :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.page-wrapper :deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  color: #2c3e50;
  font-weight: 700;
}
.goods-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
}
.goods-img:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

/* 弹窗美化 */
.page-wrapper :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.page-wrapper :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  margin: 0;
  padding: 22px 24px;
}
.page-wrapper :deep(.el-dialog__title) {
  color: #2c3e50;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
}
.page-wrapper :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.page-wrapper :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
</style>