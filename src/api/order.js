import request from '../utils/request'

// 创建订单
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

// 用户订单列表
export function getUserOrderList(userId) {
  return request({
    url: '/order/user/list',
    method: 'get',
    params: { userId }
  })
}

// 商家订单列表
export function getShopOrderList(shopId) {
  return request({
    url: '/order/shop/list',
    method: 'get',
    params: { shopId }
  })
}

// 商家接单
export function takeOrder(id) {
  return request({
    url: '/order/take',
    method: 'get',
    params: { id }
  })
}