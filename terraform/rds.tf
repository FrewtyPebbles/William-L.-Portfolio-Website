resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "portfolio-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_rds_cluster" "portfolio_db" {
  cluster_identifier = "portfolio-db"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "16.3"
  database_name      = "portfoliodb"
  master_username    = data.dotenv.config.env["DATABASE_USERNAME"]
  master_password    = data.dotenv.config.env["DATABASE_PASSWORD"]

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  storage_encrypted   = true
  skip_final_snapshot = true

  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name

  serverlessv2_scaling_configuration {
    min_capacity             = 0.0 # scale to zero
    max_capacity             = 1.0 # Minimum capacity
  }
}

resource "aws_rds_cluster_instance" "portfolio_instance" {
  identifier         = "portfolio-db-1"
  cluster_identifier = aws_rds_cluster.portfolio_db.id
  instance_class     = "db.serverless" # this makes it serverless v2
  engine             = aws_rds_cluster.portfolio_db.engine
  engine_version     = aws_rds_cluster.portfolio_db.engine_version
}
