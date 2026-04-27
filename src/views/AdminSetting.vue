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
    <h2 class="title">系统设置</h2>
    <el-card>
      <el-tabs type="border-card">

        <el-tab-pane label="基础设置">
          <el-form :model="form" label-width="150px" style="max-width:700px;margin:20px auto">
            <el-form-item label="平台名称">
              <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="平台LOGO">
              <el-upload
                action="http://localhost:8080/file/upload"
                :show-file-list="false"
                @success="uploadSuccess"
              >
                <el-button type="primary">点击上传LOGO</el-button>
              </el-upload>
              <div v-if="form.logo" style="margin-top:10px">
                <el-image :src="form.logo" style="width:100px;height:100px;object-fit:cover" />
              </div>
            </el-form-item>

            <el-form-item label="客服电话">
              <el-input v-model="form.servicePhone" />
            </el-form-item>

            <el-form-item label="平台抽成比例（%）">
              <el-input v-model="form.rate" type="number" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="save">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="管理员账号">
          <el-form :model="pwd" label-width="150px" style="max-width:600px;margin:20px auto">
            <el-form-item label="当前密码">
              <el-input v-model="pwd.old" type="password" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="pwd.new" type="password" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="pwd.confirm" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePwd">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="系统日志">
          <div style="padding: 20px">
            <el-table :data="logList" border>
              <el-table-column label="管理员" prop="username" />
              <el-table-column label="类型" prop="type" />
              <el-table-column label="内容" prop="content" />
              <el-table-column label="时间" prop="create_time" />
            </el-table>
          </div>
        </el-tab-pane>

      </el-tabs>
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
const user = JSON.parse(localStorage.getItem("user"))
const logList = ref([])
const form = ref({ name: '', logo: '', servicePhone: '', rate: 15 })
const pwd = ref({ old: '', new: '', confirm: '' })

// 加载配置
onMounted(() => {
  request.get('/admin/config/get').then(res => {
    form.value.name = res.data.platform_name
    form.value.logo = res.data.logo
    form.value.servicePhone = res.data.service_phone
    form.value.rate = res.data.platform_rate
  })
})

// 上传LOGO
const uploadSuccess = (res) => {
  if (res.code === 200) {
    form.value.logo = res.data
    ElMessage.success('LOGO上传成功')
  }
}

// 保存配置
const save = async () => {
  await request.post('/admin/config/save', form.value)
  ElMessage.success('系统设置已保存')
}

// 修改密码
const updatePwd = async () => {
  if (!pwd.value.old || !pwd.value.new || !pwd.value.confirm) {
    ElMessage.error('请填写完整')
    return
  }
  if (pwd.value.new !== pwd.value.confirm) {
    ElMessage.error('两次密码不一致')
    return
  }
  try {
    const res = await request.post('/admin/setting/update-pwd', {
      id: user.id,
      oldPwd: pwd.value.old,
      newPwd: pwd.value.new
    })
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      logout()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('系统异常')
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.wrap {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
.nav-bar {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #1a2a6c 0%, #2c3e50 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(26, 42, 108, 0.25);
}
.nav-bar :deep(.el-menu-item) {
  color: #ecf0f1;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-bar :deep(.el-menu-item:hover),
.nav-bar :deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.12);
  color: #3498db;
  border-bottom-color: #3498db;
}

.container {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 0;
  text-align: center;
}
.title {
  font-size: 26px;
  margin-bottom: 28px;
  font-weight: 800;
  color: #1a2a6c;
  letter-spacing: 1px;
}

.container > .el-card {
  padding: 0;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* Tabs 美化 */
.container > .el-card :deep(.el-tabs__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin: 0;
  padding: 0 28px;
}
.container > .el-card :deep(.el-tabs__item) {
  font-weight: 700;
  color: #7f8c8d;
  transition: all 0.3s;
}
.container > .el-card :deep(.el-tabs__item:hover),
.container > .el-card :deep(.el-tabs__item.is-active) {
  color: #1a2a6c;
}
.container > .el-card :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #1a2a6c 0%, #3498db 100%);
  height: 3px;
}

.container > .el-card :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.container > .el-card :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.container > .el-card .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  border-radius: 12px;
  height: 42px;
  padding: 0 28px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
  transition: all 0.3s;
}
.container > .el-card .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}

/* 表格美化 */
.wrap :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: none;
}
.wrap :deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #1a2a6c;
  font-weight: 800;
  font-size: 15px;
}
.wrap :deep(.el-table--border::after),
.wrap :deep(.el-table--group::after) {
  background-color: transparent;
}
</style>