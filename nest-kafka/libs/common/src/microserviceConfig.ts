import { KafkaOptions, Transport } from "@nestjs/microservices";
import { Kafka } from "kafkajs";

export const microserviceConfig = (srv: string): KafkaOptions => {
    return {
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: process.env.KAFKA_CLIENT_ID,
                brokers: [process.env.KAFKA_URL],
                retry: {
                    retries: 10,
                    initialRetryTime: 3000,
                    maxRetryTime: 20000,
                },
            },
            consumer: {
                groupId: `${srv}-consumer`,
                allowAutoTopicCreation: true,
                retry: {
                    retries: 10,
                    initialRetryTime: 3000,
                    maxRetryTime: 20000,
                },
            },
        },
    };
};
