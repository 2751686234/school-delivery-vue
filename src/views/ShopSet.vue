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
                <el-input v-model="pwdForm.oldPwd" type="password" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="pwdForm.newPwd" type="password" />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="pwdForm.confirmPwd" type="password" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePwd">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="配送设置">
            <el-form :model="deliveryForm" label-width="120px" style="max-width:600px; margin:20px auto;">
              <el-form-item label="起送价">
                <el-input v-model="deliveryForm.startPrice" type="number" />
              </el-form-item>
              <el-form-item label="配送费">
                <el-input v-model="deliveryForm.fee" type="number" />
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

// 上传成功
const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    const url = res.data
    if (url.startsWith('http://localhost:8080')) {
      shopForm.value.avatar = url.replace('http://localhost:8080', '')
    } else {
      shopForm.value.avatar = url
    }
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

// 加载
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

    // 显示用的图片列表
    if (data.avatar) {
      avatarList.value = [{ 
        url: data.avatar.startsWith('http') 
          ? data.avatar 
          : 'http://localhost:8080' + data.avatar 
      }]
    }
  } catch (e) {
    ElMessage.error('获取配置失败')
  }
}

// 保存时确保只存相对路径
const saveShop = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))

    // 确保avatar是相对路径
    let finalAvatar = shopForm.value.avatar
    if (finalAvatar.startsWith('http://localhost:8080')) {
      finalAvatar = finalAvatar.replace('http://localhost:8080', '')
    }

    await request.post('/shop/setting/save', {
      userId: user.id,
      name: shopForm.value.name,
      phone: shopForm.value.phone,
      address: shopForm.value.address,
      time: shopForm.value.time,
      desc: shopForm.value.desc,
      avatar: finalAvatar,
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

const updatePwd = () => {
  if (!pwdForm.value.oldPwd || !pwdForm.value.newPwd || !pwdForm.value.confirmPwd) {
    ElMessage.error('请填写完整')
    return
  }
  if (pwdForm.value.newPwd !== pwdForm.value.confirmPwd) {
    ElMessage.error('两次密码不一致')
    return
  }
  ElMessage.success('密码修改成功')
  logout()
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
.nav-bar {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
}
.page-container {
  width: 90%;
  max-width: 1000px;
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
</style>