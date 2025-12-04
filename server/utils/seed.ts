import { textSplitter } from './langchain'
import { useDrizzle, tables } from './drizzle'
import { PERMISSIONS } from '../../shared/utils/permissions'
import { logger } from '../../shared/utils/logger'
import * as fs from 'node:fs'
import * as path from 'node:path'

async function processGuide(db: ReturnType<typeof useDrizzle>, filePath: string, groupId: string | null) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const title = path.basename(filePath, '.md')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()) // Title Case

  logger.info(`[SEED] Processando o guia: ${title}...`)

  const [newGuide] = await db
    .insert(tables.guides)
    .values({
      title,
      content,
      groupId
    })
    .returning({ insertedId: tables.guides.id })

  if (!newGuide) throw new Error('Failed to create guide')

  const guideId = newGuide.insertedId
  logger.info(`[SEED] Guia "${title}" criado com ID: ${guideId}.`)

  const chunks = await textSplitter.createDocuments([content])
  if (chunks.length === 0) {
    logger.info(`[SEED] Nenhum chunk gerado para o guia "${title}". Pulando.`)
    return
  }

  logger.info(`[SEED] Gerando ${chunks.length} embeddings para os chunks...`)

  const chunksData = chunks.map((chunk) => {
    return {
      guideId: guideId,
      content: chunk.pageContent,
      embedding: null
    }
  })

  logger.info(`[SEED] Inserindo ${chunksData.length} chunks no banco de dados...`)
  await db.insert(tables.chunk).values(chunksData)
}

async function runSeed() {
  logger.info('[SEED] Iniciando o processo de seed...')

  const db = useDrizzle()

  logger.info('[SEED] Limpando tabelas existentes...')
  await db.delete(tables.groupMembers)
  await db.delete(tables.groups)
  await db.delete(tables.users)
  await db.delete(tables.chunk)
  await db.delete(tables.guides)

  // Criar Usuário Admin
  logger.info('[SEED] Criando usuário admin...')
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
  logger.info(`[SEED] Usuário criado: ${user.name} (ID: ${user.id})`)

  const seedDir = path.resolve('./seed')

  if (!fs.existsSync(seedDir)) {
    logger.info('[SEED] Diretório seed não encontrado.')
    return { result: 'Skipped' }
  }

  const items = fs.readdirSync(seedDir, { withFileTypes: true })

  for (const item of items) {
    if (!item.isDirectory()) continue

    const dirName = item.name
    const dirPath = path.join(seedDir, dirName)
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))

    if (dirName === 'public') {
      logger.info('[SEED] Processando pasta public (guias globais)...')
      for (const file of files) {
        await processGuide(db, path.join(dirPath, file), null)
      }
    } else {
      logger.info(`[SEED] Processando grupo: ${dirName}...`)

      // Criar Grupo
      const [group] = await db
        .insert(tables.groups)
        .values({
          name: dirName.charAt(0).toUpperCase() + dirName.slice(1), // Capitalize
          slug: dirName
        })
        .returning()

      if (!group) {
        logger.error(`[SEED] Falha ao criar grupo ${dirName}`)
        continue
      }

      logger.info(`[SEED] Grupo criado: ${group.name} (ID: ${group.id})`)

      // Adicionar Admin ao Grupo
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
      logger.info(`[SEED] Admin adicionado ao grupo ${group.name}`)

      // Processar guias do grupo
      for (const file of files) {
        await processGuide(db, path.join(dirPath, file), group.id)
      }
    }
  }

  logger.info('[SEED] Processo de seed concluído com sucesso!')
  return { result: 'Success' }
}

export { runSeed }
