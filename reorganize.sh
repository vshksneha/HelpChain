#!/bin/bash

# Script to reorganize the project into frontend and backend folders
# This script moves all frontend-related files to a 'frontend' folder
# while keeping backend files in the existing 'backend' folder

set -e

echo "Starting project reorganization..."

# Create frontend directory
mkdir -p frontend

# Move Next.js app files to frontend
echo "Moving Next.js application files..."
mv app frontend/
mv components frontend/
mv contexts frontend/
mv hooks frontend/
mv lib frontend/
mv public frontend/
mv styles frontend/

# Move Next.js config files to frontend
echo "Moving Next.js configuration files..."
mv next.config.mjs frontend/
mv tsconfig.json frontend/
mv tailwind.config.ts frontend/
mv postcss.config.mjs frontend/
mv components.json frontend/

# Move blockchain-related files to backend
echo "Moving blockchain files to backend..."
mv contracts backend/
mv scripts backend/
mv test backend/
mv hardhat.config.js backend/

# Keep root-level config files
echo "Keeping root-level config files..."
# .env, .gitignore, package.json, render.yaml, vercel.json, README.md, DEPLOYMENT.md stay at root

# Create frontend package.json
echo "Creating frontend/package.json..."
cat > frontend/package.json << 'EOF'
{
  "name": "helpchain-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "autoprefixer": "^10.4.20",
    "axios": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "ethers": "latest",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.16",
    "next-themes": "^0.4.4",
    "react": "^18",
    "react-day-picker": "9.8.0",
    "react-dom": "^18",
    "react-hook-form": "^7.54.1",
    "react-hot-toast": "latest",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
EOF

# Update backend package.json to include hardhat dependencies
echo "Updating backend/package.json with blockchain dependencies..."
cat > backend/package.json << 'EOF'
{
  "name": "helpchain-backend",
  "version": "1.0.0",
  "description": "Backend API for HelpChain - Blockchain-based aid distribution platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:hardhat": "npx hardhat test",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "build": "echo 'No build step required for Node.js backend'",
    "deploy": "npx hardhat run scripts/deploy.js",
    "compile": "npx hardhat compile"
  },
  "keywords": ["blockchain", "humanitarian", "aid", "express", "mongodb", "ethereum"],
  "author": "HelpChain Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1",
    "ethers": "latest",
    "axios": "^1.5.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "nodemailer": "^6.9.4",
    "crypto": "^1.0.1",
    "moment": "^2.29.4",
    "joi": "^17.9.2",
    "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
    "@nomicfoundation/hardhat-ethers": "^3.0.0",
    "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@nomicfoundation/hardhat-verify": "^2.0.0",
    "@typechain/ethers-v6": "^0.5.0",
    "@typechain/hardhat": "^9.0.0",
    "hardhat": "^2.26.0",
    "hardhat-gas-reporter": "latest",
    "solidity-coverage": "latest",
    "ts-node": "latest",
    "typechain": "latest",
    "chai": "latest"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "eslint": "^8.47.0",
    "eslint-config-node": "^4.1.0",
    "@types/jest": "^29.5.4",
    "@types/chai": "latest",
    "@types/mocha": "latest"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Create root package.json for workspace management
echo "Creating root package.json..."
cat > package.json << 'EOF'
{
  "name": "helpchain-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "build": "npm run build:backend && npm run build:frontend",
    "start:frontend": "cd frontend && npm start",
    "start:backend": "cd backend && npm start",
    "test:backend": "cd backend && npm test",
    "test:hardhat": "cd backend && npm run test:hardhat",
    "deploy:contracts": "cd backend && npm run deploy"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

# Update docs to reflect new structure
echo "Creating REORGANIZATION.md documentation..."
cat > REORGANIZATION.md << 'EOF'
# Project Reorganization

The project has been reorganized into a monorepo structure with separate frontend and backend folders.

## New Structure

```
project/
├── frontend/           # Next.js application
│   ├── app/           # Next.js pages and layouts
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── public/        # Static assets
│   ├── styles/        # Global styles
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/           # Express server + Blockchain
│   ├── contracts/     # Solidity smart contracts
│   ├── scripts/       # Hardhat deployment scripts
│   ├── test/          # Smart contract tests
│   ├── routes/        # Express API routes
│   ├── models/        # MongoDB models
│   ├── middleware/    # Express middleware
│   ├── server.js      # Express server entry point
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/              # Documentation
├── .env               # Environment variables
├── .gitignore
├── package.json       # Root workspace config
└── README.md
```

## Running the Application

### Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd frontend && npm install
cd backend && npm install
```

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

### Build

```bash
# Build both
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### Blockchain Development

```bash
# Compile smart contracts
cd backend && npm run compile

# Run contract tests
npm run test:hardhat

# Deploy contracts
npm run deploy:contracts
```

## Environment Variables

Both frontend and backend will read from the root `.env` file. Make sure to configure:

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address

**Backend:**
- `PORT` - Backend server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

**Blockchain:**
- `PRIVATE_KEY` - Ethereum wallet private key for deployment
- `INFURA_API_KEY` - Infura API key for network access

## Migration Notes

- All frontend code is now in the `frontend/` folder
- All backend API and blockchain code is in the `backend/` folder
- No logic has been changed, only file locations
- Import paths within each folder remain the same
- Configuration files are separated per module
EOF

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "New structure:"
echo "  📁 frontend/  - Next.js application"
echo "  📁 backend/   - Express server + Smart contracts"
echo ""
echo "Next steps:"
echo "  1. Run: npm run install:all"
echo "  2. Review REORGANIZATION.md for details"
echo "  3. Update any absolute import paths if needed"
echo "  4. Test: npm run dev"
echo ""
