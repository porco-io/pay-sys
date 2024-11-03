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
import { orderWorkflow } from "../temporal/workflows/order";
import Order from "../models/models/Order.model";
import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "../temporal/activities";
import { join } from "path";

@Autoload()
@Singleton()
@Provide()
export class TemporalWorkerService {
  @Logger()
  logger: ILogger;

  worker: Worker;

  @Init()
  async onInit() {
    this.logger.info("TemporalWorkerService created");
    
    const workerConnection = await NativeConnection.connect({
      address: "localhost:7233"
    });
    this.worker = await Worker.create({
      connection: workerConnection,
      taskQueue: "order-workflow",
      activities: activities,
      workflowsPath: join(__dirname, "../temporal/workflows"),
    });
    this.worker.run();
  }

  @Destroy()
  async onDestroy() {
    this.logger.info("TemporalWorkerService destroyed");
  }

  
}
