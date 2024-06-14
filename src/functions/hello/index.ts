import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30 * 1000,
  environment: {
    SOLESBOT_EMAIL: process.env.SOLESBOT_EMAIL,
    SOLESBOT_PASSWORD: process.env.SOLESBOT_PASSWORD,
  },
  events: [
    {
      http: {
        method: 'get',
        path: 'hello',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
