import { pipeline, TokenClassificationOutput } from '@huggingface/transformers'

type TokenClassificationSingle = TokenClassificationOutput[number]

function aggregateEntities(tokens: TokenClassificationOutput | TokenClassificationOutput[]) {
  if (!Array.isArray(tokens)) return []

  const entities: { entity: string; score: number; word: string }[] = []
  let currentEntity: { entity: string; score: number; word: string; count: number } | null = null

  for (const token of tokens) {
    // Ensure we're working with a single token object, not a nested array (batch output)
    if (Array.isArray(token) || !token || typeof token !== 'object' || !('entity' in token)) {
      continue
    }

    // Narrow to TokenClassificationSingle for easier access

    // Let's use a typed variable
    const singleToken = token as TokenClassificationSingle

    const entityType = singleToken.entity.startsWith('B-') ? singleToken.entity.substring(2) : (singleToken.entity.startsWith('I-') ? singleToken.entity.substring(2) : singleToken.entity)
    const isSubword = singleToken.word.startsWith('##')
    const cleanWord = isSubword ? singleToken.word.substring(2) : singleToken.word

    // Continue the current entity if it matches
    if (currentEntity && currentEntity.entity === entityType && (singleToken.entity.startsWith('I-') || isSubword)) {
      if (isSubword) {
        currentEntity.word += cleanWord
      } else {
        currentEntity.word += ' ' + cleanWord
      }
      currentEntity.score += singleToken.score
      currentEntity.count++
    } else {
      // Push the completed entity
      if (currentEntity) {
        entities.push({
          entity: currentEntity.entity,
          score: currentEntity.score / currentEntity.count,
          word: currentEntity.word
        })
      }

      // Start a new entity
      currentEntity = {
        entity: entityType,
        score: singleToken.score,
        word: cleanWord,
        count: 1
      }
    }
  }

  // Push the last entity
  if (currentEntity) {
    entities.push({
      entity: currentEntity.entity,
      score: currentEntity.score / currentEntity.count,
      word: currentEntity.word
    })
  }

  return entities
}

export default defineEventHandler(async (event) => {
  // Initialize the pipeline
  const ner = await pipeline(
    'token-classification',
    'Xenova/bert-base-multilingual-cased-ner-hrl',
    {}
  );

  const text = `Bem-vindo(a) à Implanta IT Solutions: Seu Guia de Integração

Boas-vindas e Introdução

Aqui iniciaremos nossa jornada! Aproveite o caminho. Este manual foi cuidadosamente elaborado para ser o seu guia central durante as primeiras semanas e além. Nosso objetivo é facilitar sua integração à nossa equipe, fornecendo um acesso claro e direto às informações essenciais sobre a cultura, as políticas, os benefícios e o propósito que movem a Implanta IT Solutions.

Esperamos que este guia sirva como um mapa para você navegar em nossa organização, compreendendo não apenas o que fazemos, mas por que fazemos. Para começar, vamos explorar a base da nossa identidade e o que nos impulsiona a inovar todos os dias.`;

  const rawOutput = await ner(text);
  const cleanOutput = aggregateEntities(rawOutput);
  return cleanOutput
})