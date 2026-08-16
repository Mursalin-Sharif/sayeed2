import type { SiteContent } from '@/lib/types'

export function ShopSettingsFields({
  form,
  onChange,
}: {
  form: SiteContent
  onChange: (next: SiteContent) => void
}) {
  return (
    <section id="shop" className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-zinc-200">Shop / website</p>
      <p className="text-xs text-zinc-500">
        Home, header, footer and contact use these values. Landing offer text is in the sections above.
      </p>
      <label className="block text-sm text-zinc-400">
        Shop name
        <input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Shop name (English / footer)
        <input
          value={form.nameEn}
          onChange={(e) => onChange({ ...form, nameEn: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Slogan
        <input
          value={form.slogan}
          onChange={(e) => onChange({ ...form, slogan: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Tagline
        <input
          value={form.tagline}
          onChange={(e) => onChange({ ...form, tagline: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        About text (footer)
        <textarea
          value={form.about}
          onChange={(e) => onChange({ ...form, about: e.target.value })}
          className="mt-1 min-h-24 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-zinc-400">
          Phone (call)
          <input
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Phone (WhatsApp / Imo)
          <input
            value={form.phone2}
            onChange={(e) => onChange({ ...form, phone2: e.target.value })}
            className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
          />
        </label>
      </div>
      <label className="block text-sm text-zinc-400">
        Email
        <input
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Address
        <input
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Hours / contact note
        <input
          value={form.hours}
          onChange={(e) => onChange({ ...form, hours: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Facebook URL
        <input
          value={form.facebook}
          onChange={(e) => onChange({ ...form, facebook: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Home banner title
        <input
          value={form.homeBannerTitle}
          onChange={(e) => onChange({ ...form, homeBannerTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Home banner button
        <input
          value={form.homeBannerCta}
          onChange={(e) => onChange({ ...form, homeBannerCta: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Header offer button
        <input
          value={form.headerOfferLabel}
          onChange={(e) => onChange({ ...form, headerOfferLabel: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
    </section>
  )
}
