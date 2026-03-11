resource "aws_iam_role" "ec2_s3_role" {
  name = "ec2-s3-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_iam_policy" "ec2_s3_policy" {
  name = "ec2-s3-full-access-to-portfolio-bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "S3PortfolioStaticAccess"
        Effect   = "Allow"
        Action   = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.static-content-bucket.arn,
          "${aws_s3_bucket.static-content-bucket.arn}/*"
        ]
      }
    ]
  })
  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_iam_role_policy_attachment" "ec2_s3_attachment" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = aws_iam_policy.ec2_s3_policy.arn
}