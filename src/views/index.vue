<template>
  <div>
    <h1>欢迎使用校园外卖系统</h1>
    <el-button @click="$router.push('/shop')">浏览商家</el-button>
    <el-button @click="$router.push('/order')">我的订单</el-button>
    <el-button @click="$router.push('/map')">配送地图</el-button>
  </div>
</template>