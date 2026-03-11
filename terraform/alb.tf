resource "aws_lb" "portfolio-alb" {
    // This alb is just for acting as a proxy
    // for our https certificate
    name = "portfolio-alb"
    internal = false
    ip_address_type = "ipv4"
    load_balancer_type = "application"
    security_groups = [ aws_security_group.alb_sg.id ]
    subnets = module.vpc.public_subnets
    tags = {
        Name = "https-alb"
    }
}

resource "aws_lb_target_group" "alb-target-group" {
    name = "web-server-target-group"
    target_type = "instance"
    vpc_id = module.vpc.vpc_id

    port = 80
    protocol = "HTTP"
    tags = {
        Name = "portfolio-tg"
    }
    // TODO: Add a healthcheck
}

// Redirect HTTP traffic
resource "aws_lb_listener" "http" {
    load_balancer_arn = aws_lb.portfolio-alb.arn
    port = 80
    protocol = "HTTP"
    default_action {
      type = "redirect"
      redirect {
        port = 443
        protocol = "HTTPS"
        status_code = "HTTP_301"
      }
    }
}

resource "aws_lb_listener" "https" {
    load_balancer_arn = aws_lb.portfolio-alb.arn
    certificate_arn = aws_acm_certificate.portfolio-certificate.arn
    port = 443
    protocol = "HTTPS"
    ssl_policy = "ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09"
    default_action {
        type             = "forward"
        target_group_arn = aws_lb_target_group.alb-target-group.arn
    }
}