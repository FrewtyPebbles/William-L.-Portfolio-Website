# db_credentials
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

resource "aws_secretsmanager_secret" "google_cloud_credentials" {
  name = "portfolio-google-cloud-credentials"

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_secretsmanager_secret_version" "google_cloud_credentials" {
  secret_id = aws_secretsmanager_secret.google_cloud_credentials.id
  secret_string = file("${path.module}/../${data.dotenv.config.env["GOOGLE_CLIENT_SECRETS_PATH"]}")# LOAD/READ GOOGLE SECRETS FILE
}
