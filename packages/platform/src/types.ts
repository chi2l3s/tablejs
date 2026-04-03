export type Platform = 'tizen' | 'webos' | 'android' | 'all'
export type Target = Exclude<Platform, 'all'>
export type Mode = 'webview' | 'native'

export interface BuildOptions {
  platform: Target
  outDir: string
  dir: string
  minify: boolean
  mode: Mode
  sourcemap: boolean
}

export interface PlatformAdapter {
  name: string
  build(options: BuildOptions): Promise<void>
  package(options: BuildOptions): Promise<string>
}

export interface ManifestBase {
  id: string
  name: string
  version: string
  description?: string
  icon?: string
}
