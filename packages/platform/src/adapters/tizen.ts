import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import type { BuildOptions, PlatformAdapter, ManifestBase } from '../types'

export class TizenAdapter implements PlatformAdapter {
  name = 'Tizen (Samsung)'

  async build(options: BuildOptions): Promise<void> {
    await this.createConfig(options.dir)
  }

  async package(options: BuildOptions): Promise<string> {
    const outputPath = path.join(options.dir, '..', 'app.wgt')

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(outputPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => resolve())
      archive.on('error', reject)

      archive.pipe(output)
      archive.directory(options.dir, false)
      archive.finalize()
    })

    return outputPath
  }

  private async createConfig(distDir: string) {
    const pkg = await this.readPackageJson()

    const config = `<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" 
        xmlns:tizen="http://tizen.org/ns/widgets"
        id="${pkg.id || 'com.example.app'}"
        version="${pkg.version}"
        viewmodes="maximized">
  <tizen:application id="${pkg.id || 'com.example.app'}.App" 
                     package="${pkg.id || 'com.example.app'}"
                     required_version="6.0"/>
  <content src="index.html"/>
  <feature name="http://tizen.org/feature/screen.size.all"/>
  <icon src="icon.png"/>
  <name>${pkg.name}</name>
  <tizen:profile name="tv"/>
  <tizen:setting screen-orientation="landscape" 
                 context-menu="disable" 
                 background-support="disable" 
                 encryption="disable" 
                 install-location="auto"/>
</widget>`

    await fs.writeFile(path.join(distDir, 'config.xml'), config)
  }

  private async readPackageJson(): Promise<ManifestBase> {
    try {
      const pkg = await fs.readJson('package.json')
      return {
        id: pkg.tizenAppId || pkg.name,
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
