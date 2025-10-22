import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOSTNAME,
  POSTGRES_PORT,
  POSTGRES_DB
} = process.env

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}:${POSTGRES_PORT}/${POSTGRES_DB}`
  }
})
