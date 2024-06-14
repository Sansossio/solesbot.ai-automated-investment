import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 10 * 60, // 10 minutes
  memorySize: 128,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['SolesbotOperateQueue', 'Arn'],
        },
      },
    },
    {
      http: {
        method: 'post',
        path: 'operator',
      },
    }
  ],
};
