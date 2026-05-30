# William A. L.'s Portfolio Website

This is my cost-effective, statically generated, and serverless full stack portfolio website where I showcase my software projects and writeups about each of them. Any projects missing from my website can usually be found on my GitHub. Live project demos coming soon.

# Portfolio Tech Stack

 - React.js for frontend
 - Serverless FastAPI with Mangum for backend
 - Cognito for admin portal auth
 - Google Auth Platform for user comment identity
 - SQLAlchemy ORM with Aurora Serverless V2 Postgres with scale to zero for RDBMS
 - Terraform for IaC

# Infrastructure

![AWS Infrastructure Diagram](/readme_files/infrastructure_diagram.png)

### Infrastructure Q and A:

---

**Why is the Lambda backend outside of the VPC?**

*This is to avoid having to pay NAT gateway fees since the Lambda needs to handle internet inbound and outbound traffic.*

---

**Why do you have an API Gateway for a single lambda function?**

*When I start to add demos of my software projects, the ones requiring backend code will exist as their own serverless microservices. The API gateway is a nessicary service to route traffic to the microservice compute infrastructure.*

---

**Why not just use cognito for user and admin accounts?**

*This would make sense if user accounts were for more than just commenting on projects. I feel that it is a more intuitive, lower commitment, and seamless user experience if my users are able to just sign in with their pre-existing google accounts though.*

---

**How do you communicate with the scale to zero database when it needs to boot from being auto-paused?**

*The backend keeps retrying database queries for longer than the database's boot time until it gets a response.*

---

**How are you querying the database with SQLAlchemy using the Data API?**

*I am using an SQLAlchemy dialect extension called "sqlalchemy-aurora-data-api".*

---

**Why aren't you using Elasticache to cache database queries?**

*Elasticache serverless does not have a scale to zero option. My goal was for this web site to be as cost effective as possible and Elasticache serverless incurs a minimum monthly fee.*

# To Do List

 - Simplify authorization by adding Google Auth client as a federated identity provider to cognito
 - Add live demos of projects as microservices
 - Add automatic inappropriate comment blocking using Amazon Comprehend
 - Add user management admin portal for blocking users from commenting