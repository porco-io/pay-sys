import { proxyActivities, sleep } from '@temporalio/workflow';
import * as orderActivities from '../activities/order';
// import axios from 'axios';

// import Order from '../../models/models/Order.model';
// const api = axios.create({
//   baseURL: `http://localhost:11205/api`,
//   validateStatus: () => true
// });
const { findOrder } = proxyActivities<typeof orderActivities>({
  startToCloseTimeout: '10s',
  retry: {
    maximumAttempts: 3,
  },
});

export const orderWorkflow = async (orderSn: string) => {
  const order = await findOrder(orderSn);
  
  // if (!order) {
  //   throw new Error('Order not found');
  // }
}