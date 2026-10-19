export const AVAILABLE_COUPONS = [
  {
    code: 'FERGANY10',
    type: 'percent',
    value: 10,
    minOrder: 150,
    titleAr: 'خصم 10% على طلبك',
    titleEn: '10% Off on your order'
  },
  {
    code: 'WELCOME',
    type: 'delivery_discount',
    value: 40,
    minOrder: 200,
    titleAr: 'توصيل مجاني للطلب الأول (خصم 40 ج.م)',
    titleEn: 'Free Delivery for First Order'
  },
  {
    code: 'CHEF50',
    type: 'fixed',
    value: 50,
    minOrder: 450,
    titleAr: 'خصم 50 ج.م على الطلبات الكبيرة فوق 450 ج.م',
    titleEn: '50 EGP Off on orders above 450 EGP'
  }
];
