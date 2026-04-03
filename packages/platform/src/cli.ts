import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { build } from './builder'
import type { Platform } from './types'

const program = new Command()

program.name('table').description('Table.js build tool for Smart TV platforms').version('0.0.1')

program
  .command('build')
  .description('Build for target platform')
  .option('-p, --platform <platform>', 'Target platform (tizen, webos, android, all)', 'all')
  .option('-m, --mode <mode>', 'Android mode (webview, native)', 'webview')
  .option('-o, --out <dir>', 'Output directory', 'dist')
  .option('--no-minify', 'Disable minification')
  .option('--sourcemap', 'Generate sourcemaps')
  .action(async (options) => {
    const platform = options.platform as Platform

    console.log()
    console.log(chalk.bold('  table.js') + chalk.dim(' — Building for Smart TV'))
    console.log()

    const spinner = ora(`Building for ${platform}...`).start()

    try {
      await build(platform, {
        outDir: options.out,
        mode: options.mode,
        minify: options.minify,
        sourcemap: options.sourcemap,
      })

      spinner.succeed('Build complete!')
      console.log()
    } catch (error) {
      spinner.fail('Build failed')
      console.error(error)
      process.exit(1)
    }
  })

program.parse()
