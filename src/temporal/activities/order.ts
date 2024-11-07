import { MidwayContainer, getCurrentApplicationContext, getCurrentAsyncContextManager } from "@midwayjs/core";
import { apis } from "../../api/apis";
import Order from "../../models/models/Order.model";
import { OrderService } from "../../service/order.service";
import { OrderState } from "../../define/enums";


/** 查询订单 */
export async function findOrder(orderSn: string) {
  const service = getCurrentApplicationContext().get<OrderService>(OrderService)//.get(OrderService);
  const order = await service.findBySn(orderSn);
  return order;
}

/** 查询订单支付情况 */
export async function getOrderPaidResult(orderSn: string): Promise<Pick<Order, 'payTime' | 'paySn' | 'paymentCode' | 'state' | 'createdAt'>> {
  const order = await Order.findOne({
    where: { orderSn: orderSn },
    attributes: ['payTime', 'paySn', 'paymentCode', 'state', 'createdAt'],
  });
  if (!order) {
    throw new Error("[查询订单支付情况]: 订单不存在");
  }
  return order;
}

/** 关闭订单 */
export async function closeOrder(orderSn: string) {
  const service = getCurrentApplicationContext().get<OrderService>(OrderService)//.get(OrderService);
  const order = await findOrder(orderSn);
  if (order.state === OrderState.closed) {
    return true;
  }
  await service.cancel(order);
  return true;
}

/** 完成订单 */
export async function completeOrder(orderSn: string) {
  const service = getCurrentApplicationContext().get<OrderService>(OrderService)//.get(OrderService);
  const order = await findOrder(orderSn);
  if (order.state === OrderState.completed) {
    return true;
  }
  await service.complete(order);
  return true;
}

/** 订单发货 */
export async function shipOrder(orderSn: string) {
  const service = getCurrentApplicationContext().get<OrderService>(OrderService)//.get(OrderService);
  const order = await findOrder(orderSn);
  await service.ship(order);
}

/** 订单准备发货 */
export async function prepearShipOrder(orderSn: string) {
  const service = getCurrentApplicationContext().get<OrderService>(OrderService)//.get(OrderService);
  const order = await findOrder(orderSn);
  await service.prepearShipOrder(order);
}