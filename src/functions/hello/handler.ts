import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3Service } from '@libs/s3.service';

import schema from './schema';
import { Cookies } from '@libs/cookie.manager';
import { SolesBotCoins, SolesbotService } from '@solesbot';

const bucketName = 'solesbot-aws';
const keyName = 'cookies.json';

const s3Service = new S3Service()

async function updateCookies(cookies: Cookies) {
  await s3Service.putObject(bucketName, keyName, JSON.stringify(Object.fromEntries(cookies)));
}

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (_event) => {
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

  await service.login(
    process.env.SOLESBOT_EMAIL!,
    process.env.SOLESBOT_PASSWORD!
  )

  const data = await service.getData()

  const coins = [
    SolesBotCoins.CAKE,
    SolesBotCoins.Polkadot
  ]

  const [pendingOperations, [cake, polkadot]] = await Promise.all([
    service.getPendingOperations(),
    service.getCoins(coins)
  ]);

  return formatJSONResponse({
    data,
    pendingOperations,
    cake,
    polkadot,
  });
};

export const main = middyfy(hello);
