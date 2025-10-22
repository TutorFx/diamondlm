export default defineTask({
  meta: {
    name: 'db:migrate',
    description: 'Run database migrations'
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run({ payload, context }) {
    const embed = useEmbedding()

    console.log(await embed.findSimilarGuides('quais são os valores da implanta?'))

    return { result: 'Success' }
  }
})
