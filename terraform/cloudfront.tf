resource "aws_cloudfront_distribution" "portfolio-cdn" {
    enabled = true
    aliases = ["walofcode.com", "www.walofcode.com"]
    price_class = "PriceClass_100"

    origin {
      domain_name = aws_s3_bucket.static-content-bucket.bucket_regional_domain_name
      origin_id = "S3-StaticContent"
      origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    }

    origin {
      domain_name = aws_lb.portfolio-alb.dns_name
      origin_id = "ALB-SiteBackend"
      custom_origin_config {
        http_port = 80
        https_port = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols = ["TLSv1.2"]
      }
    }

    default_cache_behavior {
      target_origin_id = "ALB-SiteBackend"
      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods = ["GET", "HEAD"]
      viewer_protocol_policy = "redirect-to-https"
      cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
      origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
    }

    ordered_cache_behavior {
      path_pattern           = "/static/*"
      target_origin_id       = "S3-StaticContent"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD"]
      cached_methods  = ["GET", "HEAD"]

      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    }

    restrictions {
        geo_restriction {
            restriction_type = "none"
        }
    }

    viewer_certificate {
        acm_certificate_arn = aws_acm_certificate.portfolio-certificate.arn
        ssl_support_method = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
    }
}

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name = "s3-static-content-oac-control"
    description = "Origin Access Control for the static content s3 bucket."
    origin_access_control_origin_type = "s3"
    signing_behavior = "always" // Always creates a notification if a change is made
    signing_protocol = "sigv4"
}