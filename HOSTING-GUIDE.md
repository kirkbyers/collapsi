# Hosting Collapsi on Cloudflare Pages - Cost-Effective Guide

This guide walks you through hosting your Collapsi game on Cloudflare Pages for **free** using your Cloudflare account.

## Prerequisites

- Cloudflare account (free tier sufficient)
- Domain name registered with Cloudflare or transferred to Cloudflare DNS
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

### Option A: Push to GitHub (Recommended)
```bash
# Initialize git repository if not already done
git init
git add .
git commit -m "Initial Collapsi game commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/collapsi.git
git branch -M main
git push -u origin main
```

### Option B: Direct Upload (Alternative)
You can also upload files directly through Cloudflare Pages dashboard.

## Step 2: Set Up Cloudflare Pages

1. **Log into Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the left sidebar

2. **Create New Project**
   - Click "Create a project"
   - Choose "Connect to Git" or "Upload assets"

3. **Connect Repository** (if using Git)
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Cloudflare to access your repositories
   - Select your Collapsi repository

4. **Configure Build Settings**
   ```
   Framework preset: None
   Build command: (leave empty)
   Build output directory: (leave empty or "/")
   Root directory: (leave empty)
   Environment variables: (none needed)
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Your site will be available at `https://collapsi-xxx.pages.dev`

## Step 3: Configure Custom Domain

### Add Your Domain
1. In Cloudflare Pages project settings, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `collapsi.yourdomain.com` or `yourdomain.com`)
4. Cloudflare will automatically configure DNS if domain uses Cloudflare nameservers

### DNS Configuration
If your domain uses Cloudflare DNS, the CNAME record will be added automatically:
```
Type: CNAME
Name: collapsi (or @for root domain)
Target: collapsi-xxx.pages.dev
```

## Step 4: Enable Security Features (Free)

### SSL/TLS Configuration
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full (strict)" for maximum security
3. SSL certificate is automatically provisioned (free)

### Security Headers
Create a `_headers` file in your project root with these security headers:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Step 5: Performance Optimization (Free)

### Cloudflare Features to Enable
1. **Auto Minify**: HTML, CSS, JavaScript (Settings → Speed → Optimization)
2. **Brotli Compression**: Automatically enabled
3. **HTTP/2**: Automatically enabled
4. **Caching**: Automatically optimized for static sites

### Cache Rules (Optional)
For maximum performance, set cache rules:
- CSS files: Cache for 1 year
- JS files: Cache for 1 year  
- HTML files: Cache for 4 hours

## Cost Breakdown

### Completely Free Setup
- **Cloudflare Pages**: Free (500 builds/month, unlimited bandwidth)
- **SSL Certificate**: Free
- **Global CDN**: Free
- **DDoS Protection**: Free (basic)
- **Analytics**: Free (basic)

### Optional Paid Features
- **Custom domain**: $8-15/year (domain registration cost only)
- **Pro Plan**: $20/month (advanced analytics, image optimization)
- **Advanced security**: $200/month (Web Application Firewall, etc.)

## Deployment Workflow

### Automatic Deployments
Once connected to Git, deployments are automatic:
1. Push changes to your repository
2. Cloudflare Pages automatically builds and deploys
3. Changes are live within 1-2 minutes

### Manual Deployments
For direct uploads:
1. Compress your files into ZIP
2. Upload through Cloudflare Pages dashboard
3. Deploy manually

## Domain Configuration Examples

### Subdomain Setup
```
Game URL: https://collapsi.yourdomain.com
DNS Record: CNAME collapsi → collapsi-xxx.pages.dev
```

### Root Domain Setup
```
Game URL: https://yourdomain.com
DNS Record: CNAME @ → collapsi-xxx.pages.dev
```

## Performance Benefits

- **Global CDN**: 275+ locations worldwide
- **HTTP/3**: Latest protocol support
- **Edge caching**: Sub-100ms response times
- **Mobile optimization**: Automatic image optimization
- **Zero cold starts**: Always-on static hosting

## Maintenance

### Updates
- Git-based: Simply push changes to trigger deployment
- Direct upload: Re-upload files through dashboard

### Monitoring
- View analytics in Cloudflare Pages dashboard
- Monitor performance and visitor statistics
- Set up alerts for downtime (Pro plan)

## Troubleshooting

### Common Issues
1. **Build Failures**: Ensure no build process needed (pure static files)
2. **Domain Not Working**: Check DNS propagation (up to 24 hours)
3. **CSS/JS Not Loading**: Verify file paths are relative, not absolute

### Support Resources
- Cloudflare Community: [community.cloudflare.com](https://community.cloudflare.com)
- Pages Documentation: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

## Total Setup Time: 15-30 minutes
## Total Cost: $0 (plus domain registration if needed)

Your Collapsi game will be globally distributed, secure, and lightning-fast on Cloudflare's network!