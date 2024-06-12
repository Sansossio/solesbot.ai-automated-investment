import { SolesBotCoins } from "./solesbot/enum/coins";
import { SolesbotService } from "./solesbot/solesbot.service"

;(async () => {
  console.time('Solesbot')

  const service = new SolesbotService()

  await service.start()
  await service.login(
    process.env.SOLESBOT_EMAIL!,
    process.env.SOLESBOT_PASSWORD!
  )

  const data = await service.getData()

  console.log(JSON.stringify(data, null, 2))

  const coins = [
    SolesBotCoins.CAKE,
    SolesBotCoins.Polkadot
  ]

  const [pendingOperations, [cake, polkadot]] = await Promise.all([
    service.getPendingOperations(),
    service.getCoins(coins)
  ]);

  console.log(`Cake profit: ${cake.profit}`)
  console.log(`Polkadot profit: ${polkadot.profit}`)
  console.log(`Pending operations: ${pendingOperations.map((operation) => operation.coin.name).join(', ')}`)

  console.timeEnd('Solesbot')
})()
