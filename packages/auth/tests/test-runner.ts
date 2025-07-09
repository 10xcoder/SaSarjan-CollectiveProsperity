#!/usr/bin/env tsx

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

interface TestResult {
  type: 'unit' | 'integration' | 'security' | 'e2e'
  passed: boolean
  duration: number
  coverage?: number
  details?: any
}

interface TestReport {
  timestamp: string
  results: TestResult[]
  overall: {
    passed: number
    failed: number
    total: number
    duration: number
    coverage: number
  }
}

class AuthTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  async run(): Promise<void> {
    console.log('🧪 Starting SaSarjan Auth Test Suite\n')
    console.log('=' .repeat(50))

    try {
      // Run tests in sequence
      await this.runUnitTests()
      await this.runSecurityTests()
      await this.runIntegrationTests()
      
      // Generate report
      await this.generateReport()
      
      // Exit with appropriate code
      const failed = this.results.filter(r => !r.passed).length
      process.exit(failed > 0 ? 1 : 0)
      
    } catch (error) {
      console.error('❌ Test runner failed:', error)
      process.exit(1)
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('\n🔬 Running Unit Tests')
    console.log('-'.repeat(30))

    const start = Date.now()
    
    try {
      const result = await this.runCommand('vitest', ['run', '--coverage', '--reporter=json'])
      const duration = Date.now() - start
      
      // Parse coverage from vitest output
      const coverage = this.parseCoverage(result.stdout)
      
      this.results.push({
        type: 'unit',
        passed: result.exitCode === 0,
        duration,
        coverage,
        details: this.parseViTestOutput(result.stdout)
      })

      if (result.exitCode === 0) {
        console.log(`✅ Unit tests passed (${duration}ms)`)
        console.log(`📊 Coverage: ${coverage}%`)
      } else {
        console.log(`❌ Unit tests failed (${duration}ms)`)
        console.log(result.stderr)
      }
      
    } catch (error) {
      console.log(`❌ Unit tests failed: ${error}`)
      this.results.push({
        type: 'unit',
        passed: false,
        duration: Date.now() - start,
        details: { error: error.message }
      })
    }
  }

  private async runSecurityTests(): Promise<void> {
    console.log('\n🔒 Running Security Tests')
    console.log('-'.repeat(30))

    const start = Date.now()
    
    try {
      const result = await this.runCommand('vitest', ['run', 'tests/security', '--reporter=json'])
      const duration = Date.now() - start
      
      this.results.push({
        type: 'security',
        passed: result.exitCode === 0,
        duration,
        details: this.parseViTestOutput(result.stdout)
      })

      if (result.exitCode === 0) {
        console.log(`✅ Security tests passed (${duration}ms)`)
      } else {
        console.log(`❌ Security tests failed (${duration}ms)`)
        console.log(result.stderr)
      }
      
    } catch (error) {
      console.log(`❌ Security tests failed: ${error}`)
      this.results.push({
        type: 'security',
        passed: false,
        duration: Date.now() - start,
        details: { error: error.message }
      })
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('\n🔗 Running Integration Tests')
    console.log('-'.repeat(30))

    const start = Date.now()
    
    try {
      const result = await this.runCommand('playwright', ['test', '--reporter=json'])
      const duration = Date.now() - start
      
      this.results.push({
        type: 'integration',
        passed: result.exitCode === 0,
        duration,
        details: this.parsePlaywrightOutput(result.stdout)
      })

      if (result.exitCode === 0) {
        console.log(`✅ Integration tests passed (${duration}ms)`)
      } else {
        console.log(`❌ Integration tests failed (${duration}ms)`)
        console.log(result.stderr)
      }
      
    } catch (error) {
      console.log(`❌ Integration tests failed: ${error}`)
      this.results.push({
        type: 'integration',
        passed: false,
        duration: Date.now() - start,
        details: { error: error.message }
      })
    }
  }

  private async runCommand(command: string, args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { 
        stdio: 'pipe',
        shell: true
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (exitCode) => {
        resolve({ exitCode: exitCode || 0, stdout, stderr })
      })

      proc.on('error', (error) => {
        reject(error)
      })
    })
  }

  private parseCoverage(output: string): number {
    try {
      // Parse coverage from vitest JSON output
      const lines = output.split('\n')
      for (const line of lines) {
        if (line.includes('coverage') || line.includes('Coverage')) {
          const match = line.match(/(\d+\.?\d*)%/)
          if (match) {
            return parseFloat(match[1])
          }
        }
      }
      return 0
    } catch {
      return 0
    }
  }

  private parseViTestOutput(output: string): any {
    try {
      // Try to parse as JSON first
      const lines = output.split('\n')
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
          try {
            return JSON.parse(line)
          } catch {
            continue
          }
        }
      }
      return { rawOutput: output }
    } catch {
      return { rawOutput: output }
    }
  }

  private parsePlaywrightOutput(output: string): any {
    try {
      return JSON.parse(output)
    } catch {
      return { rawOutput: output }
    }
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Generating Test Report')
    console.log('-'.repeat(30))

    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const avgCoverage = this.results.reduce((sum, r) => sum + (r.coverage || 0), 0) / this.results.length

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      results: this.results,
      overall: {
        passed,
        failed,
        total: this.results.length,
        duration: totalDuration,
        coverage: avgCoverage
      }
    }

    // Save report to file
    const reportsDir = path.join(__dirname, '../test-results')
    await fs.mkdir(reportsDir, { recursive: true })
    
    const reportPath = path.join(reportsDir, 'test-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report)
    const htmlPath = path.join(reportsDir, 'test-report.html')
    await fs.writeFile(htmlPath, htmlReport)

    // Print summary
    console.log('\n📋 Test Summary')
    console.log('=' .repeat(50))
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Coverage: ${avgCoverage.toFixed(1)}%`)
    console.log(`⏱️  Duration: ${totalDuration}ms`)
    console.log(`📄 Report: ${reportPath}`)
    console.log(`🌐 HTML Report: ${htmlPath}`)

    // Print individual results
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      const coverage = result.coverage ? ` (${result.coverage}%)` : ''
      console.log(`${status} ${result.type.padEnd(12)} ${result.duration}ms${coverage}`)
    })
  }

  private generateHtmlReport(report: TestReport): string {
    const { overall, results } = report
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>SaSarjan Auth Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007acc; }
        .results { background: white; border-radius: 8px; border: 1px solid #ddd; }
        .result { padding: 15px; border-bottom: 1px solid #eee; }
        .result:last-child { border-bottom: none; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .duration { color: #666; font-size: 12px; }
        .coverage { color: #007acc; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 SaSarjan Auth Test Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Tests</h3>
            <div class="value">${overall.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value" style="color: #28a745">${overall.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value" style="color: #dc3545">${overall.failed}</div>
        </div>
        <div class="metric">
            <h3>Coverage</h3>
            <div class="value">${overall.coverage.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div class="value">${overall.duration}ms</div>
        </div>
    </div>

    <div class="results">
        <h2>Test Results</h2>
        ${results.map(result => `
            <div class="result ${result.passed ? 'passed' : 'failed'}">
                <h3>${result.type.toUpperCase()} ${result.passed ? '✅' : '❌'}</h3>
                <div class="duration">Duration: ${result.duration}ms</div>
                ${result.coverage ? `<div class="coverage">Coverage: ${result.coverage}%</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>
    `.trim()
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new AuthTestRunner()
  runner.run()
}