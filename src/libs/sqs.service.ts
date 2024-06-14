import { SQS } from "aws-sdk";
import { SolesbotOperatorEvent } from "@solesbot";

export class SqsService {
  private readonly sqs = new SQS({
    endpoint: process.env.AWS_ENDPOINT,
  });

  async sendToOperate(queueUrl: string, event: SolesbotOperatorEvent): Promise<void> {
    await this.sqs.sendMessage({
      MessageBody: JSON.stringify(event),
      QueueUrl: queueUrl,
    }).promise();
  }
}
