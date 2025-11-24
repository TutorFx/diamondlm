export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed'
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run({ payload, context }) {
    return await runSeed()
  }
})
