import { textSplitter } from './langchain'
import { useDrizzle, tables } from './drizzle'
import { PERMISSIONS } from '../../shared/utils/permissions'
import * as fs from 'node:fs'

async function runSeed() {
  console.log('Iniciando o processo de seed...')

  const documentsToSeed = [
    {
      title: 'Welcome',
      content: fs.readFileSync('./seed/welcome.md', 'utf-8')
    },
    {
      title: 'Policies',
      content: fs.readFileSync('./seed/policies.md', 'utf-8')
    },
    {
      title: 'Guide',
      content: fs.readFileSync('./seed/guide.md', 'utf-8')
    }
  ]

  const db = useDrizzle()

  console.log('Limpando tabelas existentes...')
  await db.delete(tables.groupMembers)
  await db.delete(tables.groups)
  await db.delete(tables.users)
  await db.delete(tables.chunk)
  await db.delete(tables.guides)

  // 2. Criação do Grupo e Usuário
  console.log('Criando grupo e usuário padrão...')

  // Criar Grupo
  const [group] = await db
    .insert(tables.groups)
    .values({
      name: 'Diamante',
      slug: 'diamond'
    })
    .returning()

  if (!group) throw new Error('Failed to create group')

  console.log(`Grupo criado: ${group.name} (ID: ${group.id})`)

  // Criar Usuário
  const [user] = await db
    .insert(tables.users)
    .values({
      name: 'Admin User',
      email: 'gabriel@serejo.dev',
      provider: 'token',
      password: '$argon2id$v=19$m=65536,t=3,p=4$Tr/J52XFebvotDC2SFXzlg$orHFwV6tDtCv0nt55U5ZMefO7DiXIwp1gu7+Bg+MdHA'
    })
    .returning()

  if (!user) throw new Error('Failed to create user')

  console.log(`Usuário criado: ${user.name} (ID: ${user.id})`)

  // Adicionar Usuário ao Grupo (Membro)
  await db.insert(tables.groupMembers).values({
    groupId: group.id,
    userId: user.id,
    permissions: [
      PERMISSIONS.GUIDE.READ,
      PERMISSIONS.GUIDE.UPDATE,
      PERMISSIONS.GUIDE.DELETE,
      PERMISSIONS.GUIDE.CREATE,
      PERMISSIONS.GROUP.READ
    ]
  })

  console.log('Usuário adicionado ao grupo com sucesso.')

  // 3. Processamento dos Guides e Embeddings (Lógica Original)
  for (const doc of documentsToSeed) {
    console.log(`Processando o guia: ${doc.title}...`)

    const [newGuide] = await db
      .insert(tables.guides)
      .values({
        title: doc.title,
        content: doc.content,
        groupId: group.id
      })
      .returning({ insertedId: tables.guides.id })

    if (!newGuide) throw new Error('Failed to create guide')

    const guideId = newGuide.insertedId
    console.log(`Guia "${doc.title}" criado com ID: ${guideId}.`)

    const chunks = await textSplitter.createDocuments([doc.content])
    if (chunks.length === 0) {
      console.log(`Nenhum chunk gerado para o guia "${doc.title}". Pulando.`)
      continue
    }

    console.log(`Gerando ${chunks.length} embeddings para os chunks...`)

    const chunksData = chunks.map((chunk) => {
      return {
        guideId: guideId,
        content: chunk.pageContent,
        embedding: null
      }
    })

    console.log(`Inserindo ${chunksData.length} chunks no banco de dados...`)
    await db.insert(tables.chunk).values(chunksData)
  }

  console.log('Processo de seed concluído com sucesso!')
  return { result: 'Success' }
}

export { runSeed }
