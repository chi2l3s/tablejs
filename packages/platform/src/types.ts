export type Platform = 'tizen' | 'webos' | 'android' | 'all'

export interface BuildOptions {
  platform: Platform
  outDir: string
  minify: boolean
  sourcemap: boolean
}

export interface PlatformAdapter {
  name: string
  build(options: BuildOptions): Promise<void>
  package(distDir: string): Promise<string>
}

export interface ManifestBase {
  id: string
  name: string
  version: string
  description?: string
  icon?: string
}
