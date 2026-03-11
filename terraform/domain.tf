data "aws_route53_zone" "portfolio-domain" {
  name = "walofcode.com"
}

resource "aws_route53_record" "portfolio-a-record1" {
    zone_id = data.aws_route53_zone.portfolio-domain.zone_id
    name = "walofcode.com"
    type = "A"

    alias {
        name = aws_cloudfront_distribution.portfolio-cdn.domain_name
        zone_id = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "portfolio-a-record2" {
    zone_id = data.aws_route53_zone.portfolio-domain.zone_id
    name = "www.walofcode.com"
    type = "A"

    alias {
        name = aws_cloudfront_distribution.portfolio-cdn.domain_name
        zone_id = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
        evaluate_target_health = false
    }
}

// IPV6 support
resource "aws_route53_record" "portfolio-aaaa-record1" {
  zone_id = data.aws_route53_zone.portfolio-domain.zone_id
  name    = "walofcode.com"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.portfolio-cdn.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

// IPV6 support
resource "aws_route53_record" "portfolio-aaaa-record2" {
  zone_id = data.aws_route53_zone.portfolio-domain.zone_id
  name    = "www.walofcode.com"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.portfolio-cdn.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
    evaluate_target_health = false
  }
}