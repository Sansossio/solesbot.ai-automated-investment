import { S3 } from 'aws-sdk'

export class S3Service {
  private s3: S3

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.AWS_ENDPOINT,
      s3ForcePathStyle: !!process.env.AWS_ENDPOINT
    })
  }

  async listBuckets() {
    return this.s3.listBuckets().promise()
  }

  async getObject(bucket: string, key: string) {
    return this.s3.getObject({
      Bucket: bucket,
      Key: key
    }).promise()
  }

  async getObjectParsed(bucket: string, key: string) {
    try {
      const object = await this.getObject(bucket, key)
      return JSON.parse(object.Body.toString())
    } catch (error) {
      return undefined;
    }
  }

  async putObject(bucket: string, key: string, body: string) {
    return this.s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: body
    }).promise()
  }
}
