// هذا الكود يقرأ ملفك القديم ويرفعه للمانغو مع الإضافات الجديدة (النكهات والحالة)
const upload = async () => {
  const products = [
    // انسخ محتويات ملف products.js القديم هنا 
    // وأضف لكل منتج الحقول الجديدة: flavors, type, status
  ];

  const res = await fetch("http://localhost:3000/api/products/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(products),
  });
  
  if(res.ok) console.log("تم رفع جميع المنتجات بنجاح! ");
};