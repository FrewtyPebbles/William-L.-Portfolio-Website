# William A. L.'s Portfolio Website

This is my cost-effective serverless full stack portfolio website where I show live demos of my web-deployable projects along with write ups about all of my projects.  Any projects missing from my website can usually be found on my GitHub.

# Portfolio Tech Stack

 - React.js for frontend
 - Serverless FastAPI with Mangum for backend
 - Cognito for admin portal auth
 - SQLAlchemy ORM with Aurora Serverless V2 Postgres with scale to zero for RDBMS
 - Terraform for IaC

# Infrastructure

![AWS Infrastructure Diagram](/readme_files/portfolio%20aws%20infrastructure%20diagram.png)

### Infrastructure Q and A:

---

**Why is the Lambda backend outside of the VPC?**

*This is to avoid having to pay NAT gateway fees since the Lambda needs to handle internet inbound and outbound traffic.*

---

**How do you communicate with the scale to zero database when it needs to boot from being auto-paused?**

*The backend keeps retrying database queries for longer than the database's boot time until it gets a response.*

---

**How are you querying the database with SQLAlchemy using the Data API?**

*I am using an SQLAlchemy dialect extension called "sqlalchemy-aurora-data-api".*

---

**Why aren't you using Elasticache to cache database queries?**

*Elasticache serverless does not have a scale to zero option. My goal was for this web site to be as cost effective as possible and Elasticache serverless incurs a minimum monthly fee.*