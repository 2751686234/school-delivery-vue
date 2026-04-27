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
      <h2 class="page-title">商家设置</h2>
      <el-card class="card-container">
        <el-tabs type="border-card">
          <el-tab-pane label="店铺信息">
            <el-form :model="shopForm" label-width="120px" style="max-width:700px; margin:20px auto;">
              <el-form-item label="店铺名称">
                <el-input v-model="shopForm.name" />
              </el-form-item>

              <el-form-item label="店铺头像">
                <el-upload
                  action="http://localhost:8080/file/upload"
                  list-type="picture-card"
                  :on-success="handleUploadSuccess"
                  :file-list="avatarList"
                  :limit="1"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>

              <el-form-item label="联系电话">
                <el-input v-model="shopForm.phone" />
              </el-form-item>
              <el-form-item label="店铺地址">
                <el-input v-model="shopForm.address" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="营业时间">
                <el-input v-model="shopForm.time" placeholder="如：09:00 - 22:00" />
              </el-form-item>
              <el-form-item label="店铺简介">
                <el-input v-model="shopForm.desc" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveShop">保存店铺信息</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="账号安全">
            <el-form :model="pwdForm" label-width="120px" style="max-width:500px; margin:20px auto;">
              <el-form-item label="原密码">
                <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入当前密码" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="pwdForm.newPwd" type="password" placeholder="6-16位字母/数字" />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePwd">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="配送设置">
            <el-form :model="deliveryForm" label-width="120px" style="max-width:600px; margin:20px auto;">
              <el-form-item label="起送价">
                <el-input v-model.number="deliveryForm.startPrice" type="number" placeholder="请输入起送价" />
              </el-form-item>
              <el-form-item label="配送费">
                <el-input v-model.number="deliveryForm.fee" type="number" placeholder="请输入配送费" />
              </el-form-item>
              <el-form-item label="配送范围">
                <el-input v-model="deliveryForm.range" placeholder="单位：米" />
              </el-form-item>
              <el-form-item label="接单设置">
                <el-radio-group v-model="deliveryForm.autoAccept">
                  <el-radio value="1">自动接单</el-radio>
                  <el-radio value="0">手动接单</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveDelivery">保存配送设置</el-button>
              </el-form-item>
            </el-form>
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
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const shopForm = ref({
  name: '',
  phone: '',
  address: '',
  time: '',
  desc: '',
  avatar: ''
})

const deliveryForm = ref({
  startPrice: 0,
  fee: 0,
  range: '',
  autoAccept: '0'
})

const avatarList = ref([])
const pwdForm = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })

// 上传头像
const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    const url = res.data
    shopForm.value.avatar = url.startsWith('http://localhost:8080') ? url.replace('http://localhost:8080', '') : url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

// 加载配置
const loadSetting = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.get('/shop/setting/get', { params: { userId: user.id } })
    const data = res.data || {}

    shopForm.value = {
      name: data.name || '',
      phone: data.phone || '',
      address: data.address || '',
      time: data.time || '',
      desc: data.desc || '',
      avatar: data.avatar || ''
    }
    deliveryForm.value = {
      startPrice: data.startPrice || 0,
      fee: data.fee || 0,
      range: data.range || '',
      autoAccept: data.autoAccept != null ? String(data.autoAccept) : '0'
    }

    if (data.avatar) {
      avatarList.value = [{
        url: data.avatar.startsWith('http') ? data.avatar : 'http://localhost:8080' + data.avatar
      }]
    }
  } catch (e) {
    ElMessage.error('获取配置失败')
  }
}

// 保存店铺信息
const saveShop = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    let avatar = shopForm.value.avatar
    if (avatar.startsWith('http://localhost:8080')) avatar = avatar.replace('http://localhost:8080', '')

    await request.post('/shop/setting/save', {
      userId: user.id,
      name: shopForm.value.name,
      phone: shopForm.value.phone,
      address: shopForm.value.address,
      time: shopForm.value.time,
      desc: shopForm.value.desc,
      avatar: avatar,
      startPrice: deliveryForm.value.startPrice,
      fee: deliveryForm.value.fee,
      range: deliveryForm.value.range,
      autoAccept: deliveryForm.value.autoAccept
    })
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const updatePwd = async () => {
  const { oldPwd, newPwd, confirmPwd } = pwdForm.value
  if (!oldPwd || !newPwd || !confirmPwd) {
    ElMessage.error('请填写完整')
    return
  }
  if (newPwd !== confirmPwd) {
    ElMessage.error('两次密码不一致')
    return
  }
  if (newPwd.length < 6 || newPwd.length > 16) {
    ElMessage.error('新密码长度 6-16 位')
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const res = await request.post('/user/update-pwd', {
      id: user.id,
      oldPwd,
      newPwd
    })

    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      logout()
    } else {
      ElMessage.error(res.msg)
    }

  } catch (err) {
    ElMessage.error("原密码不正确")
  }
}

const saveDelivery = () => saveShop()
const logout = () => { localStorage.clear(); router.push('/login') }
onMounted(() => loadSetting())
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏统一 */
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
  max-width: 1000px;
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

/* Tabs 美化 */
.card-container :deep(.el-tabs__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  margin: -28px -28px 28px -28px;
  padding: 0 28px;
  border-radius: 20px 20px 0 0;
}
.card-container :deep(.el-tabs__item) {
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.3s;
}
.card-container :deep(.el-tabs__item:hover),
.card-container :deep(.el-tabs__item.is-active) {
  color: #3498db;
}
.card-container :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  height: 3px;
}

.card-container :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 2px solid #ecf0f1;
  padding: 8px 16px;
  transition: all 0.3s;
}
.card-container :deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.18);
}
.card-container .el-button--primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  border-radius: 12px;
  height: 42px;
  padding: 0 28px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(52, 152, 219, 0.35);
  transition: all 0.3s;
}
.card-container .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.45);
}
</style>