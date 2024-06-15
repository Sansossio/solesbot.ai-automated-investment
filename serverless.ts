import type { AWS } from '@serverless/typescript';

import runner from './src/functions/runner';
import operator from './src/functions/operator';

const localRegion = 'us-west-1';

const serverlessConfiguration: AWS = {
  service: 'solesbot-aws',
  frameworkVersion: '3',
  plugins: ['serverless-offline-sqs-external', 'serverless-esbuild', 'serverless-offline', 'serverless-localstack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: '*'
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: {
          'Fn::GetAtt': ['SolesbotOperateQueue', 'Arn'],
        },
      },
    ],
  },
  // import the function via paths
  functions: { runner, operator },
  package: { individually: true },
  resources: {
    Resources: {
      // create s3
      SolesbotBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'solesbot-aws',
        },
      },
      // Operation queue
      SolesbotOperateQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'solesbot-aws-operate',
          VisibilityTimeout: 10 * 60, // 10 minutes
        },
      },
    }
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline-sqs-external': {
      autoCreate: true,
      host: 'localhost',
      port: 4566,
      region: localRegion,
      https: false,
      apiVersion: '2012-11-05',
      accessKeyId: 'root',
      secretAccessKey: 'root',
      skipCacheInvalidation: false,
    },
    'serverless-offline-s3': {
      host: 'localhost',
      port: 4566,
      region: localRegion,
    },
    localstack: {
      stages: ['local'],
    },
    sqs: {
      // get SolesbotOperateQueue URL
      operateQueueUrl: {
        Ref: 'SolesbotOperateQueue',
      }
    }
  },
};

module.exports = serverlessConfiguration;
