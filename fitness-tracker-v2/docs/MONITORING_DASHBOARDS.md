# Monitoring Dashboards and Cost Management

## Overview

This document describes the monitoring dashboards, alerting rules, and cost management strategies for the Fitness Tracker application in production.

## CloudWatch Dashboards

### Application Metrics Dashboard

**URL**: [Dashboard Link](https://console.aws.amazon.com/cloudwatch/)

**Widgets**:

1. **Request Metrics**
   - Total requests (1 hour)
   - Successful requests (5XX rate)
   - Failed requests (4XX/5XX)
   - Average response time
   - P95/P99 latency

2. **Database Metrics**
   - CPU utilization
   - Database connections
   - Read/Write IOPS
   - Storage usage
   - Replication lag

3. **System Metrics**
   - Memory usage
   - Disk usage
   - Network I/O
   - Process count

4. **Custom Business Metrics**
   - Active users
   - Workouts completed
   - Plans created
   - API response times by endpoint

### Infrastructure Dashboard

**Widgets**:

1. **Auto Scaling**
   - Current capacity
   - Target capacity
   - Scaling events

2. **Load Balancer**
   - Request count
   - Target response time
   - Healthy hosts
   - Unhealthy hosts

3. **CDN (CloudFront)**
   - Cache hit rate
   - Bandwidth
   - Error rate
   - Origin requests

## Alerting Rules

### Critical Alerts (PagerDuty)

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Error Rate | > 5% | PagerDuty + Slack |
| Database CPU | > 80% | PagerDuty + Slack |
| Response Time (P95) | > 2s | PagerDuty |
| Disk Space | < 20% | PagerDuty |
| Database Connections | > 80 | PagerDuty |
| Active Hosts | < 1 | PagerDuty + Email |

### Warning Alerts (Slack)

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Error Rate | > 1% | Slack |
| Database CPU | > 60% | Slack |
| Response Time (P95) | > 1s | Slack |
| Memory Usage | > 75% | Slack |
| Cache Hit Rate | < 80% | Slack |
| Cost Anomaly | > $500/day | Slack |

### Info Alerts (Email)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Deployment Complete | - | Email |
| Backup Complete | - | Email |
| New Release Deployed | - | Email |

## Cost Budgets

### Monthly Budgets

#### Development Environment
- **Budget**: $50/month
- **Alert at**: $40 (80%)
- **Soft limit**: $45 (90%)
- **Hard limit**: $50 (100%)

#### Production Environment
- **Budget**: $500/month
- **Alert at**: $400 (80%)
- **Soft limit**: $450 (90%)
- **Hard limit**: $500 (100%)

#### Total Application
- **Budget**: $550/month
- **Alert at**: $440 (80%)
- **Soft limit**: $495 (90%)
- **Hard limit**: $550 (100%)

### Cost Breakdown

#### Typical Monthly Costs

**AWS Services**:
- EC2/RDS: $100/month
- S3 Storage: $5/month
- CloudWatch: $10/month
- Data Transfer: $15/month
- Load Balancer: $16/month
- **Total**: ~$150/month

**Firebase**:
- Authentication: $25/month
- Hosting: $10/month
- **Total**: $35/month

**Third-Party**:
- Sentry: $26/month
- Vercel: Free tier (0)
- **Total**: $26/month

**Total Infrastructure**: ~$210/month

#### Cost Optimization Strategies

1. **Reserved Instances**
   - Save up to 75% on RDS
   - Estimated savings: $50/month

2. **Auto Scaling**
   - Scale down during off-peak hours
   - Estimated savings: $30/month

3. **Spot Instances**
   - Use for development environments
   - Estimated savings: $20/month

4. **Caching**
   - Reduce database queries
   - Estimated savings: $15/month

5. **CDN**
   - CloudFront for static assets
   - Estimated savings: $10/month

**Potential Savings**: $125/month (~60% reduction)

## Cost Monitoring Dashboard

### AWS Cost Explorer

**Configuration**:
- Time period: Last 3 months
- Group by: Service
- Forecast: Enabled
- Budget alerts: Enabled

**Widgets**:
1. Total cost (3 months)
2. Cost by service
3. Cost forecast
4. Budget vs actual
5. Top cost drivers

### Custom Cost Dashboard

**Widgets**:
1. **Daily Costs**
   - Day-by-day breakdown
   - Budget burn rate
   - Forecast to end of month

2. **Service Breakdown**
   - RDS costs
   - EC2 costs
   - S3 costs
   - Data transfer costs

3. **Cost Anomaly Detection**
   - Unusual spikes
   - Unusual drops
   - Trending changes

## Sentry Dashboard

### Error Tracking

**Metrics**:
- Error rate (errors per hour)
- Error distribution by type
- Affected users
- Error frequency trends

**Key Errors to Monitor**:
1. Authentication failures
2. Database connection errors
3. API timeouts
4. Client-side errors

### Performance Monitoring

**Metrics**:
- Response time (P50, P95, P99)
- Throughput (requests per second)
- Apdex score
- Slow transactions

**Transactions to Monitor**:
1. `/api/workouts` - Workout fetching
2. `/api/workout-plans` - Plan fetching
3. `/api/goals` - Goal operations
4. `/api/records` - Record operations

## Cost Alerts

### CloudWatch Alarms

```python
# Example: Cost anomaly alert
aws cloudwatch put-metric-alarm \
  --alarm-name fitness-tracker-cost-anomaly \
  --alarm-description "Alert if cost exceeds budget" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### AWS Budgets

**Setup**:
1. Go to AWS Budgets
2. Create monthly cost budget
3. Set threshold at 80%
4. Configure email/SNS notifications

**Actions on Threshold**:
- 80%: Email notification
- 90%: Slack notification
- 100%: SNS alert to DevOps team

## Real-time Monitoring

### Dashboard Access

**Internal Dashboard**: [Grafana Dashboard](http://grafana.internal)
**Metrics Endpoint**: `/metrics` (Prometheus format)
**Health Check**: `/health` (JSON format)

### Key Metrics to Watch

1. **Request Rate**: Target 1000 req/min
2. **Error Rate**: Target < 1%
3. **Response Time**: Target P95 < 500ms
4. **Database CPU**: Target < 60%
5. **Disk Usage**: Target < 70%
6. **Memory Usage**: Target < 75%

## Cost Optimization Checklist

### Monthly Review

- [ ] Review AWS Cost Explorer
- [ ] Check for unused resources
- [ ] Review Reserved Instance savings
- [ ] Analyze data transfer costs
- [ ] Review S3 storage costs
- [ ] Check for abandoned instances
- [ ] Review RDS instance sizing
- [ ] Check for duplicate resources

### Quarterly Review

- [ ] Analyze cost trends
- [ ] Review auto-scaling policies
- [ ] Evaluate Reserved Instance options
- [ ] Review and update budgets
- [ ] Identify cost optimization opportunities
- [ ] Review third-party service costs
- [ ] Plan capacity adjustments

## Emergency Procedures

### If Costs Spike

1. **Immediate Actions**:
   - Check CloudWatch for spike source
   - Review recent deployments
   - Check for resource leaks
   - Review data transfer costs

2. **Short-term (24 hours)**:
   - Scale down non-critical resources
   - Enable cost optimization features
   - Review and cancel unused resources

3. **Long-term (1 week)**:
   - Complete cost analysis
   - Implement right-sizing
   - Enable Reserved Instances
   - Review architecture for efficiency

## Reporting

### Daily Reports

- Email: Cost summary
- Slack: Daily costs
- Dashboard: Real-time metrics

### Weekly Reports

- Cost breakdown by service
- Top cost drivers
- Optimization opportunities
- Forecast vs actual

### Monthly Reports

- Complete cost analysis
- Trends and patterns
- Budget performance
- Recommendations
- Infrastructure changes

## Tools and Integrations

### AWS Services

- **Cost Explorer**: Cost analysis
- **AWS Budgets**: Budget management
- **Trusted Advisor**: Optimization recommendations
- **CloudWatch**: Monitoring and alerting

### Third-Party Tools

- **Sentry**: Error tracking
- **Datadog**: Infrastructure monitoring (optional)
- **Grafana**: Custom dashboards (optional)
- **PagerDuty**: Incident management

## Budget Forecasting

### 3-Month Forecast

**Month 1**: $200
**Month 2**: $250 (more users)
**Month 3**: $300 (peak usage)

**Factors**:
- User growth: +20% MoM
- Feature additions: +10% MoM
- Data growth: +15% MoM

### Annual Forecast

**Q1**: $600 (270 avg)
**Q2**: $900 (300 avg)
**Q3**: $1200 (400 avg)
**Q4**: $1500 (500 avg)

**Total**: ~$4200/year

## Success Metrics

- ✅ Uptime: 99.9%
- ✅ Error rate: < 1%
- ✅ Response time: P95 < 500ms
- ✅ Cost per user: < $0.50/month
- ✅ Cost efficiency: Trending downward
- ✅ Budget adherence: Within ±10%

---

**Last Updated**: January 2024  
**Owner**: DevOps Team  
**Review Frequency**: Monthly  
**Next Review**: [Date + 1 month]

