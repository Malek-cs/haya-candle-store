import { getDb } from "@/lib/mongodb";

export default async function sitemap() {
  const baseUrl = "https://hayacandlesstore.store/"; // حط رابط موقعك الرسمي هون

  const staticEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const db = await getDb();
    const products = await db.collection("products")
      .find({}, { projection: { _id: 1 } })
      .toArray();

    const productEntries = products.map((p) => ({
      url: `${baseUrl}/product/${p._id.toString()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticEntries, ...productEntries];
  } catch {
    // إذا فشل الاتصال بالداتابيز، لأقل شي رجّع الصفحات الثابتة
    return staticEntries;
  }
}
