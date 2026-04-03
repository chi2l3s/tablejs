import fs from 'fs-extra'
import { build as viteBuild } from 'vite'
import type { BuildOptions, Mode, Platform, PlatformAdapter, Target } from './types'
import { TizenAdapter } from './adapters/tizen'
import { WebOSAdapter } from './adapters/webos'
import { AndroidAdapter } from './adapters/android'

export async function build(platform: Platform, options: Partial<BuildOptions> = {}) {
  const opts = {
    outDir: options.outDir || 'dist',
    mode: options.mode || 'webview',
    minify: options.minify ?? true,
    sourcemap: options.sourcemap ?? false,
  }

  if (platform === 'all') {
    await Promise.all([
      buildPlatform('tizen', opts),
      buildPlatform('webos', opts),
      buildPlatform('android', opts),
    ])
    return
  }

  await buildPlatform(platform, opts)
}

async function buildPlatform(platform: Target, base: Omit<BuildOptions, 'dir' | 'platform'>) {
  const options: BuildOptions = {
    ...base,
    dir: out(base.outDir, platform, base.mode),
    platform,
  }
  const adapter = getAdapter(platform)

  if (web(platform, options.mode)) {
    await viteBuild({
      build: {
        outDir: dir(options),
        minify: options.minify,
        sourcemap: options.sourcemap,
        emptyOutDir: true,
      },
      define: {
        __TABLE_PLATFORM__: JSON.stringify(platform),
      },
    })
  } else {
    await fs.emptyDir(options.dir)
  }

  await adapter.build(options)

  const packagePath = await adapter.package(options)
  console.log(`✓ ${adapter.name} package created: ${packagePath}`)
}

function getAdapter(platform: Target): PlatformAdapter {
  switch (platform) {
    case 'tizen':
      return new TizenAdapter()
    case 'webos':
      return new WebOSAdapter()
    case 'android':
      return new AndroidAdapter()
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

function out(root: string, platform: Target, mode: Mode) {
  if (platform === 'android' && mode === 'native') {
    return `${root}/android-native`
  }

  return `${root}/${platform}`
}

function dir(options: BuildOptions) {
  if (options.platform === 'android') {
    return `${options.dir}/www`
  }

  return options.dir
}

function web(platform: Target, mode: Mode) {
  return platform !== 'android' || mode === 'webview'
}
