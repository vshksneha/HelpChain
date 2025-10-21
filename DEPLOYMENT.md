# 🚀 HelpChain - Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/helpchain)

### Option 2: Manual Deployment

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial HelpChain demo"
   git branch -M main
   git remote add origin https://github.com/yourusername/helpchain.git
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy" (no configuration needed!)

3. **Your Live Demo URLs**
   \`\`\`
   https://your-project-name.vercel.app/demo/donor
   https://your-project-name.vercel.app/demo/ngo  
   https://your-project-name.vercel.app/demo/volunteer
   \`\`\`

## 🎯 Demo Features

### Donor Demo (`/demo/donor`)
- Browse realistic aid packages with urgency levels
- Make donations with simulated blockchain transactions
- See funding progress update in real-time
- View transaction hashes and success notifications

### NGO Demo (`/demo/ngo`)
- Manage aid packages with full CRUD operations
- Track funding analytics and donor statistics
- Create new aid packages with image uploads
- Monitor package performance metrics

### Volunteer Demo (`/demo/volunteer`)
- View available delivery assignments
- Pledge deliveries and track status updates
- Complete deliveries with OTP confirmation
- See full delivery lifecycle management

## 🔧 Local Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
\`\`\`

## 📱 Sharing Your Demo

Once deployed, share these direct links:

**For Donors/Investors:**
`https://your-project.vercel.app/demo/donor`

**For NGO Partners:**
`https://your-project.vercel.app/demo/ngo`

**For Volunteer Organizations:**
`https://your-project.vercel.app/demo/volunteer`

**Landing Page:**
`https://your-project.vercel.app`

## 🎨 Customization

The demo uses realistic mock data that can be easily customized in:
- `app/demo/donor/page.tsx` - Aid packages and donor stats
- `app/demo/ngo/page.tsx` - NGO metrics and package management
- `app/demo/volunteer/page.tsx` - Delivery assignments and workflows

## 🚀 Next Steps

This demo is perfect for:
- **Presentations** - Show live functionality to stakeholders
- **User Testing** - Get feedback on UX/UI without backend setup
- **Development** - Extend with real backend and blockchain integration
- **Fundraising** - Demonstrate concept to investors

## 📞 Support

The demo is fully self-contained with no external dependencies, making it perfect for showcasing the HelpChain concept anywhere, anytime.
