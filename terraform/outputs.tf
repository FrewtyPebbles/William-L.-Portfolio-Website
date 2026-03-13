output "alb_dns_name" {
    description = "DNS name of the load balancer."
    value = aws_lb.portfolio-alb.dns_name
}

output "alb_zone_id" {
    description = "Zone ID of the load balancer (for Route 53 alias records)"
    value = aws_lb.portfolio-alb.zone_id
}

output "alb_arn" {
    description = "ARN of the load balancer"
    value = aws_lb.portfolio-alb.arn
}

output "https_listener_arn" {
    description = "ARN of the HTTPS listener"
    value = aws_lb_listener.https.arn
}

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