import { formatJSONResponse, type ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { SolesBotCoins, SolesbotOperatorEvent, SolesbotService } from '@solesbot';
import { SQSHandler } from 'aws-lambda';

const operator = async (event: SolesbotOperatorEvent) => {
  const initialCookies = event.cookies ? new Map<string, string | number>(Object.entries(event.cookies)) : undefined;

  const service = new SolesbotService({
    initialCookies,
  });

  await service.login(
    event.email,
    event.password
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

  console.log({
    data,
    pendingOperations,
    cake,
    polkadot,
  });
};

export const main: SQSHandler | ValidatedEventAPIGatewayProxyEvent<any> = async event => {
  const records = 'Records' in event ? event.Records : JSON.parse(event.body).Records;

  for (const record of records) {
    const body = 'body' in record ? JSON.parse(record.body) : record;

    await operator(body);
  }

  return formatJSONResponse({
    message: 'Processed'
  }) as any;
}
