import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')
const dryRun = process.argv.includes('--dry-run')

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

const rootManifestPath = path.join(rootDir, 'package.json')
const workspaceManifestPaths = await getWorkspaceManifestPaths()
const publishManifestPaths = [rootManifestPath, ...workspaceManifestPaths]
const manifests = await Promise.all(publishManifestPaths.map(readManifest))

const workspacePackages = manifests
  .filter((manifest) => manifest.path !== rootManifestPath)
  .map((manifest) => manifest.json)

const workspacePackageNames = new Set(workspacePackages.map((pkg) => pkg.name))
const currentVersions = manifests.map((manifest) => manifest.json.version)
const nextVersion = incrementPatch(maxVersion(currentVersions))

for (const manifest of manifests) {
  manifest.json.version = nextVersion
}

for (const manifest of manifests) {
  for (const field of dependencyFields) {
    const deps = manifest.json[field]
    if (!deps) continue

    for (const dependencyName of Object.keys(deps)) {
      if (!workspacePackageNames.has(dependencyName)) continue
      deps[dependencyName] = `^${nextVersion}`
    }
  }
}

if (dryRun) {
  console.log(nextVersion)
  process.exit(0)
}

await Promise.all(
  manifests.map((manifest) =>
    writeFile(manifest.path, `${JSON.stringify(manifest.json, null, 2)}\n`, 'utf8'),
  ),
)

console.log(`Updated workspace packages to ${nextVersion}`)

async function getWorkspaceManifestPaths() {
  const entries = await readdir(packagesDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesDir, entry.name, 'package.json'))
}

async function readManifest(manifestPath) {
  const content = await readFile(manifestPath, 'utf8')
  return {
    path: manifestPath,
    json: JSON.parse(content),
  }
}

function maxVersion(versions) {
  return versions.reduce((max, candidate) => (compareVersions(candidate, max) > 0 ? candidate : max))
}

function incrementPatch(version) {
  const [major, minor, patch] = parseVersion(version)
  return `${major}.${minor}.${patch + 1}`
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left)
  const rightParts = parseVersion(right)

  for (let index = 0; index < 3; index++) {
    const difference = leftParts[index] - rightParts[index]
    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`)
  }

  return match.slice(1).map((part) => Number(part))
}
