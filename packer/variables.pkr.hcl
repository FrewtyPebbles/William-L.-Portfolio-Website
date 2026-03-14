
variable "aws_region" {
  type    = string
  default = "us-west-1"
}


variable "ami_prefix" {
  type    = string
  default = "amazon-linux-docker"
}

variable "ecr_uri" {
    type = string
}