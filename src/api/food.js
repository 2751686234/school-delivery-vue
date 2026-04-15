import request from '../utils/request'

export function getFoodList(shopId) {
  return request({
    url: '/food/list',
    method: 'get',
    params: { shopId }
  })
}

export function addFood(data) {
  return request({
    url: '/food/add',
    method: 'post',
    data
  })
}

export function updateFood(data) {
  return request({
    url: '/food/update',
    method: 'post',
    data
  })
}

export function deleteFood(id) {
  return request({
    url: '/food/delete',
    method: 'get',
    params: { id }
  })
}