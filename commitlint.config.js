// Conventional Commits configuration for SaSarjan App Store
// Enforces commit message standards and integrates with sprint/todo tracking

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Basic conventional commit rules
    'type-enum': [
      2,
      'always',
      [
        'feat',      // ✨ New feature
        'fix',       // 🐛 Bug fix
        'docs',      // 📚 Documentation only changes
        'style',     // 💄 Changes that don't affect code meaning (formatting, etc.)
        'refactor',  // ♻️ Code change that neither fixes a bug nor adds a feature
        'perf',      // ⚡ Performance improvement
        'test',      // 🧪 Adding missing tests or correcting existing tests
        'build',     // 🔧 Changes to build system or external dependencies
        'ci',        // 👷 Changes to CI configuration files and scripts
        'chore',     // 🔨 Other changes that don't modify src or test files
        'revert',    // ⏪ Reverts a previous commit
        'sprint',    // 🎯 Sprint-related changes (planning, documentation)
        'todo',      // ✅ Todo item completion or updates
        'blocker',   // 🚨 Fixes sprint blockers
        'automation' // 🤖 Automation and tooling improvements
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    
    // Custom rules for sprint/todo integration
    'sprint-todo-format': [1, 'always'], // Warning for missing sprint/todo info
  },
  plugins: [
    {
      rules: {
        'sprint-todo-format': ({ body, footer }) => {
          // Extract sprint and todo information from commit message
          const sprintPattern = /Sprint:\s*(Week\s*\d+|W\d+)/i;
          const todoPattern = /Todo:\s*(todo-\d+|#\d+)/i;
          const blockersPattern = /Fixes:\s*(blocker-\d+|BLOCKER-\d+)/i;
          
          const hasSprintInfo = sprintPattern.test(body || '') || sprintPattern.test(footer || '');
          const hasTodoInfo = todoPattern.test(body || '') || todoPattern.test(footer || '');
          const hasBlockerInfo = blockersPattern.test(body || '') || blockersPattern.test(footer || '');
          
          // For certain commit types, sprint/todo info is recommended
          const message = body || '';
          const recommendedTypes = ['feat', 'fix', 'refactor', 'perf'];
          
          if (recommendedTypes.some(type => message.includes(type)) && !hasSprintInfo && !hasTodoInfo && !hasBlockerInfo) {
            return [
              false,
              'Consider adding sprint/todo information in commit body:\n' +
              'Sprint: Week X\n' +
              'Todo: todo-123\n' +
              'Fixes: blocker-456 (for blockers)'
            ];
          }
          
          return [true];
        }
      }
    }
  ],
  helpUrl: 'https://github.com/sasarjan/SaSarjan-AppStore/blob/main/docs/COMMIT_CONVENTIONS.md'
};