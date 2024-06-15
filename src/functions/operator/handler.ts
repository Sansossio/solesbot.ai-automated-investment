import { formatJSONResponse, type ValidatedEventAPIGatewayProxyEvent } from '@/libs/api-gateway'
import { SolesbotOperatorEvent, SolesbotService } from '@/solesbot'
import { SQSHandler } from 'aws-lambda'
import { StrategyRunner } from '../../solesbot/strategy/strategy.runner'
import { Strategies } from '../../solesbot/strategy/list'
import { SolesbotStrategy } from '../../solesbot/strategy/strategy'

const operator = async (event: SolesbotOperatorEvent): Promise<any> => {
  const initialCookies = (event.cookies != null) ? new Map<string, string | number>(Object.entries(event.cookies)) : undefined

  const service = new SolesbotService({
    initialCookies
  })

  await service.login(
    event.email,
    event.password
  )

  const strategy = new StrategyRunner(service)
  const strategiesToRun = event.strategies.map(strategyId => Strategies.get(strategyId))

  for (const strategyToRun of strategiesToRun) {
    await strategy.run(strategyToRun as SolesbotStrategy)
  }
}

export const main: SQSHandler | ValidatedEventAPIGatewayProxyEvent<any> = async (event: any) => {
  const records = 'Records' in event ? event.Records : JSON.parse(event.body).Records

  for (const record of records) {
    const body = 'body' in record ? JSON.parse(record.body) : record

    await operator(body)
  }

  return formatJSONResponse({
    message: 'Processed'
  })
}
