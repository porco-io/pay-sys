import crypto from "crypto-js";
import mime from "mime";
import { v4 } from "uuid";
import path from "path";
import axios from "axios";
import FormData from "form-data";

// import { IApiCallback } from './httpHelper';
// const { FormData } = FormDataNode;
/** 业务上传类型 */
export enum UPLOAD_TYPE {
  /** 用户常规上传 */
  pay = "pay",
}

/** 上传参数 */
export interface UploadParams {
  host: string;
  key: string;
  filename: string;
  formMap: Record<string, any>;
}

/** 上传dir地址 */
export const UPLOAD_PREFIX: Record<UPLOAD_TYPE, string> = {
  [UPLOAD_TYPE.pay]: "pay",
};

/** 获取存储目录 */
function getKeyPrefix(type: UPLOAD_TYPE, ownerAccount: string) {
  switch (type) {
    case UPLOAD_TYPE.pay:
      return UPLOAD_PREFIX[type];
    default: {
      throw new Error("必须指定限定的上传类型");
    }
  }
}

interface UploadOptions {
  host: string;
  accessKeyId: string;
  accessKeySecret: string;
  /* 限制参数的生效时间，单位为分钟，默认值为10。 */
  timeout: number;
  /* 限制上传文件的大小，单位为MB，默认值为10。 */
  maxSize: number;
  /** 文件名 */
  filename: string;
  /** 文件类型 */
  contentType: string;
  /** 上传类型 */
  uploadType?: UPLOAD_TYPE;
  /** oss对象key */
  key: string;
  /** 回调地址 */
  callbackUrl: string;
  /** 回调附加参数 */
  callbackParams: Record<string, any>;
  /** owner */
  ownerAccount: string;
}

export class UploadOssHelper {
  options: UploadOptions = {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    host: process.env.OSS_ENDPOINT,
    timeout: 10,
    maxSize: 20,
    uploadType: undefined,
    filename: "",
    contentType: "",
    key: "",
    callbackUrl: "",
    callbackParams: {},
    ownerAccount: "",
  };

  constructor(
    options: Partial<
      Pick<
        UploadOptions,
        | "uploadType"
        | "filename"
        | "contentType"
        | "callbackUrl"
        | "callbackParams"
        | "ownerAccount"
      >
    >
  ) {
    this.options = {
      ...this.options,
      ...options,
    };
    if (!Object.values(UPLOAD_TYPE).includes(this.options.uploadType!)) {
      throw new Error("必须指定限定的上传类型");
    }
    if (!this.options.ownerAccount) {
      throw new Error("必须指定上传者身份");
    }
    // key
    this.options.key = this.generateKey();

    // 后缀由
    if (this.options.filename) {
      this.options.filename = path.basename(this.options.filename);
      const mineType = mime.getType(this.options.filename);
      this.options.contentType = mineType || this.options.contentType || "";
    }
  }

  /** 生成唯一key */
  generateKey() {
    const prefix = getKeyPrefix(
      this.options.uploadType!,
      this.options.ownerAccount
    );

    const randomKey = crypto
      .MD5(
        JSON.stringify({
          v4: v4(),
          filename: this.options.filename,
          timestamp: Date.now(),
          sign: "jmm-key",
        })
      )
      .toString();
    return `${prefix}/${randomKey}`;
  }

  createUploadParams(): UploadParams {
    const policy = this.getPolicyBase64();
    const signature = this.signature(policy);
    const callbackPolicy = this.getCallbackPolicy();
    const headers = this.getHeaders();

    return {
      host: this.options.host,
      key: this.options.key,
      filename: this.options.filename,
      formMap: {
        ...headers,
        key: this.options.key,
        OSSAccessKeyId: this.options.accessKeyId,
        policy: policy,
        signature: signature,
        callback: callbackPolicy,
      },
    };
  }

