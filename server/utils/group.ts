import { eq, or, like, desc } from 'drizzle-orm'

export async function getAvailableSlug(db: ReturnType<typeof useDrizzle>, name: string): Promise<string> {
  const baseSlug = stringToSlug(name)

  const [lastSlug] = await db
    .select({ slug: tables.groups.slug })
    .from(tables.groups)
    .where(
      or(
        eq(tables.groups.slug, baseSlug),
        like(tables.groups.slug, `${baseSlug}-%`)
      )
    )
    .orderBy(
      desc(sql`length(${tables.groups.slug})`),
      desc(tables.groups.slug)
    )
    .limit(1)

  if (!lastSlug) {
    return baseSlug
  }

  const currentSlug = lastSlug.slug

  if (currentSlug === baseSlug) {
    return `${baseSlug}-1`
  }

  const suffix = currentSlug.slice(baseSlug.length + 1)
  const crNumber = parseInt(suffix, 10)

  if (isNaN(crNumber)) {
    return `${baseSlug}-1`
  }

  return `${baseSlug}-${crNumber + 1}`
}
