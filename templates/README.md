# Template Files Quick Reference

This TEMPLATES directory contains production-ready template files for scaffolding a new AWS Lex Web UI repository with right-panel integration.

## 📁 Files Included

### 1. **package.json.root**
   - **Location**: Root `package.json`
   - **Purpose**: Monorepo configuration with npm workspaces
   - **Key Features**:
     - Workspace management for web and server packages
     - Common scripts for dev, build, test, deploy
     - Development tooling (ESLint, Prettier, Husky)
   - **Usage**: Copy to root directory and rename to `package.json`

### 2. **package.json.web**
   - **Location**: `src/web/package.json`
   - **Purpose**: Vue.js web UI component package
   - **Key Features**:
     - Vue 3 with Vite build tool
     - AWS SDK integration (Cognito, Lex)
     - Testing with Vitest
     - State management with Vuex/Pinia
   - **Usage**: Copy to `src/web/package.json`

### 3. **package.json.server**
   - **Location**: `src/server/package.json`
   - **Purpose**: Express.js backend API server
   - **Key Features**:
     - API gateway pattern
     - AWS SDK clients
     - Express middleware and routing
     - Jest testing framework
   - **Usage**: Copy to `src/server/package.json`

### 4. **.eslintrc.js**
   - **Location**: Root `.eslintrc.js`
   - **Purpose**: Code quality and style enforcement
   - **Key Features**:
     - Vue 3 linting rules
     - ES2021 support
     - Prettier integration
     - Production-safe defaults
   - **Usage**: Copy to root `.eslintrc.js`

### 5. **.prettierrc.json**
   - **Location**: Root `.prettierrc.json`
   - **Purpose**: Code formatting configuration
   - **Key Features**:
     - Consistent code style
     - 2-space indentation
     - Single quotes
     - Semicolons enabled
   - **Usage**: Copy to root `.prettierrc.json`

### 6. **.gitignore**
   - **Location**: Root `.gitignore`
   - **Purpose**: Git repository control
   - **Key Features**:
     - Node modules exclusion
     - Build artifacts
     - Environment variables
     - IDE/editor files
   - **Usage**: Copy to root `.gitignore`

### 7. **.env.example**
   - **Location**: Root `.env.example`
   - **Purpose**: Environment variable template
   - **Key Features**:
     - All required environment variables documented
     - Clear sections for AWS, Cognito, Lex, features
     - Security-focused comments
     - 50+ configurable options
   - **Usage**: Copy to `.env` and fill with actual values

### 8. **docker-compose.yml**
   - **Location**: Root `docker-compose.yml`
   - **Purpose**: Multi-container local development environment
   - **Key Features**:
     - API server service
     - Web app service
     - PostgreSQL database
     - Redis cache
     - Nginx reverse proxy
   - **Services**:
     - `api`: Backend on port 3000
     - `web`: Frontend on port 3001
     - `postgres`: Database on port 5432
     - `redis`: Cache on port 6379
     - `nginx`: Proxy on port 8080
   - **Usage**: Copy to root directory

### 9. **Makefile**
   - **Location**: Root `Makefile`
   - **Purpose**: Common development and deployment commands
   - **Key Features**:
     - Color-coded output
     - Setup automation
     - Development commands
     - Testing targets
     - Deployment workflows
   - **Usage**: Copy to root `Makefile` and use with `make [target]`
   - **Examples**:
     ```bash
     make help          # Show all commands
     make install       # Install dependencies
     make dev           # Start all services
     make test          # Run all tests
     make build         # Build for production
     ```

### 10. **lex.service.js**
   - **Location**: `src/server/lib/services/lex.service.js`
   - **Purpose**: AWS Lex V2 Runtime abstraction
   - **Key Features**:
     - Text recognition
     - Speech recognition
     - Session management
     - Response formatting
     - Error handling
   - **Usage**: Copy to services directory

### 11. **error-handler.js**
   - **Location**: `src/server/middleware/error-handler.js`
   - **Purpose**: Centralized error handling
   - **Key Features**:
     - Custom error classes (AppError, ValidationError, etc.)
     - Express error middleware
     - Consistent error responses
     - Logging integration
   - **Usage**: Copy to middleware directory

### 12. **logger.js**
   - **Location**: `src/server/lib/logger.js`
   - **Purpose**: Structured logging with Winston
   - **Key Features**:
     - Structured log output
     - Environment-based levels
     - File and console transports
     - Request tracking
   - **Usage**: Copy to lib directory

