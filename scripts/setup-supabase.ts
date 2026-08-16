import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { seedLanding, seedMedia, seedProducts, seedSlides } from '../src/lib/seed.ts'

function loadEnvLocal() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const env: Record<string, string> = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1)
  }
  return env
}

const env = loadEnvLocal()
const url = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = env.VITE_ADMIN_EMAIL || 'jsagroshop63@gmail.com'
const adminPassword = env.VITE_ADMIN_PASSWORD || 'admin123'

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function ensureBucket() {
  const { data } = await supabase.storage.listBuckets()
  if (data?.some((bucket) => bucket.name === 'media')) {
    console.log('storage: media bucket exists')
    return
  }
  const { error } = await supabase.storage.createBucket('media', { public: true, fileSizeLimit: 10485760 })
  if (error) console.log(`storage: ${error.message}`)
  else console.log('storage: media bucket created')
}

async function ensureAdmin() {
  const { error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  })
  if (!error) {
    console.log('auth: admin user created')
    return
  }
  if (/already|registered|exists/i.test(error.message)) {
    console.log('auth: admin user already exists')
    return
  }
  console.log(`auth: ${error.message}`)
}

async function seedIfReady() {
  const probe = await supabase.from('products').select('id').limit(1)
  if (probe.error) {
    console.log('tables_missing: run supabase/schema.sql in the SQL Editor, then run this script again')
    return false
  }

  const productRows = seedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    headline: product.headline,
    description: product.description,
    price: product.price,
    compare_price: product.comparePrice,
    image: product.image,
    gallery: product.gallery,
    category: product.category,
    stock: product.stock,
    featured: product.featured,
    created_at: product.createdAt,
  }))
  const slideRows = seedSlides.map((slide) => ({
    id: slide.id,
    image: slide.image,
    title: slide.title,
    subtitle: slide.subtitle,
    cta_text: slide.ctaText,
    cta_link: slide.ctaLink,
    sort_order: slide.sortOrder,
    active: slide.active,
  }))
  const mediaRows = seedMedia.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    title: item.title,
    caption: item.caption,
    sort_order: item.sortOrder,
    active: item.active,
  }))
  const landingRow = {
    id: 1,
    hero_title: seedLanding.heroTitle,
    hero_subtitle: seedLanding.heroSubtitle,
    package_title: seedLanding.packageTitle,
    package_items: seedLanding.packageItems,
    story_title: seedLanding.storyTitle,
    story_body: seedLanding.storyBody,
    why_title: seedLanding.whyTitle,
    why_items: seedLanding.whyItems,
    payment_title: seedLanding.paymentTitle,
    payment_number: seedLanding.paymentNumber,
    payment_note: seedLanding.paymentNote,
    offer_product_id: seedLanding.offerProductId,
    offer_title: seedLanding.offerTitle,
    offer_price: seedLanding.offerPrice,
    offer_compare_price: seedLanding.offerComparePrice,
    offer_media_ids: seedLanding.offerMediaIds,
  }

  const products = await supabase.from('products').upsert(productRows)
  const slides = await supabase.from('carousel_slides').upsert(slideRows)
  const media = await supabase.from('landing_media').upsert(mediaRows)
  const landing = await supabase.from('landing_content').upsert(landingRow)

  console.log(products.error ? `products: ${products.error.message}` : 'products: seeded')
  console.log(slides.error ? `slides: ${slides.error.message}` : 'slides: seeded')
  console.log(media.error ? `media: ${media.error.message}` : 'media: seeded')
  console.log(landing.error ? `landing: ${landing.error.message}` : 'landing: seeded')
  return true
}

const bucketOk = await ensureBucket().then(() => true).catch((error: Error) => {
  console.log(`storage: ${error.message}`)
  return false
})
await ensureAdmin()
const seeded = await seedIfReady()
console.log(bucketOk && seeded ? 'supabase_ready' : 'supabase_partial')
