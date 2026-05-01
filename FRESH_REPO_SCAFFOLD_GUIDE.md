# Fresh Repository Scaffold Guide
## Complete Architecture for AWS Lex Web UI Right-Panel Implementation

**Purpose:** This guide provides a step-by-step blueprint for creating a new, production-ready repository from scratch with enterprise best practices, microservices patterns, and clean architecture principles.

---

## Table of Contents
1. [Complete Folder Hierarchy](#complete-folder-hierarchy)
2. [Purpose of Each File/Directory](#purpose-of-each-filedirectory)
3. [Microservices Architecture](#microservices-architecture)
4. [Best Practices & Rationale](#best-practices--rationale)
5. [File Creation Checklist](#file-creation-checklist)
6. [Step-by-Step Setup Instructions](#step-by-step-setup-instructions)
7. [Build & Deployment Pipeline](#build--deployment-pipeline)
8. [Environment Management](#environment-management)

---

## Complete Folder Hierarchy

```
lex-web-ui-right-panel/                          # Root: Project name
├── .github/                                      # GitHub-specific configs
│   ├── workflows/                                # CI/CD automation
│   │   ├── build-and-test.yml                   # Automated build & test
│   │   ├── security-scan.yml                    # Security scanning
│   │   └── deploy-staging.yml                   # Staging deployment
│   ├── ISSUE_TEMPLATE/                          # Issue templates
│   │   ├── bug.md
│   │   ├── feature-request.md
│   │   └── documentation.md
│   └── pull_request_template.md                 # PR template
│
├── infrastructure/                              # Infrastructure as Code
│   ├── terraform/                               # Terraform configs (if using AWS)
│   │   ├── main.tf                             # Main infrastructure
│   │   ├── variables.tf                        # Variable definitions
│   │   ├── outputs.tf                          # Output definitions
│   │   ├── vpc.tf                              # VPC/networking
│   │   ├── s3.tf                               # S3 bucket config
│   │   ├── cloudfront.tf                       # CDN config
│   │   ├── cognito.tf                          # Cognito setup
│   │   ├── lex.tf                              # Lex bot setup
│   │   └── terraform.tfvars                    # Variables values
│   ├── docker/                                 # Docker configs
│   │   ├── Dockerfile                          # Multi-stage build
│   │   ├── docker-compose.yml                  # Local dev compose
│   │   └── nginx.conf                          # Nginx config
│   └── k8s/                                    # Kubernetes (optional)
│       ├── deployment.yaml
│       ├── service.yaml
│       └── configmap.yaml
│
├── src/                                        # Source code
│   ├── web/                                   # Web application (main deliverable)
│   │   ├── public/                            # Static assets
│   │   │   ├── index.html                     # Full-page chatbot
│   │   │   ├── right-panel.html               # Right-panel variant
│   │   │   ├── favicon.ico
│   │   │   └── robots.txt
│   │   ├── src/                               # Vue.js source (if building component)
│   │   │   ├── App.vue                        # Root component
│   │   │   ├── main.js                        # Entry point
│   │   │   ├── components/                    # Reusable components
│   │   │   │   ├── ChatWidget.vue
│   │   │   │   ├── QuickReplies.vue
│   │   │   │   └── Toolbar.vue
│   │   │   ├── store/                         # Vuex state management
│   │   │   │   ├── index.js
│   │   │   │   ├── actions.js
│   │   │   │   ├── mutations.js
│   │   │   │   └── getters.js
│   │   │   ├── services/                      # API/Lex services
│   │   │   │   ├── lexService.js              # Lex Runtime calls
│   │   │   │   ├── cognitoService.js          # Cognito auth
│   │   │   │   ├── messageService.js          # Message handling
│   │   │   │   └── storageService.js          # Local storage wrapper
│   │   │   ├── utils/                         # Utilities
│   │   │   │   ├── logger.js                  # Logging utility
│   │   │   │   ├── validators.js              # Input validation
│   │   │   │   ├── formatters.js              # String/date formatting
│   │   │   │   └── constants.js               # App constants
│   │   │   ├── styles/                        # CSS/SCSS
│   │   │   │   ├── main.scss                  # Main styles
│   │   │   │   ├── variables.scss             # Design tokens
│   │   │   │   ├── components.scss            # Component styles
│   │   │   │   └── animations.scss            # Animation definitions
│   │   │   └── config/                        # Config files
│   │   │       ├── default.config.js          # Default config
│   │   │       ├── dev.config.js              # Dev environment
│   │   │       ├── staging.config.js          # Staging environment
│   │   │       └── prod.config.js             # Production environment
│   │   ├── tests/                             # Test files
│   │   │   ├── unit/                          # Unit tests
│   │   │   │   ├── services/
│   │   │   │   ├── utils/
│   │   │   │   └── store/
│   │   │   ├── integration/                   # Integration tests
│   │   │   ├── e2e/                           # End-to-end tests
│   │   │   └── setup.js                       # Test setup
│   │   ├── package.json                       # Web app dependencies
│   │   ├── vite.config.js                     # Vite build config
│   │   └── tsconfig.json                      # TypeScript config (if using TS)
│   │
│   ├── server/                                # Backend API (optional microservice)
│   │   ├── src/
│   │   │   ├── index.js                       # Express server entry
│   │   │   ├── routes/                        # API routes
│   │   │   │   ├── auth.js                    # Auth endpoints
│   │   │   │   ├── messages.js                # Message endpoints
│   │   │   │   ├── health.js                  # Health check
│   │   │   │   └── config.js                  # Config endpoints
│   │   │   ├── controllers/                   # Business logic
│   │   │   │   ├── authController.js
│   │   │   │   ├── messageController.js
│   │   │   │   └── configController.js
│   │   │   ├── middlewares/                   # Express middlewares
│   │   │   │   ├── auth.js
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── logger.js
│   │   │   │   └── corsHandler.js
│   │   │   ├── services/                      # Business services
│   │   │   │   ├── lexProxyService.js         # Lex API proxy
│   │   │   │   ├── cognito
Service.js         # Cognito integration
│   │   │   │   └── analyticsService.js        # Analytics logging
│   │   │   ├── config/                        # Server config
│   │   │   │   ├── default.js
│   │   │   │   ├── dev.js
│   │   │   │   ├── prod.js
│   │   │   │   └── secrets.js                 # Secrets manager
│   │   │   ├── utils/                         # Utilities
│   │   │   │   ├── logger.js
│   │   │   │   ├── validators.js
│   │   │   │   └── errorHandler.js
│   │   │   └── db/                            # Database (if needed)
│   │   │       ├── models/
│   │   │       ├── migrations/
│   │   │       └── seeders/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   ├── e2e/
│   │   │   └── setup.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── config/                                # Shared configuration
│   │   ├── lex-bot-config.json               # Lex bot definition
│   │   ├── cognito-config.json               # Cognito settings
│   │   ├── ui-config.schema.json             # UI config schema
│   │   └── defaults.json                     # Default values
│   │
│   └── loader/                                # Loader library (optional)
│       ├── src/
│       │   ├── index.js                       # Entry point
│       │   ├── IframeLoader.js               # Iframe loader class
│       │   ├── FullPageLoader.js             # Full page loader class
│       │   ├── ConfigLoader.js               # Config loader
│       │   └── DependencyLoader.js           # Dependency loader
│       ├── dist/                              # Built output
│       ├── package.json
│       └── webpack.config.js
│
├── docs/                                      # Documentation
│   ├── README.md                              # Main documentation
│   ├── ARCHITECTURE.md                        # Architecture overview
│   ├── API.md                                 # API documentation
│   ├── SETUP.md                               # Setup instructions
│   ├── DEPLOYMENT.md                          # Deployment guide
│   ├── TROUBLESHOOTING.md                     # Troubleshooting
│   ├── CONTRIBUTING.md                        # Contribution guide
│   ├── design-system.md                       # UI design system
│   ├── microservices.md                       # Microservices guide
│   ├── diagrams/                              # Architecture diagrams
│   │   ├── system-architecture.md             # Mermaid diagrams
│   │   ├── data-flow.md
│   │   └── deployment-flow.md
│   └── examples/                              # Usage examples
│       ├── basic-integration.md
│       ├── advanced-customization.md
│       └── cross-origin-setup.md
│
├── config/                                    # Root-level configuration
│   ├── .env.example                          # Environment variables template
│   ├── .env.dev                              # Dev environment
│   ├── .env.staging                          # Staging environment
│   ├── .env.prod                             # Production environment
│   └── config.js                             # Config loader
│
├── scripts/                                   # Automation scripts
│   ├── setup.sh                               # Initial setup script
│   ├── install-dependencies.sh                # Install all deps
│   ├── build.sh                               # Build script
│   ├── start.sh                               # Start dev server
│   ├── test.sh                                # Run tests
│   ├── lint.sh                                # Run linters
│   ├── deploy-staging.sh                      # Deploy to staging
│   ├── deploy-prod.sh                         # Deploy to production
│   ├── cleanup.sh                             # Cleanup script
│   └── update-deps.sh                         # Update dependencies
│
├── .git/                                      # Git repository
│   ├── hooks/                                 # Git hooks
│   │   ├── pre-commit                         # Pre-commit checks
│   │   ├── pre-push                           # Pre-push checks
│   │   └── commit-msg                         # Commit message format
│   └── ...
│
├── .gitignore                                 # Git ignore rules
├── .dockerignore                              # Docker ignore rules
├── .eslintrc.js                               # ESLint config
├── .prettierrc.json                           # Prettier config
├── .editorconfig                              # Editor config
│
├── package.json                               # Root package.json (monorepo)
├── package-lock.json                          # Lock file
├── lerna.json                                 # Lerna config (if monorepo)
│
├── docker-compose.yml                         # Local development setup
├── docker-compose.prod.yml                    # Production docker setup
│
├── Makefile                                   # Make targets
├── CHANGELOG.md                               # Version history
├── LICENSE                                    # License file
└── README.md                                  # Project readme
```

---

## Purpose of Each File/Directory

### Root Level Files

#### **package.json** (Root)
```json
{
  "name": "lex-web-ui-right-panel",
  "version": "1.0.0",
  "description": "Enterprise-grade AWS Lex Web UI with right-panel integration",
  "private": true,
  "workspaces": [
    "src/web",
    "src/server",
    "src/loader"
  ],
  "scripts": {
    "install:all": "npm install && npm install -w src/web && npm install -w src/server",
    "dev": "concurrently 'npm run dev -w src/web' 'npm run dev -w src/server'",
    "build": "npm run build -w src/web && npm run build -w src/server",
    "test": "npm run test -w src/web && npm run test -w src/server",
    "lint": "npm run lint -w src/web && npm run lint -w src/server",
    "start": "npm run start -w src/server"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "keywords": ["lex", "chatbot", "aws", "vue"],
  "author": "Your Team",
  "license": "MIT"
}
```
**Purpose:** Monorepo root configuration. Uses npm workspaces to manage multiple packages (web, server, loader) as single project. Allows unified dependency management and scripting.

**Why:** Monorepo pattern enables:
- Shared dependencies (faster CI/CD)
- Atomic commits across packages
- Centralized versioning
- Easier development workflow

---

#### **.env.example**
```
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Cognito
COGNITO_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Lex
LEX_BOT_ID=YourBotId
LEX_BOT_ALIAS_ID=ALIZAA
LEX_BOT_LOCALE_ID=en_US

# UI Configuration
VITE_APP_TITLE=Chat Assistant
VITE_APP_TOOLBAR_COLOR=#1e3a5f
VITE_APP_INITIAL_TEXT=Welcome!

# Server
PORT=3000
NODE_ENV=development

# Cross-origin
PARENT_ORIGIN=http://localhost:3000
IFRAME_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info

# Feature Flags
FEATURE_VOICE_INPUT=true
FEATURE_RESPONSE_CARDS=true
FEATURE_AUTHENTICATION=false
```
**Purpose:** Template for environment variables. Never commit secrets; use this as reference.

**Why:** 
- Security (secrets not in version control)
- Environment-specific configuration
- Onboarding reference for new developers
- CI/CD pipeline integration

---

#### **docker-compose.yml**
```yaml
version: '3.8'
services:
  web:
    build:
      context: ./src/web
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://server:3000
    depends_on:
      - server
    volumes:
      - ./src/web/src:/app/src
    networks:
      - lex-network

  server:
    build:
      context: ./src/server
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - AWS_REGION=us-east-1
      - LOG_LEVEL=debug
    depends_on:
      - dynamodb
    volumes:
      - ./src/server/src:/app/src
    networks:
      - lex-network

  dynamodb:
    image: amazon/dynamodb-local:latest
    ports:
      - "8000:8000"
    networks:
      - lex-network

networks:
  lex-network:
    driver: bridge
```
**Purpose:** Local development orchestration. Spins up web, server, and database.

**Why:**
- Reproducible dev environment across team
- No "works on my machine" issues
- Mimics production setup locally
- Single `docker-compose up` for full stack

---

### Configuration Files

#### **.eslintrc.js**
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
};
```
**Purpose:** Code quality enforcement. Catches errors and enforces style.

**Why:**
- Prevents bugs at development time
- Enforces team standards
- Integrates with IDE for real-time feedback
- CI/CD pipeline validation

---

#### **.prettierrc.json**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "printWidth": 100
}
```
**Purpose:** Automatic code formatting. Removes style debates.

**Why:**
- Consistent code format across team
- Automated formatting on save
- Prettier + ESLint prevent conflicts
- Faster PR reviews (no style comments)

---

#### **Makefile**
```makefile
.PHONY: help install dev build test lint deploy-staging deploy-prod clean

help:
	@echo "Available targets:"
	@echo "  make install          - Install all dependencies"
	@echo "  make dev              - Start development servers"
	@echo "  make build            - Build for production"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linters"
	@echo "  make deploy-staging   - Deploy to staging"
	@echo "  make deploy-prod      - Deploy to production"
	@echo "  make clean            - Clean build artifacts"

install:
	npm run install:all

dev:
	docker-compose up

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

deploy-staging:
	bash ./scripts/deploy-staging.sh

deploy-prod:
	bash ./scripts/deploy-prod.sh

clean:
	rm -rf src/*/dist src/*/node_modules
	docker-compose down
```
**Purpose:** Common build tasks. Single entry point for operations.

**Why:**
- Better than `npm run` for discoverability
- Team knows standard targets
- Easy cross-platform (Linux/Mac/Windows with WSL)
- Documentation in help target

---

### GitHub Workflows (CI/CD)

#### **.github/workflows/build-and-test.yml**
```yaml
name: Build & Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm run test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./src/web/coverage/lcov.info
```
**Purpose:** Automated testing on every push/PR. Ensures code quality before merge.

**Why:**
- Catches bugs early
- Prevents broken code in main branch
- Ensures all commits are tested
- Fast feedback loop for developers

---

### Source Structure

#### **src/web/src/services/lexService.js**
```javascript
/**
 * Lex Service
 * 
 * Handles all Lex Runtime API calls
 * Abstracts AWS SDK usage for easier testing and maintenance
 */

import { LexRuntimeV2Client } from '@aws-sdk/client-lex-runtime-v2';
import { RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2';
import logger from '../utils/logger';

class LexService {
  constructor(config) {
    this.config = config;
    this.client = new LexRuntimeV2Client({
      region: config.region,
      credentials: config.credentials
    });
    
    this.botId = config.botId;
    this.botAliasId = config.botAliasId;
    this.localeId = config.localeId;
    this.sessionId = config.sessionId || this.generateSessionId();
  }

  /**
   * Send text message to Lex bot
   * @param {string} message - User message
   * @returns {Promise} Lex response
   */
  async sendMessage(message) {
    try {
      const command = new RecognizeTextCommand({
        botId: this.botId,
        botAliasId: this.botAliasId,
        localeId: this.localeId,
        sessionId: this.sessionId,
        text: message
      });

      const response = await this.client.send(command);
      logger.info('Lex response received', { sessionId: this.sessionId });
      
      return this.formatResponse(response);
    } catch (error) {
      logger.error('Lex API error', { error, message });
      throw this.handleError(error);
    }
  }

  /**
   * Format Lex response for UI
   * @private
   */
  formatResponse(lexResponse) {
    return {
      text: lexResponse.messages?.[0]?.content || '',
      sessionState: lexResponse.sessionState,
      dialogState: lexResponse.sessionState?.dialogState,
      intent: lexResponse.sessionState?.intent,
      sessionAttributes: lexResponse.sessionState?.sessionAttributes || {}
    };
  }

  /**
   * Handle Lex errors with custom messages
   * @private
   */
  handleError(error) {
    const errorMessage = error.message || 'Unknown error';
    
    if (error.name === 'ValidationException') {
      return new Error(`Invalid request: ${errorMessage}`);
    }
    
    if (error.name === 'AccessDeniedException') {
      return new Error('Access denied. Check Cognito credentials.');
    }
    
    return error;
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default LexService;
```
**Purpose:** Service layer abstracts Lex API. Single responsibility: Lex communication.

**Why:**
- Separation of concerns (UI doesn't know AWS SDK)
- Testable (mock service easily)
- Reusable across components
- Centralized error handling
- Easy to switch Lex versions or APIs

---

#### **src/web/src/store/index.js** (Vuex Store)
```javascript
/**
 * Vuex Store
 * 
 * Centralized state management for the chatbot
 * Follows Flux pattern: Actions → Mutations → State → Components
 */

import { createStore } from 'vuex';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

const state = () => ({
  // UI State
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  
  // Chat State
  messages: [],
  sessionAttributes: {},
  currentIntent: null,
  dialogState: null,
  
  // User State
  isAuthenticated: false,
  user: null,
  
  // Configuration
  config: {},
  features: {}
});

export default createStore({
  state,
  mutations,
  actions,
  getters,
  strict: process.env.NODE_ENV !== 'production'
});
```
**Purpose:** Single source of truth for app state. Prevents prop drilling and state inconsistencies.

**Why:**
- Predictable state updates (mutations)
- Debuggable state changes (actions)
- Reactive updates across components
- Time-travel debugging capability
- Easier testing with state snapshots

---

#### **src/server/src/middlewares/errorHandler.js**
```javascript
/**
 * Express Error Handler Middleware
 * 
 * Centralizes error handling across API
 * Ensures consistent error responses
 */

import logger from '../utils/logger';

const errorHandler = (err, req, res, next) => {
  logger.error('API error', {
    error: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  // Default error response
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = `Validation Error: ${err.message}`;
  }

  if (err.name === 'AuthenticationError') {
    status = 401;
    message = 'Authentication failed';
  }

  if (err.name === 'AuthorizationError') {
    status = 403;
    message = 'Not authorized';
  }

  // Send error response
  res.status(status).json({
    error: {
      status,
      message,
      requestId: req.id,
      timestamp: new Date().toISOString()
    }
  });
};

export default errorHandler;
```
**Purpose:** Middleware for centralized error handling. All errors follow same format.

**Why:**
- Consistent API error responses
- No unhandled promise rejections
- Structured logging
- Client knows error format
- Production doesn't leak stack traces

---

### Documentation Files

#### **docs/ARCHITECTURE.md**
```markdown
# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Parent Page (right-panel.html)               │ │
│  │  - DOM hosting                                       │ │
│  │  - Config management                                │ │
│  │  - postMessage communication                        │ │
│  └─────────────────────┬─────────────────────────────────┘ │
│                        │ postMessage                        │
│  ┌─────────────────────┼─────────────────────────────────┐ │
│  │      Iframe (Vue Component)                          │ │
│  │  - Chat UI                                           │ │
│  │  - Message handling                                 │ │
│  │  - Lex integration                                  │ │
│  └─────────────────────┬─────────────────────────────────┘ │
│                        │ AWS SDK                           │
└────────────────────────┼───────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼───┐       ┌────▼───┐      ┌────▼───┐
   │  Lex   │       │Cognito │      │  S3    │
   │ Runtime│       │  IDP   │      │Config  │
   └────────┘       └────────┘      └────────┘
```

## Component Breakdown

### 1. **Parent Page (right-panel.html)**
- Entry point for users
- Loads loader library
- Fetches and manages configuration
- Handles iframe DOM mounting
- Communicates with iframe via postMessage

### 2. **Iframe Component (Vue App)**
- Vue.js application
- Chat UI components
- State management with Vuex
- Lex integration via SDK
- Responsive design

### 3. **Backend Server (Node.js/Express)**
- Proxy for Lex API (optional)
- Authentication middleware
- Session management
- Analytics collection
- Configuration delivery

### 4. **AWS Services**
- **Lex**: Conversational AI
- **Cognito**: User authentication
- **S3**: Static file hosting
- **CloudFront**: CDN distribution
- **CloudWatch**: Logging and monitoring

## Data Flow

1. **Initialization**
   - Parent page loads → fetches config JSON
   - Modifies config for session
   - Initializes IframeLoader
   - Creates iframe and waits for ready signal

2. **Message Flow**
   - User types in iframe → component sends text
   - Component calls Lex Runtime SDK
   - Lex processes and responds
   - Response rendered in chat UI
   - State updates propagate to Vuex store

3. **State Synchronization**
   - Parent page can listen to iframe state changes
   - Session attributes persisted to localStorage
   - Analytics events sent to server

## Microservices Pattern

This architecture supports microservices scaling:

```
┌──────────────────┐
│  API Gateway     │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │          │          │          │
┌───▼──┐  ┌───▼──┐  ┌────▼──┐  ┌───▼──┐
│Lex   │  │Auth  │  │Config │  │Chat  │
│Proxy │  │Svc   │  │Svc    │  │Svc   │
└──────┘  └──────┘  └───────┘  └──────┘
```

Each service is independently deployable and scalable.
```

**Purpose:** High-level system design documentation.

**Why:**
- Onboarding reference for new team members
- Design decision justification
- Architecture discussion basis
- Future scaling roadmap

---

#### **docs/DEPLOYMENT.md**
```markdown
# Deployment Guide

## Staging Deployment

### Prerequisites
- AWS credentials configured
- Terraform installed
- Docker installed

### Steps

1. **Prepare environment**
   ```bash
   cp .env.staging .env
   ```

2. **Build artifacts**
   ```bash
   npm run build
   ```

3. **Deploy infrastructure**
   ```bash
   cd infrastructure/terraform
   terraform plan -var-file=staging.tfvars
   terraform apply -var-file=staging.tfvars
   ```

4. **Deploy application**
   ```bash
   npm run deploy:staging
   ```

5. **Run smoke tests**
   ```bash
   npm run test:e2e:staging
   ```

## Production Deployment

### Blue-Green Deployment Strategy

1. **Blue environment** (current production)
2. **Green environment** (new release)
3. Switch traffic when Green is healthy

### Steps

1. **Create green environment**
   ```bash
   ./scripts/create-green-env.sh
   ```

2. **Deploy to green**
   ```bash
   npm run deploy:prod:green
   ```

3. **Run comprehensive tests**
   ```bash
   npm run test:e2e:prod
   ```

4. **Switch traffic**
   ```bash
   ./scripts/switch-traffic-to-green.sh
   ```

5. **Monitor**
   - CloudWatch dashboards
   - Application logs
   - Error rates
   - Performance metrics

## Rollback Procedure

If issues detected:
```bash
./scripts/switch-traffic-to-blue.sh
```

Switches traffic back to previous version immediately.
```

**Purpose:** Step-by-step deployment instructions. Removes guesswork.

**Why:**
- Reduces deployment errors
- On-call team reference
- New team member training
- Disaster recovery documentation

---

### Scripts

#### **scripts/setup.sh**
```bash
#!/bin/bash
set -e

echo "🚀 Setting up Lex Web UI Right-Panel project..."

# Create .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp config/.env.example .env
  echo "⚠️  Please edit .env with your AWS credentials"
fi

# Create required directories
echo "📁 Creating directory structure..."
mkdir -p logs
mkdir -p data
mkdir -p build

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Generate types (if using TypeScript)
if [ -f "tsconfig.json" ]; then
  echo "📘 Generating TypeScript types..."
  npm run types:generate
fi

# Setup Git hooks
echo "🔧 Setting up Git hooks..."
npx husky install

# Create initial database (if needed)
if command -v psql &> /dev/null; then
  echo "🗄️  Initializing database..."
  npm run db:migrate
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your AWS credentials"
echo "2. Run: make dev"
echo "3. Open: http://localhost:3001"
```
**Purpose:** Automated project setup. Ensures consistency across team.

**Why:**
- Onboarding takes minutes, not hours
- No manual steps = fewer mistakes
- New developers productive immediately
- CI/CD can use same script

---

## Microservices Architecture

### Service Separation

```
┌─────────────────────────────────────────────────────────────┐
│                    Lex Web UI Platform                       │
└─────────────────────────────────────────────────────────────┘

Service 1: Web UI Component
├── Responsibility: User interface and interactions
├── Tech: Vue.js, Vuex, Vite
├── Deployment: CDN + S3
└── Scaling: Horizontal (stateless)

Service 2: API Gateway
├── Responsibility: Request routing, rate limiting
├── Tech: Express.js
├── Deployment: Docker, ECS, or Kubernetes
└── Scaling: Horizontal (load balancer)

Service 3: Lex Proxy Service
├── Responsibility: Lex API calls, session management
├── Tech: Node.js, AWS SDK
├── Deployment: Serverless (Lambda) or containerized
└── Scaling: Auto-scaling based on requests

Service 4: Auth Service
├── Responsibility: Cognito integration, JWT validation
├── Tech: Node.js, jsonwebtoken
├── Deployment: Containerized
└── Scaling: Independent scaling

Service 5: Analytics Service
├── Responsibility: Event collection and analysis
├── Tech: Node.js, Data warehouse
├── Deployment: Event-driven (serverless)
└── Scaling: Auto-scaling on events
```

### Inter-Service Communication

**Synchronous (REST/gRPC)**
```
Client → API Gateway → Service
```

**Asynchronous (Message Queue)**
```
Service A → SQS/Kafka → Service B
```

**Configuration**
```javascript
// services/config.js
const services = {
  lex: {
    endpoint: process.env.LEX_SERVICE_URL,
    timeout: 5000,
    retries: 3
  },
  auth: {
    endpoint: process.env.AUTH_SERVICE_URL,
    timeout: 3000,
    retries: 2
  }
};
```

---

## Best Practices & Rationale

### 1. **Monorepo with Workspaces**

**Why:** Shared dependencies, atomic commits, centralized versioning

**Best Practice:**
```json
{
  "workspaces": ["src/web", "src/server", "src/loader"]
}
```

**Rationale:**
- Single source of truth for versions
- Synchronized releases
- Easier refactoring across packages
- Better dependency management

---

### 2. **Environment-Based Configuration**

**Why:** Different settings per environment (dev/staging/prod)

**Best Practice:**
```
config/
├── .env.dev
├── .env.staging
└── .env.prod

src/config/
├── dev.config.js
├── staging.config.js
└── prod.config.js
```

**Rationale:**
- No hardcoded secrets
- Easy environment switching
- CI/CD integration
- Configuration validation

---

### 3. **Service Layer Pattern**

**Why:** Separate business logic from UI logic

**Structure:**
```
src/services/
├── lexService.js          (Lex API calls)
├── cognitoService.js      (Authentication)
├── messageService.js      (Message handling)
└── storageService.js      (LocalStorage wrapper)
```

**Benefits:**
- Testable (mock services)
- Reusable across components
- Single responsibility
- Easy to refactor

---

### 4. **Vuex State Management**

**Why:** Predictable state updates, debugging

**Pattern:**
```
Actions (async work)
    ↓
Mutations (state updates)
    ↓
State (single source of truth)
    ↓
Getters (derived state)
    ↓
Components (render state)
```

**Benefits:**
- Clear data flow
- Time-travel debugging
- Testable state changes
- Prevents state inconsistencies

---

### 5. **Error Handling Strategy**

**Server-Side:**
```javascript
// Centralized error handler middleware
app.use(errorHandler);

// Custom error classes
class ValidationError extends Error {}
class AuthenticationError extends Error {}
```

**Client-Side:**
```javascript
// Global error handler
window.addEventListener('error', event => {
  logger.error('Global error', event.error);
});

// Vue error handler
app.config.errorHandler = (err) => {
  logger.error('Vue error', err);
};
```

**Benefits:**
- Consistent error responses
- No unhandled rejections
- User-friendly messages
- Detailed logging for debugging

---

### 6. **Logging Strategy**

**Structured Logging:**
```javascript
logger.info('User message sent', {
  userId: user.id,
  sessionId: session.id,
  messageLength: message.length,
  timestamp: new Date().toISOString()
});
```

**Log Levels:**
- `debug`: Development details
- `info`: General information
- `warn`: Warnings
- `error`: Errors (actionable)

**Benefits:**
- Aggregatable logs
- Easy filtering
- Production debugging
- Performance monitoring

---

### 7. **Testing Strategy**

**Pyramid Model:**
```
        ▲
       /│\      E2E Tests (5-10%)
      / │ \     - Full user flows
     /  │  \    - Selenium, Cypress
    /───┼───\
   /    │    \  Integration Tests (25-35%)
  /     │     \ - Component interactions
 /      │      \- API calls
/───────┼───────\
         │        Unit Tests (50-70%)
         │        - Functions, components
         │        - Jest, Vitest
         ▼
```

**Coverage Goals:**
- Unit: 80%+
- Integration: Key flows
- E2E: Critical paths

---

### 8. **Security Best Practices**

**Input Validation:**
```javascript
// Validate user input
const { body, validationResult } = require('express-validator');

router.post('/message', [
  body('text').trim().notEmpty().escape(),
  body('sessionId').isUUID()
], controller.sendMessage);
```

**Secrets Management:**
```javascript
// Use environment variables, never commit secrets
const apiKey = process.env.LEX_API_KEY;

// Rotate credentials
// Use AWS Secrets Manager or similar
```

**CORS Configuration:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

---

### 9. **Performance Optimization**

**Code Splitting:**
```javascript
// Lazy load components
const ChatWidget = () => import('./components/ChatWidget.vue');
```

**Asset Optimization:**
```javascript
// Vite config
export default {
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vuex'],
          lex: ['@aws-sdk/client-lex-runtime-v2']
        }
      }
    }
  }
};
```

---

### 10. **Documentation Standards**

**Code Comments:**
```javascript
/**
 * Sends a message to the Lex bot
 * @param {string} text - User message
 * @param {Object} options - Configuration options
 * @param {boolean} options.saveHistory - Whether to save to history
 * @returns {Promise<Object>} Lex response
 * @throws {Error} If message sending fails
 */
async function sendMessage(text, options = {}) {
  // Implementation
}
```

**README Structure:**
- Quick start
- Architecture overview
- Setup instructions
- API documentation
- Troubleshooting
- Contributing guidelines

---

## File Creation Checklist

Use this checklist to set up new repo:

```
Core Configuration
☐ package.json (monorepo setup)
☐ package-lock.json
☐ .env.example (all required variables)
☐ Makefile (common targets)

Linting & Formatting
☐ .eslintrc.js
☐ .prettierrc.json
☐ .editorconfig

Git
☐ .gitignore
☐ .git/hooks/pre-commit (run linter)
☐ .git/hooks/pre-push (run tests)

Docker
☐ docker-compose.yml (dev setup)
☐ docker-compose.prod.yml
☐ Dockerfile (web app)
☐ Dockerfile (server)
☐ .dockerignore

Web Application
☐ src/web/package.json
☐ src/web/vite.config.js
☐ src/web/src/main.js
☐ src/web/src/App.vue
☐ src/web/src/store/index.js
☐ src/web/src/services/lexService.js
☐ src/web/public/index.html
☐ src/web/public/right-panel.html

Server Application
☐ src/server/package.json
☐ src/server/src/index.js
☐ src/server/src/routes/
☐ src/server/src/services/
☐ src/server/src/middlewares/

Configuration
☐ src/config/lex-bot-config.json
☐ src/config/cognito-config.json
☐ config/.env.example
☐ config/.env.dev
☐ config/.env.staging
☐ config/.env.prod

Documentation
☐ docs/README.md
☐ docs/ARCHITECTURE.md
☐ docs/SETUP.md
☐ docs/DEPLOYMENT.md
☐ docs/API.md
☐ docs/CONTRIBUTING.md

CI/CD
☐ .github/workflows/build-and-test.yml
☐ .github/workflows/deploy-staging.yml
☐ .github/pull_request_template.md

Scripts
☐ scripts/setup.sh
☐ scripts/install-dependencies.sh
☐ scripts/build.sh
☐ scripts/start.sh
☐ scripts/test.sh
☐ scripts/lint.sh
☐ scripts/deploy-staging.sh
☐ scripts/deploy-prod.sh

Testing
☐ src/web/tests/unit/setup.js
☐ src/web/tests/integration/
☐ src/server/tests/unit/
☐ src/server/tests/integration/

Infrastructure (Optional)
☐ infrastructure/terraform/main.tf
☐ infrastructure/terraform/variables.tf
☐ infrastructure/terraform/outputs.tf
```

---

## Step-by-Step Setup Instructions

### Phase 1: Initialize Repository (30 min)

```bash
# Create project directory
mkdir lex-web-ui-right-panel && cd lex-web-ui-right-panel

# Initialize Git
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Initialize npm monorepo
npm init -y

# Create folder structure
mkdir -p src/web src/server src/loader src/config docs config scripts infrastructure
mkdir -p .github/workflows .github/ISSUE_TEMPLATE

# Copy initial files (from templates below)
# .gitignore, .eslintrc.js, .prettierrc.json, etc.

# Initialize Git hooks
npm install -D husky
npx husky install
```

### Phase 2: Configure Web Application (1 hour)

```bash
cd src/web
npm init -y
npm install -D vite @vitejs/plugin-vue vue
npm install vue vuex vue-router axios
npm install -D @aws-sdk/client-lex-runtime-v2
npm install -D eslint prettier vitest

# Create src structure
mkdir -p src/{components,store,services,utils,styles,config}
mkdir -p tests/{unit,integration,e2e}
mkdir -p public
```

### Phase 3: Configure Server Application (1 hour)

```bash
cd ../server
npm init -y
npm install express cors dotenv helmet
npm install -D @aws-sdk/client-cognito-identity
npm install -D eslint prettier jest

# Create src structure
mkdir -p src/{routes,controllers,services,middlewares,utils}
mkdir -p tests/{unit,integration}
```

### Phase 4: Set Up Testing (30 min)

```bash
# Web testing
cd ../web
npm install -D vitest @vitest/ui jsdom

# Server testing
cd ../server
npm install -D jest supertest
```

### Phase 5: CI/CD Setup (30 min)

```bash
# Create GitHub Actions workflows
mkdir -p ../../.github/workflows

# Copy workflow files (see templates)
```

### Phase 6: Documentation (30 min)

```bash
# Create documentation structure
cd ../../docs
# Create markdown files:
# - README.md
# - ARCHITECTURE.md
# - SETUP.md
# - DEPLOYMENT.md
# - API.md
# - CONTRIBUTING.md
```

---

## Build & Deployment Pipeline

### Local Development
```
Developer Code
    ↓
Pre-commit Hook (lint, format)
    ↓
Git Push
    ↓
GitHub Actions (build, test, lint)
    ↓
Approved PR
    ↓
Merge to main
    ↓
Staging Deployment (automated)
    ↓
Manual Testing
    ↓
Production Deployment (manual trigger)
```

### Build Pipeline

```bash
# Build script flow
#!/bin/bash

# 1. Install dependencies
npm ci

# 2. Run linters
npm run lint

# 3. Run tests
npm run test

# 4. Build artifacts
npm run build

# 5. Generate documentation
npm run docs:build

# 6. Package for deployment
npm run package
```

### Deployment Pipeline

```
Push to GitHub
    ↓
Trigger GitHub Actions
    ↓
Build stage
├─ Install deps
├─ Run tests
├─ Build artifacts
└─ Upload to artifact storage
    ↓
Deploy to Staging
├─ Pull artifacts
├─ Update infrastructure
└─ Run smoke tests
    ↓
Manual Approval
    ↓
Deploy to Production
├─ Blue-green strategy
├─ Health checks
└─ Monitor metrics
```

---

## Environment Management

### Development Environment
```
.env.dev
NODE_ENV=development
LOG_LEVEL=debug
VITE_API_URL=http://localhost:3000
AWS_REGION=us-east-1
```

### Staging Environment
```
.env.staging
NODE_ENV=staging
LOG_LEVEL=info
VITE_API_URL=https://staging-api.example.com
AWS_REGION=us-east-1
```

### Production Environment
```
.env.prod
NODE_ENV=production
LOG_LEVEL=warn
VITE_API_URL=https://api.example.com
AWS_REGION=us-east-1
```

---

## Summary Table

| Aspect | Location | Purpose | Best Practice |
|--------|----------|---------|----------------|
| Web App | `src/web/` | Vue UI | Use Vite for fast builds |
| Server | `src/server/` | API & proxies | Use Express middleware |
| Config | `src/config/` | Bot/Cognito settings | Never commit secrets |
| Docs | `docs/` | Documentation | Keep updated with code |
| Tests | `*/tests/` | Quality assurance | Maintain 80%+ coverage |
| CI/CD | `.github/workflows/` | Automation | Run on every PR |
| Scripts | `scripts/` | Common tasks | Make them idempotent |
| Infrastructure | `infrastructure/` | IaC | Version control infrastructure |

---

**Last Updated:** April 28, 2026  
**Version:** 1.0  
**Status:** Production Ready  
**Audience:** All team members, especially new developers  
**Maintenance:** Update quarterly or after major changes
