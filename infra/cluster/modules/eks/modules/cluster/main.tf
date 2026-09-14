resource "aws_eks_cluster" "oauth_server_eks_cluster" {
  name     = var.eks_cluster_name
  role_arn = aws_iam_role.oauth_server_eks_cluster_role.arn

  vpc_config {
    subnet_ids = concat(var.private_subnet_ids, var.public_subnet_ids)
  }

  access_config {
    authentication_mode                         = "API"
    bootstrap_cluster_creator_admin_permissions = true
  }

  depends_on = [aws_iam_role_policy_attachment.oauth_server_eks_cluster_policy]
}
resource "aws_eks_access_entry" "oauth_server_admin_access_entry" {
  cluster_name  = aws_eks_cluster.oauth_server_eks_cluster.name
  principal_arn = aws_iam_role.oauth_server_eks_cluster_access_entry_admin_role.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "oauth_server_admin_access_entry_policy_association" {
  cluster_name  = aws_eks_cluster.oauth_server_eks_cluster.name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = aws_iam_role.oauth_server_eks_cluster_access_entry_admin_role.arn
  access_scope {
    type = "cluster"
  }
}

resource "aws_eks_access_entry" "oauth_server_root_user_admin_access_entry" {
  cluster_name  = aws_eks_cluster.oauth_server_eks_cluster.name
  principal_arn = "arn:aws:iam::${var.aws_account_id}:root"
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "oauth_server_root_user_admin_access_entry_policy_association" {
  cluster_name  = aws_eks_cluster.oauth_server_eks_cluster.name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = "arn:aws:iam::${var.aws_account_id}:root"
  access_scope {
    type = "cluster"
  }
}




