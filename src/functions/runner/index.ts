import { handlerPath } from '@/libs/handler-resolver';

const localEvents = [
  {
    http: {
      method: 'get',
      path: 'runner',
    },
  }
]

const cloudEvents = [
  {
    schedule: 'rate(6 minutes)',
  }
]

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 15 * 60, // 15 minutes
  memorySize: 256,
  environment: {
    OPERATE_SQS_QUEUE_URL: process.env.OPERATE_SQS_QUEUE_URL || "${self:custom.sqs.operateQueueUrl}",
  },
  events: process.env.NODE_ENV === 'local' ? localEvents : cloudEvents,
};
