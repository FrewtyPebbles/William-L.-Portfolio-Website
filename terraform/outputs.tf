output "static_content_bucket_name" {
  description = "The name of the static content bucket."
  value       = aws_s3_bucket.static-content-bucket.id
}

output "s3_region" {
  value = aws_s3_bucket.static-content-bucket.region
}

output "cdn_domain_name" {
  value = aws_cloudfront_distribution.portfolio-cdn.domain_name
}

output "api_gateway_url" {
  description = "The API Gateway endpoint URL."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID."
  value       = aws_cognito_user_pool.admin_pool.id
}
