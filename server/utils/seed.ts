import { splitText } from './langchain'
import { useDrizzle, tables } from './drizzle'
import { PERMISSIONS } from '../../shared/utils/permissions'
import { logger } from '../../shared/utils/logger'
import { useRedis } from './redis'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { z } from 'zod'
import { HashPassword } from './auth/crypt'
import { splitByCase, upperFirst } from 'scule'

async function processGuide(db: ReturnType<typeof useDrizzle>, filePath: string, groupId: string | null) {
  const log = logger.withTag('SEED:ProcessGuide')
  const content = fs.readFileSync(filePath, 'utf-8')
  const rawTitle = path.basename(filePath, '.md')
  const title = splitByCase(rawTitle).map(upperFirst).join(' ')

  log.log(`Processando o guia: ${title}...`)

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
  log.log(`Guia "${title}" criado com ID: ${guideId}.`)

  const chunks = await splitText({ title, content })
  if (chunks.length === 0) {
    log.log(`Nenhum chunk gerado para o guia "${title}". Pulando.`)
    return
  }

  log.log(`Gerando ${chunks.length} embeddings para os chunks...`)

  const chunksData = chunks.map((chunk) => {
    return {
      guideId: guideId,
      content: chunk.pageContent,
      embedding: null
    }
  })

  log.log(`Inserindo ${chunksData.length} chunks no banco de dados...`)
  await db.insert(tables.chunk).values(chunksData)
}

async function runSeed() {
  const log = logger.withTag('SEED')

  log.log('Iniciando o processo de seed...')

  const db = useDrizzle()
  const kv = useRedis()

  log.log(`Limpando redis...`)
  await kv.flushdb('ASYNC')
  await kv.quit()

  log.log('Limpando tabelas existentes...')
  await db.delete(tables.groupMembers)
  await db.delete(tables.groups)
  await db.delete(tables.users)
  await db.delete(tables.chunk)
  await db.delete(tables.guides)

  const seedDir = path.resolve('./seed')

  // Criar Usuários Admins via JSON
  const createdAdmins: typeof tables.users.$inferSelect[] = []
  const adminsFile = path.join(seedDir, 'admins.json')

  if (fs.existsSync(adminsFile)) {
    try {
      log.log('Lendo seeds de admins...')
      const fileContent = fs.readFileSync(adminsFile, 'utf-8')
      const adminSchema = z.object({
        admins: z.array(z.object({
          email: z.email(),
          password: z.string(),
          name: z.string()
        }))
      })

      const parsed = adminSchema.safeParse(JSON.parse(fileContent))

      if (parsed.success) {
        for (const adminData of parsed.data.admins) {
          const hashedPassword = await HashPassword(adminData.password)

          const [user] = await db
            .insert(tables.users)
            .values({
              name: adminData.name,
              email: adminData.email,
              provider: 'token',
              password: hashedPassword
            })
            .returning()

          if (user) {
            createdAdmins.push(user)
            log.log(`Usuário admin criado: ${user.email} (ID: ${user.id})`)
          }
        }
      } else {
        log.error('Erro de validação no arquivo admins.json', parsed.error)
      }
    } catch (e) {
      log.error('Erro ao processar arquivo admins.json', e)
    }
  } else {
    log.warn('Arquivo admins.json não encontrado. Nenhum admin será criado.')
  }

  // Criar Usuário sem grupo
  log.log('Criando usuário sem grupo...')
  const [userNoGroup] = await db
    .insert(tables.users)
    .values({
      name: 'User No Group',
      email: 'user@nogroup.com',
      provider: 'token',
      password: '$argon2id$v=19$m=65536,t=3,p=4$Tr/J52XFebvotDC2SFXzlg$orHFwV6tDtCv0nt55U5ZMefO7DiXIwp1gu7+Bg+MdHA'
    })
    .returning()

  if (userNoGroup) {
    log.log(`Usuário sem grupo criado: ${userNoGroup.name} (ID: ${userNoGroup.id})`)
  }

  if (!fs.existsSync(seedDir)) {
    log.log('Diretório seed não encontrado.')
    return { result: 'Skipped' }
  }

  const items = fs.readdirSync(seedDir, { withFileTypes: true })

  for (const item of items) {
    if (!item.isDirectory()) continue

    const dirName = item.name
    const dirPath = path.join(seedDir, dirName)
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))

    if (dirName === 'public') {
      log.log('Processando pasta public (guias globais)...')
      for (const file of files) {
        await processGuide(db, path.join(dirPath, file), null)
      }
    } else {
      log.log(`Processando grupo: ${dirName}...`)

      // Criar Grupo
      const [group] = await db
        .insert(tables.groups)
        .values({
          name: dirName.charAt(0).toUpperCase() + dirName.slice(1), // Capitalize
          slug: dirName
        })
        .returning()

      if (!group) {
        log.error(`Falha ao criar grupo ${dirName}`)
        continue
      }

      log.log(`Grupo criado: ${group.name} (ID: ${group.id})`)

      // Adicionar Admins ao Grupo
      if (createdAdmins.length > 0) {
        for (const adminUser of createdAdmins) {
          await db.insert(tables.groupMembers).values({
            groupId: group.id,
            userId: adminUser.id,
            permissions: [
              PERMISSIONS.GUIDE.READ,
              PERMISSIONS.GUIDE.UPDATE,
              PERMISSIONS.GUIDE.DELETE,
              PERMISSIONS.GUIDE.CREATE,
              PERMISSIONS.GROUP.READ,
              PERMISSIONS.GROUP.MANAGE_MEMBERS
            ]
          })
          log.log(`Admin ${adminUser.email} adicionado ao grupo ${group.name}`)
        }
      } else {
        log.warn(`Nenhum admin disponível para adicionar ao grupo ${group.name}`)
      }

      // Processar guias do grupo
      for (const file of files) {
        await processGuide(db, path.join(dirPath, file), group.id)
      }
    }
  }

  log.log('Processo de seed concluído com sucesso!')
  return { result: 'Success' }
}

export { runSeed }
