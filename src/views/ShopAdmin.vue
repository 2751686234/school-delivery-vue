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
.nav-bar {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
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
}
.card-container {
  padding: 20px;
  text-align: left;
}
.search-add {
  display: flex;
  align-items: center;
}
.goods-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}
</style>