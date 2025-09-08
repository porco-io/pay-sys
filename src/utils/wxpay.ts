import { hextob64, KJUR } from "jsrsasign";
import randomstring from "random-string";
import { apis } from "../api/apis";
import { httpError, Provide } from "@midwayjs/core";
import crypto from "crypto";
import axios from "axios";
import { CacheManager } from "@midwayjs/cache-manager";
import { nanoRandom } from "./cipher";
import { loggers } from "./loggers";

/** 解析base64格式json对象 */
export const resolveBase64json = <T = any>(base64Str: string): T | void => {
  try {
    const str = Buffer.from(base64Str, "base64").toString("utf-8");
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return;
  }
};

/** 获取微信accessToken */
export function getWxAccessToken() {
  return apis.wx.get<{
    access_token: string;
    expires_in: number;
  }>("/cgi-bin/token", {
    params: {
      grant_type: "client_credential",
      appid: process.env.WX_APP_ID,
      secret: process.env.WX_APP_SECRET,
    },
  });
}

/** 计算微信支付sign */
// HTTP请求方法\n
// URL\n
// 请求时间戳\n
// 请求随机串\n
// 请求报文主体\n
export const getWxPaySign = (params: {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  pem: string;
}) => {
  const signStr = `${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  sig.init(params.pem);
  sig.updateString(signStr);
  const signature = sig.sign();
  // 将签名转换为 Base64 格式
  const base64Signature = hextob64(signature);
  return base64Signature;

  //   const result = execSync(`echo -n -e \
  //  "${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n" \
  //    | openssl dgst -sha256 -sign ${wxApiClientLicensePath} \
  //    | openssl base64 -A`, {
  //     encoding: 'utf-8'
  //   });
  //   return result;
};

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
  mchId: string;
  method: string;
  url: string;
  timestamp: string;
  nonce_str: string;
  body?: Record<string, any>;
  pem: string;
}) => {
  const paramStr = `${params.method}\n${params.url}\n${params.timestamp}\n${
    params.nonce_str
  }\n${params.body ? JSON.stringify(params.body) : ""}\n`;
  const sign = new KJUR.crypto.Signature({
    alg: "SHA256withRSA",
  });
  sign.init(params.pem, params.mchId);
  return hextob64(sign.signString(paramStr));
};

/** 生成微信商户接口Auth请求头 */
export const getWxShopAuthorization = (params: {
  method: string;
  url: string;
  body?: Record<string, any>;
  mchId: string;
  serialNo: string;
  pem: string;
}) => {
  const algo = "WECHATPAY2-SHA256-RSA2048";
  const timestamp = Math.round(Date.now() / 1000);
  const nonce_str = randomstring({
    length: 12,
    numeric: true,
    letters: true,
    special: false,
  }).toUpperCase();
  const signature = getWxShopApiSign({
    method: params.method.toUpperCase(),
    url: params.url,
    timestamp: timestamp.toString(),
    nonce_str: nonce_str,
    body: params.body,
    mchId: params.mchId,
    pem: params.pem,
  });

  return `${algo} mchid="${params.mchId}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${params.serialNo}"`;
};

/** 解密微信支付报文 */
// export const decipherWxCallback = (ciphertext: string, nouce: string) => {
//   const decipher = crypto.createDecipheriv('aes-256-gcm', process.env.WX_MCH_V3_KEY, nouce);
//   const cipherBuffer = Buffer.from(ciphertext, 'base64');
//   const authTag = cipherBuffer.subarray(-16);
//   const dataBuffer = cipherBuffer.subarray(0, -16);
//   decipher.setAuthTag(authTag);
//   const decrypted = decipher.update(dataBuffer.toString('base64'), 'base64', 'utf-8');
//   return decrypted;
// }

// /** 加密微信商户信息 */
// export const encipherWxShopMessage = (content?: string, publicKey?: string) => {
//   if (!content || !publicKey) return '';
//   // 对明文进行加密
//   const encrypted = crypto.publicEncrypt({
//     key: publicKey,
//     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//     oaepHash: 'sha1',
//   }, Buffer.from(content));

//   return encrypted.toString('base64');
// }

// export class WxPayConfig implements IStruct.WxPayConfig {
//   APP_ID: string;
//   MCH_ID: string;
//   API_KEY: string;
//   constructor(config: IStruct.WxPayConfig) {
//     this.APP_ID = config.APP_ID;
//     this.MCH_ID = config.MCH_ID;
//     this.API_KEY = config.MCH_V3_KEY;
//   }
// }

/** 微信商铺API工具 */
export class WxPayUtil {
  config: IStruct.WxPayConfig;

  constructor(config: IStruct.WxPayConfig) {
    this.config = config;
  }

