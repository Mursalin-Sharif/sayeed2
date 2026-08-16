export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type Product = {
  id: string
  name: string
  headline: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  gallery: string[]
  category: string
  stock: number
  featured: boolean
  createdAt: string
}

export type CartItem = {
  productId: string
  quantity: number
}

export type OrderItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  items: OrderItem[]
  customerName: string
  phone: string
  address: string
  district: string
  shippingType: 'district' | 'upazila' | 'home'
  shippingFee: number
  subtotal: number
  total: number
  status: OrderStatus
  notes: string
  source: string
  campaign: string
  createdAt: string
}

export type Customer = {
  id: string
  name: string
  phone: string
  address: string
  district: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export type CarouselSlide = {
  id: string
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  sortOrder: number
  active: boolean
}

export type LandingMedia = {
  id: string
  type: 'image' | 'video'
  url: string
  title: string
  caption: string
  sortOrder: number
  active: boolean
}

export type LandingContent = {
  heroTitle: string
  heroSubtitle: string
  packageTitle: string
  packageItems: string[]
  storyTitle: string
  storyBody: string
  whyTitle: string
  whyItems: string[]
  paymentTitle: string
  paymentNumber: string
  paymentNote: string
  offerProductId: string
  offerTitle: string
  offerPrice: number
  offerComparePrice: number | null
  offerMediaIds: string[]
  metaPixelId: string
  ctaLabel: string
  checkoutTitle: string
  helpTitle: string
  helpSubtitle: string
  checkoutBillingTitle: string
  checkoutOrderTitle: string
  checkoutSubmitLabel: string
  checkoutCodNote: string
}

export type SiteContent = {
  name: string
  nameEn: string
  slogan: string
  tagline: string
  about: string
  phone: string
  phone2: string
  email: string
  address: string
  hours: string
  facebook: string
  homeBannerTitle: string
  homeBannerCta: string
  headerOfferLabel: string
}

export type ContactMessage = {
  id: string
  name: string
  phone: string
  email: string
  message: string
  read: boolean
  createdAt: string
}

export type CheckoutInput = {
  items: OrderItem[]
  customerName: string
  phone: string
  address: string
  district: string
  shippingType: 'district' | 'upazila' | 'home'
  notes?: string
  source?: string
  campaign?: string
}

export type StoreSnapshot = {
  products: Product[]
  orders: Order[]
  slides: CarouselSlide[]
  media: LandingMedia[]
  landing: LandingContent
  site: SiteContent
  customers: Customer[]
  messages: ContactMessage[]
}
