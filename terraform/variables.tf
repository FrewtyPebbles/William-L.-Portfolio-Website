variable "region" {
    description = "The availability zone for the application."
    type = string
    default = "us-west-1"
}

variable "database_username" {
  type        = string
  description = "The database username"
  sensitive   = true # Prevents the value from showing in plan output
}

variable "database_password" {
  type        = string
  description = "The database password"
  sensitive   = true # Prevents the value from showing in plan output
}

variable "ENVIRONMENT" {
  type        = string
  description = "PROD | DEV"
}