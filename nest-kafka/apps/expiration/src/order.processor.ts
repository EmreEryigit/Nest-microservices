import { Process, Processor } from "@nestjs/bull";

import { Inject } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { Job } from "bull";

@Processor("order")
export class OrderProcessor {
    constructor(
        @Inject("ORDERS_SERVICE") private readonly orderClient: ClientKafka
    ) {}
    @Process()
    async process(job: Job) {
        console.log(job.data);
        this.orderClient.emit("expiration_completed", job.data.orderId);
    }
}
