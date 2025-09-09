import {
  Inject,
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  httpError,
  Param,
  Del,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { WxPayCallbackDTO } from "../dto/pay.dto";
import { PayService } from "../service/pay.service";
import { AliService } from "../service/ali.service";
import { MidwayLogger } from "@midwayjs/logger";
import { PayState } from "../define/enums";
import { LoginRequired } from "../middleware/auth.middleware";

@Controller("/api/pay", {})
export class PayController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger;

  @Inject()
  payService: PayService;

  @Inject()
  aliService: AliService;

  // 获取微信支付参数
  @Get("/:paySn/wxpayParams", {
    description: "获取微信支付参数",
    middleware: [LoginRequired],
  })
  async getPayParams(@Param("paySn") paySn: string) {
    const payOrder = await this.payService.findByPaySn(paySn);
    if (!payOrder) {
      throw new httpError.BadRequestError("支付单不存在");
    }
    // 如果不是正在支付的支付单，则抛错
    const stateErrMsg = payOrder.matchState(PayState.paying);
    if (stateErrMsg !== true) {
      throw new httpError.ConflictError(stateErrMsg);
    }
    const payParams = await this.payService.getPayParams(payOrder);
    return payParams;
  }

  // 微信支付回调
  @Post("/wxCallback/:paySn", {
    description: "微信支付回调(只有支付成功才有回调)",
  })
  async handleWxPayCallback(
    @Param("paySn") paySn: string,
    @Body() params: WxPayCallbackDTO
  ) {
    this.logger.info(
      "handleWxPayCallback - paySn: ",
      paySn,
      "\n",
      JSON.stringify(params)
    );
    // 处理支付回调
    try {
      const payOrder = await this.payService.findByPaySn(paySn);
      if (!payOrder) {
        throw new httpError.BadRequestError("支付单不存在");
      }
      await this.payService.handleWxPayCallback(payOrder, params);
    } catch (err) {
      this.logger.error(err);
    }
    return true;
  }

  // 获取支付宝-支付参数
  @Get("/:paySn/alipayParams", {
    description: "获取支付宝支付参数",
    middleware: [LoginRequired],
  })
  async getAliPayParams(@Param("paySn") paySn: string) {
    const payOrder = await this.payService.findByPaySn(paySn);
    if (!payOrder) {
      throw new httpError.BadRequestError("支付单不存在");
    }
    // 如果不是正在支付的支付单，则抛错
    const stateErrMsg = payOrder.matchState(PayState.paying);
    if (stateErrMsg !== true) {
      throw new httpError.ConflictError(stateErrMsg);
    }

    const payParams = await this.payService.getPayParams(payOrder);
    return payParams;
  }

  // 支付宝支付回调
  @Post("/alipayCallback/:paySn", {
    description: "支付宝支付回调(只有支付成功才有回调)",
  })
  async handleAliPayCallback(
    @Param("paySn") paySn: string,
    @Body() params: any
  ) {
    console.log("params: ", params);
    return true;
  }
}
