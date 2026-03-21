data "dotenv" "config" {
  filename = "../.env"
}

variable "region" {
    description = "The availability zone for the application."
    type = string
    default = "us-west-1"
}

variable "ENVIRONMENT" {
  type        = string
  description = "prod | dev"
  default = "prod"
}