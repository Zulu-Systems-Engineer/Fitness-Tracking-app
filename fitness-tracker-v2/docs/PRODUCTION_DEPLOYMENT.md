# Production Deployment Guide

## Overview
This guide covers the complete process of deploying the fitness tracker application to production, including infrastructure setup, security configuration, monitoring, and maintenance.

## Prerequisites
- Node.js 18+ installed
- pnpm package manager
- PostgreSQL database
- Firebase project setup
- Domain name and SSL certificate
- CI/CD pipeline configured

## Infrastructure Setup

### 1. Database Setup
```bash
# Create production database
createdb fitness_tracker_prod

# Set up environment variables
export DATABASE_URL="postgresql://username:password@localhost:5432/fitness_tracker_prod"

# Run migrations
cd functions
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### 2. Firebase Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy Firebase functions
firebase deploy --only functions

# Deploy Firebase hosting
firebase deploy --only hosting
```

### 3. Environment Variables
Create production environment files:

**Frontend (.env.production)**
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://your-api-domain.com
```

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/fitness_tracker_prod
JWT_SECRET=your_super_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
FIREBASE_PROJECT_ID=your_production_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Deployment Process

### 1. Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

### 2. Backend Deployment (Railway/Heroku)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=...
railway variables set JWT_SECRET=...
```

### 3. Database Deployment
```bash
# Set up production database
# Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)

# Run migrations
pnpm db:migrate

# Verify database connection
pnpm db:studio
```

## Security Configuration

### 1. SSL/TLS Setup
- Configure SSL certificates for all domains
- Enable HTTPS redirect
- Set up HSTS headers
- Configure CSP headers

### 2. Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. Database Security
- Enable SSL connections
- Configure firewall rules
- Set up connection pooling
- Enable audit logging

### 4. API Security
- Implement rate limiting
- Set up API authentication
- Configure CORS properly
- Enable request logging

## Monitoring & Observability

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2
npm install -g @sentry/cli

# Set up PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Configure Sentry
sentry-cli releases new $VERSION
sentry-cli releases files $VERSION upload-sourcemaps ./dist
```

### 2. Database Monitoring
- Set up database performance monitoring
- Configure slow query logging
- Set up connection monitoring
- Enable backup monitoring

### 3. Infrastructure Monitoring
- Set up server monitoring (CPU, memory, disk)
- Configure uptime monitoring
- Set up log aggregation
- Enable alerting

## Performance Optimization

### 1. Frontend Optimization
```bash
# Build with optimizations
pnpm build

# Analyze bundle size
pnpm build --analyze

# Enable compression
# Configure gzip/brotli compression
```

### 2. Backend Optimization
```bash
# Enable compression
npm install compression

# Set up caching
npm install redis

# Configure connection pooling
# Set up database indexes
```

### 3. CDN Configuration
- Set up CDN for static assets
- Configure caching headers
- Enable image optimization
- Set up edge locations

## Backup & Recovery

### 1. Database Backups
```bash
# Set up automated backups
pg_dump fitness_tracker_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Test restore process
psql fitness_tracker_test < backup_file.sql
```

### 2. Application Backups
- Set up code repository backups
- Configure environment variable backups
- Set up configuration backups
- Test disaster recovery procedures

## Maintenance & Updates

### 1. Regular Maintenance
- Update dependencies monthly
- Review security patches weekly
- Monitor performance metrics
- Clean up old logs and data

### 2. Update Process
```bash
# Test updates in staging
git checkout staging
git pull origin main
pnpm install
pnpm test
pnpm build

# Deploy to production
git checkout main
git pull origin main
pnpm install
pnpm test
pnpm build
# Deploy using CI/CD pipeline
```

### 3. Rollback Procedure
```bash
# Rollback to previous version
git checkout previous-version
pnpm install
pnpm build
# Deploy using CI/CD pipeline
```

## Troubleshooting

### 1. Common Issues
- Database connection errors
- Authentication failures
- Performance issues
- Security vulnerabilities

### 2. Debugging Tools
- Application logs
- Database logs
- Server logs
- Monitoring dashboards

### 3. Emergency Procedures
- Incident response plan
- Communication procedures
- Escalation procedures
- Recovery procedures

## Security Checklist

- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] Authentication secured
- [ ] Monitoring enabled
- [ ] Backup procedures tested
- [ ] Incident response plan ready

## Performance Checklist

- [ ] CDN configured
- [ ] Compression enabled
- [ ] Caching implemented
- [ ] Database optimized
- [ ] Images optimized
- [ ] Bundle size minimized
- [ ] Core Web Vitals optimized
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Performance budget defined

## Conclusion
This deployment guide provides a comprehensive approach to deploying the fitness tracker application to production. Follow these steps carefully and adapt them to your specific infrastructure and requirements.

For additional support, refer to the documentation or contact the development team.
