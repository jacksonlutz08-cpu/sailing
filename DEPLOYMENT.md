# BlueHorizon Deployment Guide

Deploy BlueHorizon to production across multiple platforms.

---

## 🚀 Vercel (Recommended - Easiest)

Vercel is the creator of Next.js. PWA support is built-in.

### 1. Prepare for Deployment
```bash
# Ensure everything builds locally
npm run build

# Check for TypeScript errors
npm run lint
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Initial BlueHorizon commit"
git push origin main
```

### 3. Deploy to Vercel
- Go to https://vercel.com/new
- Import your GitHub repository
- Add environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_STORMGLASS_API_KEY
  NEXT_PUBLIC_EXCHANGERATE_API_KEY
  NEXT_PUBLIC_NOAA_APPLICATION_ID
  SUPABASE_SERVICE_ROLE_KEY
  ```
- Click "Deploy"

### 4. Enable PWA
Vercel automatically serves `public/sw.js` and `public/manifest.json`.

**Verify PWA status:**
```bash
# After deployment, test with Lighthouse
npx lighthouse https://your-domain.vercel.app --view
```

### 5. Custom Domain
In Vercel dashboard:
- Settings → Domains
- Add your custom domain (e.g., `bluehorizon.app`)
- Point DNS records

---

## 🐳 Docker (Self-Hosted)

For deployment on your own infrastructure.

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### 2. Build Docker Image
```bash
docker build -t bluehorizon:latest .
```

### 3. Run Locally
```bash
docker run \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  bluehorizon:latest
```

### 4. Push to Registry
```bash
docker tag bluehorizon:latest myregistry/bluehorizon:latest
docker push myregistry/bluehorizon:latest
```

### 5. Deploy to Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bluehorizon
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bluehorizon
  template:
    metadata:
      labels:
        app: bluehorizon
    spec:
      containers:
      - name: app
        image: myregistry/bluehorizon:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: bluehorizon-secrets
              key: supabase-url
        - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: bluehorizon-secrets
              key: supabase-key
```

---

## ☁️ AWS (EC2 + S3)

### 1. Create EC2 Instance
```bash
# Launch Ubuntu 24.04 LTS instance
# Security groups: Allow ports 80, 443
```

### 2. SSH and Install Runtime
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### 3. Clone and Deploy
```bash
# Clone repository
git clone https://github.com/your-repo/sailing.git
cd sailing

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=..." > .env.local

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name bluehorizon

# Set PM2 to restart on reboot
pm2 startup
pm2 save
```

### 4. Setup Reverse Proxy (Nginx)
```bash
sudo apt install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/bluehorizon > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/bluehorizon \
  /etc/nginx/sites-enabled/bluehorizon

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ⚡ Netlify

### 1. Prepare Repository
```bash
# Ensure next.config.js is configured
npm run build
```

### 2. Deploy via Git
- Go to https://app.netlify.com
- Connect your GitHub repository
- Build command: `npm run build`
- Publish directory: `.next`

### 3. Environment Variables
In Netlify dashboard → Site settings → Build & deploy:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STORMGLASS_API_KEY
NEXT_PUBLIC_EXCHANGERATE_API_KEY
NEXT_PUBLIC_NOAA_APPLICATION_ID
```

### 4. Edge Functions (Optional)
Create `netlify/edge-functions/auth.ts` for custom auth logic.

---

## 📱 iOS/Android (Via Ionic or React Native)

Currently not planned, but BlueHorizon as a PWA works on mobile browsers:

1. **iOS Safari**: Home Screen → "Add to Home Screen"
2. **Android Chrome**: Menu → "Install app"

Works offline with Service Worker caching.

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Supabase RLS policies enabled
- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS/TLS configured
- [ ] CORS policies set correctly
- [ ] Rate limiting enabled on API
- [ ] Encryption keys stored securely
- [ ] Backups configured
- [ ] Monitoring & alerts set up
- [ ] PWA service worker tested offline
- [ ] Lighthouse audit passed

---

## 📊 Monitoring

### Vercel
- Dashboard shows auto-deployed status
- Analytics included
- Alerts for failures

### Docker / Self-Hosted
```bash
# Application logs
tail -f ~/.pm2/logs/bluehorizon-out.log

# CPU/Memory usage
pm2 monit

# Setup monitoring
npm install -g pm2-plus
pm2 plus
```

### Supabase
- Supabase dashboard shows database usage
- Set up alerts for storage limits
- Monitor real-time activity

---

## 🚀 Auto-Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Pre-Deployment Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Test PWA
npm run build && npm start
# Open DevTools → Application → Service Workers
# Verify offline support works

# Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

---

## 📝 Rollback Procedure

### Vercel
- Vercel dashboard → Deployments
- Click the previous deployment
- Click "Promote to Production"

### Docker
```bash
# Revert to previous image
docker pull myregistry/bluehorizon:previous-tag
docker run ... myregistry/bluehorizon:previous-tag
```

---

## 💬 Support

- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Happy sailing! ⛵**
