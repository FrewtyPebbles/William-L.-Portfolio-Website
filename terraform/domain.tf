resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "walofcode.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio-cdn.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.walofcode.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio-cdn.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio-cdn.hosted_zone_id
    evaluate_target_health = false
  }
}