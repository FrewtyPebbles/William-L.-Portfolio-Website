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
