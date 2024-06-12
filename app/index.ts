import { SolesbotService } from "./services/solesbot.service"

;(async () => {
  const service = new SolesbotService()

  await service.start()
  await service.login(
    process.env.SOLESBOT_EMAIL!,
    process.env.SOLESBOT_PASSWORD!
  )

  const data = await service.getData()

  console.log(JSON.stringify(data, null, 2))
})()
