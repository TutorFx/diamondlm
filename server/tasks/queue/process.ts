export default defineTask({
  meta: {
    name: 'queue:process',
    description: 'Processa jobs pendentes da fila KV'
  },
  async run({ payload, context }) {
    return { }
  }
})
