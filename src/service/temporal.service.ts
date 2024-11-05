import {
  Autoload,
  Destroy,
  ILogger,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  Singleton,
} from "@midwayjs/core";
import { Client, Connection } from "@temporalio/client";
import { orderProcessingWorkflow } from "../temporal/workflows/order";
import Order from "../models/models/Order.model";
import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "../temporal/activities";

@Autoload()
@Singleton()
@Provide()
export class TemporalService {
  @Logger()
  logger: ILogger;

  client: Client;

  @Init()
  async onInit() {
    this.logger.info("TemporalService created");
    const connection = await Connection.connect({ address: "localhost:7233" });
    this.client = new Client({
      connection,
    });
  }

  @Destroy()
  async onDestroy() {
    this.logger.info("TemporalService destroyed");
  }

  // 开始订单工作流
  async startOrderWorkflow(orderSn: string) {
    const handler = await this.client.workflow.start(orderProcessingWorkflow, {
      args: [orderSn],
      workflowId: `order-${orderSn}`,
      taskQueue: "order-workflow",
      workflowTaskTimeout: "10s",
    });
    await handler
      .result()
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        console.log("Workflow completed");
      });
      
    return handler;
  }
}