### 13. **Dockerfile.api**
   - **Location**: Root `Dockerfile.api`
   - **Purpose**: Container image for API server
   - **Key Features**:
     - Multi-stage build
     - Development/Production stages
     - Non-root user
     - Health checks
     - Optimized image size
   - **Usage**: Copy to root directory

### 14. **setup.sh**
   - **Location**: `scripts/setup.sh`
   - **Purpose**: Automated project initialization
   - **Key Features**:
     - Prerequisite checking
     - Environment setup
     - Dependency installation
     - Git hooks setup
     - Docker configuration
   - **Usage**: 
     ```bash
     chmod +x scripts/setup.sh
     bash scripts/setup.sh
     ```

## 🚀 Quick Start

### Step 1: Create Directory Structure
```bash
mkdir -p my-lex-project
cd my-lex-project
mkdir -p src/web src/server scripts
```

### Step 2: Copy Templates
```bash
# Copy root-level files
cp TEMPLATES/package.json.root package.json
cp TEMPLATES/.eslintrc.js .eslintrc.js
cp TEMPLATES/.prettierrc.json .prettierrc.json
cp TEMPLATES/.gitignore .gitignore
cp TEMPLATES/.env.example .env.example
cp TEMPLATES/docker-compose.yml docker-compose.yml
cp TEMPLATES/Makefile Makefile

# Copy web app files
cp TEMPLATES/package.json.web src/web/package.json

# Copy server files
cp TEMPLATES/package.json.server src/server/package.json
mkdir -p src/server/lib/services
mkdir -p src/server/middleware
cp TEMPLATES/lex.service.js src/server/lib/services/
cp TEMPLATES/error-handler.js src/server/middleware/
cp TEMPLATES/logger.js src/server/lib/

# Copy scripts
mkdir -p scripts
cp TEMPLATES/setup.sh scripts/
chmod +x scripts/setup.sh

# Copy Docker files
cp TEMPLATES/Dockerfile.api Dockerfile.api
```

### Step 3: Run Setup
```bash
bash scripts/setup.sh
```

### Step 4: Configure Environment
```bash
# Edit .env with your AWS credentials
nano .env
# Update:
# - AWS_REGION
# - COGNITO_POOL_ID
# - COGNITO_CLIENT_ID
# - LEX_BOT_ID
# - LEX_BOT_ALIAS_ID
```

### Step 5: Start Development
```bash
# Using Makefile
make dev

# Or without Docker
npm run dev
```

## 📋 Configuration Checklist

Before deploying, configure:

- [ ] AWS credentials and region
- [ ] Cognito pool and client IDs
- [ ] Lex bot IDs and aliases
- [ ] CORS allowed origins
- [ ] Database credentials
- [ ] JWT secret key
- [ ] Feature flags
- [ ] Analytics endpoints
- [ ] Monitoring services

## 🔧 File Modification Guide

### After copying files, you'll need to:

1. **Create Vue components** in `src/web/src/components/`
2. **Implement Express routes** in `src/server/src/routes/`
3. **Setup Vuex store** in `src/web/src/store/`
4. **Add API endpoints** for auth, chat, config
5. **Create database migrations**
6. **Configure CI/CD pipelines**

## 🐳 Docker Quick Commands

```bash
# Start all services
make docker-up

# Stop all services
make docker-down

# View logs
make docker-logs

# Rebuild images
make docker-build
```

## 📚 Additional Resources

- [Fresh Repo Scaffold Guide](../FRESH_REPO_SCAFFOLD_GUIDE.md) - Complete blueprint
- [Right Panel Customization Guide](../RIGHT_PANEL_CUSTOMIZATION_GUIDE.md) - UI customization

## ⚠️ Security Notes

- **Never commit .env file** - Use .env.example instead
- **Change JWT_SECRET** in production
- **Use strong database passwords**
- **Enable HTTPS** in production
- **Rotate AWS credentials** regularly
- **Keep dependencies updated**

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a
make docker-build
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules
npm cache clean --force
npm install
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the FRESH_REPO_SCAFFOLD_GUIDE.md
3. Consult AWS documentation
4. Check error logs in `logs/` directory

---

**Template Version**: 1.0.0
**Last Updated**: 2024
**Compatibility**: Node.js 18+, npm 9+