  /** 生成回调策略base64 */
  getCallbackPolicy() {
    if (!this.options.callbackUrl) return "";
    const callbackParams = this.options.callbackParams || {};
    let paramsStr = Object.keys(callbackParams)
      .map((k) => `${k}=${encodeURIComponent(callbackParams[k])}`)
      .join("&");
    // 回调策略
    const callbackPolicy = {
      callbackUrl: this.options.callbackUrl,
      callbackBody: `bucket=\${bucket}&key=\${object}&size=\${size}&mimeType=${
        this.options.contentType || "${mimeType}"
      }&height=\${imageInfo.height}&width=\${imageInfo.width}`,
      callbackBodyType: "application/x-www-form-urlencoded",
    };
    if (paramsStr) {
      callbackPolicy.callbackBody = `${callbackPolicy.callbackBody}&${paramsStr}`;
    }
    return Buffer.from(JSON.stringify(callbackPolicy)).toString("base64");
  }

  getHeaders() {
    const headers: Record<string, string> = {
      "Cache-Control": "max-age=180",
    };

    if (this.options.contentType) {
      headers["Content-Type"] = this.options.contentType;
    }

    if (this.options.filename) {
      const inline =
        this.options.contentType.startsWith("image/") ||
        this.options.contentType.startsWith("video/") ||
        this.options.contentType.startsWith("audio/");
      headers["Content-Disposition"] = `${
        inline ? "inline" : "attachment"
      }; filename=\"${encodeURIComponent(this.options.filename)}\"`;
    }

    return headers;
  }

  getPolicyBase64() {
    const date = new Date();
    // 设置policy过期时间。
    date.setMinutes(date.getMinutes() + this.options.timeout);
    const conditions: (string | number)[][] = [
      // 限制上传文件大小。
      ["content-length-range", 1, this.options.maxSize * 1024 * 1024],
      ["eq", "$key", this.options.key],
    ];

    const policyText = {
      expiration: date.toISOString(),
      conditions: conditions,
    };
    const buffer = Buffer.from(JSON.stringify(policyText));
    return buffer.toString("base64");
  }

  signature(policy: string) {
    const sig = crypto.enc.Base64.stringify(
      crypto.HmacSHA1(policy, this.options.accessKeySecret)
    );

    return sig;
  }

  async uploadOss(file: Buffer, params: UploadParams) {
    const formData = new FormData();
    for (const k in params.formMap) {
      formData.append(k, params.formMap[k]);
    }
    formData.append("file", file);
    const resp = await axios.post<{
      filename: string;
      id: number;
      key: string;
      size: number;
    }>(params.host, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return resp.data;
  }
}

// const sts = new STS({
//   accessKeyId: ctx.env.STORAGE_ALIBABA_KEY,
//   accessKeySecret: ctx.env.STORAGE_ALIBABA_SECRET
// });
// const policy = {
//   'Version': '1',
//   'Statement': [{
//     'Effect': 'Allow',
//     'Action': [
//       'oss:*'
//     ],
//     'Resource': [
//       `acs:oss:*:*:${ctx.env.STORAGE_ALIBABA_BUCKET}/${ctx.env.STORAGE_ALIBABA_ROOT}/${req.params.id}*`
//     ]
//   }]
// };

// const result = await sts.assumeRole(ctx.env.STORAGE_ALIBABA_ROLEARN, policy, 3600, req.params.id);
// if (result && result.credentials) {
//   const ossToken = {
//     region: ctx.env.STORAGE_ALIBABA_REGION,
//     accessKeyId: result.credentials.AccessKeyId,
//     accessKeySecret: result.credentials.AccessKeySecret,
//     stsToken: result.credentials.SecurityToken,
//     Expiration: result.credentials.Expiration,
//     bucket: ctx.env.STORAGE_ALIBABA_BUCKET,
//     basefolder: ctx.env.STORAGE_ALIBABA_ROOT
//   };
//   res.json(httpHelper.success({ data: ossToken }));

// }

// else {
//   res.json(httpHelper.error({
//     status: 404,
//     code: 40005,
//     message: 'sts error',
//   }));

// }
