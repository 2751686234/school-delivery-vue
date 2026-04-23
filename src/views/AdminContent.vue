<template>
<div class="wrap">
  <el-menu mode="horizontal" class="nav-bar">
    <el-menu-item @click="$router.push('/admin')">首页</el-menu-item>
    <el-menu-item @click="$router.push('/admin-user')">用户管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-shop')">商店管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-goods')">商品管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-order')">订单管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-finance')">财务管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-content')">内容管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-data')">数据分析</el-menu-item>
    <el-menu-item @click="$router.push('/admin-setting')">系统设置</el-menu-item>
    <el-menu-item @click="logout">退出</el-menu-item>
  </el-menu>

  <div class="container">
    <h2 class="title">内容管理（轮播/公告/活动）</h2>
    <el-card>
      <el-button type="success" style="margin-bottom:15px" @click="add">新增内容</el-button>
      <el-table :data="list" border align="center">
        <el-table-column prop="id" label="ID"/>
        <el-table-column prop="title" label="标题"/>
        <el-table-column prop="image" label="图片">
          <template #default="scope">
            <div v-if="scope.row.image">
              <el-image :src="scope.row.image" style="width:50px;height:50px;object-fit:cover"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            {{ scope.row.type == 1 ? '轮播图' : scope.row.type == 2 ? '公告' : '活动' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'">
              {{ scope.row.status == 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <el-dialog v-model="dialogVisible" title="内容编辑" width="500px">
    <el-form label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入标题"/>
      </el-form-item>
      <el-form-item label="图片">
        <div v-if="form.image" style="margin-bottom:8px">
          <el-image :src="form.image" style="width:80px;height:80px;object-fit:cover" fit="cover"/>
        </div>
        <el-upload
          action="http://localhost:8080/file/upload"
          :show-file-list="false"
          @success="uploadSuccess"
        >
          <el-button type="primary" size="small">点击上传图片</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="类型">
        <el-select v-model="form.type" style="width:100%">
          <el-option label="轮播图" :value="1"/>
          <el-option label="公告" :value="2"/>
          <el-option label="活动" :value="3"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" style="width:100%">
          <el-option label="显示" :value="1"/>
          <el-option label="隐藏" :value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item label="详情">
        <el-input v-model="form.content" type="textarea" rows="4"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const list = ref([])
const dialogVisible = ref(false)
const form = ref({
  id: null,
  title: '',
  image: '',
  content: '',
  type: 1,
  status: 1
})

// 图片上传成功
const uploadSuccess = (res) => {
  if (res.code === 200) {
    form.value.image = res.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const loadList = async () => {
  const res = await request.get('/admin/content/list')
  list.value = res.data
}

const add = () => {
  form.value = { id: null, title: '', image: '', content: '', type: 1, status: 1 }
  dialogVisible.value = true
}

const edit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const save = async () => {
  if (form.value.id) {
    await request.post('/admin/content/update', form.value)
  } else {
    await request.post('/admin/content/add', form.value)
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadList()
}

const del = async (id) => {
  await request.get('/admin/content/delete?id=' + id)
  ElMessage.success('删除成功')
  loadList()
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>