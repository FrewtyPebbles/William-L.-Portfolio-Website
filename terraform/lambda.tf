resource "aws_s3_object" "lambda_code" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "lambda/lambda.zip"
  source = "${path.module}/../backend/lambda.zip"
  etag   = filemd5("${path.module}/../backend/lambda.zip")
}

resource "aws_lambda_function" "api" {
  function_name = "portfolio-api"
  handler       = "app.main.handler"
  runtime       = "python3.12"
  timeout       = 60
  memory_size   = 256

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_code.key

  source_code_hash = aws_s3_object.lambda_code.checksum_sha256

  role    = aws_iam_role.lambda_role.arn
  publish = true

  environment {
    variables = {
      ENVIRONMENT             = var.ENVIRONMENT
      DB_NAME                 = aws_rds_cluster.portfolio_db.database_name
      AURORA_CLUSTER_ARN      = aws_rds_cluster.portfolio_db.arn
      AURORA_SECRET_ARN       = aws_secretsmanager_secret.db_credentials.arn
      S3_BUCKET_NAME          = aws_s3_bucket.static-content-bucket.id
      S3_REGION               = var.region
      COGNITO_USER_POOL_ID    = aws_cognito_user_pool.admin_pool.id
      COGNITO_CLIENT_ID       = aws_cognito_user_pool_client.admin_client.id
      GOOGLE_CLOUD_SECRET_ARN = aws_secretsmanager_secret.google_cloud_credentials.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_policy_attach,
    aws_cognito_user_pool.admin_pool,
    aws_cognito_user_pool_client.admin_client,
  ]

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "portfolio-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins     = ["https://walofcode.com", "https://www.walofcode.com", "http://localhost:5173"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["*"]
    allow_credentials = true
    max_age           = 86400
  }

  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  description            = "FastAPI Mangum Integration"
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# JWT Authorizer for Admin routes
resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  name             = "cognito-jwt-authorizer"
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.admin_client.id]
    issuer   = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.admin_pool.id}"
  }
}

resource "aws_apigatewayv2_route" "public_catch_all" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "delete_comment" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /api/project/{project_slug}/comments"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "check_admin" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /api/admin/check"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
  authorization_type = "JWT"
}
