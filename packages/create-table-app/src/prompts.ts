import prompts from 'prompts'
import type { PackageManager, Platform, ProjectOptions } from './types'

export async function askProjectOptions(nameArg?: string): Promise<ProjectOptions> {
  const answers = await prompts([
    {
      type: nameArg ? null : 'text',
      name: 'name',
      message: 'Project name',
      initial: 'my-table-app',
      validate: (v: string) => {
        return /^[a-z0-9-_]+$/.test(v) || 'Use lowercase letters, numbers, - or _'
      },
    },
    {
      type: 'select',
      name: 'platform',
      message: 'Target platform',
      choices: [
        { title: 'All platforms', value: 'all' },
        { title: 'Tizen (Samsung)', value: 'tizen' },
        { title: 'WebOS (LG)', value: 'webos' },
        { title: 'Android TV', value: 'android' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager',
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
      ],
      initial: 0,
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize git repository?',
      initial: true,
    },
  ], {
    onCancel: () => {
        process.exit(0)
    }
  })

  return {
    name: nameArg ?? (answers.name as string),
    platform: answers.platform as Platform,
    packageManager: answers.packageManager as PackageManager,
    installDeps: answers.installDeps as boolean,
    initGit: answers.initGit as boolean
  }
}
