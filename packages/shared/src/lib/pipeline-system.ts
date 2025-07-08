// CI/CD Pipeline System for Micro-App Processing
import { 
  DeploymentPipeline, 
  PipelineStatus, 
  PipelineStep, 
  MicroAppRepository,
  SecurityScanResult,
  DeveloperSubmissionForm
} from '../types/developer';

interface PipelineConfig {
  steps: PipelineStepConfig[];
  environment: 'development' | 'staging' | 'production';
  timeout?: number;
  retryPolicy?: RetryPolicy;
  notifications?: NotificationConfig;
}

interface PipelineStepConfig {
  name: string;
  type: 'clone' | 'install' | 'test' | 'build' | 'security_scan' | 'quality_check' | 'package' | 'deploy';
  config: Record<string, any>;
  retries?: number;
  timeout?: number;
  condition?: string; // Script condition for conditional execution
  dependencies?: string[]; // Other steps this depends on
}

interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

interface NotificationConfig {
  onSuccess?: string[];
  onFailure?: string[];
  onStart?: string[];
}

interface PipelineContext {
  repositoryId: string;
  submissionData: DeveloperSubmissionForm;
  workspaceDir: string;
  artifacts: Map<string, any>;
  environment: Record<string, string>;
}

export class PipelineExecutor {
  private config: PipelineConfig;
  private context: PipelineContext;
  private pipeline: DeploymentPipeline;
  private stepInstances: Map<string, PipelineStepExecutor> = new Map();

  constructor(config: PipelineConfig, context: PipelineContext) {
    this.config = config;
    this.context = context;
    this.pipeline = this.initializePipeline();
  }

  async execute(): Promise<DeploymentPipeline> {
    try {
      this.pipeline.status = 'running';
      this.pipeline.startTime = new Date().toISOString();
      
      await this.notifyPipelineStart();
      
      // Execute steps in dependency order
      const executionOrder = this.resolveExecutionOrder();
      
      for (const stepName of executionOrder) {
        const stepConfig = this.config.steps.find(s => s.name === stepName);
        if (!stepConfig) continue;

        await this.executeStep(stepConfig);
        
        // Check if pipeline should continue
        if (this.pipeline.status === 'failed' || this.pipeline.status === 'cancelled') {
          break;
        }
      }

      // Finalize pipeline
      if (this.pipeline.status === 'running') {
        this.pipeline.status = 'success';
      }
      
      this.pipeline.endTime = new Date().toISOString();
      this.pipeline.durationSeconds = this.calculateDuration();
      
      await this.notifyPipelineComplete();
      
    } catch (error) {
      this.pipeline.status = 'failed';
      this.pipeline.endTime = new Date().toISOString();
      this.pipeline.errorMessage = error instanceof Error ? error.message : 'Pipeline execution failed';
      this.pipeline.errorDetails = error instanceof Error ? { stack: error.stack } : { error };
      
      await this.notifyPipelineFailure();
    }

    return this.pipeline;
  }

  async cancel(): Promise<void> {
    this.pipeline.status = 'cancelled';
    
    // Cancel any running steps
    for (const stepExecutor of this.stepInstances.values()) {
      await stepExecutor.cancel();
    }
  }

  private async executeStep(stepConfig: PipelineStepConfig): Promise<void> {
    const stepIndex = this.pipeline.steps.findIndex(s => s.name === stepConfig.name);
    if (stepIndex === -1) {
      this.pipeline.steps.push({
        name: stepConfig.name,
        status: 'pending'
      });
    }

    const step = this.pipeline.steps[stepIndex] || this.pipeline.steps[this.pipeline.steps.length - 1];
    
    try {
      step.status = 'running';
      step.startTime = new Date().toISOString();
      
      // Create step executor
      const executor = this.createStepExecutor(stepConfig);
      this.stepInstances.set(stepConfig.name, executor);
      
      // Execute step with retries
      const result = await this.executeWithRetries(executor, stepConfig);
      
      step.status = 'success';
      step.endTime = new Date().toISOString();
      step.duration = this.calculateStepDuration(step);
      step.output = result.output;
      step.logs = result.logs;
      
      // Store artifacts
      if (result.artifacts) {
        for (const [key, value] of Object.entries(result.artifacts)) {
          this.context.artifacts.set(key, value);
        }
      }
      
    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date().toISOString();
      step.duration = this.calculateStepDuration(step);
      step.error = error instanceof Error ? error.message : 'Step execution failed';
      step.logs = error instanceof Error ? error.stack : undefined;
      
      // Mark pipeline as failed
      this.pipeline.status = 'failed';
      
      throw error;
    } finally {
      this.stepInstances.delete(stepConfig.name);
    }
  }

