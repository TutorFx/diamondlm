export function stringToSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-') // Espaços para -
    .replace(/[^\w\\-]+/g, '') // Remove caracteres não alfanuméricos
    .replace(/\\-\\-+/g, '-') // Remove múltiplos hifens
}
