# Infrastructure as Code

This directory contains Terraform configuration for deploying the Fitness Tracker application infrastructure to AWS.

## Prerequisites

1. **AWS CLI** installed and configured
2. **Terraform** >= 1.0 installed
3. **AWS Account** with appropriate permissions
4. **S3 Bucket** for Terraform state (create manually first)

## Quick Start

### 1. Set Up S3 Backend (First Time Only)

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://fitness-tracker-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket fitness-tracker-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket fitness-tracker-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 2. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 3. Set Variables

Create `terraform.tfvars`:

```hcl
aws_region        = "us-east-1"
environment       = "prod"
project_name      = "fitness-tracker"
db_password       = "your-secure-password-here" # Generate with: openssl rand -base64 32
allocated_storage = 20
```

### 4. Plan the Infrastructure

```bash
terraform plan -out=tfplan
```

### 5. Apply the Infrastructure

```bash
terraform apply tfplan
```

### 6. Get Outputs

```bash
terraform output
```

## Architecture

The infrastructure provisions:

### Networking
- **VPC** with public and private subnets across 2 availability zones
- **Internet Gateway** for public internet access
- **Route Tables** for traffic routing

### Database
- **RDS PostgreSQL** instance in private subnets
- **Security Groups** restricting database access to backend only
- **Automated Backups** with 7-day retention
- **Performance Insights** enabled for query analysis
- **Encrypted Storage** at rest

### Application
- **Application Load Balancer** for high availability
- **Security Groups** for frontend and backend access
- **Auto Scaling** (configure as needed)

### Monitoring
- **CloudWatch Alarms** for:
  - High CPU utilization
  - High database connections
  - Application response time
- **CloudWatch Dashboard** for metrics visualization
- **SNS Topic** for alert notifications

## Environment-Specific Deployments

### Development

```bash
terraform workspace new dev
terraform workspace select dev
terraform apply -var="environment=dev" -var="db_password=dev-password"
```

### Staging

```bash
terraform workspace new staging
terraform workspace select staging
terraform apply -var="environment=staging" -var="db_password=staging-password"
```

### Production

```bash
terraform workspace new prod
terraform workspace select prod
terraform apply -var="environment=prod" -var="db_password=prod-password"
```

## Cost Estimates

### Development Environment
- RDS db.t3.micro: ~$15/month
- Application Load Balancer: ~$16/month
- Data Transfer: ~$5/month
- **Total**: ~$36/month

### Production Environment
- RDS db.t3.medium: ~$60/month
- Application Load Balancer: ~$16/month
- Data Transfer: ~$20/month
- **Total**: ~$96/month

*Prices are estimates and may vary by region and usage*

## Cost Optimization

1. **Right-sizing**: Use smaller instances for dev/staging
2. **Reserved Instances**: Reserve capacity for production
3. **Auto Scaling**: Scale down during off-peak hours
4. **Storage**: Enable Auto Scaling on RDS for pay-as-you-grow
5. **Monitoring**: Set up cost budgets with alerts

## Maintenance

### Update Infrastructure

```bash
terraform plan
terraform apply
```

### Destroy Infrastructure

⚠️ **WARNING**: This will delete all resources!

```bash
terraform destroy
```

### Backup Database

```bash
# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier fitness-tracker-db-prod \
  --db-snapshot-identifier manual-snapshot-$(date +%Y%m%d)
```

## Security Best Practices

1. **Never commit secrets** - Use Terraform Cloud or AWS Secrets Manager
2. **Use encrypted state** - Enable S3 bucket encryption
3. **Limit access** - Use IAM roles with least privilege
4. **Enable VPC Flow Logs** - Monitor network traffic
5. **Regular patching** - Keep RDS engine updated
6. **Network isolation** - Private subnets for databases

## Troubleshooting

### Terraform State Lock

If you get a state lock error:

```bash
# Check for locks
terraform force-unlock <LOCK_ID>

# Or in Terraform Cloud, unlock from the UI
```

### Connection Issues

```bash
# Test RDS connectivity
psql -h <RDS_ENDPOINT> -U postgres -d fitness_tracker

# Test from within VPC
aws ec2 run-instances --image-id ami-xxx --subnet-id subnet-xxx
```

## Resources Created

- 1x VPC
- 4x Subnets (2 public, 2 private)
- 1x Internet Gateway
- 2x Route Tables
- 1x RDS PostgreSQL Instance
- 3x Security Groups
- 1x Application Load Balancer
- 2x CloudWatch Alarms
- 1x SNS Topic
- 1x CloudWatch Dashboard

## Next Steps

After provisioning infrastructure:

1. **Set up CI/CD** - Configure GitHub Actions to deploy to EC2/ECS
2. **Configure DNS** - Point your domain to the load balancer
3. **Set up SSL** - Request and configure ACM certificate
4. **Enable WAF** - Add Web Application Firewall for security
5. **Set up monitoring** - Configure CloudWatch dashboards and alerts
6. **Cost monitoring** - Set up AWS Cost Explorer and budgets

## Support

For issues or questions:
- Check CloudWatch logs
- Review Terraform state
- Consult AWS documentation
- Contact DevOps team

---

**Last Updated**: 2024  
**Maintained by**: DevOps Team  
**Version**: 1.0.0

