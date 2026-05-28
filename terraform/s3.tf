locals {
  public_dir   = "${path.module}/../public/static"
  frontend_dir = "${path.module}/../frontend/dist"
  root_dir     = "${path.module}/.."
  mime_types = {
    html    = "text/html"
    htm     = "text/html"
    css     = "text/css"
    txt     = "text/plain"
    lua     = "text/plain"
    obj     = "text/plain"
    mtl     = "text/plain"
    fs      = "text/plain"
    vs      = "text/plain"
    md      = "text/markdown"
    js      = "application/javascript"
    mjs     = "text/javascript"
    json    = "application/json"
    jar     = "application/java-archive"
    png     = "image/png"
    jpg     = "image/jpeg"
    jpeg    = "image/jpeg"
    svg     = "image/svg+xml"
    sh      = "application/x-sh"
    pdf     = "application/pdf"
    mp4     = "video/mp4"
    mpeg    = "video/mpeg"
    mp3     = "audio/mpeg"
    ico     = "image/vnd.microsoft.icon"
    gif     = "image/gif"
    csv     = "text/csv"
    bmp     = "image/bmp"
    bin     = "application/octet-stream"
    avi     = "video/x-msvideo"
    avif    = "image/avif"
    apng    = "image/apng"
    epub    = "application/epub+zip"
    jsonld  = "application/ld+json"
    mid     = "audio/midi"
    midi    = "audio/midi"
    otf     = "font/otf"
    php     = "application/x-httpd-php"
    ppt     = "application/vnd.ms-powerpoint"
    pptx    = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    rar     = "application/vnd.rar"
    rtf     = "application/rtf"
    tif     = "image/tiff"
    tiff    = "image/tiff"
    ttf     = "font/ttf"
    wav     = "audio/wav"
    weba    = "audio/webm"
    webm    = "video/webm"
    webmanifest = "application/manifest+json"
    webp    = "image/webp"
    woff    = "font/woff"
    woff2   = "font/woff2"
    xhtml   = "application/xhtml+xml"
    xml     = "application/xml"
    zip     = "application/zip"
    "7z"    = "application/x-7z-compressed"
  }
}

# Static content bucket
resource "aws_s3_bucket" "static-content-bucket" {
  bucket = "portfolio-site-static-content-bucket"
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
    sid    = "AllowCloudFrontOACReadOnly"
    effect = "Allow"
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

# Upload static files (vanta_assets, images, svgs, etc.)
resource "aws_s3_object" "public_files" {
  for_each = fileset(local.public_dir, "**/*")

  bucket = aws_s3_bucket.static-content-bucket.id
  key    = "static/${each.value}"
  source = "${local.public_dir}/${each.value}"

  content_type = lookup(local.mime_types, reverse(split(".", each.value))[0], "application/octet-stream")

  etag = filemd5("${local.public_dir}/${each.value}")
}

# Upload frontend SPA build
resource "aws_s3_object" "frontend_files" {
  for_each = fileset(local.frontend_dir, "**/*")

  bucket = aws_s3_bucket.static-content-bucket.id
  key    = each.value
  source = "${local.frontend_dir}/${each.value}"

  content_type = lookup(local.mime_types, reverse(split(".", each.value))[0], "application/octet-stream")

  etag = filemd5("${local.frontend_dir}/${each.value}")
}

# Upload environment file to global bucket
resource "aws_s3_object" "env" {
  bucket = "global-files-wal-aws"
  key    = "portfolio/.env"
  source = "${local.root_dir}/.env"

  content_type = "text/plain"

  etag = filemd5("${local.root_dir}/.env")
}

# This bucket stores my lambda function
# we use a separate bucket for deployment efficiency, security,
# and deployment vs prod environment separation.
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "portfolio-site-lambda-bucket"
}

resource "aws_s3_bucket_public_access_block" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}