import { handlerPath } from '@/libs/handler-resolver';

const events: any = [
  {
    http: {
      method: 'post',
      path: 'operator',
    }
  }
];

if (process.env.NODE_ENV !== 'local') {
  events.push({
    sqs: {
      arn: {
        'Fn::GetAtt': ['SolesbotOperateQueue', 'Arn'],
      },
    },
  });
}

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 10 * 60, // 10 minutes
  memorySize: 128,
  events,
};
