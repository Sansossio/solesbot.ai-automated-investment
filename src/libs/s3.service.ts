import { S3 } from 'aws-sdk'

export class S3Service {
  private readonly s3: S3

  constructor () {
    this.s3 = new S3({
      endpoint: process.env.AWS_ENDPOINT,
      s3ForcePathStyle: Boolean(process.env.AWS_ENDPOINT)
    })
  }

  async listBuckets (): Promise<S3.ListBucketsOutput> {
    return await this.s3.listBuckets().promise()
  }

  async getObject (bucket: string, key: string): Promise<S3.GetObjectOutput> {
    return await this.s3.getObject({
      Bucket: bucket,
      Key: key
    }).promise()
  }

  async getObjectParsed <T> (bucket: string, key: string): Promise<T | undefined> {
    try {
      const object = await this.getObject(bucket, key)
      return JSON.parse(object.Body?.toString() ?? '')
    } catch (error) {
      return undefined
    }
  }

  async putObject (bucket: string, key: string, body: string): Promise<S3.PutObjectOutput> {
    return await this.s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: body
    }).promise()
  }
}