  private async executeWithRetries(
    executor: PipelineStepExecutor, 
    stepConfig: PipelineStepConfig
  ): Promise<StepResult> {
    const maxRetries = stepConfig.retries || this.config.retryPolicy?.maxRetries || 0;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        return await executor.execute(this.context);
      } catch (error) {
        attempt++;
        
        if (attempt > maxRetries) {
          throw error;
        }
        
        // Wait before retry
        const backoffMs = this.config.retryPolicy?.backoffMs || 1000;
        const multiplier = this.config.retryPolicy?.backoffMultiplier || 2;
        const delay = backoffMs * Math.pow(multiplier, attempt - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  private createStepExecutor(stepConfig: PipelineStepConfig): PipelineStepExecutor {
    switch (stepConfig.type) {
      case 'clone':
        return new CloneStepExecutor(stepConfig);
      case 'install':
        return new InstallStepExecutor(stepConfig);
      case 'test':
        return new TestStepExecutor(stepConfig);
      case 'build':
        return new BuildStepExecutor(stepConfig);
      case 'security_scan':
        return new SecurityScanStepExecutor(stepConfig);
      case 'quality_check':
        return new QualityCheckStepExecutor(stepConfig);
      case 'package':
        return new PackageStepExecutor(stepConfig);
      case 'deploy':
        return new DeployStepExecutor(stepConfig);
      default:
        throw new Error(`Unknown step type: ${stepConfig.type}`);
    }
  }

  private resolveExecutionOrder(): string[] {
    const steps = new Map(this.config.steps.map(s => [s.name, s]));
    const resolved: string[] = [];
    const resolving = new Set<string>();
    
    const resolve = (stepName: string) => {
      if (resolved.includes(stepName)) return;
      if (resolving.has(stepName)) {
        throw new Error(`Circular dependency detected: ${stepName}`);
      }
      
      resolving.add(stepName);
      
      const step = steps.get(stepName);
      if (step?.dependencies) {
        for (const dep of step.dependencies) {
          resolve(dep);
        }
      }
      
      resolving.delete(stepName);
      resolved.push(stepName);
    };
    
    for (const stepName of steps.keys()) {
      resolve(stepName);
    }
    
    return resolved;
  }

  private initializePipeline(): DeploymentPipeline {
    return {
      id: `pipeline-${Date.now()}`,
      repositoryId: this.context.repositoryId,
      triggerEvent: 'submission',
      pipelineConfig: this.config,
      environment: this.config.environment,
      status: 'pending',
      startTime: new Date().toISOString(),
      steps: this.config.steps.map(s => ({
        name: s.name,
        status: 'pending'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private calculateDuration(): number {
    if (!this.pipeline.startTime || !this.pipeline.endTime) return 0;
    
    const start = new Date(this.pipeline.startTime).getTime();
    const end = new Date(this.pipeline.endTime).getTime();
    
    return Math.floor((end - start) / 1000);
  }

  private calculateStepDuration(step: PipelineStep): number {
    if (!step.startTime || !step.endTime) return 0;
    
    const start = new Date(step.startTime).getTime();
    const end = new Date(step.endTime).getTime();
    
    return Math.floor((end - start) / 1000);
  }

  private async notifyPipelineStart(): Promise<void> {
    // Send notifications for pipeline start
    console.log(`Pipeline ${this.pipeline.id} started`);
  }

  private async notifyPipelineComplete(): Promise<void> {
    // Send notifications for pipeline completion
    console.log(`Pipeline ${this.pipeline.id} completed successfully`);
  }

  private async notifyPipelineFailure(): Promise<void> {
    // Send notifications for pipeline failure
    console.log(`Pipeline ${this.pipeline.id} failed: ${this.pipeline.errorMessage}`);
  }
}

// Base step executor interface
interface StepResult {
  output?: any;
  logs?: string;
  artifacts?: Record<string, any>;
}

abstract class PipelineStepExecutor {
  protected config: PipelineStepConfig;
  protected cancelled: boolean = false;

  constructor(config: PipelineStepConfig) {
    this.config = config;
  }

  abstract execute(context: PipelineContext): Promise<StepResult>;

  async cancel(): Promise<void> {
    this.cancelled = true;
  }

  protected checkCancellation(): void {
    if (this.cancelled) {
      throw new Error('Step execution cancelled');
    }
  }
}

// Step executor implementations
class CloneStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const { repository } = context.submissionData;
    
    // Clone repository to workspace
    const cloneDir = `${context.workspaceDir}/source`;
    
    let logs = `Cloning repository: ${repository.url}\n`;
    logs += `Branch: ${repository.branch || 'main'}\n`;
    
    // Simulate git clone
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logs += `Repository cloned to: ${cloneDir}\n`;
    
    return {
      output: { cloneDir },
      logs,
      artifacts: { sourceDir: cloneDir }
    };
  }
}

class InstallStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const sourceDir = context.artifacts.get('sourceDir');
    if (!sourceDir) {
      throw new Error('Source directory not found');
    }
    
    let logs = `Installing dependencies in: ${sourceDir}\n`;
    
    // Detect package manager
    const packageManager = this.detectPackageManager(sourceDir);
    logs += `Package manager: ${packageManager}\n`;
    
    // Install dependencies
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    logs += `Dependencies installed successfully\n`;
    
    return {
      output: { packageManager },
      logs
    };
  }
  
  private detectPackageManager(sourceDir: string): string {
    // In real implementation, check for package-lock.json, yarn.lock, pnpm-lock.yaml
    return 'npm';
  }
}

class TestStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const sourceDir = context.artifacts.get('sourceDir');
    
    let logs = `Running tests in: ${sourceDir}\n`;
    
    // Run tests
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const testResults = {
      totalTests: 45,
      passed: 43,
      failed: 2,
      coverage: 87.5,
      duration: 8942
    };
    
    logs += `Tests completed: ${testResults.passed}/${testResults.totalTests} passed\n`;
    logs += `Coverage: ${testResults.coverage}%\n`;
    
    if (testResults.failed > 0) {
      logs += `Warning: ${testResults.failed} tests failed\n`;
    }
    
    return {
      output: testResults,
      logs,
      artifacts: { testResults }
    };
  }
}

class BuildStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const sourceDir = context.artifacts.get('sourceDir');
    const buildDir = `${sourceDir}/dist`;
    
