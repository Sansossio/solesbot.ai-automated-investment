import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 15 * 60, // 15 minutes
  memorySize: 256,
  environment: {
    OPERATE_SQS_QUEUE_URL: process.env.OPERATE_SQS_QUEUE_URL || "${self:custom.sqs.operateQueueUrl}",
  },
  events: [
    {
      http: {
        method: 'get',
        path: 'runner',
      },
    },
  ],
};
