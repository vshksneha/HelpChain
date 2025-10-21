# Project Reorganization Guide

## Overview

This guide explains how to reorganize your HelpChain project into a clean frontend/backend structure.

## Current Structure Issues

Currently, the project has mixed concerns:
- Frontend (Next.js) files at the root level
- Backend already in `backend/` folder
- Blockchain contracts, scripts, and tests at the root level
- Configuration files mixed together

## Target Structure

```
helpchain/
├── frontend/                 # Next.js Application
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # React components
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Frontend utilities
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   ├── next.config.mjs      # Next.js configuration
│   ├── tsconfig.json        # TypeScript config
│   ├── tailwind.config.ts   # Tailwind configuration
│   ├── postcss.config.mjs   # PostCSS configuration
│   ├── components.json      # shadcn/ui configuration
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Backend Server & Blockchain
│   ├── routes/              # Express API routes
│   ├── models/              # MongoDB models
│   ├── middleware/          # Express middleware
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Hardhat deployment scripts
│   ├── test/                # Smart contract tests
│   ├── server.js            # Express server entry
│   ├── hardhat.config.js    # Hardhat configuration
│   └── package.json         # Backend + blockchain dependencies
│
├── docs/                    # Documentation
├── .env                     # Environment variables (root)
├── .gitignore              # Git ignore patterns
├── package.json            # Workspace root configuration
├── README.md               # Project readme
└── DEPLOYMENT.md           # Deployment instructions
```

## Reorganization Steps

### Option 1: Automated Script

Run the provided shell script:

```bash
chmod +x reorganize.sh
./reorganize.sh
```

This will automatically:
1. Create the `frontend/` directory
2. Move all Next.js files to `frontend/`
3. Move blockchain files to `backend/`
4. Create appropriate `package.json` files
5. Set up a workspace configuration

### Option 2: Manual Steps

If you prefer to do it manually:

#### Step 1: Create Frontend Directory

```bash
mkdir -p frontend
```

#### Step 2: Move Frontend Files

```bash
# Move Next.js app files
mv app frontend/
mv components frontend/
mv contexts frontend/
mv hooks frontend/
mv lib frontend/
mv public frontend/
mv styles frontend/

# Move Next.js configuration files
mv next.config.mjs frontend/
mv tsconfig.json frontend/
mv tailwind.config.ts frontend/
mv postcss.config.mjs frontend/
mv components.json frontend/
```

#### Step 3: Move Blockchain Files to Backend

```bash
# Move blockchain-related files
mv contracts backend/
mv scripts backend/
mv test backend/
mv hardhat.config.js backend/
```

#### Step 4: Create Frontend Package.json

Create `frontend/package.json` with frontend-only dependencies (React, Next.js, UI libraries).

#### Step 5: Update Backend Package.json

Update `backend/package.json` to include Hardhat and blockchain dependencies.

#### Step 6: Create Root Package.json

Create a root `package.json` for workspace management.

## Post-Reorganization Setup

### 1. Install Dependencies

```bash
# From root directory
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Update Environment Variables

Ensure your `.env` file (at root) contains all necessary variables:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helpchain
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# Blockchain
PRIVATE_KEY=your_ethereum_private_key
INFURA_API_KEY=your_infura_api_key
```

### 3. Update Import Paths (If Needed)

Check for any absolute imports that might need updating:

**Frontend:** Most imports should be relative and won't need changes.

**Backend:** Update any imports that reference moved files.

### 4. Update Configuration Files

#### Update `frontend/next.config.mjs` if needed:

```javascript
const nextConfig = {
  // Your existing config
  // No changes should be needed unless you had custom paths
}
```

#### Update `backend/hardhat.config.js` paths:

```javascript
// Ensure paths point to correct locations
module.exports = {
  solidity: "0.8.19",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // ... rest of config
}
```

### 5. Update Scripts

The root `package.json` now includes workspace scripts:

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Build
npm run build            # Build both
npm run build:frontend   # Frontend only
npm run build:backend    # Backend only

# Testing
npm run test:backend     # Backend API tests
npm run test:hardhat     # Smart contract tests

# Blockchain
npm run deploy:contracts # Deploy smart contracts
```

## Verification Checklist

After reorganization, verify:

- [ ] `frontend/` directory exists with all Next.js files
- [ ] `backend/` directory contains Express server, contracts, and scripts
- [ ] Each folder has its own `package.json`
- [ ] Root `package.json` configured for workspaces
- [ ] Environment variables are properly set
- [ ] Dependencies installed in all locations
- [ ] Frontend runs: `cd frontend && npm run dev`
- [ ] Backend runs: `cd backend && npm run dev`
- [ ] Smart contracts compile: `cd backend && npx hardhat compile`
- [ ] Tests pass: `npm run test:hardhat`

## Benefits of New Structure

1. **Clear Separation of Concerns**: Frontend and backend code are completely separated
2. **Independent Development**: Teams can work on frontend/backend independently
3. **Easier Deployment**: Each part can be deployed separately
4. **Better Dependency Management**: Frontend and backend have their own dependencies
5. **Scalability**: Easier to add new services or split further if needed
6. **Cleaner Git History**: Changes are organized by application layer

## Troubleshooting

### Import Errors

If you see import errors after reorganization:

1. Check that relative paths are correct
2. Ensure `package.json` is in the right location
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Module Not Found

- Ensure all dependencies are installed in the correct location
- Check that workspace configuration is correct in root `package.json`
- Run `npm run install:all` from the root

### Path Resolution Issues

- Update `tsconfig.json` paths if using TypeScript path aliases
- Check Next.js configuration for custom paths
- Verify Hardhat paths in configuration

## Rollback

If you need to rollback:

1. Keep a backup of your project before running the script
2. Use git to revert changes if tracked: `git reset --hard HEAD`
3. Or manually move files back to root directory

## Additional Notes

- No application logic has been changed
- All functionality remains the same
- Only file locations have been updated
- The reorganization is purely structural

## Support

If you encounter any issues during reorganization:
1. Check this guide thoroughly
2. Review error messages carefully
3. Ensure all dependencies are properly installed
4. Verify environment variables are set correctly
