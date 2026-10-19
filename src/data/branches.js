// Verified Branch and Fulfillment Information for Chef Fergany

export const BRANCHES = [
  {
    id: 'haram-orouba',
    nameAr: 'فرع الهرم - شارع العروبة (الرئيسي)',
    nameEn: 'El Haram - El Orouba Branch (HQ)',
    shortAr: 'الهرم - شارع العروبة',
    shortEn: 'El Haram - El Orouba',
    addressAr: 'شارع العروبة متفرع من المريوطية / ترسا، بجوار مدرسة الزهراء الخاصة، برج الشيماء، الهرم، الجيزة',
    addressEn: 'El Orouba St. off Maryouteya / Tersa, Beside Al-Zahraa School, Al-Shaimaa Tower, Haram, Giza',
    phone: '01040925170',
    secondaryPhones: ['01121283930', '01557500532', '01018404534'],
    whatsapp: '201040925170',
    hoursAr: 'يومياً من 10:00 ص حتى 12:00 منتصف الليل',
    hoursEn: 'Daily from 10:00 AM to 12:00 Midnight',
    deliveryTimeAr: '30 - 50 دقيقة',
    deliveryTimeEn: '30 - 50 mins',
    baseDeliveryFee: 40,
    isOpen: true
  }
];

export const DELIVERY_ZONES = [
  { id: 'haram_maryouteya', nameAr: 'الهرم والمريوطية وترسا', nameEn: 'Haram, Maryouteya & Tersa', fee: 35, timeAr: '30-40 دقيقة' },
  { id: 'faisal_giza', nameAr: 'فيصل وضواحي الجيزة', nameEn: 'Faisal & Giza Suburbs', fee: 40, timeAr: '35-50 دقيقة' },
  { id: 'hadayek_ahram', nameAr: 'حدائق الأهرام والرماية', nameEn: 'Hadayek El Ahram & Remaya', fee: 45, timeAr: '40-55 دقيقة' },
  { id: 'dokki_mohandessin', nameAr: 'الدقي والمهندسين والعجوزة', nameEn: 'Dokki & Mohandessin', fee: 50, timeAr: '45-60 دقيقة' },
  { id: 'october_zayed', nameAr: 'مدينة 6 أكتوبر والشيخ زايد', nameEn: '6th of October & Sheikh Zayed', fee: 65, timeAr: '50-70 دقيقة' },
  { id: 'cairo_central', nameAr: 'القاهرة ووسط البلد ومصر الجديدة', nameEn: 'Greater Cairo & Heliopolis', fee: 60, timeAr: '50-75 دقيقة' }
];
