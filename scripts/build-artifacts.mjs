/**
 * ⑦ 記事公開時の統合ビルド
 * npm run build:artifacts
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const skipIstep = process.argv.includes('--skip-istep')
const skipDeploy = process.argv.includes('--skip-deploy')

const steps = [
  { name: 'build:search-index', cmd: 'node', args: ['scripts/build-search-index.mjs'] },
  { name: 'build:entity-graph', cmd: 'node', args: ['scripts/build-entity-graph.mjs'] },
  { name: 'ranking:bootstrap', cmd: 'node', args: ['scripts/bootstrap-ranking-snapshot.mjs'] },
]

if (!skipIstep) {
  steps.unshift({ name: 'istep:sync', cmd: 'npm', args: ['run', 'istep:sync'] })
}

let failed = 0

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`)
  const result = spawnSync(step.cmd, step.args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    console.error(`❌ ${step.name} failed`)
    failed++
  } else {
    console.log(`✅ ${step.name} OK`)
  }
}

if (!skipDeploy && process.env.REVALIDATE_URL && process.env.REVALIDATE_SECRET) {
  console.log('\n=== revalidate ===')
  const res = spawnSync(
    'node',
    ['-e', `
      fetch(process.env.REVALIDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.REVALIDATE_SECRET,
        },
        body: JSON.stringify({ source: 'build-artifacts' }),
      }).then(async (r) => {
        const text = await r.text()
        console.log(r.status, text)
        process.exit(r.ok ? 0 : 1)
      }).catch((e) => { console.error(e); process.exit(1) })
    `],
    { cwd: root, stdio: 'inherit', shell: true, env: process.env },
  )
  if (res.status !== 0) failed++
}

console.log(failed === 0 ? '\n✅ build:artifacts 完了' : `\n❌ ${failed} ステップ失敗`)
process.exit(failed === 0 ? 0 : 1)
