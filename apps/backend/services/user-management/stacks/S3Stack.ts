import { Bucket, StackContext } from "sst/constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function S3Stack({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";

  // Profile images bucket
  const profileImagesBucket = new Bucket(stack, "ProfileImagesBucket", {
    cdk: {
      bucket: {
        publicReadAccess: true,
        cors: [
          {
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
          },
        ],
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  // Create a CloudFront distribution for profile images
  const profileImagesDistribution = new cloudfront.Distribution(
    stack,
    "ProfileImagesDistribution",
    {
      defaultBehavior: {
        origin: new origins.S3Origin(profileImagesBucket.cdk.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    }
  );

  stack.addOutputs({
    ProfileImagesBucketName: profileImagesBucket.bucketName,
    ProfileImagesDistributionId: profileImagesDistribution.distributionId,
    ProfileImagesDistributionDomainName: profileImagesDistribution.distributionDomainName,
  });

  return {
    profileImagesBucket,
    profileImagesDistribution,
  };
}
