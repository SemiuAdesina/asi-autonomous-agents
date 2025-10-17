#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Setting up Jest testing environment for ASI Autonomous Agents...')

// Check if we're in the frontend directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the frontend directory')
  process.exit(1)
}

// Install dependencies if they don't exist
const nodeModulesPath = path.join(process.cwd(), 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencies installed successfully')
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message)
    process.exit(1)
  }
}

// Create test directories if they don't exist
const testDirs = [
  'src/__tests__',
  'src/components/__tests__',
  'src/contexts/__tests__',
  'src/services/__tests__',
  'src/pages/api/__tests__',
]

testDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`📁 Created test directory: ${dir}`)
  }
})

console.log('🎯 Test setup complete!')
console.log('')
console.log('Available test commands:')
console.log('  npm test              - Run all tests')
console.log('  npm run test:watch    - Run tests in watch mode')
console.log('  npm run test:coverage - Run tests with coverage report')
console.log('  npm run test:ci       - Run tests for CI/CD')
console.log('')
console.log('Test files created:')
console.log('  ✅ AgentContext.test.tsx')
console.log('  ✅ Web3Context.test.tsx')
console.log('  ✅ MobileMenuContext.test.tsx')
console.log('  ✅ AgentGrid.test.tsx')
console.log('  ✅ DeFiProtocols.test.tsx')
console.log('  ✅ discover-agents.test.ts')
console.log('  ✅ defi-data.test.ts')
console.log('  ✅ agentCommunication.test.ts')
console.log('')
console.log('🚀 Ready to run tests!')
