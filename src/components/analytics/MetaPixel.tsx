import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '@/context/StoreContext'
import {
  captureAttribution,
  getMetaPixelId,
  initMetaPixel,
  setMetaPixelId,
  trackPageView,
} from '@/lib/metaPixel'

export function MetaPixel() {
  const { landing } = useStore()
  const location = useLocation()
  const admin = location.pathname.startsWith('/admin')
  const pixelId = landing.metaPixelId?.trim() || import.meta.env.VITE_META_PIXEL_ID?.trim() || ''

  useEffect(() => {
    captureAttribution(location.search, location.pathname)
  }, [location.pathname, location.search])

  useEffect(() => {
    setMetaPixelId(pixelId)
    if (!pixelId || admin) return
    initMetaPixel(pixelId)
    trackPageView()
  }, [admin, location.pathname, pixelId])

  const id = getMetaPixelId()
  if (!id || admin) return null

  return (
    <noscript>
      <img
        height={1}
        width={1}
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}
