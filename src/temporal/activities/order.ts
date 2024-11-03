import Order from "../../models/models/Order.model";

export async function findOrder(orderSn: string) {
  const order = await Order.findOne({
    where: { orderSn: orderSn },
    logging: console.log,
  });

  if (!order) {
    throw new Error("Order not found");
  }
  return order.toJSON();
}
