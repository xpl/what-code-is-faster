const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..', 'dist', 'npm-esm')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function resolveRelativeSpecifier(specifier, fromDir) {
  if (!specifier.startsWith('.')) return specifier

  const target = path.resolve(fromDir, specifier)
  if (fs.existsSync(`${target}.js`) || fs.existsSync(`${target}.mjs`)) return `${specifier}.mjs`
  if (fs.existsSync(path.join(target, 'index.js')) || fs.existsSync(path.join(target, 'index.mjs'))) {
    return `${specifier}/index.mjs`
  }
  return specifier
}

for (const file of walk(root).filter(file => file.endsWith('.js'))) {
  const dir = path.dirname(file)
  const source = fs.readFileSync(file, 'utf8')
  const rewritten = source.replace(
    /(from\s+['"])(\.[^'"]+)(['"])/g,
    (_match, before, specifier, after) =>
      `${before}${resolveRelativeSpecifier(specifier, dir)}${after}`
  )

  fs.writeFileSync(file, rewritten)
  fs.renameSync(file, file.replace(/\.js$/, '.mjs'))
}
