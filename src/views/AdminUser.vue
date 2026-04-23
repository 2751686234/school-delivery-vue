<template>
  <div class="wrap">
    <el-menu mode="horizontal" class="nav-bar" v-model="activeMenu" router>
      <el-menu-item index="/admin">首页</el-menu-item>
      <el-menu-item index="/admin-user">用户管理</el-menu-item>
      <el-menu-item index="/admin-shop">商家管理</el-menu-item>
      <el-menu-item index="/admin-goods">商品管理</el-menu-item>
      <el-menu-item index="/admin-order">订单管理</el-menu-item>
      <el-menu-item index="/admin-finance">财务管理</el-menu-item>
      <el-menu-item index="/admin-content">内容管理</el-menu-item>
      <el-menu-item index="/admin-data">数据分析</el-menu-item>
      <el-menu-item index="/admin-setting">系统设置</el-menu-item>
      <el-menu-item @click="logout">退出</el-menu-item>
    </el-menu>

    <div class="container">
      <h2 class="title">用户管理</h2>
      <el-card>
        <div style="margin-bottom:15px; text-align:left;">
          <el-input v-model="key" placeholder="搜索姓名/账号/手机号" style="width:280px;margin-right:10px"/>
          <el-button type="primary" @click="loadList">搜索</el-button>
          <el-button @click="key=''; loadList()">重置</el-button>
        </div>

        <el-table :data="list" border align="center">
          <el-table-column prop="id" label="ID" width="80"/>
          <el-table-column prop="username" label="账号"/>
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="phone" label="手机"/>
          <el-table-column prop="address" label="地址"/>
          <el-table-column prop="role" label="角色" width="110">
            <template #default="scope">
              <el-tag :type="scope.row.role === 1 ? 'success' : scope.row.role === 2 ? 'primary' : scope.row.role === 3 ? 'warning' : 'info'">
                {{ scope.row.role === 1 ? '普通用户' : 
                   scope.row.role === 2 ? '商家' : 
                   scope.row.role === 3 ? '骑手' : '管理员' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280">
            <template #default="scope">
              <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
              <el-button size="small" :type="scope.row.status === 1 ? 'info' : 'success'" @click="toggleStatus(scope.row)">
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑用户" width="500px">
      <el-form label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editForm.address" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role">
            <el-option label="普通用户" :value="1" />
            <el-option label="商家" :value="2" />
            <el-option label="骑手" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
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

// 弹窗
const editVisible = ref(false)
const editForm = ref({
  id: '',
  name: '',
  phone: '',
  address: '',
  role: 1
})

// 加载用户
const loadList = async () => {
  try {
    const res = await request.get('/admin/user/list', { params: { key: key.value } })
    list.value = res.data || []
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

// 打开编辑
const openEdit = (row) => {
  editForm.value = { ...row }
  editVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  await request.post('/admin/user/update', editForm.value)
  ElMessage.success('保存成功')
  editVisible.value = false
  loadList()
}

// 删除
const deleteUser = async (id) => {
  await ElMessageBox.confirm('确定删除？')
  await request.post('/admin/user/delete', { id })
  ElMessage.success('删除成功')
  loadList()
}

// 状态切换
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  await request.post('/admin/user/updateStatus', { id: row.id, status: newStatus })
  row.status = newStatus
  ElMessage.success('状态已更新')
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
.container{width:90%;max-width:1200px;margin:0 auto;padding:30px 0}
.title{font-size:24px;margin-bottom:20px;text-align:center}
</style>