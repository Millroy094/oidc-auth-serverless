# CI/CD IAM roles

Two AWS IAM roles are used by the deployment pipeline, both assumed via OIDC (no long-lived AWS keys). Neither definition lives in this repo — they're provisioned in a separate shared infra repo — this doc just records the permissions each one needs.

## GitHub Actions deployment role

Assumed directly by CI (`.github/workflows/deploy.yml`) to upload the Lambda artifact, sync the frontend to S3, and invalidate CloudFront. This is separate from, and narrower than, the Terraform Cloud role below — it never touches Terraform state or provisions infrastructure.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArtifactsBucket",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:HeadBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::oidc-auth-artifacts",
        "arn:aws:s3:::oidc-auth-artifacts/*"
      ]
    },
    {
      "Sid": "WebsiteBucketSync",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::oidc-auth-website",
        "arn:aws:s3:::oidc-auth-website/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/*"
    }
  ]
}
```

## Terraform Cloud role

Assumed by the Terraform Cloud run to provision/update all infrastructure (`infra/environments/production`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucket*",
        "s3:PutBucket*",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetAccelerateConfiguration",
        "s3:GetBucketAcl",
        "s3:GetBucketLogging",
        "s3:GetBucketObjectLockConfiguration",
        "s3:GetBucketRequestPayment",
        "s3:GetReplicationConfiguration",
        "s3:GetLifecycleConfiguration",
        "s3:GetBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::oidc-auth-website",
        "arn:aws:s3:::oidc-auth-website/*",
        "arn:aws:s3:::oidc-auth-artifacts",
        "arn:aws:s3:::oidc-auth-artifacts/*"
      ]
    },
    {
      "Sid": "CloudFront",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:TagResource",
        "cloudfront:UntagResource",
        "cloudfront:ListTagsForResource",
        "cloudfront:CreateCloudFrontOriginAccessIdentity",
        "cloudfront:GetCloudFrontOriginAccessIdentity",
        "cloudfront:DeleteCloudFrontOriginAccessIdentity",
        "cloudfront:CreateFunction",
        "cloudfront:UpdateFunction",
        "cloudfront:DeleteFunction",
        "cloudfront:GetFunction",
        "cloudfront:DescribeFunction",
        "cloudfront:PublishFunction"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Lambda",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:GetFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:TagResource",
        "lambda:ListTags",
        "lambda:ListVersionsByFunction",
        "lambda:GetFunctionCodeSigningConfig"
      ],
      "Resource": "arn:aws:lambda:<region>:<account-id>:function:*"
    },
    {
      "Sid": "ApiGateway",
      "Effect": "Allow",
      "Action": ["apigateway:*"],
      "Resource": "arn:aws:apigateway:<region>::/*"
    },
    {
      "Sid": "DynamoDB",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:UpdateTable",
        "dynamodb:DeleteTable",
        "dynamodb:TagResource",
        "dynamodb:UntagResource",
        "dynamodb:ListTagsOfResource",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:UpdateTimeToLive",
        "dynamodb:DescribeContinuousBackups"
      ],
      "Resource": "arn:aws:dynamodb:<region>:<account-id>:table/*"
    },
    {
      "Sid": "SNS",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:DeleteTopic",
        "sns:TagResource",
        "sns:UntagResource",
        "sns:ListTagsForResource"
      ],
      "Resource": "arn:aws:sns:<region>:<account-id>:*"
    },
    {
      "Sid": "SSM",
      "Effect": "Allow",
      "Action": [
        "ssm:PutParameter",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:DeleteParameter",
        "ssm:AddTagsToResource",
        "ssm:ListTagsForResource"
      ],
      "Resource": "arn:aws:ssm:<region>:<account-id>:parameter/oidc-auth/*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:PutRetentionPolicy",
        "logs:DescribeLogGroups",
        "logs:TagResource",
        "logs:ListTagsForResource",
        "logs:CreateLogDelivery",
        "logs:DeleteLogDelivery",
        "logs:UpdateLogDelivery",
        "logs:PutDeliverySource",
        "logs:DescribeDeliveries",
        "logs:GetDeliverySource",
        "logs:GetLogDelivery",
        "logs:ListDeliveries",
        "logs:ListLogDeliveries",
        "logs:ListDeliveryDestinations",
        "logs:PutResourcePolicy",
        "logs:DescribeResourcePolicies",
        "logs:PutDestination",
        "logs:PutDestinationPolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAM",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:GetRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:PassRole",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole"
      ],
      "Resource": "arn:aws:iam::<account-id>:role/oidc-auth-*"
    },
    {
      "Sid": "ACM",
      "Effect": "Allow",
      "Action": [
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:GetCertificate",
        "acm:DeleteCertificate",
        "acm:AddTagsToCertificate",
        "acm:RemoveTagsFromCertificate",
        "acm:ListTagsForCertificate"
      ],
      "Resource": "arn:aws:acm:us-east-1:<account-id>:certificate/*"
    },
    {
      "Sid": "RandomRequired",
      "Effect": "Allow",
      "Action": ["ssm:DescribeParameters"],
      "Resource": "*"
    }
  ]
}
```
