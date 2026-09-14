resource "aws_eks_node_group" "private-nodes" {
  cluster_name    = var.eks_cluster_name
  node_group_name = "oauth-server-node-groups"
  node_role_arn   = aws_iam_role.oauth_server_eks_node_groups_role.arn

  subnet_ids = var.private_subnet_ids

  capacity_type  = "ON_DEMAND"
  instance_types = ["t3.small"]

  scaling_config {
    desired_size = 1
    max_size     = 5
    min_size     = 0
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "general"
  }

  depends_on = [
    aws_iam_role_policy_attachment.auth_server_node_group_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.auth_server_node_group_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.oauth_server_node_group_AmazonEC2ContainerRegistryReadOnly,
  ]
}
