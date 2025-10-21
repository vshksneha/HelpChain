# HelpChain Deployment Guide

## Pre-Deployment Checklist

### 1. Smart Contract Deployment
- [ ] Deploy contract to Mumbai testnet using Hardhat
- [ ] Verify contract on PolygonScan
- [ ] Save contract address and ABI
- [ ] Fund deployer wallet with test MATIC

### 2. Database Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Configure network access (allow all IPs for production)
- [ ] Create database user with read/write permissions
- [ ] Get connection string

### 3. File Storage Setup
- [ ] Create Cloudinary account
- [ ] Get API credentials (cloud name, API key, API secret)
- [ ] Configure upload presets

## Backend Deployment (Render)

### Step 1: Repository Setup
1. Push your code to GitHub
2. Ensure `package.json` has correct scripts:
   \`\`\`json
   {
     "scripts": {
       "start": "node server.js",
       "build": "echo 'No build step required'"
     }
   }
   \`\`\`

### Step 2: Render Configuration
1. Connect GitHub repository to Render
2. Choose "Web Service" type
3. Configure build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18.x

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

**Required Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MONGODB_URI` = `your-mongodb-connection-string`
- `JWT_SECRET` = `your-secure-jwt-secret`
- `MUMBAI_RPC_URL` = `https://rpc-mumbai.maticvigil.com`
- `PRIVATE_KEY` = `your-wallet-private-key`
- `CONTRACT_ADDRESS` = `your-deployed-contract-address`
- `FRONTEND_URL` = `https://your-frontend-domain.vercel.app`

**Optional Variables:**
- `CLOUDINARY_CLOUD_NAME` = `your-cloudinary-cloud-name`
- `CLOUDINARY_API_KEY` = `your-cloudinary-api-key`
- `CLOUDINARY_API_SECRET` = `your-cloudinary-api-secret`

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-app-name.onrender.com`

## Frontend Deployment (Vercel)

### Step 1: Vercel Setup
1. Connect GitHub repository to Vercel
2. Choose "Next.js" framework preset
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 2: Environment Variables
Add these environment variables in Vercel dashboard:

- `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.onrender.com/api`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` = `your-deployed-contract-address`
- `NEXT_PUBLIC_MUMBAI_RPC_URL` = `https://rpc-mumbai.maticvigil.com`

### Step 3: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-app-name.vercel.app`

## Post-Deployment Testing

### 1. API Health Check
Test your backend endpoints:
\`\`\`bash
# Health check
curl https://your-backend.onrender.com/api/health

# Test CORS
curl -H "Origin: https://your-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/auth/login
\`\`\`

### 2. Database Connection
- Check MongoDB Atlas metrics
- Verify collections are created
- Test user registration/login

### 3. Blockchain Connection
- Test contract interaction from backend
- Verify RPC endpoint connectivity
- Check transaction broadcasting

### 4. Frontend Integration
- Test API calls from frontend
- Verify environment variables are loaded
- Check CORS configuration

## Production Maintenance

### Keeping Render Service Active
Render free tier services sleep after 15 minutes of inactivity. To prevent this during demonstrations:

1. **Use a monitoring service** (recommended):
   - Set up UptimeRobot or similar
   - Ping your API every 10 minutes
   - Configure: `https://your-backend.onrender.com/api/health`

2. **Manual keep-alive** (temporary):
   - Open browser tab to your API
   - Refresh every 10-15 minutes before demo

### Monitoring and Alerts
1. Set up error tracking (Sentry recommended)
2. Monitor API response times
3. Set up database connection alerts
4. Monitor blockchain RPC endpoint status

### Security Considerations
1. Rotate JWT secrets regularly
2. Monitor for suspicious API usage
3. Keep dependencies updated
4. Review access logs regularly

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for specific errors

**CORS errors:**
- Verify `FRONTEND_URL` environment variable
- Check CORS middleware configuration
- Ensure frontend URL matches exactly

**Blockchain connection fails:**
- Verify RPC URL is accessible
- Check private key format (no 0x prefix in env var)
- Ensure contract address is correct

**Database connection issues:**
- Verify MongoDB Atlas network access
- Check connection string format
- Ensure database user has correct permissions

### Getting Help
- Check Render logs: Dashboard → Service → Logs
- Check Vercel logs: Dashboard → Project → Functions
- Monitor MongoDB Atlas: Dashboard → Metrics
- Use browser dev tools for frontend debugging

## Success Criteria
Your deployment is successful when:
- [ ] Backend API responds to health checks
- [ ] Frontend loads without errors
- [ ] User registration/login works
- [ ] Aid package creation works
- [ ] Donation flow completes
- [ ] Blockchain transactions are recorded
- [ ] All environment variables are configured
- [ ] CORS is properly configured
- [ ] Database operations work correctly
