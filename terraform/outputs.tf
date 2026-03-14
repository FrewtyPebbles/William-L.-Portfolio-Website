output "static_content_bucket_name" {
    description = "The name of the static content bucket."
    value = aws_s3_bucket.static-content-bucket.id
}

output "s3_region" {
  value = aws_s3_bucket.static-content-bucket.region
}

output "cdn_domain_name" {
  value = aws_cloudfront_distribution.portfolio-cdn.domain_name
}