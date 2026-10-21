import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Chef Fergany database seeding...');

  // 1. Create or update Super Admin
  const adminPasswordHash = await bcrypt.hash('Admin@Fergany2026!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { phone: '01040925170' },
    update: {
      role: Role.SUPER_ADMIN,
      fullName: 'الشيف فرجاني (الإدارة الرئيسية)',
      email: 'admin@cheffergany.com',
      password_hash: adminPasswordHash,
      isActive: true,
    },
    create: {
      role: Role.SUPER_ADMIN,
      fullName: 'الشيف فرجاني (الإدارة الرئيسية)',
      phone: '01040925170',
      email: 'admin@cheffergany.com',
      password_hash: adminPasswordHash,
      isActive: true,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email} / ${superAdmin.phone}`);

  // 2. Seed Categories
  const categoriesData = [
    { slug: 'mahshi_pigeon', name_ar: 'حمام ومحاشي', name_en: 'Pigeons & Mahshi', orderIndex: 1 },
    { slug: 'grills', name_ar: 'مشويات ومتبلات', name_en: 'Grills & Marinated', orderIndex: 2 },
    { slug: 'casseroles', name_ar: 'طواجن وصواني', name_en: 'Tajines & Casseroles', orderIndex: 3 },
    { slug: 'butchery', name_ar: 'مصنعات وبرجر بلدي', name_en: 'Artisanal Butchery', orderIndex: 4 },
    { slug: 'appetizers', name_ar: 'مقبلات وسلطات', name_en: 'Appetizers & Sides', orderIndex: 5 },
    { slug: 'offers', name_ar: 'العروض التوفيرية', name_en: 'Special Offers', orderIndex: 6 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
      create: {
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        slug: cat.slug,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ ${categoriesData.length} Categories seeded.`);

  // 3. Seed Menu Items
  const menuItemsData = [
    {
      title_ar: 'حمام محشي جاهز على التسوية',
      title_en: 'Stuffed Pigeon Ready to Roast',
      categorySlug: 'mahshi_pigeon',
      price: 280,
      imageUrl: '/assets/dishes/hamam_mahshi_dish.jpg',
      description_ar: 'حمام بلدي جامبو طازج محشي بالأرز بالخلطة السرية للشيف فرجاني والمكسرات المحمصة وكبد الحمام، متبل وجاهز للفرن أو التحمير.',
      description_en: 'Jumbo baladi pigeons generously stuffed with Chef Fergany signature spiced rice, toasted nuts and giblets.',
    },
    {
      title_ar: 'دجاج بلدي محشي أرز بالمكسرات',
      title_en: 'Whole Stuffed Baladi Chicken',
      categorySlug: 'mahshi_pigeon',
      price: 250,
      imageUrl: '/assets/dishes/chicken_mahshi_dish.jpg',
      description_ar: 'دجاجة بلدي منتقاة بعناية، محشوة بأرز الخلطة الغني بالبهارات الشرقية والمكسرات، متبلة بخلطة الشيف بالزعتر والليمون.',
      description_en: 'Premium whole Egyptian baladi chicken stuffed with seasoned spiced rice and toasted nuts.',
    },
    {
      title_ar: 'كفتة مشوية مع شيش طاووق فاخر',
      title_en: 'Charcoal Kofta & Shish Platter',
      categorySlug: 'grills',
      price: 285,
      imageUrl: '/assets/dishes/mix_grill_platter.jpg',
      description_ar: 'ميكس جريل ملوكي يجمع بين كفتة الحاتي البلدي المشوية على الفحم وتندر شيش طاووق الدجاج المتبل بالزبادي والخلطة السرية.',
      description_en: 'Royal mix grill combining charcoal-grilled Egyptian baladi beef kofta and tender marinated chicken shish tawook.',
    },
    {
      title_ar: 'طاجن لحم كوندوز فاخر بالبصل المكرمل',
      title_en: 'Signature Caramelized Beef Tagine',
      categorySlug: 'casseroles',
      price: 310,
      imageUrl: '/assets/dishes/beef_tajine_dish.jpg',
      description_ar: 'قطع لحم كوندوز طازجة ذائبة ومطهوة ببطء في الفرن الفخاري مع شرائح البصل البلدي المكرمل والصوص البني الغني.',
      description_en: 'Tender prime veal chunks slow-cooked in traditional clay pot with caramelized onions and rich gravy.',
    },
    {
      title_ar: 'برجر بلدي سوبر جامبو (4 قطع)',
      title_en: 'Artisanal Baladi Beef Burgers (4 pcs)',
      categorySlug: 'butchery',
      price: 260,
      imageUrl: '/assets/dishes/baladi_burger_pack.jpg',
      description_ar: 'برجر لحم بلدي مفروم طازج 100% بتتبيلة الشيف فرجاني الخاصة، بدون فول صويا أو إضافات صناعية.',
      description_en: '100% fresh Egyptian baladi beef burger patties seasoned with natural spices. No fillers, pure meat.',
    },
    {
      title_ar: 'سمبوسك مكس جبن كيري ونعناع (12 قطعة)',
      title_en: 'Cheese & Mint Sambousek (12 pcs)',
      categorySlug: 'appetizers',
      price: 135,
      imageUrl: '/assets/dishes/sambousek_cheese_dish.jpg',
      description_ar: 'رقائق سمبوسك مقرمشة ومحشوة بمزيج غني من جبنة الكيري والموزاريلا والنعناع الطازج، جاهزة للقلي السريع.',
      description_en: 'Crispy pastry triangles stuffed with rich Kiri, mozzarella and fresh mint. Ready to deep-fry.',
    },
    {
      title_ar: 'صينية العزومة الملكية الخاصة (8 - 10 أفراد)',
      title_en: 'Signature Royal Banquet (8-10 Guests)',
      categorySlug: 'offers',
      price: 1640,
      imageUrl: '/assets/dishes/royal_tray_special.jpg',
      description_ar: 'تشكيلة ملوكية فاخرة من الحمام المحشي، المشويات المشكلة، الأرز بالمكسرات، والسمبوسك البلدي مع الشحن المجاني.',
      description_en: 'Lavish signature banquet spread with stuffed pigeons, mix grills, spiced rice and appetizers with free delivery.',
    },
  ];

  for (const item of menuItemsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.menuItem.findFirst({
      where: { title_ar: item.title_ar },
    });

    if (existing) {
      await prisma.menuItem.update({
        where: { id: existing.id },
        update: {
          categoryId,
          title_en: item.title_en,
          price: item.price,
          imageUrl: item.imageUrl,
          description_ar: item.description_ar,
          description_en: item.description_en,
          isAvailable: true,
        },
      });
    } else {
      await prisma.menuItem.create({
        data: {
          categoryId,
          title_ar: item.title_ar,
          title_en: item.title_en,
          price: item.price,
          imageUrl: item.imageUrl,
          description_ar: item.description_ar,
          description_en: item.description_en,
          isAvailable: true,
        },
      });
    }
  }
  console.log(`✅ ${menuItemsData.length} Menu items seeded.`);

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
