import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { S3Service } from '@libs/s3.service';

import { Cookies } from '@libs/cookie.manager';
import { SolesbotService } from '@solesbot';
import { SqsService } from '../../libs/sqs.service';
import { ACCOUNTS } from '../../solesbot/accounts';

const bucketName = 'solesbot-aws';
const keyName = 'cookies.json';

const s3Service = new S3Service()
const sqsService = new SqsService()

let cookiesCache = new Map<string, string | number>();

async function updateCookies(cookies: Cookies) {
  cookiesCache = cookies;
  await s3Service.putObject(bucketName, keyName, JSON.stringify(Object.fromEntries(cookies)));
}

export const main: ValidatedEventAPIGatewayProxyEvent<any> = async (_event) => {
  const cookiesSaved = await s3Service.getObjectParsed(bucketName, keyName);

  const initialCookies = typeof cookiesSaved === 'object' ? new Map<string, string | number>(Object.entries(cookiesSaved)) : undefined;

  const service = new SolesbotService({
    initialCookies,
    async onCookiesUpdated(cookies) {
      await updateCookies(cookies);
    },
  });

  console.log('Starting service');

  await service.start();

  const cookiesAsObject = Object.fromEntries(cookiesCache);

  for (const account of ACCOUNTS) {
    await sqsService.sendToOperate(process.env.OPERATE_SQS_QUEUE_URL!, {
      email: account.email,
      password: account.password,
      cookies: cookiesAsObject,
      strategies: [1]
    });
  }

  return formatJSONResponse({
    cookies: cookiesAsObject
  });
};

