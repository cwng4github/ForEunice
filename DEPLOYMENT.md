# AWS S3 Deployment Guide

Complete guide for deploying the ForEunice Baby Tracker to AWS S3 as a static website.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Basic knowledge of AWS S3

## Quick Start

### 1. Build the Distribution Package

```bash
./build.sh
```

This creates:
- `dist/` directory with all static files
- `baby-tracker-s3-dist.zip` archive

### 2. Deploy to S3

```bash
cd dist
./deploy-to-s3.sh your-bucket-name us-east-1
```

Replace `your-bucket-name` with your desired bucket name and `us-east-1` with your preferred AWS region.

## Manual Deployment Steps

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://baby-tracker-app --region us-east-1
```

### Step 2: Upload Files

```bash
cd dist
aws s3 sync . s3://baby-tracker-app \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude "*.txt" \
  --exclude "bucket-policy.json" \
  --delete
```

### Step 3: Enable Static Website Hosting

```bash
aws s3 website s3://baby-tracker-app \
  --index-document index.html \
  --error-document error.html
```

### Step 4: Set Bucket Policy for Public Access

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::baby-tracker-app/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy \
  --bucket baby-tracker-app \
  --policy file://bucket-policy.json
```

### Step 5: Access Your Website

Your website will be available at:
```
http://baby-tracker-app.s3-website-us-east-1.amazonaws.com
```

## AWS Console Deployment (Alternative)

### 1. Create Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Enter bucket name: `baby-tracker-app`
4. Choose region
5. Uncheck "Block all public access"
6. Click "Create bucket"

### 2. Upload Files

1. Open your bucket
2. Click "Upload"
3. Drag and drop all files from `dist/` folder
4. Click "Upload"

### 3. Enable Static Website Hosting

1. Go to bucket "Properties" tab
2. Scroll to "Static website hosting"
3. Click "Edit"
4. Enable static website hosting
5. Set index document: `index.html`
6. Set error document: `error.html`
7. Save changes

### 4. Set Bucket Policy

1. Go to "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste the bucket policy JSON
5. Save changes

## CloudFront Setup (Optional - Recommended)

For HTTPS support and better performance:

### 1. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name baby-tracker-app.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

Or via AWS Console:

1. Go to CloudFront Console
2. Click "Create Distribution"
3. Origin domain: Select your S3 bucket
4. Origin access: Public
5. Default root object: `index.html`
6. Create distribution

### 2. Configure Custom Error Pages

1. Go to your distribution
2. Click "Error Pages" tab
3. Create custom error response:
   - HTTP error code: 404
   - Customize error response: Yes
   - Response page path: `/error.html`
   - HTTP response code: 404

### 3. (Optional) Add Custom Domain

1. Request SSL certificate in ACM (us-east-1 region)
2. Add CNAME record in your DNS
3. Add alternate domain name in CloudFront
4. Select your SSL certificate

## Cost Estimation

### S3 Costs (Approximate)
- Storage: ~$0.023 per GB/month
- GET requests: $0.0004 per 1,000 requests
- Data transfer: First 1 GB free, then $0.09 per GB

**Estimated monthly cost for low traffic**: $0.50 - $2.00

### CloudFront Costs (Optional)
- Data transfer: First 1 TB free (12 months), then $0.085 per GB
- Requests: $0.0075 per 10,000 HTTPS requests

**Estimated monthly cost with CloudFront**: $1.00 - $5.00

## Updating Your Deployment

### Quick Update

```bash
./build.sh
cd dist
./deploy-to-s3.sh baby-tracker-app us-east-1
```

### Manual Update

```bash
cd dist
aws s3 sync . s3://baby-tracker-app --delete
```

### CloudFront Cache Invalidation

If using CloudFront, invalidate cache after updates:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Monitoring and Maintenance

### Enable S3 Access Logging

```bash
aws s3api put-bucket-logging \
  --bucket baby-tracker-app \
  --bucket-logging-status file://logging.json
```

### Set Up CloudWatch Alarms

Monitor:
- Request count
- 4xx/5xx errors
- Data transfer

### Backup Strategy

Since data is stored in browser localStorage:
- Encourage users to export CSV regularly
- Consider adding cloud backup feature in future

## Security Best Practices

1. **Enable versioning** (optional):
   ```bash
   aws s3api put-bucket-versioning \
     --bucket baby-tracker-app \
     --versioning-configuration Status=Enabled
   ```

2. **Enable encryption**:
   ```bash
   aws s3api put-bucket-encryption \
     --bucket baby-tracker-app \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

3. **Set up CloudTrail** for audit logging

4. **Use CloudFront** for DDoS protection

## Troubleshooting

### Issue: 403 Forbidden Error

**Solution**: Check bucket policy allows public read access

### Issue: 404 Not Found

**Solution**: Verify index.html exists and static website hosting is enabled

### Issue: CSS/JS Not Loading

**Solution**: Check file paths in index.html are relative (not absolute)

### Issue: Data Not Persisting

**Solution**: This is expected - data is stored in browser localStorage, not on server

## Performance Optimization

1. **Enable Gzip Compression** (CloudFront):
   - Automatically compresses text files
   - Reduces bandwidth by ~70%

2. **Set Cache Headers**:
   ```bash
   aws s3 cp dist/css/styles.css s3://baby-tracker-app/css/styles.css \
     --cache-control "max-age=31536000"
   ```

3. **Use CloudFront** for global CDN

4. **Optimize Images** (if added in future)

## Rollback Procedure

If you need to rollback to a previous version:

1. **With versioning enabled**:
   ```bash
   aws s3api list-object-versions --bucket baby-tracker-app
   aws s3api copy-object \
     --copy-source baby-tracker-app/index.html?versionId=VERSION_ID \
     --bucket baby-tracker-app \
     --key index.html
   ```

2. **Without versioning**:
   - Keep local backups of dist/ folder
   - Redeploy from backup

## Support and Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

## Cleanup

To remove all resources:

```bash
# Empty bucket
aws s3 rm s3://baby-tracker-app --recursive

# Delete bucket
aws s3 rb s3://baby-tracker-app

# Delete CloudFront distribution (if created)
aws cloudfront delete-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --if-match ETAG
```

## Next Steps

After deployment:

1. ✅ Test the website thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Enable HTTPS via CloudFront
5. ✅ Share the URL with users
6. ✅ Document any customizations

---

**Note**: This is a static website. All user data is stored locally in the browser using localStorage. No server-side database is required.