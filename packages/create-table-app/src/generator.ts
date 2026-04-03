import path from 'path'
import fs from 'fs-extra'
import { ProjectOptions } from './types'
import { execa } from 'execa'

const TEMPLATE_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'templates',
  'default',
)

const TEMPLATE_VARS = ['{{name}}', '{{platform}}'] as const

type TemplateVar = (typeof TEMPLATE_VARS)[number]

type TemplateValues = Record<TemplateVar, string>

async function applyTemplateVars(filePath: string, values: TemplateValues): Promise<void> {
  const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.json', '.html', '.css', '.md']

  const ext = path.extname(filePath)
  if (!TEXT_EXTENSIONS.includes(ext)) return

  let content = await fs.readFile(filePath, 'utf-8')
  let changed = false

  for (const [key, value] of Object.entries(values)) {
    if (content.includes(key)) {
      content = content.replaceAll(key, value)
      changed = true
    }
  }

  if (changed) {
    await fs.writeFile(filePath, content, 'utf-8')
  }
}

async function walk(dir: string, values: TemplateValues): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath, values)
      } else {
        await applyTemplateVars(fullPath, values)
      }
    }),
  )
}

export async function generateProject(targetDir: string, options: ProjectOptions): Promise<void> {
  await fs.copy(TEMPLATE_DIR, targetDir)

  const values: TemplateValues = {
    '{{name}}': options.name,
    '{{platform}}': options.platform,
  }

  await walk(targetDir, values)
}

export async function installDeps(
  dir: string,
  pm: ProjectOptions['packageManager'],
): Promise<void> {
  await execa(pm, ['install'], { cwd: dir, stdio: 'inherit' })
}

export async function initGit(dir: string): Promise<void> {
  await execa('git', ['init'], { cwd: dir })
  await execa('git', ['add', '-A'], { cwd: dir })
  await execa('git', ['commit', '-m', 'chore: initial commit from create-table-app'], { cwd: dir })
}
