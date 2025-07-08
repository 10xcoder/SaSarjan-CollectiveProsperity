#!/usr/bin/env node

// SaSarjan CLI Tool for Package Management
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { MicroAppPackageRegistry, RegistryCLI } from '../lib/package-registry';
import { PackageSearchFilters } from '../types/developer';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

// CLI Configuration
const DEFAULT_REGISTRY_URL = 'https://api.sasarjan.com/v1';
const CONFIG_FILE = path.join(process.cwd(), '.sasarjan.json');

interface CLIConfig {
  registry: string;
  apiKey?: string;
  defaultBrand?: string;
  workspace?: string;
}

class SasarjanCLI {
  private config: CLIConfig;
  private registry: MicroAppPackageRegistry;
  private registryCLI: RegistryCLI;

  constructor() {
    this.config = {
      registry: DEFAULT_REGISTRY_URL
    };
    this.registry = new MicroAppPackageRegistry({
      baseUrl: this.config.registry
    });
    this.registryCLI = new RegistryCLI(this.registry);
  }

  async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
      this.config = { ...this.config, ...JSON.parse(configData) };
      
      // Reinitialize registry with loaded config
      this.registry = new MicroAppPackageRegistry({
        baseUrl: this.config.registry,
        apiKey: this.config.apiKey
      });
      this.registryCLI = new RegistryCLI(this.registry);
    } catch (error) {
      // Config file doesn't exist or is invalid, use defaults
    }
  }

  async saveConfig(): Promise<void> {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  // Command implementations
  async search(query?: string, options?: any): Promise<void> {
    const spinner = ora('Searching packages...').start();
    
    try {
      const filters: PackageSearchFilters = {
        query,
        category: options.category,
        brand: options.brand,
        isTemplate: options.template ? true : undefined,
        isFeatured: options.featured ? true : undefined,
        license: options.license ? [options.license] : undefined,
        sort: options.sort || 'relevance',
        limit: options.limit || 20
      };

      const results = await this.registry.searchPackages(filters);
      spinner.stop();

      if (results.packages.length === 0) {
        console.log(chalk.yellow('No packages found matching your criteria.'));
        return;
      }

      // Display results in table
      const table = new Table({
        head: ['Package', 'Version', 'Description', 'Downloads', 'Quality'],
        colWidths: [30, 10, 50, 12, 10]
      });

      results.packages.forEach(pkg => {
        table.push([
          chalk.blue(pkg.packageName),
          chalk.green(`v${pkg.version}`),
          pkg.description.length > 45 ? pkg.description.substring(0, 45) + '...' : pkg.description,
          pkg.totalDownloads.toLocaleString(),
          `${pkg.qualityScore.toFixed(1)}/5.0`
        ]);
      });

      console.log(table.toString());
      console.log(chalk.gray(`\\nShowing ${results.packages.length} of ${results.totalCount} packages`));
      
      if (results.totalCount > results.packages.length) {
        console.log(chalk.gray('Use --limit to see more results'));
      }

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Search failed:'), error instanceof Error ? error.message : error);
    }
  }

  async install(packageName: string, options?: any): Promise<void> {
    const spinner = ora(`Installing ${packageName}...`).start();
    
    try {
      const result = await this.registry.installPackage(packageName, {
        version: options.version,
        environment: options.env || 'production',
        customizations: options.customizations ? JSON.parse(options.customizations) : undefined,
        enabledModules: options.modules ? options.modules.split(',') : undefined
      });

      spinner.stop();

      if (result.success) {
        console.log(chalk.green(`✓ Successfully installed ${packageName}@${result.version}`));
        
        if (result.dependencies.length > 0) {
          console.log(chalk.gray(`Dependencies: ${result.dependencies.join(', ')}`));
        }
        
        if (result.warnings?.length) {
          result.warnings.forEach(warning => {
            console.log(chalk.yellow(`⚠ ${warning}`));
          });
        }
      } else {
        console.log(chalk.red(`✗ Installation failed:`));
        result.errors?.forEach(error => {
          console.log(chalk.red(`  ${error}`));
        });
        process.exit(1);
      }

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Installation failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  async info(packageName: string): Promise<void> {
    const spinner = ora(`Fetching package info...`).start();
    
    try {
      const pkg = await this.registry.getPackage(packageName);
      const versions = await this.registry.getPackageVersions(packageName);
      
      spinner.stop();

      if (!pkg) {
        console.log(chalk.red(`Package ${packageName} not found`));
        return;
      }

      console.log(chalk.blue.bold(pkg.packageName));
      console.log(chalk.gray(pkg.description));
      console.log();
      
      const infoTable = new Table({
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      infoTable.push(
        ['Version', chalk.green(pkg.version)],
        ['Author', pkg.authorId],
        ['License', pkg.manifest.license],
        ['Downloads', pkg.totalDownloads.toLocaleString()],
        ['Quality Score', `${pkg.qualityScore.toFixed(1)}/5.0`],
        ['Published', new Date(pkg.publishedAt || pkg.createdAt).toLocaleDateString()],
        ['Compatible Brands', pkg.compatibleBrands.join(', ') || 'All'],
        ['Template', pkg.isTemplate ? 'Yes' : 'No'],
        ['Featured', pkg.isFeatured ? 'Yes' : 'No']
      );

      console.log(infoTable.toString());
      
      if (versions.length > 1) {
        console.log(chalk.bold('\\nAvailable Versions:'));
        versions.slice(0, 5).forEach(version => {
          const indicator = version.isLatest ? chalk.yellow(' (latest)') : '';
          console.log(`  ${chalk.green(version.version)}${indicator} - ${new Date(version.publishedAt).toLocaleDateString()}`);
        });
        
        if (versions.length > 5) {
          console.log(chalk.gray(`  ... and ${versions.length - 5} more versions`));
        }
      }

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to fetch package info:'), error instanceof Error ? error.message : error);
    }
  }

  async list(): Promise<void> {
    // List installed packages (would read from local package.json or config)
    console.log(chalk.blue.bold('Installed Packages:\\n'));
    
    // Mock data for demonstration
    const installedPackages = [
      { name: '@sasarjan/internship-platform', version: '1.2.0', location: 'node_modules/@sasarjan/internship-platform' },
      { name: '@sasarjan/job-board', version: '2.1.3', location: 'node_modules/@sasarjan/job-board' }
    ];

    if (installedPackages.length === 0) {
      console.log(chalk.gray('No packages installed'));
      return;
    }

    const table = new Table({
      head: ['Package', 'Version', 'Location'],
      colWidths: [35, 12, 50]
    });

    installedPackages.forEach(pkg => {
      table.push([
        chalk.blue(pkg.name),
        chalk.green(`v${pkg.version}`),
        chalk.gray(pkg.location)
      ]);
    });

    console.log(table.toString());
  }

  async init(): Promise<void> {
    console.log(chalk.blue.bold('Initializing SaSarjan workspace...\\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:'
      },
      {
        type: 'list',
        name: 'defaultBrand',
        message: 'Default brand:',
        choices: [
          { name: 'TalentExcel', value: 'talentexcel' },
          { name: 'Happy247', value: 'happy247' },
          { name: '10x Growth', value: '10xgrowth' },
          { name: 'Seva Premi', value: 'sevapremi' }
        ]
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: true
      }
    ]);

    const spinner = ora('Creating project files...').start();

    try {
      // Create package.json
      const packageJson = {
        name: answers.projectName,
        version: '1.0.0',
        description: answers.description,
        main: answers.typescript ? 'dist/index.js' : 'src/index.js',
        types: answers.typescript ? 'dist/index.d.ts' : undefined,
        scripts: {
          dev: 'sasarjan dev',
          build: 'sasarjan build',
          test: 'sasarjan test'
        },
        dependencies: {
          '@sasarjan/sdk': '^1.0.0'
        },
        devDependencies: answers.typescript ? {
          'typescript': '^5.0.0',
          '@types/node': '^20.0.0'
        } : {},
        sasarjan: {
          brand: answers.defaultBrand,
          entry: answers.typescript ? 'dist/index.js' : 'src/index.js',
          typescript: answers.typescript
        }
      };

      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));

      // Create basic project structure
      await fs.mkdir('src', { recursive: true });
      
      const indexContent = answers.typescript 
        ? `import { MicroAppSDK } from '@sasarjan/sdk';

export class MyMicroApp {
  private sdk: MicroAppSDK;

  constructor(sdk: MicroAppSDK) {
    this.sdk = sdk;
  }

  async initialize(): Promise<void> {
    console.log('MyMicroApp initialized');
  }
}`
        : `const { MicroAppSDK } = require('@sasarjan/sdk');

class MyMicroApp {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async initialize() {
    console.log('MyMicroApp initialized');
  }
}

module.exports = { MyMicroApp };`;

      await fs.writeFile(
        `src/index.${answers.typescript ? 'ts' : 'js'}`, 
        indexContent
      );

      if (answers.typescript) {
        const tsConfig = {
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            lib: ['ES2020'],
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: true,
            declarationMap: true,
            sourceMap: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        };
        
        await fs.writeFile('tsconfig.json', JSON.stringify(tsConfig, null, 2));
      }

      // Update CLI config
      this.config.defaultBrand = answers.defaultBrand;
      this.config.workspace = process.cwd();
      await this.saveConfig();

      spinner.stop();
      
      console.log(chalk.green('✓ Project initialized successfully!\\n'));
      console.log('Next steps:');
      console.log(chalk.blue('  1. npm install'));
      console.log(chalk.blue('  2. sasarjan dev'));
      console.log(chalk.blue('  3. Start building your micro-app!'));

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Initialization failed:'), error instanceof Error ? error.message : error);
    }
  }

  async config(key?: string, value?: string): Promise<void> {
    if (!key) {
      // Display current config
      console.log(chalk.blue.bold('Current Configuration:\\n'));
      
      const configTable = new Table({
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      configTable.push(
        ['Registry URL', this.config.registry],
        ['API Key', this.config.apiKey ? '***' + this.config.apiKey.slice(-4) : 'Not set'],
        ['Default Brand', this.config.defaultBrand || 'Not set'],
        ['Workspace', this.config.workspace || 'Not set']
      );

      console.log(configTable.toString());
      return;
    }

    if (!value) {
      // Get specific config value
      const configValue = (this.config as any)[key];
      if (configValue !== undefined) {
        console.log(configValue);
      } else {
        console.log(chalk.red(`Configuration key '${key}' not found`));
      }
      return;
    }

    // Set config value
    (this.config as any)[key] = value;
    await this.saveConfig();
    console.log(chalk.green(`✓ Set ${key} = ${value}`));
  }

  async login(): Promise<void> {
    console.log(chalk.blue.bold('Login to SaSarjan Registry\\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: (input) => input.includes('@') || 'Please enter a valid email'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*'
      }
    ]);

    const spinner = ora('Authenticating...').start();

    try {
      // Mock authentication - in real implementation, would call auth API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockApiKey = 'sas_' + Math.random().toString(36).substring(2, 15);
      
      this.config.apiKey = mockApiKey;
      await this.saveConfig();
      
      spinner.stop();
      console.log(chalk.green('✓ Successfully logged in!'));
      console.log(chalk.gray(`API key saved to ${CONFIG_FILE}`));

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Login failed:'), error instanceof Error ? error.message : error);
    }
  }

  async logout(): Promise<void> {
    delete this.config.apiKey;
    await this.saveConfig();
    console.log(chalk.green('✓ Successfully logged out'));
  }

  async publish(): Promise<void> {
    // Check if we're in a SaSarjan project
    try {
      await fs.access('package.json');
    } catch {
      console.log(chalk.red('No package.json found. Are you in a SaSarjan project?'));
      return;
    }

    if (!this.config.apiKey) {
      console.log(chalk.red('Please login first: sasarjan login'));
      return;
    }

    console.log(chalk.blue.bold('Publishing package...\\n'));
    
    const spinner = ora('Preparing package...').start();

    try {
      // Read package.json
      const packageJsonContent = await fs.readFile('package.json', 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      spinner.text = 'Building package...';
      
      // Mock build process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      spinner.text = 'Publishing to registry...';
      
      // Mock publish
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      spinner.stop();
      
      console.log(chalk.green(`✓ Successfully published ${packageJson.name}@${packageJson.version}`));
      console.log(chalk.gray(`View at: https://sasarjan.com/packages/${packageJson.name}`));

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Publish failed:'), error instanceof Error ? error.message : error);
    }
  }
}

// Main CLI setup
async function main() {
  const cli = new SasarjanCLI();
  await cli.loadConfig();

  program
    .name('sasarjan')
    .description('SaSarjan CLI for micro-app development and package management')
    .version('1.0.0');

  // Search command
  program
    .command('search [query]')
    .description('Search for packages in the registry')
    .option('-c, --category <category>', 'Filter by category')
    .option('-b, --brand <brand>', 'Filter by compatible brand')
    .option('-t, --template', 'Show only templates')
    .option('-f, --featured', 'Show only featured packages')
    .option('-l, --license <license>', 'Filter by license')
    .option('-s, --sort <sort>', 'Sort results (relevance, downloads, rating, updated, created)', 'relevance')
    .option('--limit <limit>', 'Limit number of results', '20')
    .action(async (query, options) => {
      await cli.search(query, options);
    });

  // Install command
  program
    .command('install <package>')
    .description('Install a package from the registry')
    .option('-v, --version <version>', 'Install specific version')
    .option('-e, --env <environment>', 'Target environment (development, staging, production)', 'production')
    .option('-c, --customizations <json>', 'Customizations as JSON string')
    .option('-m, --modules <modules>', 'Comma-separated list of modules to enable')
    .action(async (packageName, options) => {
      await cli.install(packageName, options);
    });

  // Info command
  program
    .command('info <package>')
    .description('Show detailed information about a package')
    .action(async (packageName) => {
      await cli.info(packageName);
    });

  // List command
  program
    .command('list')
    .description('List installed packages')
    .action(async () => {
      await cli.list();
    });

  // Init command
  program
    .command('init')
    .description('Initialize a new SaSarjan micro-app project')
    .action(async () => {
      await cli.init();
    });

  // Config command
  program
    .command('config [key] [value]')
    .description('Get or set configuration values')
    .action(async (key, value) => {
      await cli.config(key, value);
    });

  // Login command
  program
    .command('login')
    .description('Login to the SaSarjan registry')
    .action(async () => {
      await cli.login();
    });

  // Logout command
  program
    .command('logout')
    .description('Logout from the SaSarjan registry')
    .action(async () => {
      await cli.logout();
    });

  // Publish command
  program
    .command('publish')
    .description('Publish current project to the registry')
    .action(async () => {
      await cli.publish();
    });

  program.parse();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('CLI Error:'), error);
    process.exit(1);
  });
}

export { SasarjanCLI };