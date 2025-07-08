#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validates commit message integration with sprint and todo tracking
 */
function validateCommitIntegration(commitMsgFile) {
  try {
    const commitMsg = fs.readFileSync(commitMsgFile, 'utf8');
    
    // Skip validation for merge commits, reverts, and other automated commits
    if (
      commitMsg.startsWith('Merge') ||
      commitMsg.startsWith('Revert') ||
      commitMsg.startsWith('Initial commit') ||
      commitMsg.includes('Co-authored-by: Claude')
    ) {
      return true;
    }

    // Extract commit type from conventional commit format
    const typeMatch = commitMsg.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|sprint|todo|blocker|automation)(\(.+\))?: /);
    
    if (!typeMatch) {
      console.error('❌ Commit message does not follow conventional commit format');
      console.error('   Format: type(scope): description');
      console.error('   Example: feat(web): add user dashboard');
      return false;
    }

    const commitType = typeMatch[1];
    
    // Check for sprint and todo integration for development commits
    const developmentTypes = ['feat', 'fix', 'refactor', 'perf', 'test'];
    
    if (developmentTypes.includes(commitType)) {
      const hasSprintInfo = /Sprint:\s*(Week\s*\d+|W\d+)/i.test(commitMsg);
      const hasTodoInfo = /Todo:\s*(todo-\d+|#\d+)/i.test(commitMsg);
      const hasBlockerInfo = /Fixes:\s*(blocker-\d+|BLOCKER-\d+)/i.test(commitMsg);
      
      if (!hasSprintInfo && !hasTodoInfo && !hasBlockerInfo) {
        console.warn('⚠️  Development commit missing sprint/todo integration');
        console.warn('   Consider adding to commit message:');
        console.warn('   Sprint: Week X (YYYY-MM-DD to YYYY-MM-DD)');
        console.warn('   Todo: todo-123');
        console.warn('   Fixes: blocker-456 (for blockers)');
        console.warn('');
        console.warn('   This helps track progress and maintain sprint alignment.');
        // Return true for warning (non-blocking)
        return true;
      }
      
      // Validate sprint format if present
      if (hasSprintInfo) {
        const sprintMatch = commitMsg.match(/Sprint:\s*(Week\s*(\d+)|W(\d+))/i);
        if (sprintMatch) {
          const weekNumber = sprintMatch[2] || sprintMatch[3];
          if (parseInt(weekNumber) < 1 || parseInt(weekNumber) > 52) {
            console.error('❌ Invalid sprint week number. Must be between 1-52');
            return false;
          }
        }
      }
      
      // Validate todo format if present
      if (hasTodoInfo) {
        const todoMatches = commitMsg.match(/Todo:\s*([^\\n]+)/i);
        if (todoMatches) {
          const todoList = todoMatches[1];
          const validTodoFormat = /^(todo-\d+|#\d+)(,\s*(todo-\d+|#\d+))*$/;
          if (!validTodoFormat.test(todoList.trim())) {
            console.error('❌ Invalid todo format. Use: todo-123 or todo-123, todo-456');
            return false;
          }
        }
      }
    }

    // Validate scope for multi-app repository
    const scopeMatch = commitMsg.match(/^[^(]+\(([^)]+)\)/);
    if (scopeMatch) {
      const scope = scopeMatch[1];
      const validScopes = [
        'web', 'talentexcel', 'sevapremi', '10xgrowth', 'admin',
        'ui', 'auth', 'database', 'shared',
        'ci', 'docs', 'build', 'config'
      ];
      
      if (!validScopes.includes(scope)) {
        console.warn(`⚠️  Scope '${scope}' is not in recommended list: ${validScopes.join(', ')}`);
      }
    }

    // Check for collective prosperity alignment for major features
    if (commitType === 'feat' && commitMsg.length > 200) {
      const prosperityKeywords = [
        'transformation', 'excellence', 'resilience', 'regeneration',
        'empowerment', 'commons', 'innovation', 'expression',
        'collective', 'prosperity', 'community', 'sustainability'
      ];
      
      const hasProsperityAlignment = prosperityKeywords.some(keyword => 
        commitMsg.toLowerCase().includes(keyword)
      );
      
      if (!hasProsperityAlignment) {
        console.warn('⚠️  Large feature commit may benefit from mentioning collective prosperity alignment');
      }
    }

    console.log('✅ Commit message validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Error validating commit message:', error.message);
    return false;
  }
}

// Main execution
const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('❌ Commit message file not provided');
  process.exit(1);
}

const isValid = validateCommitIntegration(commitMsgFile);
if (!isValid) {
  console.error('');
  console.error('💡 Commit message help:');
  console.error('   See: .gitmessage for template');
  console.error('   Run: git config commit.template .gitmessage');
  console.error('');
  process.exit(1);
}

process.exit(0);