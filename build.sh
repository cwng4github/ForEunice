#!/bin/bash

# Build script for AWS S3 deployment
# This script creates a distribution package ready for S3 static hosting

echo "🚀 Building distribution package for AWS S3..."

# Clean dist directory
echo "📦 Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Copy static HTML
echo "📄 Copying HTML files..."
cp views/index.ejs dist/index.html

# Update paths in HTML for static hosting
echo "🔧 Updating asset paths..."
sed -i '' 's|href="/css/|href="css/|g' dist/index.html
sed -i '' 's|src="/js/|src="js/|g' dist/index.html

# Copy CSS and JS
echo "🎨 Copying CSS and JavaScript..."
cp -r public/css dist/
cp -r public/js dist/

# Update JS for static version (remove server API calls)
echo "⚙️  Updating JavaScript for static hosting..."
# The app.js already uses localStorage, so it works as-is

# Create a simple error page
echo "📝 Creating error page..."
cat > dist/error.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>頁面未找到 - 嬰兒食瞓痾小助手</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-stone-100">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-stone-800 mb-4">404</h1>
    <p class="text-stone-600 mb-6">找不到此頁面</p>
    <a href="/" class="inline-block px-6 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-700">
      返回首頁
    </a>
  </div>
</body>
</html>
EOF

# Create deployment info file
echo "📋 Creating deployment info..."
cat > dist/DEPLOYMENT_INFO.txt << EOF
ForEunice Baby Tracker - AWS S3 Deployment Package
===================================================

Build Date: $(date)
Version: 1.0.0

Contents:
- index.html       : Main application page
- error.html       : 404 error page
- css/styles.css   : Custom styles
- js/app.js        : Application JavaScript

Deployment Instructions:
1. Upload all files to your S3 bucket
2. Enable static website hosting
3. Set index.html as the index document
4. Set error.html as the error document
5. Configure bucket policy for public read access
6. (Optional) Set up CloudFront for CDN

Features:
- All data stored in browser localStorage
- No server-side dependencies
- Works completely offline after first load
- Mobile-optimized (max-width: 480px)

Note: This is a static version. All data persists in the user's browser.
EOF

# Create a README for the dist folder
echo "📖 Creating distribution README..."
cat > dist/README.md << 'EOF'
# ForEunice Baby Tracker - S3 Distribution Package

This package contains the static files ready for deployment to AWS S3.

## Quick Deploy to AWS S3

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-baby-tracker-bucket
```

### 2. Upload Files

```bash
aws s3 sync . s3://your-baby-tracker-bucket --exclude "README.md" --exclude "DEPLOYMENT_INFO.txt"
```

### 3. Enable Static Website Hosting

```bash
aws s3 website s3://your-baby-tracker-bucket --index-document index.html --error-document error.html
```

### 4. Set Bucket Policy

Create a file named `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-baby-tracker-bucket/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy --bucket your-baby-tracker-bucket --policy file://bucket-policy.json
```

### 5. Access Your Site

Your site will be available at:
```
http://your-baby-tracker-bucket.s3-website-[region].amazonaws.com
```

## Optional: CloudFront Setup

For better performance and HTTPS support:

1. Create a CloudFront distribution
2. Set the S3 bucket as the origin
3. Configure custom domain (optional)
4. Enable HTTPS with ACM certificate

## Features

- ✅ Fully static - no server required
- ✅ All data stored in browser localStorage
- ✅ Works offline after first load
- ✅ Mobile-optimized design
- ✅ Age-based baby care templates (0-12 months)
- ✅ CSV export functionality

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Data Storage

All data is stored locally in the browser using localStorage:
- Baby birth date
- Reference feeding patterns
- Historical records
- Forecast predictions

**Important**: Data is device-specific and will be lost if browser data is cleared.

## Support

For issues or questions, refer to the main project repository.
EOF

# Create bucket policy template
echo "🔐 Creating bucket policy template..."
cat > dist/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
EOF

# Create deployment script
echo "📜 Creating deployment script..."
cat > dist/deploy-to-s3.sh << 'EOF'
#!/bin/bash

# AWS S3 Deployment Script
# Usage: ./deploy-to-s3.sh your-bucket-name [aws-region]

if [ -z "$1" ]; then
  echo "❌ Error: Bucket name is required"
  echo "Usage: ./deploy-to-s3.sh your-bucket-name [aws-region]"
  exit 1
fi

BUCKET_NAME=$1
REGION=${2:-us-east-1}

echo "🚀 Deploying to S3 bucket: $BUCKET_NAME"
echo "📍 Region: $REGION"

# Check if bucket exists
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
  echo "📦 Creating bucket..."
  aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
fi

# Upload files
echo "📤 Uploading files..."
aws s3 sync . "s3://$BUCKET_NAME" \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude "*.txt" \
  --exclude "bucket-policy.json" \
  --delete

# Enable static website hosting
echo "🌐 Enabling static website hosting..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document error.html

# Update bucket policy
echo "🔐 Updating bucket policy..."
cat > /tmp/bucket-policy.json << POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
POLICY

aws s3api put-bucket-policy \
  --bucket "$BUCKET_NAME" \
  --policy file:///tmp/bucket-policy.json

rm /tmp/bucket-policy.json

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "✅ Deployment complete!"
echo "🌍 Website URL: $WEBSITE_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Visit the URL above to test your site"
echo "   2. (Optional) Set up CloudFront for HTTPS and better performance"
echo "   3. (Optional) Configure a custom domain"
EOF

chmod +x dist/deploy-to-s3.sh

# Create archive
echo "📦 Creating distribution archive..."
cd dist
zip -r ../baby-tracker-s3-dist.zip . -x "*.DS_Store"
cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Distribution package created in: ./dist/"
echo "📦 Archive created: ./baby-tracker-s3-dist.zip"
echo ""
echo "📋 Files in distribution:"
ls -lh dist/
echo ""
echo "🚀 To deploy to AWS S3:"
echo "   cd dist"
echo "   ./deploy-to-s3.sh your-bucket-name"
echo ""
echo "📖 See dist/README.md for detailed deployment instructions"

# Made with Bob
