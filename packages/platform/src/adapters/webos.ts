import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import type { BuildOptions, PlatformAdapter, ManifestBase } from '../types'

export class WebOSAdapter implements PlatformAdapter {
  name = 'webOS (LG)'

  async build(options: BuildOptions): Promise<void> {
    const distDir = `${options.outDir}/webos`
    await this.createAppInfo(distDir)
  }

  async package(distDir: string): Promise<string> {
    const outputPath = path.join(distDir, '..', 'app.ipk')

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(outputPath)
      const archive = archiver('tar', { gzip: true })

      output.on('close', () => resolve())
      archive.on('error', reject)

      archive.pipe(output)
      archive.directory(distDir, false)
      archive.finalize()
    })

    return outputPath
  }

  private async createAppInfo(distDir: string) {
    const pkg = await this.readPackageJson()

    const appInfo = {
      id: pkg.id || 'com.example.app',
      version: pkg.version,
      vendor: 'Table.js',
      type: 'web',
      main: 'index.html',
      title: pkg.name,
      icon: 'icon.png',
      largeIcon: 'icon.png',
      bgImage: 'splash.png',
      resolution: '1920x1080',
      disallowScrollingInMainWindow: true,
    }

    await fs.writeJson(path.join(distDir, 'appinfo.json'), appInfo, { spaces: 2 })
  }

  private async readPackageJson(): Promise<ManifestBase> {
    try {
      const pkg = await fs.readJson('package.json')
      return {
        id: pkg.webosAppId || pkg.name,
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
      }
    } catch {
      return {
        id: 'com.example.app',
        name: 'Table App',
        version: '1.0.0',
      }
    }
  }
}
