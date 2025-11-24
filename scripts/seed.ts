import { runSeed } from '../server/utils/seed'

async function main() {
  await runSeed()
}

main()
  .catch(e => console.error(e))
  .finally(async () => {})
