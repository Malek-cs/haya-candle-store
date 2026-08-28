import { MongoClient } from 'mongodb';

// التأكد من وجود الرابط في ملف البيئة
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // في مرحلة التطوير (على جهازك)، نحفظ الاتصال عشان ما نستهلك موارد السيرفر المجاني 
  // مع كل تحديث (Hot Reload) يسويه Next.js
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // في مرحلة الإنتاج (لما ترفع الموقع على Vercel)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// نصدر الاتصال عشان نستخدمه في أي مكان بالمشروع (في صفحات المنتجات والطلبات)
export default clientPromise;

// كل الكولكشنز (products, orders, admins, deliveryZones) لازم تكون بنفس الداتابيز
// عشان ما نرجع نكرر مشكلة تفرق البيانات بين "hayastore" و "haya_store"
export async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "hayastore");
}