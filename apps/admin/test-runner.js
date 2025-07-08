#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Change to admin directory
process.chdir(__dirname);

try {
  console.log('🧪 Running Admin Panel Tests...\n');

  // Run unit tests
  console.log('📋 Running Unit Tests...');
  execSync('pnpm vitest run', { stdio: 'inherit' });
  
  console.log('\n✅ Unit tests completed successfully!\n');

  // Run type checking (without dependencies)
  console.log('🔍 Running Type Check...');
  execSync('pnpm typecheck', { stdio: 'inherit' });
  
  console.log('\n✅ Type checking completed successfully!\n');

  console.log('🎉 All tests passed!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}