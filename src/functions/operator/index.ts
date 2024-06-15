import { handlerPath } from '@/libs/handler-resolver'

const localEvents = [
  {
    http: {
      method: 'post',
      path: 'operator'
    }
  }
]

const cloudEvents = [
  {
    sqs: {
      arn: {
        'Fn::GetAtt': ['SolesbotOperateQueue', 'Arn']
      },
      maximumConcurrency: 20
    }
  }
]

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 6 * 60, // 6 minutes
  memorySize: 128,
  events: process.env.NODE_ENV === 'local' ? localEvents : cloudEvents
}
