import { build as viteBuild } from 'vite'
import type { BuildOptions, Platform, PlatformAdapter } from './types'
import { TizenAdapter } from './adapters/tizen'
import { WebOSAdapter } from './adapters/webos'
import { AndroidAdapter } from './adapters/android'

export async function build(platform: Platform, options: Partial<BuildOptions> = {}) {
  const opts: BuildOptions = {
    platform,
    outDir: options.outDir || 'dist',
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

async function buildPlatform(platform: Platform, options: BuildOptions) {
  const adapter = getAdapter(platform)

  await viteBuild({
    build: {
      outDir: `${options.outDir}/${platform}`,
      minify: options.minify,
      sourcemap: options.sourcemap,
      emptyOutDir: true,
    },
    define: {
      __TABLE_PLATFORM__: JSON.stringify(platform),
    },
  })

  await adapter.build(options)

  const packagePath = await adapter.package(`${options.outDir}/${platform}`)
  console.log(`✓ ${adapter.name} package created: ${packagePath}`)
}

function getAdapter(platform: Platform): PlatformAdapter {
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
