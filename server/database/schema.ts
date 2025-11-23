import { relations } from 'drizzle-orm'
import { index, integer, json, jsonb, pgEnum, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, varchar, vector } from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
}

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('description').notNull(),
  groupId: varchar('group_id', { length: 36 }).references(() => groups.id, { onDelete: 'cascade' }),
  ...timestamps
})

export const guidesRelations = relations(guides, ({ many, one }) => ({
  guides: many(chunk),

  group: one(groups, {
    fields: [guides.groupId],
    references: [groups.id]
  })
}))

export const chunk = pgTable(
  'chunk',
  {
    id: serial('id').primaryKey(),
    guideId: integer('guide_id')
      .notNull()
      .references(() => guides.id, { onDelete: 'cascade' }),
    embedding: vector('embedding', { dimensions: 1024 }),
    content: text('content').notNull(),
    ...timestamps
  },
  table => [
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))
  ]
)

export const chunkRelations = relations(chunk, ({ one }) => ({
  guide: one(guides, {
    fields: [chunk.guideId],
    references: [guides.id]
  })
}))

export const providerEnum = pgEnum('provider', ['github', 'token'])
export const roleEnum = pgEnum('role', ['user', 'assistant'])

export const users = pgTable('users', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar({ length: 255 }).unique().notNull(),
  name: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 255 }),
  avatar: varchar({ length: 500 }),
  provider: providerEnum().notNull(),
  providerId: varchar({ length: 50 }),
  ...timestamps
}, table => [
  uniqueIndex('users_provider_id_idx').on(table.provider, table.providerId)
])

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
  groupMemberships: many(groupMembers)
}))

export const chats = pgTable('chats', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar({ length: 200 }),
  userId: varchar({ length: 36 }).notNull(),
  ...timestamps
}, table => [
  index('chats_user_id_idx').on(table.userId)
])

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  }),
  messages: many(messages)
}))

export const messages = pgTable('messages', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: varchar({ length: 36 }).notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: roleEnum().notNull(),
  parts: json(),
  ...timestamps
}, table => [
  index('messages_chat_id_idx').on(table.chatId)
])

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}))

export const groups = pgTable('groups', {
  id: varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).unique().notNull(), // Ex: 'rocketseat', 'meu-time'
  ...timestamps
})

export const groupMembers = pgTable('group_members', {
  id: serial('id'),
  userId: varchar({ length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: varchar({ length: 36 }).notNull().references(() => groups.id, { onDelete: 'cascade' }),

  // Ex no banco: ["guide:create", "guide:delete"]
  permissions: jsonb('permissions').$type<GroupMemberPermission[]>().notNull().default([]),

  ...timestamps
}, t => [primaryKey({ columns: [t.userId, t.groupId] }), index('group_members_user_id_idx').on(t.userId)])

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  guides: many(guides)
}))

// Relations da ACL (Membros)
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] })
}))
