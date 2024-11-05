import { proxyActivities, executeChild, sleep } from "@temporalio/workflow";
import * as orderActivities from "../activities/order";
import { OrderProcessType } from "../../define/enums";

const {
  findOrder,
  getOrderPaidResult,
  closeOrder,
  completeOrder,
  shipOrder,
  prepearShipOrder,
} = proxyActivities<typeof orderActivities>({
  startToCloseTimeout: "10s",
  retry: {
    maximumAttempts: 7,
  },
});

/** 订单流程工作流 */
export const orderProcessingWorkflow = async (orderSn: string) => {
  // 查询订单
  const order = await findOrder(orderSn);
  // 检查订单支付状态
  const payResult = await executeChild(checkPaymentWorkflow, {
    args: [orderSn],
  });
  /// 支付超时或其他
  if (!payResult) {
    // 进入关闭订单工作流
    await executeChild(closeOrderWorkflow, { args: [orderSn] });
    return;
  }

  /// 根据订单流程类型进入下一个工作流
  switch (order.procType) {
    // 速发订单
    case OrderProcessType.quick:
      {
        /// 进入发货流程
        await executeChild(shipOrderWorkflow, { args: [orderSn] });
        /// 进入订单完成流程
        await executeChild(completeOrderWorkflow, { args: [orderSn] });
        console.log(`订单(${orderSn})流程已结束!`);
      }
      break;
    // 手动发货订单
    case OrderProcessType.manual:
      {
        // 进入准备发货流程
        await executeChild(preparingOrderWorkflow, { args: [orderSn] });
        // 进入等待收货流程
        await executeChild(receivingOrderWorkflow, { args: [orderSn] });
        // 进入订单完成流程
        await executeChild(completeOrderWorkflow, { args: [orderSn] });
        console.log(`订单(${orderSn})流程已结束!`);
      }
      break;
  }

  return;
};

/** 检查订单支付状态流程 */
export const checkPaymentWorkflow = async (orderSn: string) => {
  console.log(`检查订单(${orderSn})支付状态流程开始`);
  const order = await findOrder(orderSn);
  const createTime = new Date(order.createdAt).getTime();
  const timeoutDuration = 1000 * 60 * 60 * 2; // 5 minutes
  while (true) {
    try {
      const payResult = await getOrderPaidResult(orderSn);
      if (payResult.payTime) {
        // 已支付
        console.log(`订单(${orderSn})已支付, 进入下一个流程。`);
        return true;
      } else if (Date.now() - createTime >= timeoutDuration) {
        // 超时未支付
        console.log(`订单(${orderSn})支付超时，订单自动关闭。`);
        return false;
      }
      // 两秒后再检查订单支付状态
      await sleep(2000);
    } catch (e) {
      console.log(`订单(${orderSn})支付状态查询失败，将进行重试。`);
      await sleep(2000);
    }
  }
  return true;
};

/** 关闭订单工作流 */
export const closeOrderWorkflow = async (orderSn: string) => {
  console.log(`关闭订单(${orderSn})支付状态`);
  return closeOrder(orderSn);
};

/** 完成订单工作流 */
export const completeOrderWorkflow = async (orderSn: string) => {
  console.log(`开始检查订单(${orderSn})支付状态`);
  return completeOrder(orderSn);
};

/** 发货工作流 */
export const shipOrderWorkflow = async (orderSn: string) => {
  return shipOrder(orderSn);
};

/** 准备发货流程 */
export const preparingOrderWorkflow = async (orderSn: string) => {
  await prepearShipOrder(orderSn);
  // TODO: 准备发货，直到超时异常
  while(true) {
    break;
  }
};

/** 等待收货流程 */
export const receivingOrderWorkflow = async (orderSn: string) => {
  // TODO: 等待收货，直到超时，进行自动收货
  while(true) {
    break;
  }
};
