resource "aws_cloudfront_vpc_origin" "ec2_vpc_origin" {
  lifecycle {
    replace_triggered_by = [aws_instance.web-server]
  }

  vpc_origin_endpoint_config {
    name                   = "EC2-Private-Origin"
    arn                    = aws_instance.web-server.arn
    http_port              = 80
    https_port             = 443
    origin_protocol_policy = "http-only"

    origin_ssl_protocols {
      items    = ["TLSv1.2"]
      quantity = 1
    }
  }
}

resource "aws_cloudfront_distribution" "portfolio-cdn" {
  lifecycle {
    replace_triggered_by = [aws_cloudfront_vpc_origin.ec2_vpc_origin]
  }
  
  depends_on = [aws_acm_certificate_validation.portfolio-certificate]

  enabled     = true
  aliases     = ["walofcode.com", "www.walofcode.com"]
  price_class = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.static-content-bucket.bucket_regional_domain_name
    origin_id                = "S3-StaticContent"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  origin {
    domain_name = aws_instance.web-server.private_dns
    origin_id   = "EC2-DirectBackend"

    vpc_origin_config {
      vpc_origin_id = aws_cloudfront_vpc_origin.ec2_vpc_origin.id
    }
  }

  default_cache_behavior {
    target_origin_id         = "EC2-DirectBackend"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }

  ordered_cache_behavior {
    path_pattern           = "/static/*"
    target_origin_id       = "S3-StaticContent"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.portfolio-certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "s3-static-content-oac-control"
  description                       = "Origin Access Control for the static content s3 bucket."
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
