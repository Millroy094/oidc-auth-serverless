
data "aws_eks_cluster" "oauth_server_eks_cluster" {
  name = var.cluster_name
}

data "tls_certificate" "oauth_server_tls_certificate" {
  url        = data.aws_eks_cluster.oauth_server_eks_cluster.identity[0].oidc[0].issuer
  depends_on = [data.aws_eks_cluster.oauth_server_eks_cluster]
}

data "aws_eks_cluster_auth" "oauth_server_eks_cluster_auth" {
  name = var.cluster_name
}

resource "aws_iam_openid_connect_provider" "oauth_server_eks_oidc_provider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.oauth_server_tls_certificate.certificates[0].sha1_fingerprint]
  url             = data.aws_eks_cluster.oauth_server_eks_cluster.identity[0].oidc[0].issuer

  depends_on = [data.aws_eks_cluster.oauth_server_eks_cluster, data.tls_certificate.oauth_server_tls_certificate]

}

resource "aws_iam_role" "oauth_server_eks_service_account_role" {
  name = "oauth-server-eks-dynamodb-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.oauth_server_eks_oidc_provider.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${aws_iam_openid_connect_provider.oauth_server_eks_oidc_provider.url}:sub" = "system:serviceaccount:${var.cluster_namespace}:${var.oauth_server_service_account_name}"
        }
      }
    }]
  })

  depends_on = [aws_iam_openid_connect_provider.oauth_server_eks_oidc_provider]
}

resource "aws_iam_policy" "oauth_server_dynamodb_access_policy" {
  name = "oauth-server-eks-dynamodb-access-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = ["dynamodb:*"]
      Effect   = "Allow"
      Resource = [aws_dynamodb_table.user_dynamodb_table.arn, aws_dynamodb_table.client_dynamodb_table.arn, aws_dynamodb_table.oidc_store_dynamodb_table.arn, aws_dynamodb_table.otp_dynamodb_table.arn, aws_dynamodb_table.challenge_dynamodb_table.arn]
    }]
  })
}
resource "aws_iam_policy" "oauth_server_sns_sms_policy" {
  name        = "oauth-server-all-send-sms-via-sns"
  description = "Oauth server policy to allow user to send SMS using SNS"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sns:Publish",
          "sns:CreateTopic",
          "sns:DeleteTopic"
        ],
        Resource = "*"
      },
      {
        Effect   = "Allow",
        Action   = "sns:SetSMSAttributes",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_policy" {
  role       = aws_iam_role.oauth_server_eks_service_account_role.name
  policy_arn = aws_iam_policy.oauth_server_dynamodb_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_sns_policy" {
  role       = aws_iam_role.oauth_server_eks_service_account_role.name
  policy_arn = aws_iam_policy.oauth_server_sns_sms_policy.arn
}


provider "kubernetes" {
  host                   = data.aws_eks_cluster.oauth_server_eks_cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.oauth_server_eks_cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.oauth_server_eks_cluster_auth.token
}

resource "kubernetes_service_account" "oauth_server_dynamodb_service_account" {
  metadata {
    name      = var.oauth_server_service_account_name
    namespace = var.cluster_namespace
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.oauth_server_eks_service_account_role.arn
    }
  }

  depends_on = [aws_iam_role_policy_attachment.attach_dynamodb_policy, data.aws_eks_cluster_auth.oauth_server_eks_cluster_auth]
}