  /** 生成微信商户接口Auth请求头 */
  getAuthorization(params: {
    method: string;
    url: string;
    body?: Record<string, any>;
  }) {
    const { method, url, body } = params;
    const timestamp = Math.round(Date.now() / 1000).toString();
    const nonce_str = randomstring({
      length: 12,
      numeric: true,
      letters: true,
      special: false,
    }).toUpperCase();
    const signature = this.getAuthSign({
      method: method.toUpperCase(),
      url,
      body,
      timestamp,
      nonce_str,
    });
    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.config.MCH_ID}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.config.MCH_SERIAL_NO}"`;
  }

  /** app下单 - 返回prepay_id */
  async appPrepay(params: {
    /** 商品描述 */
    description: string;
    /** 支付单 */
    paySn: string;
    /** 内部订单号 */
    orderSn: string;
    /** 过期时间 */
    time_expire: string;
    /** 附加数据 */
    attach: string;
    /** 支付金额 */
    payAmount: number;
  }) {
    /** 支付回调地址 */
    const payCallback = `${process.env.SERVER_HOST}/api/pay/wxCallback/${params.paySn}`;
    console.log('wx:pay_notify', payCallback);
    const prepayApi = "/v3/pay/transactions/app";
    const wxPayParams = {
      mchid: this.config.MCH_ID,
      description: params.description ?? "",
      out_trade_no: params.orderSn,
      /* 交易结束时间 */
      time_expire: params.time_expire,
      attach: params.attach ?? "",
      notify_url: payCallback,
      amount: {
        total: params.payAmount || 1,
        currency: "CNY",
      },
    };

    const resp = await apis.wxShop.post<{
      prepay_id: string;
      code?: string;
      message?: string;
    }>(prepayApi, wxPayParams, {
      validateStatus: (status) => status < 500,
      headers: {
        Accept: "application/json",
        Authorization: this.getAuthorization({
          method: "POST",
          url: prepayApi,
          body: wxPayParams,
        }),
      },
    });
    // this.logger.info("prepay_id:", resp.data);
    if (!resp.data.prepay_id) {
      throw new httpError.BadRequestError(`微信下单失败, ${resp.data.message}`);
    }
    return resp.data.prepay_id;
  }

  /**
   * native下单 - 返回code_url
   * 通过本接口来生成支付链接参数code_url，然后将该参数值生成二维码图片展示给用户。用户在使用微信客户端扫描二维码后，可以直接跳转到微信支付页面完成支付操作。
   */
  async nativePrepay(params: {
    /** 应用id */
    appId: string, 
    /** 商品描述 */
    description: string;
    /** 支付单 */
    paySn: string;
    /** 内部订单号 */
    orderSn: string;
    /** 过期时间 */
    time_expire: string;
    /** 附加数据 */
    attach: string;
    /** 支付金额 */
    payAmount: number;
  }) {
    /** 支付回调地址 */
    const payCallback = `${process.env.SERVER_HOST}/api/pay/wxCallback/${params.paySn}`;
    const prepayApi = "/v3/pay/transactions/native";
    const wxPayParams = {
      appid: params.appId.trim(),
      mchid: this.config.MCH_ID.trim(),
      description: params.description ?? "",
      out_trade_no: params.orderSn,
      /* 交易结束时间 */
      time_expire: params.time_expire,
      attach: params.attach ?? "",
      notify_url: payCallback,
      amount: {
        total: params.payAmount || 1,
        currency: "CNY",
      },
    };

    const resp = await apis.wxShop.post<{
      code_url: string;
      code?: string;
      message?: string;
    }>(prepayApi, wxPayParams, {
      validateStatus: (status) => status < 500,
      headers: {
        Accept: "application/json",
        Authorization: this.getAuthorization({
          method: "POST",
          url: prepayApi,
          body: wxPayParams,
        }),
      },
    });
    // this.logger.info("code_url:", resp.data);
    if (!resp.data.code_url) {
      throw new httpError.BadRequestError(`微信下单失败, ${resp.data.message}`);
    }
    return resp.data.code_url;
  }

  /** h5下单 - 返回h5_url */
  async h5Prepay(params: {
    /** 商品描述 */
    description: string;
    /** 支付单 */
    paySn: string;
    /** 内部订单号 */
    orderSn: string;
    /** 过期时间 */
    time_expire: string;
    /** 附加数据 */
    attach: string;
    /** 支付金额 */
    payAmount: number;
    /** 场景信息 */
    scene_info: {
      payer_client_ip: string;
      h5_info: {
        type: string;
      };
    };
  }) {
    /** 支付回调地址 */
    const payCallback = `${process.env.SERVER_HOST}/v1/pay/wxCallback/${params.paySn}`;
    const prepayApi = "/v3/pay/transactions/h5";
    const wxPayParams = {
      mchid: this.config.MCH_ID,
      description: params.description ?? "",
      out_trade_no: params.orderSn,
      /* 交易结束时间 */
      time_expire: params.time_expire,
      attach: params.attach ?? "",
      notify_url: payCallback,
      amount: {
        total: params.payAmount || 1,
        currency: "CNY",
      },
      scene_info: params.scene_info,
    };

    const resp = await apis.wxShop.post<{
      h5_url: string;
      code?: string;
      message?: string;
    }>(prepayApi, wxPayParams, {
      validateStatus: (status) => status < 500,
      headers: {
        Accept: "application/json",
        Authorization: this.getAuthorization({
          method: "POST",
          url: prepayApi,
          body: wxPayParams,
        }),
      },
    });
    // this.logger.info("prepay_id:", resp.data);
    if (!resp.data.h5_url) {
      throw new httpError.BadRequestError(`微信下单失败, ${resp.data.message}`);
    }
    return resp.data.h5_url;
  }

  /** jsApi/小程序下单 - 返回prepay_id */
  async miniOrJsPrepay(params: {
    /** 商品描述 */
    description: string;
    /** 支付单 */
    paySn: string;
    /** 内部订单号 */
    orderSn: string;
    /** 过期时间 */
    time_expire: string;
    /** 附加数据 */
    attach: string;
    /** 支付金额 */
    payAmount: number;
    /** openId */
    openid: string;
  }) {
    /** 支付回调地址 */
    const payCallback = `${process.env.SERVER_HOST}/api/pay/wxCallback/${params.paySn}`;
    console.log('wx:pay_notify', payCallback);
    const prepayApi = "/v3/pay/transactions/jsapi";
    const wxPayParams = {
      mchid: this.config.MCH_ID,
      appid: params.openid,
      description: params.description ?? "",
      out_trade_no: params.orderSn,
      /* 交易结束时间 */
      time_expire: params.time_expire,
      attach: params.attach ?? "",
      notify_url: payCallback,
      amount: {
        total: params.payAmount || 1,
        currency: "CNY",
      },
      payer: {
        openid: params.openid,
      },
    };

    const resp = await apis.wxShop.post<{
      prepay_id: string;
      code?: string;
      message?: string;
    }>(prepayApi, wxPayParams, {
      validateStatus: (status) => status < 500,
      headers: {
        Accept: "application/json",
        Authorization: this.getAuthorization({
          method: "POST",
          url: prepayApi,
          body: wxPayParams,
        }),
      },
    }).catch((err) => {
      loggers.default.error(err.message);
      return null;
    });
    // this.logger.info("prepay_id:", resp.data);
    if (!resp?.data.prepay_id) {
      throw new httpError.BadRequestError(`微信下单失败, ${resp.data.message}`);
    }
    return resp.data.prepay_id;
  }

  getPaySign(params: {
    timeStamp: string;
    nonceStr: string;
    package: string;
    appId: string;
  }) {
    // const timeStamp =
    const signStr = `${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;
    const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
    sig.init(this.config.MCH_KEY_PEM);
    sig.updateString(signStr);
    const signature = sig.sign();
    // 将签名转换为 Base64 格式
    const base64Signature = hextob64(signature);
    return base64Signature;
  }

  /** 小程序支付，获取客户端调起支付所需要的参数 */
  async getMiniPayParams(openid: string, prepay_id: string) {
    const timeStamp = Math.round(Date.now() / 1000).toString();
    const payParams: IStruct.WxMiniPayInvokeParams = {
      appId: openid,
      timeStamp: timeStamp,
      nonceStr: nanoRandom(8),
      package: `prepay_id=${prepay_id}`,
      signType: "RSA",
      paySign: "",
    };
    payParams.paySign = this.getPaySign(payParams);
    return payParams;
    // return getWxPaySign({
    //   timeStamp: timeStamp,
    //   nonceStr: payParams.nonceStr,
    //   package: payParams.package,
    // });
  }
  /**
   * 计算微信商户接口sign
   *
   * 商户API证书序列号serial_no，用于声明所使用的证书
   * 请求随机串nonce_str
   * 时间戳timestamp
   * 签名值signature
   */
  getAuthSign(params: {
    method: string;
    url: string;
    timestamp: string;
    nonce_str: string;
    body?: Record<string, any>;
  }) {
    const { method, url, timestamp, nonce_str, body } = params;
    const paramStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n${
      body ? JSON.stringify(body) : ""
    }\n`;
    const sign = new KJUR.crypto.Signature({
      alg: "SHA256withRSA",
    });
    sign.init(this.config.MCH_KEY_PEM.trim(), this.config.MCH_ID.trim());
    return hextob64(sign.signString(paramStr));
  }

  /** 解密微信支付报文 */
  decipher(ciphertext: string, nouce: string) {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.config.MCH_V3_KEY,
      nouce
    );
    const cipherBuffer = Buffer.from(ciphertext, "base64");
    const authTag = cipherBuffer.subarray(-16);
    const dataBuffer = cipherBuffer.subarray(0, -16);
    decipher.setAuthTag(authTag);
    const decrypted = decipher.update(
      dataBuffer.toString("base64"),
      "base64",
      "utf-8"
    );
    return decrypted;
  }

  /** 加密微信支付报文 */
  encipher(content?: string, publicKey?: string) {
    if (!content || !publicKey) return "";
    // 对明文进行加密
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha1",
      },
      Buffer.from(content)
    );

    return encrypted.toString("base64");
  }
}
