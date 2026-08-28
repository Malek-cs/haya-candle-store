import clientPromise from "./mongodb";
import { ObjectId } from "mongodb"; // نحتاجها عشان نتعرف على الـ ID حق المنتج

// ========== PRODUCTS ==========

// 1. جلب كل المنتجات (بديل listenToProducts)
export async function getProducts() {
  const client = await clientPromise;
  const db = client.db("hayastore");
  
  // نجلب المنتجات ونرتبها من الأحدث للأقدم
  const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray();
  
  // نحول الـ _id المعقد إلى نص عادي عشان Next.js يقدر يعرضه في الواجهة
  return products.map(product => ({
    ...product,
    _id: product._id.toString()
  }));
}

// 2. إضافة منتج جديد (بديل addProduct)
export async function addProduct(data) {
  const client = await clientPromise;
  const db = client.db("hayastore");
  
  return await db.collection("products").insertOne({
    ...data,
    createdAt: new Date(), // استخدمنا Date العادية بدل serverTimestamp
  });
}

// 3. تحديث منتج (بديل updateProduct)
export async function updateProduct(id, data) {
  const client = await clientPromise;
  const db = client.db("hayastore");
  
  return await db.collection("products").updateOne(
    { _id: new ObjectId(id) }, // نبحث عن المنتج بالـ ID
    { $set: { ...data, updatedAt: new Date() } } // نحدث البيانات
  );
}

// 4. حذف منتج (بديل deleteProduct)
export async function deleteProduct(id) {
  const client = await clientPromise;
  const db = client.db("hayastore");
  
  return await db.collection("products").deleteOne({ _id: new ObjectId(id) });
}