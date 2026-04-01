export type Platform = 'tizen' | 'webos' | 'androidtv' | 'all'
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export interface ProjectOptions {
    name: string
    platform: Platform
    packageManager: PackageManager
    installDeps: boolean
    initGit: boolean
}