resource "aws_secretsmanager_secret" "db_credentials" {
  name = "portfolio-db-credentials"

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = data.dotenv.config.env["DATABASE_USERNAME"]
    password = data.dotenv.config.env["DATABASE_PASSWORD"]
  })
}
