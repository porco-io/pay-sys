import appRootPath from "app-root-path";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { hextob64, KJUR } from 'jsrsasign';
import crypto from 'crypto';
// import Qrcode from 'qrcode';
// import randomstring from 'crypto-random-string';
import randomstring from 'random-string';
import { apis } from "../api/apis";

/** 商户支付证书路径 */
const wxApiClientLicensePath = join(appRootPath.path, 'libs/wx_apiclient_key.pem');
const wxClientApiPrivateKey = readFileSync(wxApiClientLicensePath, { encoding: 'utf-8' });

/** 解析base64格式json对象 */
export const resolveBase64json = <T = any>(base64Str: string): T | void => {
  try {
    const str = Buffer.from(base64Str, 'base64').toString('utf-8');
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return;
  }
}

/** 获取微信accessToken */
export function getWxAccessToken() {
  return apis.wx.get<{
    access_token: string;
    expires_in: number;
  }>('/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: process.env.WX_APP_ID,
      secret: process.env.WX_APP_SECRET
    },
  });
}


/** 计算微信支付sign */
export const getWxPaySign = (params: {
  appId: string,
  timeStamp: string,
  nonceStr: string,
  package: string
}) => {
  const result = execSync(`echo -n -e \
 "${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n" \
   | openssl dgst -sha256 -sign ${wxApiClientLicensePath} \
   | openssl base64 -A`, {
    encoding: 'utf-8'
  });
  return result;
}


/** 
 * 计算微信商户接口sign 
 * 
 * 发起请求的商户（包括直连商户、服务商或渠道商）的商户号 mchid
 * 商户API证书序列号serial_no，用于声明所使用的证书
 * 请求随机串nonce_str
 * 时间戳timestamp
 * 签名值signature
*/
export const getWxShopApiSign = (params: {
  method: string,
  url: string,
  timestamp: string,
  nonce_str: string,
  body?: Record<string, any>
}) => {
  const paramStr = `${params.method}\n${params.url}\n${params.timestamp}\n${params.nonce_str}\n${params.body ? JSON.stringify(params.body) : ''}\n`;
  const sign = new KJUR.crypto.Signature({
    alg: 'SHA256withRSA'
  });
  sign.init(wxClientApiPrivateKey, process.env.WX_MCH_ID);
  return hextob64(sign.signString(paramStr));
}

/** 生成微信商户接口Auth请求头 */
export const getWxShopAuthorization = (params: {
  method: string,
  url: string,
  body?: Record<string, any>,
}) => {
  const mchid = process.env.WX_MCH_ID;
  const serial_no = process.env.WX_MCH_SERIAL_NO;
  const algo = 'WECHATPAY2-SHA256-RSA2048';
  const timestamp = Math.round(Date.now() / 1000);
  const nonce_str = randomstring({
    length: 12,
    numeric: true,
    letters: true,
    special: false,
  }).toUpperCase();
  const signature = getWxShopApiSign({
    method: params.method,
    url: params.url,
    timestamp: timestamp.toString(),
    nonce_str: nonce_str,
    body: params.body,
  });

  return `${algo} mchid="${mchid}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${serial_no}"`
}

/** 解密微信支付报文 */
export const decipherWxCallback = (ciphertext: string, nouce: string) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', process.env.WX_MCH_V3_KEY, nouce);
  const cipherBuffer = Buffer.from(ciphertext, 'base64');
  const authTag = cipherBuffer.subarray(-16);
  const dataBuffer = cipherBuffer.subarray(0, -16);
  decipher.setAuthTag(authTag);
  const decrypted = decipher.update(dataBuffer.toString('base64'), 'base64', 'utf-8');
  return decrypted;
}

/** 加密微信商户信息 */
export const encipherWxShopMessage = (content?: string, publicKey?: string) => {
  if (!content || !publicKey) return '';
  // 对明文进行加密
  const encrypted = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha1',
  }, Buffer.from(content));

  return encrypted.toString('base64');
}