    let logs = `Building project in: ${sourceDir}\n`;
    
    // Run build commands
    const buildCommands = this.config.config.commands || ['npm run build'];
    
    for (const command of buildCommands) {
      logs += `$ ${command}\n`;
      await new Promise(resolve => setTimeout(resolve, 3000));
      logs += `Command completed\n`;
    }
    
    logs += `Build completed successfully\n`;
    logs += `Output directory: ${buildDir}\n`;
    
    return {
      output: { buildDir },
      logs,
      artifacts: { buildDir }
    };
  }
}

class SecurityScanStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const sourceDir = context.artifacts.get('sourceDir');
    
    let logs = `Running security scan on: ${sourceDir}\n`;
    
    // Simulate security scanning
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const scanResults: SecurityScanResult = {
      vulnerabilities: [
        {
          id: 'npm-audit-1',
          severity: 'medium',
          type: 'dependency',
          description: 'Prototype pollution vulnerability in lodash',
          file: 'package.json',
          recommendation: 'Update lodash to version 4.17.21 or higher',
          cvss: 6.5
        }
      ],
      dependencies: [
        {
          package: 'lodash',
          version: '4.17.15',
          vulnerabilities: 1,
          outdated: true,
          license: 'MIT',
          recommendation: 'Update to 4.17.21'
        }
      ],
      codeQuality: {
        maintainabilityIndex: 7.2,
        cyclomaticComplexity: 4.1,
        linesOfCode: 2847,
        testCoverage: 87.5,
        duplicateCodePercentage: 2.3,
        techDebtMinutes: 45
      },
      compliance: [
        {
          rule: 'OWASP Top 10',
          status: 'passed',
          description: 'No critical security vulnerabilities found'
        }
      ],
      recommendations: [
        'Update outdated dependencies',
        'Add input validation for user data',
        'Implement rate limiting for API endpoints'
      ],
      scanDuration: 14523,
      scannedAt: new Date().toISOString()
    };
    
    logs += `Security scan completed\n`;
    logs += `Vulnerabilities found: ${scanResults.vulnerabilities.length}\n`;
    logs += `Dependencies scanned: ${scanResults.dependencies.length}\n`;
    
    return {
      output: scanResults,
      logs,
      artifacts: { securityScanResults: scanResults }
    };
  }
}

class QualityCheckStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const testResults = context.artifacts.get('testResults');
    const securityResults = context.artifacts.get('securityScanResults');
    
    let logs = `Running quality checks\n`;
    
    const qualityScore = this.calculateQualityScore(testResults, securityResults);
    
    logs += `Quality score: ${qualityScore}/100\n`;
    
    if (qualityScore < 70) {
      throw new Error(`Quality score too low: ${qualityScore}/100 (minimum: 70)`);
    }
    
    return {
      output: { qualityScore },
      logs,
      artifacts: { qualityScore }
    };
  }
  
  private calculateQualityScore(testResults: any, securityResults: any): number {
    let score = 100;
    
    // Deduct for test failures
    if (testResults?.failed > 0) {
      score -= testResults.failed * 5;
    }
    
    // Deduct for low coverage
    if (testResults?.coverage < 80) {
      score -= (80 - testResults.coverage) * 2;
    }
    
    // Deduct for security vulnerabilities
    if (securityResults?.vulnerabilities) {
      for (const vuln of securityResults.vulnerabilities) {
        switch (vuln.severity) {
          case 'critical': score -= 25; break;
          case 'high': score -= 15; break;
          case 'medium': score -= 10; break;
          case 'low': score -= 5; break;
        }
      }
    }
    
    return Math.max(0, score);
  }
}

class PackageStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const buildDir = context.artifacts.get('buildDir');
    const { technical } = context.submissionData;
    
    let logs = `Packaging micro-app\n`;
    logs += `Package name: ${technical.packageName}\n`;
    logs += `Version: ${technical.version}\n`;
    
    // Create package
    const packageInfo = {
      name: technical.packageName,
      version: technical.version,
      entryPoint: technical.entryPoint,
      sizeBytes: 1024 * 512, // 512KB
      distUrl: `https://cdn.sasarjan.com/packages/${technical.packageName}/${technical.version}/index.js`,
      tarballUrl: `https://cdn.sasarjan.com/packages/${technical.packageName}/${technical.version}/package.tgz`,
      integrityHash: 'sha256-' + Math.random().toString(36).substring(2)
    };
    
    logs += `Package created: ${packageInfo.distUrl}\n`;
    logs += `Size: ${(packageInfo.sizeBytes / 1024).toFixed(1)} KB\n`;
    
    return {
      output: packageInfo,
      logs,
      artifacts: { packageInfo }
    };
  }
}

class DeployStepExecutor extends PipelineStepExecutor {
  async execute(context: PipelineContext): Promise<StepResult> {
    this.checkCancellation();
    
    const packageInfo = context.artifacts.get('packageInfo');
    
    let logs = `Deploying package to registry\n`;
    
    // Deploy to CDN and registry
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    logs += `Package deployed successfully\n`;
    logs += `Available at: ${packageInfo.distUrl}\n`;
    
    return {
      output: { deploymentUrl: packageInfo.distUrl },
      logs
    };
  }
}

// Pipeline template configurations
export const PIPELINE_TEMPLATES = {
  basic: {
    steps: [
      { name: 'clone', type: 'clone', config: {} },
      { name: 'install', type: 'install', config: {}, dependencies: ['clone'] },
      { name: 'test', type: 'test', config: {}, dependencies: ['install'] },
      { name: 'build', type: 'build', config: { commands: ['npm run build'] }, dependencies: ['test'] },
      { name: 'package', type: 'package', config: {}, dependencies: ['build'] },
      { name: 'deploy', type: 'deploy', config: {}, dependencies: ['package'] }
    ],
    environment: 'production' as const,
    timeout: 1800000, // 30 minutes
    retryPolicy: {
      maxRetries: 2,
      backoffMs: 1000,
      backoffMultiplier: 2
    }
  },
  
  comprehensive: {
    steps: [
      { name: 'clone', type: 'clone', config: {} },
      { name: 'install', type: 'install', config: {}, dependencies: ['clone'] },
      { name: 'test', type: 'test', config: {}, dependencies: ['install'] },
      { name: 'security_scan', type: 'security_scan', config: {}, dependencies: ['install'] },
      { name: 'build', type: 'build', config: { commands: ['npm run build'] }, dependencies: ['test'] },
      { name: 'quality_check', type: 'quality_check', config: {}, dependencies: ['test', 'security_scan'] },
      { name: 'package', type: 'package', config: {}, dependencies: ['build', 'quality_check'] },
      { name: 'deploy', type: 'deploy', config: {}, dependencies: ['package'] }
    ],
    environment: 'production' as const,
    timeout: 2700000, // 45 minutes
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 2000,
      backoffMultiplier: 2
    }
  }
} as const;