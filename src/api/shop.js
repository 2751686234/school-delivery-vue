import request from '../utils/request'

// 获取商家列表
export function getShopList() {
  return request({
    url: '/shop/list',
    method: 'get'
  })
}

// 添加商家
export function addShop(data) {
  return request({
    url: '/shop/add',
    method: 'post',
    data
  })
}