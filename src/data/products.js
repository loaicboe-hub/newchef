// Verified Catalog for Chef Fergany (الشيف فرجاني - الشيف في بيتك)

export const CATEGORIES = [
  { id: 'all', nameAr: 'كل الأقسام', nameEn: 'All Categories', icon: '🍽️' },
  { id: 'offers', nameAr: 'العروض التوفيرية', nameEn: 'Special Offers', icon: '🔥' },
  { id: 'mahshi_pigeon', nameAr: 'حمام ومحاشي', nameEn: 'Pigeons & Mahshi', icon: '🍗' },
  { id: 'grills', nameAr: 'مشويات ومتبلات', nameEn: 'Grills & Marinated', icon: '🥩' },
  { id: 'casseroles', nameAr: 'طواجن وصواني', nameEn: 'Tajines & Casseroles', icon: '🥘' },
  { id: 'butchery', nameAr: 'مصنعات وبرجر بلدي', nameEn: 'Artisanal Butchery', icon: '🍔' },
  { id: 'appetizers', nameAr: 'مقبلات وسلطات', nameEn: 'Appetizers & Sides', icon: '🥟' }
];

export const PRODUCTS = [
  {
    id: 'hamam-mahshi-rice',
    titleAr: 'حمام محشي جاهز على التسوية',
    titleEn: 'Stuffed Pigeon Ready to Roast',
    category: 'mahshi_pigeon',
    price: 280,
    unitAr: '1 جوز (2 فرد)',
    unitEn: '1 Pair (2 birds)',
    descriptionAr: 'حمام بلدي جامبو طازج محشي بالأرز بالخلطة السرية للشيف فرجاني والمكسرات المحمصة وكبد الحمام، متبل وجاهز للفرن أو التحمير الذهبي الفوري.',
    descriptionEn: 'Jumbo baladi pigeons generously stuffed with Chef Fergany signature spiced rice, toasted almonds, pine nuts and giblets. Seasoned and oven-ready.',
    image: '/assets/dishes/hamam_mahshi_dish.jpg',
    badgeAr: 'جاهز للتسوية',
    badgeEn: 'Ready to Cook',
    badgeType: 'primary',
    weightAr: '500 - 550 جرام',
    weightEn: '500 - 550g',
    storageAr: 'يحفظ مجمداً في الفريزر عند -18°C',
    storageEn: 'Keep frozen at -18°C',
    cookTimeAr: '35 - 45 دقيقة بالفرن',
    cookTimeEn: '35-45 mins in oven',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'stuffing',
        nameAr: 'نوع الحشوة',
        nameEn: 'Stuffing Type',
        choices: [
          { id: 'rice_nuts', nameAr: 'أرز متبل بالمكسرات والكبد (الأكثر طلباً)', nameEn: 'Spiced Rice & Nuts (Popular)', extraPrice: 0 },
          { id: 'freek', nameAr: 'فريك صعيدي فاخر بالسمن البلدي', nameEn: 'Saidi Green Freekah', extraPrice: 20 }
        ]
      },
      {
        id: 'prep_style',
        nameAr: 'حالة التسوية المطلوبة',
        nameEn: 'Preparation State',
        choices: [
          { id: 'ready_to_cook', nameAr: 'جاهز للتسوية الفورية بالفرن (أكياس حرارية)', nameEn: 'Oven-Ready in Roasting Bag', extraPrice: 0 },
          { id: 'cooked_golden', nameAr: 'مطهو ومحمر ذهبي جاهز للأكل فوراً', nameEn: 'Fully Roasted & Hot Ready to Eat', extraPrice: 30 }
        ]
      }
    ]
  },
  {
    id: 'chicken-mahshi-special',
    titleAr: 'دجاج بلدي محشي أرز بالمكسرات',
    titleEn: 'Whole Stuffed Baladi Chicken',
    category: 'mahshi_pigeon',
    price: 250,
    unitAr: '1 دجاجة كاملة (1.2 كجم)',
    unitEn: '1 Whole Chicken (1.2 kg)',
    descriptionAr: 'دجاجة بلدي منتقاة بعناية، محشوة بأرز الخلطة الغني بالبهارات الشرقية والمكسرات، متبلة بخلطة الشيف بالزعتر والليمون وجاهزة للشوي.',
    descriptionEn: 'Premium whole Egyptian baladi chicken stuffed with seasoned spiced rice and toasted nuts, marinated with fresh thyme and lemon.',
    image: '/assets/dishes/chicken_mahshi_dish.jpg',
    badgeAr: 'الأعلى تقييماً',
    badgeEn: 'Top Rated',
    badgeType: 'gold',
    weightAr: '1100 - 1250 جرام',
    weightEn: '1.1 - 1.25 kg',
    storageAr: 'يحفظ بالفريزر أو الثلاجة حتى 48 ساعة',
    storageEn: 'Keep chilled or frozen',
    cookTimeAr: '60 دقيقة بالفرن على حرارة 190°C',
    cookTimeEn: '60 mins at 190°C',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'chicken_stuffing',
        nameAr: 'نوع الحشو',
        nameEn: 'Stuffing Choice',
        choices: [
          { id: 'rice_nuts', nameAr: 'أرز مصري بالمكسرات والقرفة', nameEn: 'Spiced Egyptian Rice', extraPrice: 0 },
          { id: 'spicy_freek', nameAr: 'فريك بلدي حار بالسمن البلدي', nameEn: 'Spicy Baladi Freekah', extraPrice: 25 }
        ]
      }
    ]
  },
  {
    id: 'kofta-hati-shish-combo',
    titleAr: 'كفتة مشوية مع شيش طاووق فاخر',
    titleEn: 'Charcoal Kofta & Shish Platter',
    category: 'grills',
    price: 285,
    unitAr: 'طبق عائلي 750 جرام',
    unitEn: 'Family Platter 750g',
    descriptionAr: 'ميكس جريل ملوكي يجمع بين كفتة الحاتي البلدي المشوية على الفحم وتندر شيش طاووق الدجاج المتبل بالزبادي والخلطة السرية مع البقدونس والطماطم المشوية.',
    descriptionEn: 'Royal mix grill combining charcoal-grilled Egyptian baladi beef kofta and tender marinated chicken shish tawook skewers with grilled vegetables.',
    image: '/assets/dishes/kofta_grilled_shish.jpg',
    badgeAr: 'عرض مميز',
    badgeEn: 'Special Combo',
    badgeType: 'danger',
    weightAr: '750 جرام صافي',
    weightEn: '750g Net Weight',
    storageAr: 'جاهز للأكل ساخناً أو متبل للشوي الفوري',
    storageEn: 'Ready to eat hot or chilled for grill',
    cookTimeAr: 'مشوي جاهز / أو 15 دقيقة على الشواية',
    cookTimeEn: 'Ready or 15 mins on grill',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'grill_type',
        nameAr: 'نوع التقديم',
        nameEn: 'Serving Style',
        choices: [
          { id: 'grilled_hot', nameAr: 'مشوي جاهز على الفحم مع خبز وسلطة', nameEn: 'Grilled Hot with Bread & Salad', extraPrice: 0 },
          { id: 'raw_marinated', nameAr: 'أسياخ متبلة جاهزة لشوايتك بالبيت', nameEn: 'Raw Marinated for Home Grill', extraPrice: 0 }
        ]
      },
      {
        id: 'spiciness',
        nameAr: 'درجة الشطة',
        nameEn: 'Spice Level',
        choices: [
          { id: 'mild', nameAr: 'عادي متبل برفق', nameEn: 'Mild Seasoned', extraPrice: 0 },
          { id: 'spicy', nameAr: 'حار سبايسي لمحبي النكهة القوية', nameEn: 'Spicy Kick', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'sambousek-mix-cheese',
    titleAr: 'سمبوسك مكس جبن كيري وموتزاريلا',
    titleEn: 'Artisan Mixed Cheese Sambousek',
    category: 'appetizers',
    price: 95,
    unitAr: 'طبق 12 قطعة',
    unitEn: '12 Pieces Pack',
    descriptionAr: 'عجينة سمبوسك منزلية مقرمشة محشوة بتوليفة فاخرة من جبنة الموتزاريلا الطبيعية، الجبنة الكيري، النعناع المجفف وحبة البركة.',
    descriptionEn: 'Crispy handcrafted golden pastry pockets filled with stretchy mozzarella, rich cream cheese, aromatic mint, and nigella seeds.',
    image: '/assets/dishes/sambousek_cheese_dish.jpg',
    badgeAr: 'جاهز للقلي',
    badgeEn: 'Ready to Fry',
    badgeType: 'success',
    weightAr: '450 جرام',
    weightEn: '450g',
    storageAr: 'يحفظ مجمداً حتى موعد القلي أو الإيرفراير',
    storageEn: 'Keep frozen until frying or air-fryer',
    cookTimeAr: '3 - 5 دقائق بالزيت الساخن أو 8 دقائق إيرفراير',
    cookTimeEn: '3-5 mins deep fry / 8 mins airfryer',
    isFeatured: false,
    isPopular: true,
    options: [
      {
        id: 'cheese_mix',
        nameAr: 'نكهة الحشوة',
        nameEn: 'Cheese Flavor',
        choices: [
          { id: 'mix_cheese', nameAr: 'مكس موتزاريلا ورومي وكيري بالنعناع', nameEn: 'Mozzarella, Roumy & Kiri', extraPrice: 0 },
          { id: 'cheese_meat', nameAr: 'نصف مكس جبن + نصف لحمة مفرومة بلدي', nameEn: 'Half Cheese + Half Minced Meat', extraPrice: 15 }
        ]
      }
    ]
  },
  {
    id: 'special-meat-tajine',
    titleAr: 'طاجن لحمة كوندوز بالبصل القاورمة',
    titleEn: 'Egyptian Beef Tagine with Shallots',
    category: 'casseroles',
    price: 285,
    unitAr: 'طاجن فخار وسط (يكفي شخصين)',
    unitEn: 'Medium Clay Pot (Serves 2)',
    descriptionAr: 'قطع لحم كوندوز بلدي دسمة ومطهوة ببطء في صوص البصل القاورمة المكرمل والبهار الكباب الصيني والمستكة الفاخرة داخل طاجن فخاري أصيل.',
    descriptionEn: 'Slow-braised tender Egyptian baladi beef chunks melted in a rich caramelized baby onion sauce with mastic and oriental spices in authentic earthenware.',
    image: '/assets/dishes/special_tajine_pot.jpg',
    badgeAr: 'أطباق مميزة',
    badgeEn: 'Chef Signature',
    badgeType: 'gold',
    weightAr: '850 جرام',
    weightEn: '850g',
    storageAr: 'جاهز للتسخين الفوري أو الطهي بالفرن',
    storageEn: 'Ready to heat or finish in oven',
    cookTimeAr: '20 دقيقة تسخين بالفرن على حرارة 180°C',
    cookTimeEn: '20 mins in oven at 180°C',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'tajine_pot',
        nameAr: 'الوعاء',
        nameEn: 'Packaging',
        choices: [
          { id: 'earthen_pot', nameAr: 'مع طاجن فخار أصيل قابل لإعادة الاستخدام', nameEn: 'In Reusable Authentic Clay Pot', extraPrice: 25 },
          { id: 'oven_tray', nameAr: 'في صينية فويل جاهزة للفرن مباشرة', nameEn: 'In Oven Foil Tray', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'mahshi-platter-mix',
    titleAr: 'صينية محاشي مشكلة ملوكية (ورق عنب وكوسة)',
    titleEn: 'Royal Stuffed Vegetables Platter',
    category: 'mahshi_pigeon',
    price: 220,
    unitAr: 'صينية 1 كجم مشكل',
    unitEn: '1 kg Assorted Tray',
    descriptionAr: 'تشكيلة مميزة من محشي ورق العنب بالليمون ودبس الرمان، الكوسة الفلاحي، الباذنجان الأسود والأبيض، وفلفل رومي بخلطة الشيف بالنعناع والكزبرة.',
    descriptionEn: 'Generous platter of lemon & pomegranate glazed stuffed vine leaves, baby zucchini, eggplant, and bell peppers in fragrant Egyptian herb sauce.',
    image: '/assets/dishes/mahshi_varieties_plate.jpg',
    badgeAr: 'أطباق زمان',
    badgeEn: 'Heritage Taste',
    badgeType: 'primary',
    weightAr: '1000 جرام',
    weightEn: '1000g',
    storageAr: 'جاهز على التسوية الفورية أو مطهو ساخن',
    storageEn: 'Ready to cook or fully cooked',
    cookTimeAr: 'جاهز للتسوية بإضافة الشوربة (40 دقيقة)',
    cookTimeEn: 'Add broth & simmer 40 mins',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'mahshi_style',
        nameAr: 'طريقة الاستلام',
        nameEn: 'Serving Style',
        choices: [
          { id: 'ready_to_boil', nameAr: 'مرصوص جاهز للتسوية بالشوربة في بيتك', nameEn: 'Arranged Raw, Ready for Broth', extraPrice: 0 },
          { id: 'steaming_hot', nameAr: 'مطهو ساخن ونازل من على النار لبيتك', nameEn: 'Cooked Hot & Ready to Eat', extraPrice: 20 }
        ]
      }
    ]
  },
  {
    id: 'hawawshi-baladi-crisp',
    titleAr: 'حواوشي لحم بلدي مخصوص بالجبن والسمسم',
    titleEn: 'Baladi Hawawshi with Cheese & Sesame',
    category: 'butchery',
    price: 90,
    unitAr: '1 رغيف بلدي كبير',
    unitEn: '1 Large Baladi Loaf',
    descriptionAr: 'لحم بلدي مفروم طازج متبل بخلطة فرجاني الخاصة مع الفلفل الألوان، مخبوز في رغيف بلدي ردة مقرمش مغطى بالسمسم وحبة البركة وموزاريلا ذائبة.',
    descriptionEn: 'Fresh minced baladi beef seasoned with peppers and spices, baked in artisan Egyptian flatbread crusted with sesame seeds and stretchy melted cheese.',
    image: '/assets/dishes/hawawshi_baladi_crispy.jpg',
    badgeAr: 'قرمشة أصلية',
    badgeEn: 'Extra Crispy',
    badgeType: 'danger',
    weightAr: '300 جرام',
    weightEn: '300g',
    storageAr: 'يحفظ مجمداً حتى الشوي أو يقدم ساخناً',
    storageEn: 'Frozen or ready to bake',
    cookTimeAr: '10 دقائق على الجريل أو الفرن',
    cookTimeEn: '10 mins on grill / oven',
    isFeatured: false,
    isPopular: true,
    options: [
      {
        id: 'hawawshi_cheese',
        nameAr: 'إضافة الجبن',
        nameEn: 'Cheese Addon',
        choices: [
          { id: 'with_cheese', nameAr: 'محشو مكس جبن موتزاريلا ورومي', nameEn: 'With Melted Cheese Mix', extraPrice: 15 },
          { id: 'traditional', nameAr: 'حواوشي لحم بلدي كلاسيك سادة', nameEn: 'Classic Pure Meat', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'sojouk-oriental-skillet',
    titleAr: 'سجق بلدي إسكندراني متبل جاهز للتحمير',
    titleEn: 'Alexandrian Spiced Baladi Sausage',
    category: 'butchery',
    price: 195,
    unitAr: 'طبق نصف كيلو (500 جم)',
    unitEn: '500g Fresh Pack',
    descriptionAr: 'سجق بلدي لحم بقري صافي 100% بتتبيلة الشيف فرجاني الإسكندرانية الأصيلة بالثوم، الكزبرة المحمصة، وفلفل حار طبيعي بدون أي إضافات صناعية.',
    descriptionEn: '100% pure Egyptian beef sausage handcrafted with authentic Alexandrian spices, garlic, coriander, and hot peppers. No artificial preservatives.',
    image: '/assets/dishes/sojouk_oriental_pan.jpg',
    badgeAr: 'لحوم بلدي 100%',
    badgeEn: '100% Baladi Beef',
    badgeType: 'success',
    weightAr: '500 جرام',
    weightEn: '500g',
    storageAr: 'يحفظ مبرداً أو مجمداً',
    storageEn: 'Keep chilled or frozen',
    cookTimeAr: '10 دقائق تشويح بالطاسة الإسكندراني مع بصل وفلفل',
    cookTimeEn: '10 mins skillet sauté with peppers',
    isFeatured: false,
    isPopular: true,
    options: [
      {
        id: 'sojouk_cut',
        nameAr: 'الشكل المطلوب',
        nameEn: 'Prep Cut',
        choices: [
          { id: 'finger_links', nameAr: 'أصابع كاملة جاهزة للتحمير', nameEn: 'Whole Sausage Links', extraPrice: 0 },
          { id: 'saute_ready', nameAr: 'مقطع وجاهز مع صوص وخضار إسكندراني', nameEn: 'Pre-cut with Sauté Veggies', extraPrice: 15 }
        ]
      }
    ]
  },
  {
    id: 'combo-family-feast-box',
    titleAr: 'بوكس لمة العيلة الملكي (كفتة + شيش + محاشي + سلطات)',
    titleEn: 'Royal Family Feast Box',
    category: 'offers',
    price: 555,
    unitAr: 'بوكس عائلي (تكفي 4 - 6 أفراد)',
    unitEn: 'Family Feast (Serves 4-6)',
    descriptionAr: 'العرض الأكبر توفيراً لعزومات الهرم والجيزة: كيلو كفتة حاتي مشوية + نصف كيلو شيش طاووق + كيلو محشي مشكل مشكل + 4 أطباق أرز بسمتي فاخر + سلطة طحينة وخضراء وخبز بلدي.',
    descriptionEn: 'The ultimate royal feast: 1kg grilled baladi kofta, 500g chicken shish, 1kg mixed stuffed vegetables, 4 spiced basmati rice portions, tahini salads, and fresh bread.',
    image: '/assets/dishes/hero_chef_feast.jpg',
    badgeAr: 'وفر 120 جنيه',
    badgeEn: 'Save 120 EGP',
    badgeType: 'danger',
    weightAr: '3.2 كجم تقريباً',
    weightEn: 'Approx 3.2 kg',
    storageAr: 'يصل ساخناً وجاهزاً للسفرة فوراً',
    storageEn: 'Delivered hot & table-ready',
    cookTimeAr: 'مطهو جاهز للتقديم الفوري',
    cookTimeEn: 'Ready to Serve',
    isFeatured: true,
    isPopular: true,
    options: [
      {
        id: 'box_delivery_timing',
        nameAr: 'وقت الاستلام',
        nameEn: 'Serving Time',
        choices: [
          { id: 'now', nameAr: 'توصيل فوري خلال 45-60 دقيقة', nameEn: 'Immediate Delivery (45-60 mins)', extraPrice: 0 },
          { id: 'scheduled', nameAr: 'حجز مسبق لموعد العزومة اليوم أو غداً', nameEn: 'Scheduled Banquet Time', extraPrice: 0 }
        ]
      }
    ]
  }
];
