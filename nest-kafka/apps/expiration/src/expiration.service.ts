import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class ExpirationService {
    constructor(@InjectQueue("order") private queue: Queue) {}
    getHello(): string {
        return "Hello World!";
    }

    async process(orderId: number, expiresAt: string) {
        const delay = new Date(expiresAt).getTime() - new Date().getTime();
        await this.queue.add(
            {
                orderId,
            },
            {
                delay,
            }
        );
        console.log("q added");
    }
}
