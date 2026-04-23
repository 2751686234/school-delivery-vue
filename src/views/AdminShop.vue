<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav-bar" v-model="activeMenu" router>
      <el-menu-item index="/admin">首页</el-menu-item>
      <el-menu-item index="/admin-user">用户管理</el-menu-item>
      <el-menu-item index="/admin-shop">商店管理</el-menu-item>
      <el-menu-item index="/admin-goods">商品管理</el-menu-item>
      <el-menu-item index="/admin-order">订单管理</el-menu-item>
      <el-menu-item index="/admin-finance">财务管理</el-menu-item>
      <el-menu-item index="/admin-content">内容管理</el-menu-item>
      <el-menu-item index="/admin-data">数据分析</el-menu-item>
      <el-menu-item index="/admin-setting">系统设置</el-menu-item>
      <el-menu-item @click="logout">退出</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">商店管理</h2>
      <el-card>
        <div style="margin-bottom:15px; text-align:left;">
          <el-input v-model="key" placeholder="搜索商店名称" style="width:280px;margin-right:10px"/>
          <el-button type="primary" @click="loadList">搜索</el-button>
          <el-button @click="key=''; loadList()">重置</el-button>
          <el-button type="success" @click="openAdd">新增商店</el-button>
        </div>

        <el-table :data="list" border align="center">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="商店名称" />

          <!-- 商家信息 -->
          <el-table-column prop="merchantUsername" label="商家账号" width="130" />
          <el-table-column prop="merchantName" label="商家姓名" width="120" />
          <el-table-column prop="merchantPhone" label="商家电话" width="130" />

          <el-table-column prop="logo" label="Logo">
            <template #default="scope">
              <img 
                :src="'http://localhost:8080' + scope.row.logo" 
                style="width:40px;height:40px;border-radius:4px;object-fit:cover" 
                v-if="scope.row.logo && scope.row.logo.trim() !== ''"
              />
              <img 
                src="https://img.icons8.com/fluency/96/store.png" 
                style="width:40px;height:40px;border-radius:4px" 
                v-else
              />
            </template>
          </el-table-column>

          <el-table-column prop="lng" label="经度" />
          <el-table-column prop="lat" label="纬度" />
          <el-table-column prop="status" label="营业状态" width="110">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '营业中' : '已停业' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
              <el-button size="small" :type="scope.row.status === 1 ? 'info' : 'success'" @click="toggleStatus(scope.row)">
                {{ scope.row.status === 1 ? '停业' : '营业' }}
              </el-button>
              <el-button size="small" type="danger" @click="deleteShop(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" title="商店信息" width="520px">
      <el-form label-width="100px">
        <el-form-item label="商店名称">
          <el-input v-model="form.name" />
        </el-form-item>

        <!-- 绑定商家ID -->
        <el-form-item label="绑定商家ID">
          <el-input v-model.number="form.userId" placeholder="请输入用户表中的商家ID" />
        </el-form-item>

        <el-form-item label="Logo">
          <el-input v-model="form.logo" placeholder="输入图片路径" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="form.lng" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="form.lat" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveShop">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const activeMenu = ref(route.path)

const key = ref('')
const list = ref([])
const dialogVisible = ref(false)
const form = ref({ 
  id: '', 
  name: '', 
  userId: '', 
  logo: '', 
  lng: '', 
  lat: '', 
  status: 1 
})

// 加载列表
const loadList = async () => {
  const res = await request.get('/admin/shop/list', { params: { key: key.value } })
  list.value = res.data || []
}

// 新增
const openAdd = () => {
  form.value = { id: '', name: '', userId: '', logo: '', lng: '', lat: '', status: 1 }
  dialogVisible.value = true
}

// 编辑
const openEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

// 保存
const saveShop = async () => {
  await request.post('/admin/shop/save', form.value)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadList()
}

// 营业/停业切换
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  await request.post('/admin/shop/updateStatus', { id: row.id, status: newStatus })
  row.status = newStatus
  ElMessage.success('状态已更新')
}

// 删除
const deleteShop = async (id) => {
  await ElMessageBox.confirm('确定删除该商店？')
  await request.post('/admin/shop/delete', { id })
  ElMessage.success('删除成功')
  loadList()
}

// 退出
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
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0}
.title{font-size:24px;margin-bottom:20px;text-align:center}
</style>