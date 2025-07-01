import { httpError, ILogger, Logger, Provide } from "@midwayjs/core";
import PayOrder from "../models/models/PayOrder.model";
import { AlipaySdk, AlipaySdkCommonResult } from 'alipay-sdk';
@Provide()
export class AliService {
  @Logger()
  logger: ILogger;

  /** 获取支付宝支付前端调起所需数据 */
  async getAliPayParams(payOrder: PayOrder) {
    const payCallback = `${process.env.SERVER_HOST}/pay/alipayCallback/${payOrder.paySn}`;
    
    const alipayConfig = {
      appId: '2021005155667848',
      privateKey: 'MIIEpAIBAAKCAQEAgTxk0WPuGqLfbmUdjPtx+Q7g3TVMmMKzWbJ3CfovDPnrm2Nnf4qgC24Qk3N06zrPcp2RFs92KpNYeiDJyWEx8gAhq8864iIJfmK4l7prh8cw1pF5kt3XH+FJgfmT3g0Sd5uoeNuo8p1k1Bg16iMIN+cqWf7JbCZBDtI0HTNghXIz2fINFvCQr1nzF5mIOtTv7dTiK8eROalWUgAZ9Yz1lWdlUvpjXVqXHxhywgI4KDH10ZO4b+xwOAgVAxobnsTzAKBWLl0W3lSCWuuUtXyWZVh6GxwvtNEeFtiFiSIJXw10QdwJ1H+5bRF85pmNuSxfuN2388yqe3Sl62mAnzyqhQIDAQABAoIBAC9av95x7XdZIuHCr1dPc229Y+vqccyv2yQM3s2LHN52XTys6em0E/zcMbq13aur+wOWdOmUz0m+f/cQOKBPuwtfvPbFkl/19OCYr+b46hnwhRa6a3/DReZqmJLFrsb4p0GoiczvQDLWNXH6BRdsCsDhNYWQdKHqSoBxyaLBhqaesffaMK1Pvc2YFXh7Z40/Df4g2rp0lrItw4A5TGK+8HsMXqj09TQ9XaBIP62D742NLiBxGo1G8jB0u3m48qxisdrGqoRC7zCPYegb8EQOS1xlEar921GJ3cl3Z5S3O3wRLz+DGY+O/38trlCGJp8yPuC17C+PyUx0mvX/2VUcRekCgYEAy5YFe7wkC1mwl1NGyvvJVdEdjhqo2422oGiOaiFmolgN+x4EizTnyovkgvB+HLj68u2Gg13FrizV/HZdNFGu8BE1iW+ib/jkJ/aCgetpCrCdmY9UuE8ELNdPaNHPEb7wIL6hv0WAzua/+anq9NFoy1mKdENc/6R/TY9r1sPEkCcCgYEAooIYGXOG1Q9+5a+MHQi8CmAaOhWE89Bb+at6H5el8F/xq6Xbydw4XCdXgB7qPoNFIRBdV4rwi20MfI+s+Pu1+sZj5jwk/C9qkfW8PgHCs/7AZgkWTsmtI4esPONX04lhHNahn0fidnkhKYmwKa5hVQSNvPJW4h9HpmigIsd5b3MCgYEAtACD/qAdmm+FpHZ7/FLc8+R95jwKGn1VAMURTiMUFOwYCHTE/bQcUUiZFXC/gHPJZeq/aP0LIHICDUM2K2EhdJ8yn761d50vVWouf+J9sHbyEWjaNk+e2GrSilIfbIhO1hTW/D/eoJEDIiKrXCSfLFSSBzPcUSfHavMpHO1gqTcCgYAnb6qpgn+V9My2sIMwCI6ZdfjnX5GEGWw4ioR4ZjS+wInFPdq4gdirhGCXlukBgpmkDHSaaf012KDPGY7AXVUsJjjYBoBzMo6KHTgxU/wL8iZ+nHXtaMO7e5EwtXr6urv2Y5+VJ7ytQ3fovKEjfE3ic9hxod2zwiOBHqK9zeqKQQKBgQCHookNoymk7dZt6kANdTntGXlHqHoLFRMcdlTyaWJEf58QUvMRhIi8mire5hdfKdm7Fy4o2xA3FHLaMIVVpTGG/szXT9iGYO8qAnl6WCFWjwmczUkbj8zs5o/JrV8Jqoi9Gzi6JdYgLdmzBk30E5617x3bmhSibZ1wrIyMlQRKeg==',
      alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgT2lUMDStmcAWJYbUG76VvZnqXL5XB3y6aYYawNwsVfsBC1y0xPsM9qYb3ZNO/ZdGFlETbEonqwYEyBF6VpAYL5z23Tp9QM4B4iaC+ya0LMLhs8NYYVkKko3oLuItlYnSrHFgvrB6aWjZmzgmyMdQPgpQ/D6KXcBix9veQaF/D4dWioZRSjGZN10rIZYvGWvTdB6z9tPF2fH33SuHwZ1JgdVyUmvYl21HL8KfwUwq9XRsqjJ9WyhdfsV985cTG+jePofRSdzjxShm1hTO8bb6vXFaDJM0j/N5tutJLLCj66WEBecsB8aBuKhH5fW111mYM3dPu2rd/WBn8Hxzft2PQIDAQAB',
      endpoint: 'https://openapi.alipaydev.com', // 沙箱环境用测试网关
    };
    
    const alipaySdk = new AlipaySdk({
      ...alipayConfig,
      timeout: 5000,
      signType: 'RSA2' // 推荐使用 RSA2 签名
    });

    try {
      // 调用支付宝预支付接口
      const result = (await alipaySdk.exec("alipay.trade.create", {
        bizContent: {
          out_trade_no: payOrder.orderSn,
          // total_amount: (totalAmount / 100).toString(), // 支付宝金额单位为元
          total_amount: payOrder.amount,
          subject: payOrder.title,
          op_app_id: alipayConfig.appId,
          buyer_open_id: '007iL1kt9FxGPQKilXuun4jI4Uvg6qFDo8paE5gFquLW0Ea',
        },
        notify_url: payCallback
      })) as AlipaySdkCommonResult & { tradeNo: string; outTradeNo: string };
  
      return result;
      
    } catch (error) {
      console.error("调用支付宝预支付接口失败:", error);
    }
  }
}
