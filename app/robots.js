export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // ممنوع جوجل يدخل على لوحة تحكم الأدمن تبعتك
    },
    sitemap: 'https://haya-one.vercel.app/sitemap.xml',
  }
}