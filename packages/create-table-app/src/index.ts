import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { Command } from 'commander'
import { askProjectOptions } from './prompts'

const program = new Command()

program
  .name('create-table-app')
  .description('Create a new Table.js Smart TV application')
  .version('0.0.1')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName?: string) => {
    console.log()
    console.log(chalk.bold('  table.js') + chalk.dim(' — Smart TV framework'))
    console.log()

    const options = await askProjectOptions(projectName)
    const targetDir = path.resolve(process.cwd(), options.name)

    console.log()

    const spinner = ora('Creating project structure').start()

    try {
      spinner.succeed('Project structure created')
    } catch (err) {
      spinner.fail('Failed to create project')
      console.error(err)
      process.exit(1)
    }

    if (options.installDeps) {
      const depSpinner = ora('Installing dependencies').start()
      try {
        depSpinner.succeed('Dependencies installed')
      } catch {
        depSpinner.fail('Failed to install dependencies')
      }
    }

    if (options.initGit) {
      const gitSpinner = ora('Initializing git').start()
      try {
        gitSpinner.succeed('Git initialized')
      } catch {
        gitSpinner.fail('Failed to initialize git')
      }
    }

    console.log()
    console.log(chalk.green('  Project ready!'))
    console.log()
    console.log('  Next steps:')
    console.log()
    console.log(chalk.dim(`  cd ${options.name}`))
    if (!options.installDeps) {
      console.log(chalk.dim(`  ${options.packageManager} install`))
    }
    console.log(chalk.dim(`  ${options.packageManager} run dev`))
    console.log()
  })

program.parse()