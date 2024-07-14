import { Bucket, Function, StackContext } from "sst/constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cr from "aws-cdk-lib/custom-resources";
import * as iam from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function S3Stack({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";

  //TODO - Fix permissions
  const bucket = new Bucket(stack, "CasesBucket", {
    cdk: {
      bucket: {
        publicReadAccess: true,
        cors: [
          {
            allowedMethods: [s3.HttpMethods.GET],
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
          },
        ],
        // removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        removalPolicy: RemovalPolicy.RETAIN,
      },
    },
  });

  const uploadFunction = new Function(stack, "UploadFunction", {
    handler: "src/scripts/uploadJson.handler",
    bind: [bucket],
    permissions: ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
  });

  // Create a Custom Resource that uses the Lambda function
  new cr.AwsCustomResource(stack, "UploadJSONResource", {
    onCreate: {
      service: "Lambda",
      action: "invoke",
      parameters: {
        FunctionName: uploadFunction.functionName,
        Payload: JSON.stringify({
          bucketName: bucket.bucketName,
          fileName: "cases.json",
          imagesDirectory: "src/data/cases-images",
        }),
      },
      physicalResourceId: cr.PhysicalResourceId.of("UploadJSONResource"),
    },
    policy: cr.AwsCustomResourcePolicy.fromStatements([
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: [uploadFunction.functionArn],
      }),
    ]),
  });

  // Create a CloudFront distribution
  const distribution = new cloudfront.Distribution(stack, "CasesDistribution", {
    defaultBehavior: {
      origin: new origins.S3Origin(bucket.cdk.bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
  });

  stack.addOutputs({
    CasesBucketName: bucket.cdk.bucket.bucketName,
    CasesDistributionId: distribution.distributionId,
    CasesDistributionDomainName: distribution.distributionDomainName,
  });

  return {
    bucket,
    distribution,
  };
}
