# Estágio 1: Instalação de dependências
# Usamos uma imagem base oficial do Bun.
FROM oven/bun:1.1-slim AS dependencies
WORKDIR /usr/src/app

# Copia os arquivos de pacote e instala as dependências
# Isso cria uma camada que será cacheada se os arquivos não mudarem, acelerando builds futuros.
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Estágio 2: Build da aplicação e execução do script de seed
FROM dependencies AS build
WORKDIR /usr/src/app

# Copia as dependências já instaladas
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copia todo o código-fonte da aplicação
COPY . .

# Argumentos para as variáveis de ambiente necessárias durante o build (para o script seed.ts)
ARG UPSTASH_VECTOR_REST_URL
ARG UPSTASH_VECTOR_REST_TOKEN

# Executa o script para popular o banco de dados vetorial
RUN bun run seed.ts

# Compila a aplicação Nuxt para produção
RUN bun run build

# Estágio 3: Imagem final de produção
# Começamos com uma imagem limpa e leve do Bun para a imagem final.
FROM oven/bun:1.1-slim AS production
WORKDIR /usr/src/app

# Define as variáveis de ambiente para o modo de produção
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
# Variáveis que serão passadas em tempo de execução para a API
ENV UPSTASH_VECTOR_REST_URL=""
ENV UPSTASH_VECTOR_REST_TOKEN=""

# Copia o build de produção do estágio 'build'
COPY --from=build /usr/src/app/.output ./.output
# Copia os node_modules do estágio 'dependencies'
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Expõe a porta em que a aplicação será executada
EXPOSE 3000

# Comando para iniciar o servidor Nuxt em produção
CMD ["bun", ".output/server/index.mjs"]