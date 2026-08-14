import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { HomePage } from '@/pages/HomePage'
import { ProductPage } from '@/pages/ProductPage'
import { CartPage } from '@/pages/CartPage'
import { ContactPage } from '@/pages/ContactPage'
import { LandingPage } from '@/pages/LandingPage'
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage'
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage'
import { AdminMediaPage } from '@/pages/admin/AdminMediaPage'
import { AdminLandingPage } from '@/pages/admin/AdminLandingPage'
import { AdminCarouselPage } from '@/pages/admin/AdminCarouselPage'

function Storefront({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>
}

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Storefront><HomePage /></Storefront>} />
        <Route path="/product/:id" element={<Storefront><ProductPage /></Storefront>} />
        <Route path="/cart" element={<Storefront><CartPage /></Storefront>} />
        <Route path="/contact" element={<Storefront><ContactPage /></Storefront>} />
        <Route path="/offer" element={<Storefront><LandingPage /></Storefront>} />
        <Route path="/order-success/:id" element={<Storefront><OrderSuccessPage /></Storefront>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="landing" element={<AdminLandingPage />} />
          <Route path="carousel" element={<AdminCarouselPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
