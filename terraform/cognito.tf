resource "aws_cognito_user_pool" "admin_pool" {
  name = "portfolio-admin-pool"

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_cognito_user_pool_client" "admin_client" {
  name                = "portfolio-admin-client"
  user_pool_id        = aws_cognito_user_pool.admin_pool.id
  generate_secret     = false

  explicit_auth_flows = [
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  access_token_validity  = 24
  id_token_validity      = 24
  refresh_token_validity = 30
}

resource "aws_cognito_user" "admin" {
  user_pool_id     = aws_cognito_user_pool.admin_pool.id
  username         = data.dotenv.config.env["COGNITO_ADMIN_USERNAME"]
  password         = data.dotenv.config.env["COGNITO_ADMIN_PASSWORD"]
  message_action   = "SUPPRESS"

  attributes = {
    email = "admin@walofcode.com"
  }
}
