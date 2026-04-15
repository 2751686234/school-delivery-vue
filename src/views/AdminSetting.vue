<template>
<div class="wrap">
  <el-menu mode="horizontal" class="nav-bar">
    <el-menu-item @click="$router.push('/admin')">首页</el-menu-item>
    <el-menu-item @click="$router.push('/admin-user')">用户管理</el-menu-item>
    <el-menu-item @click="$router.push('/admin-shop')">商家管理</el-menu-item>
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
              <el-upload action="#" :file-list="logoList">
                <el-button type="primary">上传</el-button>
              </el-upload>
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
          <div style="padding:20px;text-align:center">
            登录日志 / 操作日志 / 异常日志 查看区域
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
const form = ref({ name:'校园外卖平台', servicePhone:'400-123-8888', rate:15 })
const logoList = ref([])
const pwd = ref({ old:'', new:'', confirm:'' })

const logout = () => { localStorage.clear(); router.push('/login') }
const save = () => ElMessage.success('系统设置已保存')
const updatePwd = () => {
  if(!pwd.old || !pwd.new || !pwd.confirm) return ElMessage.error('请填写完整')
  if(pwd.new !== pwd.confirm) return ElMessage.error('两次密码不一致')
  ElMessage.success('密码修改成功，请重新登录')
  logout()
}
</script>

<style scoped>
.wrap{width:100%;min-height:100vh;background:#f5f7fa}
.nav-bar{display:flex;justify-content:center}
.container{width:90%;max-width:1000px;margin:0 auto;padding:30px 0;text-align:center}
.title{font-size:22px;margin-bottom:20px}
</style>