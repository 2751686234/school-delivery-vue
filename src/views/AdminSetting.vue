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
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1000px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>