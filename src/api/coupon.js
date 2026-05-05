import request from '../utils/request'

// 获取用户可用优惠券
export function getUserCoupons(userId, shopId) {
  return request({
    url: '/user/coupon/list',
    method: 'get',
    params: { userId, shopId }
  })
}

// 获取店铺可领取的优惠券
export function getAvailableCoupons(shopId, userId) {
  return request({
    url: '/user/coupon/available',
    method: 'get',
    params: { shopId, userId }
  })
}

// 领取优惠券
export function claimCoupon(data) {
  return request({
    url: '/user/coupon/claim',
    method: 'post',
    data
  })
}

// 获取店铺满减活动
export function getShopDiscounts(shopId) {
  return request({
    url: '/user/discount/list',
    method: 'get',
    params: { shopId }
  })
}

// 添加评价
export function addEvaluate(data) {
  return request({
    url: '/evaluate/add',
    method: 'post',
    data
  })
}

// 查询店铺评价
export function getShopEvaluates(shopId) {
  return request({
    url: '/evaluate/list',
    method: 'get',
    params: { shopId }
  })
}

// 检查订单是否已评价
export function checkEvaluate(orderId, userId) {
  return request({
    url: '/evaluate/check',
    method: 'get',
    params: { orderId, userId }
  })
}