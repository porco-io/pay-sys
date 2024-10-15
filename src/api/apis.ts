import axios, { AxiosRequestConfig } from 'axios';
import { getWxShopAuthorization } from '../utils/wxpay';
import { storage } from '../utils/storage';

/** 微信接口 */
const wx = axios.create({
  baseURL: process.env.WX_API,
})

wx.interceptors.request.use((config) => {
  config.params = {
    ...(config.params ?? {}),
    access_token: storage.wx_app_access_token || undefined
  }
  return config
})

/** wx商户 */
const wxShop = axios.create({
  baseURL: process.env.WX_MCH_API
})

// wxShop.interceptors.request.use((config) => {
//   // const headerAuthorization = getWxShopAuthorization({
//   //   body: config.data,
//   //   method: config.method?.toUpperCase() ?? '',
//   //   url: config.url!,
//   //   mchId: config['states']?.['mchId'],
//   //   serialNo: config['states']?.['serialNo'],
//   //   pem: config['states']?.['pem'],
//   // });
//   config.headers = config.headers.concat({
//     ...(config.headers ?? {}),
//   });
//   return config;

/** 高德地图api */
const amap = axios.create({
  baseURL: process.env.AMAP_HOST,
})

amap.interceptors.request.use((config) => {
  config.params = {
    ...(config.params ?? {}),
    key: process.env.AMAP_KEY,
  }
  return config
})

const qmap = axios.create({
  baseURL: process.env.QMAP_HOST,
})

qmap.interceptors.request.use((config) => {
  config.params = {
    ...(config.params ?? {}),
    key: process.env.QMAP_KEY,
  }
  return config
})


export const apis = {
  wx,
  amap,
  qmap,
  wxShop,
  axios: axios.create()
}