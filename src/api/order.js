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
export function getShopOrderList(userId) {
  return request({
    url: '/order/shop/list',
    method: 'get',
    params: { userId }  
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
// 骑手取餐
export function riderTakeOrder(id) {
  return request({
    url: '/order/rider/take',
    method: 'get',
    params: { id }
  })
}

// 确认送达
export function completeOrder(id) {
  return request({
    url: '/order/complete',
    method: 'get',
    params: { id }
  })
}

// 商家取消订单
export function cancelShopOrder(id) {
  return request({
    url: '/order/shop/cancel',
    method: 'get',
    params: { id }
  })
}

// 用户取消订单
export function cancelOrder(id) {
  return request({
    url: '/order/cancel',
    method: 'get',
    params: { id }
  })
}

// 获取待取餐订单（骑手）
export function getWaitTakeOrder() {
  return request({
    url: '/order/waitTake',
    method: 'get'
  })
}