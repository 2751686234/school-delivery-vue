import request from '../utils/request'

// 添加购物车
export function addCart(data) {
  return request({
    url: '/cart/add',
    method: 'post',
    data
  })
}

// 获取我的购物车
export function getCartList(userId) {
  return request({
    url: '/cart/list',
    method: 'get',
    params: { userId }
  })
}