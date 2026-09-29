// Public origin for shareable links and the wall QR. NUXT_PUBLIC_SITE_URL wins over the request
// origin, which can come out as http:// or an internal host behind a reverse proxy.
export function useSiteOrigin() {
  const siteUrl = useRuntimeConfig().public.siteUrl
  return siteUrl ? siteUrl.replace(/\/+$/, '') : useRequestURL().origin
}
