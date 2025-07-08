module.exports = function (plop) {
  // Helper to convert to PascalCase
  plop.setHelper('pascalCase', (text) => {
    return text.replace(/(^|[-_ ])(.)/g, (_, __, char) => char.toUpperCase());
  });

  // Helper to convert to kebab-case
  plop.setHelper('kebabCase', (text) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  // Component generator
  plop.setGenerator('component', {
    description: 'Create a new React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., UserProfile):',
        validate: (input) => {
          if (!input) return 'Component name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return 'Component name must be in PascalCase (e.g., UserProfile)';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type:',
        choices: ['ui', 'forms', 'layout', 'feature']
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/components/{{kebabCase type}}/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/component.hbs'
      },
      {
        type: 'add',
        path: 'apps/{{app}}/src/components/{{kebabCase type}}/{{pascalCase name}}.test.tsx',
        templateFile: 'plop-templates/component.test.hbs'
      }
    ]
  });

  // Hook generator
  plop.setGenerator('hook', {
    description: 'Create a new custom hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (without "use" prefix):',
        validate: (input) => {
          if (!input) return 'Hook name is required';
          return true;
        },
        filter: (input) => {
          // Remove 'use' prefix if provided
          return input.replace(/^use/i, '');
        }
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/hooks/use{{pascalCase name}}.ts',
        templateFile: 'plop-templates/hook.hbs'
      },
      {
        type: 'add',
        path: 'apps/{{app}}/src/hooks/use{{pascalCase name}}.test.ts',
        templateFile: 'plop-templates/hook.test.hbs'
      }
    ]
  });

  // Utility generator
  plop.setGenerator('util', {
    description: 'Create a new utility function',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Utility name (e.g., format-currency):',
        validate: (input) => {
          if (!input) return 'Utility name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Utility name must be in kebab-case (e.g., format-currency)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/utils/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/utility.hbs'
      },
      {
        type: 'add',
        path: 'apps/{{app}}/src/utils/{{kebabCase name}}.test.ts',
        templateFile: 'plop-templates/utility.test.hbs'
      }
    ]
  });

  // Page generator (Next.js App Router)
  plop.setGenerator('page', {
    description: 'Create a new Next.js page',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page route (e.g., user-profile):',
        validate: (input) => {
          if (!input) return 'Page route is required';
          if (!/^[a-z][a-z0-9-/]*$/.test(input)) {
            return 'Page route must be in kebab-case (e.g., user-profile)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/app/{{name}}/page.tsx',
        templateFile: 'plop-templates/page.hbs'
      },
      {
        type: 'add',
        path: 'apps/{{app}}/src/app/{{name}}/layout.tsx',
        templateFile: 'plop-templates/layout.hbs'
      }
    ]
  });

  // API Route generator
  plop.setGenerator('api', {
    description: 'Create a new API route',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'API route (e.g., user-profile):',
        validate: (input) => {
          if (!input) return 'API route is required';
          if (!/^[a-z][a-z0-9-/]*$/.test(input)) {
            return 'API route must be in kebab-case (e.g., user-profile)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/app/api/{{name}}/route.ts',
        templateFile: 'plop-templates/api-route.hbs'
      }
    ]
  });

  // Type definition generator
  plop.setGenerator('type', {
    description: 'Create a new type definition',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Type name (will be converted to kebab-case for file):',
        validate: (input) => {
          if (!input) return 'Type name is required';
          return true;
        }
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/types/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/type.hbs'
      }
    ]
  });

  // Location-aware component generator
  plop.setGenerator('location-component', {
    description: 'Create a location-aware React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., LocationPicker):',
        validate: (input) => {
          if (!input) return 'Component name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return 'Component name must be in PascalCase';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'locationType',
        message: 'Location feature type:',
        choices: ['picker', 'display', 'filter', 'search', 'map']
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/{{app}}/src/components/location/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/location-component.hbs'
      },
      {
        type: 'add',
        path: 'apps/{{app}}/src/components/location/{{pascalCase name}}.test.tsx',
        templateFile: 'plop-templates/location-component.test.hbs'
      }
    ]
  });

  // Feature generator (complete features with multiple components)
  plop.setGenerator('feature', {
    description: 'Create a complete feature with components, hooks, and types',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (e.g., internship-search):',
        validate: (input) => {
          if (!input) return 'Feature name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Feature name must be in kebab-case';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'locationAware',
        message: 'Include location-aware features?',
        default: true
      },
      {
        type: 'input',
        name: 'app',
        message: 'Which app? (web/talentexcel/sevapremi/10xgrowth):',
        default: 'web'
      }
    ],
    actions: function(data) {
      const actions = [
        {
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/components/{{pascalCase name}}Card.tsx',
          templateFile: data.locationAware ? 'plop-templates/feature-card-location.hbs' : 'plop-templates/feature-card.hbs'
        },
        {
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/hooks/use{{pascalCase name}}.ts',
          templateFile: 'plop-templates/feature-hook.hbs'
        },
        {
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/types/index.ts',
          templateFile: 'plop-templates/feature-types.hbs'
        },
        {
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/utils/index.ts',
          templateFile: 'plop-templates/feature-utils.hbs'
        },
        {
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/index.ts',
          templateFile: 'plop-templates/feature-index.hbs'
        }
      ];

      if (data.locationAware) {
        actions.push({
          type: 'add',
          path: 'apps/{{app}}/src/features/{{kebabCase name}}/components/{{pascalCase name}}LocationFilter.tsx',
          templateFile: 'plop-templates/feature-location-filter.hbs'
        });
      }

      return actions;
    }
  });

  // Shared module generator (for packages)
  plop.setGenerator('module', {
    description: 'Create a new shared module in packages',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (kebab-case):',
        validate: (input) => {
          if (!input) return 'Module name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Module name must be in kebab-case';
          }
          return true;
        }
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/{{name}}/package.json',
        templateFile: 'plop-templates/module-package.hbs'
      },
      {
        type: 'add',
        path: 'packages/{{name}}/index.ts',
        templateFile: 'plop-templates/module-index.hbs'
      },
      {
        type: 'add',
        path: 'packages/{{name}}/README.md',
        templateFile: 'plop-templates/module-readme.hbs'
      }
    ]
  });
};