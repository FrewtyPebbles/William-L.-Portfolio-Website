
locals {
  public_dir = "${path.module}/../public/static"
  root_dir = "${path.module}/.."
  mime_types = {
    "html" = "text/html"
    "css"  = "text/css"
    "txt" = "text/plain"
    "md" = "text/plain"
    "js"   = "application/javascript"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "jpeg"  = "image/jpeg"
    "svg"  = "image/svg"
  }
}

resource "aws_s3_object" "public_files" {
  # for each recursively found file
  for_each = fileset(local.public_dir, "**/*")

  bucket = aws_s3_bucket.static-content-bucket.id
  key    = "static/${each.value}"
  source = "${local.public_dir}/${each.value}"

  content_type = lookup(local.mime_types, reverse(split(".", each.value))[0], "application/octet-stream")

  # important for terraform backend state
  etag = filemd5("${local.public_dir}/${each.value}")
}

resource "aws_s3_bucket" "static-content-bucket" {
  bucket = "portfolio-site-static-content-bucket"

  tags = {
    Application = "NodeApp"
  }
}

resource "aws_s3_bucket_public_access_block" "static_content" {
  bucket = aws_s3_bucket.static-content-bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "s3_cloudfront_policy" {
  statement {
    sid       = "AllowCloudFrontOACReadOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static-content-bucket.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.portfolio-cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_s3_access" {
  bucket = aws_s3_bucket.static-content-bucket.id
  policy = data.aws_iam_policy_document.s3_cloudfront_policy.json
}



// Static files s3 IAM role:
// These let the web server read and write files
// to the CDN's static s3 bucket

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
        Sid    = "S3PortfolioStaticAccess"
        Effect = "Allow"
        Action = [
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

// Global s3 bucket connection iam policy
// we will only allow it to make get requests 
// inside the portfolio/ subdirectory of the s3 bucket

data "aws_iam_policy_document" "s3_global_portfolio_folder_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::global-files-wal-aws/portfolio/*"]
    effect    = "Allow"
  }
}

resource "aws_iam_policy" "s3_global_portfolio_folder_limited_access" {
  name   = "S3GlobalPortfolioAccess"
  policy = data.aws_iam_policy_document.s3_global_portfolio_folder_policy.json
}

resource "aws_iam_role_policy_attachment" "ec2_s3_global_portfolio_folder_s3_attachment" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = aws_iam_policy.s3_global_portfolio_folder_limited_access.arn
}

// upload the .env.prod to the global bucket

resource "aws_s3_object" "env-prod" {
  bucket = "global-files-wal-aws"
  key    = "portfolio/.env.prod"
  source = "${local.root_dir}/.env.prod"

  content_type = "text/plain"

  # important for terraform backend state
  etag = filemd5("${local.root_dir}/.env.prod")
}