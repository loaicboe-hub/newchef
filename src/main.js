// Main Application Controller for Chef Fergany (الشيف فرجاني - الشيف في بيتك)
// TRUE RESPONSIVE E-COMMERCE WEBSITE (Mobile, Tablet, Desktop, Large Desktop)
import { CATEGORIES, PRODUCTS } from './data/products.js';
import { BRANCHES, DELIVERY_ZONES } from './data/branches.js';
import { AVAILABLE_COUPONS } from './data/coupons.js';
import { store } from './store/state.js';
import { api } from './services/api.js';
import { adminPortal } from './components/AdminPortal.js';
import { clientAuthModal } from './components/ClientAuthModal.js';

import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/responsive.css';

class ChefApp {
  constructor() {
    this.appRoot = document.getElementById('app-root');
    this.calcState = { size: 'medium', style: 'royal', customQty: {} };
    this.quickTagFilter = 'all';
    this.init();
  }

  init() {
    // Sync initial HTML direction and language
    const currentLang = store.state.lang;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Hash route listener for #admin
    const checkHashRoute = () => {
      const isHashAdmin = window.location.hash.startsWith('#admin');
      store.state.currentRoute = isHashAdmin ? 'admin' : 'storefront';
      if (isHashAdmin) {
        adminPortal.loadData();
      }
      this.render();
    };

    window.addEventListener('hashchange', checkHashRoute);
    if (window.location.hash.startsWith('#admin')) {
      adminPortal.loadData();
    }

    // Subscribe to state changes
    store.subscribe(() => {
      this.render();
    });

    // Initial render
    this.render();
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.state.activeModal) {
        store.closeModal();
      }
    });

    // Delegated Global Handler for Language Switching (Instant & Touch Resilient on Mobile & Desktop)
    let lastLangToggle = 0;
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('#btn-lang-toggle, #btn-lang-toggle-mobile, .mobile-lang-btn, .top-bar-lang-btn, #menu-lang-switch, [data-action="toggle-lang"]');
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastLangToggle < 350) return; // Debounce rapid double-taps
        lastLangToggle = now;
        const newLang = store.state.lang === 'ar' ? 'en' : 'ar';
        store.setLang(newLang);
      }
    });
  }

  // Translation helper
  t(arText, enText) {
    return store.state.lang === 'ar' ? arText : enText;
  }

  getFeastPackage(size = 'medium', style = 'royal') {
    let basePkg = {};
    if (size === 'small') {
      basePkg = {
        titleAr: 'عزومة اللمة العائلية (4 - 6 أفراد)',
        titleEn: 'Family Gathering Feast (4-6 Guests)',
        descAr: 'تشكيلة متوازنة ومحبوبة لغداء عائلي مميز يشرف سفرتك',
        descEn: 'Perfect balance of stuffed pigeons, mixed grills and appetizers',
        servings: '4 - 6',
        discountRate: 0.11,
        items: [
          { productId: 'hamam-mahshi-rice', baseQty: 2, labelAr: 'جوز حمام محشي أرز ومكسرات', labelEn: 'Pair Stuffed Pigeon' },
          { productId: 'kofta-hati-shish-combo', baseQty: 1, labelAr: 'طبق كفتة حاتي وشيش طاووق مشوي', labelEn: 'Kofta & Shish Platter' },
          { productId: 'sambousek-mix-cheese', baseQty: 1, labelAr: 'طبق سمبوسك مكس جبن كيري (12 قطعة)', labelEn: 'Cheese Sambousek (12 pcs)' }
        ]
      };
    } else if (size === 'large') {
      basePkg = {
        titleAr: 'العزومة الملكية الكبرى (15 - 20 فرداً)',
        titleEn: 'Grand Royal Banquet (15-20 Guests)',
        descAr: 'بوفيه متكامل من أفخم أطباق الشيف فرجاني للمناسبات والعزومات الفاخرة',
        descEn: 'Full lavish spread of gourmet meats, stuffed poultry and appetizers',
        servings: '15 - 20',
        discountRate: 0.132,
        items: [
          { productId: 'hamam-mahshi-rice', baseQty: 4, labelAr: 'جوز حمام بلدي محشي', labelEn: 'Pair Stuffed Pigeon' },
          { productId: 'chicken-mahshi-special', baseQty: 2, labelAr: 'دجاجة بلدي كاملة محشية أرز ومكسرات', labelEn: 'Whole Stuffed Chicken' },
          { productId: 'special-meat-tajine', baseQty: 3, labelAr: 'طاجن لحم كوندوز فاخر بالبصل المكرمل', labelEn: 'Beef Tagine' },
          { productId: 'kofta-hati-shish-combo', baseQty: 2, labelAr: 'طبق كفتة حاتي وشيش طاووق', labelEn: 'Kofta & Shish Platter' },
          { productId: 'sambousek-mix-cheese', baseQty: 3, labelAr: 'طبق سمبوسك مكس أجبان فاخرة', labelEn: 'Cheese Sambousek' }
        ]
      };
    } else {
      // medium: 8 - 10 guests (default)
      basePkg = {
        titleAr: 'صينية العزومة الملكية الخاصة (8 - 10 أفراد)',
        titleEn: 'Signature Royal Banquet (8-10 Guests)',
        descAr: 'التشكيلة الأكثر طلباً ومبيعاً في مطابخ فرجاني، كرم الضيافة بأعلى جودة',
        descEn: 'Our #1 best-selling banquet spread for family & friend feasts',
        servings: '8 - 10',
        discountRate: 0.13,
        items: [
          { productId: 'hamam-mahshi-rice', baseQty: 3, labelAr: 'جوز حمام محشي أرز ومكسرات', labelEn: 'Pair Stuffed Pigeon' },
          { productId: 'special-meat-tajine', baseQty: 2, labelAr: 'طاجن لحم كوندوز بالبصل والتوابل السرية', labelEn: 'Beef Tagine' },
          { productId: 'kofta-hati-shish-combo', baseQty: 1, labelAr: 'طبق كفتة حاتي وشيش طاووق مشوي', labelEn: 'Kofta & Shish Platter' },
          { productId: 'sambousek-mix-cheese', baseQty: 2, labelAr: 'طبق سمبوسك مكس جبن كيري (12 قطعة)', labelEn: 'Cheese Sambousek' }
        ]
      };
    }

    // Resolve quantities (customized or default)
    const items = basePkg.items.map((it) => {
      const custom = this.calcState.customQty[it.productId];
      const qty = custom !== undefined ? custom : it.baseQty;
      return {
        ...it,
        qty: Math.max(1, qty)
      };
    });

    let origPrice = 0;
    items.forEach((it) => {
      const prod = PRODUCTS.find((p) => p.id === it.productId);
      if (prod) {
        origPrice += prod.price * it.qty;
      }
    });

    const saving = Math.round(origPrice * basePkg.discountRate);
    const dealPrice = Math.max(0, origPrice - saving);

    return {
      ...basePkg,
      items,
      origPrice,
      dealPrice,
      saving,
      qualifiesForFreeDelivery: dealPrice >= 600
    };
  }

  getCookingInstructions(product) {
    switch (product.id) {
      case 'hamam-mahshi-rice':
        return {
          methodTitleAr: 'تسوية بالفرن (أكياس حرارية معتمدة)',
          methodTitleEn: 'Oven Roasting (Vacuum Thermal Bag)',
          methodIcon: '🔥',
          steps: [
            { stepAr: 'التجهيز المسبق: يسخن الفرن مسبقاً على حرارة 180°C، ويترك الحمام في درجة حرارة الغرفة 20 دقيقة قبل إدخاله الفرن.', stepEn: 'Preheat oven to 180°C. Keep pigeons at room temp for 20 mins.' },
            { stepAr: 'التسوية: يوضع الحمام داخل الكيس الحراري المرفق أو صينية مدهونة، ويدخل الرف الأوسط لمدة 35 - 45 دقيقة.', stepEn: 'Bake in roasting bag or baking tray on center rack for 35-45 mins.' },
            { stepAr: 'التحمير والقرمشة: تشغل الشواية آخر 5 دقائق مع مسحة زبدة بلدي أو رشة ليمون للحصول على لون ذهبي محمر مقرمش.', stepEn: 'Broil final 5 mins with a touch of ghee for a golden crisp finish.' }
          ],
          verified: true
        };

      case 'chicken-mahshi-special':
        return {
          methodTitleAr: 'تسوية الدجاج المحشي بالفرن',
          methodTitleEn: 'Oven Roasted Stuffed Chicken',
          methodIcon: '🍗',
          steps: [
            { stepAr: 'التجهيز: تسخين الفرن على 190°C. دهن صينية التسوية بملعقة سمن بلدي خفيفة.', stepEn: 'Preheat oven to 190°C. Lightly grease roasting tray.' },
            { stepAr: 'التسوية: تغطى الصينية بورق زبدة ثم ورق ألومنيوم (فويل) وتترك بالفرن لمدة 50 دقيقة.', stepEn: 'Cover with parchment & foil, bake for 50 mins.' },
            { stepAr: 'التحمير: ينزع الفويل وتشعل الشواية العلوية لمدة 10 دقائق حتى يصبح الجلد مقرمشاً ومحمراً بالكامل.', stepEn: 'Uncover and broil for 10 mins until golden and crispy.' }
          ],
          verified: true
        };

      case 'sambousek-mix-cheese':
        return {
          methodTitleAr: 'قلي سريع بالزيت أو قلاية هوائية (Air Fryer)',
          methodTitleEn: 'Deep Frying or Air Fryer (No Oven)',
          methodIcon: '🥟',
          steps: [
            { stepAr: 'طريقة الزيت: تقلى الحبات مباشرة وهي مجمدة في زيت غزير ساخن لمدة 3 - 5 دقائق حتى تكتسب لوناً ذهبياً.', stepEn: 'Fry directly from frozen in hot oil for 3-5 mins until golden.' },
            { stepAr: 'طريقة القلاية الهوائية (Air Fryer): ترش الحبات برذاذ زيت خفيف وتطهى على 180°C لمدة 7 - 8 دقائق مع التقليب في المنتصف.', stepEn: 'Air fry with light oil spray at 180°C for 7-8 mins, shaking halfway.' },
            { stepAr: 'نصيحة الشيف: لا تفرط في القلي حتى لا تخرج الجبنة، وتصفى فوراً على مناديل مطبخ.', stepEn: 'Do not over-fry to keep cheese inside; drain on paper towels.' }
          ],
          verified: true
        };

      case 'mahshi-platter-mix':
        return {
          methodTitleAr: 'تسوية بالمرقة/الشوربة على البوتاجاز',
          methodTitleEn: 'Stovetop Simmering with Broth',
          methodIcon: '🍲',
          steps: [
            { stepAr: 'إضافة المرقة: تضاف شوربة لحمة أو فراخ بلدي مغلية ومتبلة حتى تصل لمنتصف الصف العلوي للمحشي.', stepEn: 'Pour boiling seasoned meat or poultry broth up to half of top layer.' },
            { stepAr: 'الغليان والتسوية: تترك على نار عالية لمدة 10 دقائق حتى تغلي وتتشرب معظم المرقة، ثم تغطى الصينية بإحكام.', stepEn: 'Boil vigorously on high for 10 mins until broth reduces, then cover tightly.' },
            { stepAr: 'التهدئة: تنقل الصينية على نار هادئة جداً (شياطة) لمدة 30 - 35 دقيقة حتى النضج الكامل.', stepEn: 'Reduce heat to low and simmer for 30-35 mins until tender.' }
          ],
          verified: true
        };

      case 'kofta-hati-shish-combo':
        return {
          methodTitleAr: 'تسوية على الجريل أو الشواية المنزلية / الفرن',
          methodTitleEn: 'Stovetop Griddle, Charcoal Grill or Oven',
          methodIcon: '🥩',
          steps: [
            { stepAr: 'التجهيز: تسخين الشواية أو الجريل جيداً حتى تتصاعد حرارته ودهنه بمسحة زيت خفيفة جداً.', stepEn: 'Preheat griddle or grill very hot with light oil brush.' },
            { stepAr: 'الشوي: تفرد أصابع الكفتة والشيش وتقلب كل دقيقتين لمدة 12 - 15 دقيقة فقط للحفاظ على عصارتها وطراوتها.', stepEn: 'Grill skewers turning every 2 mins for 12-15 mins to maintain tenderness.' },
            { stepAr: 'سر الفحم: ضع قطعة فحم مشتعلة في ورقة فويل مع قطرة سمن وغطِ الوعاء لدقيقة لنكهة الحاتي الأصلية.', stepEn: 'Add glowing charcoal on foil with drop of ghee for authentic smokiness.' }
          ],
          verified: true
        };

      case 'hawawshi-baladi-crisp':
        return {
          methodTitleAr: 'تسوية على الجريل أو الفرن السريع',
          methodTitleEn: 'Stovetop Pan or Oven Baking',
          methodIcon: '🥪',
          steps: [
            { stepAr: 'طريقة الطاسة/الجريل (المفضلة للشيف): يدهن الرغيف بمسحة سمن ويوضع في طاسة ساخنة على نار متوسطة 5 دقائق لكل وجه مع الضغط الخفيف.', stepEn: 'Pan fry on medium heat for 5 mins each side with light pressing.' },
            { stepAr: 'طريقة الفرن: يلف في ورق زبدة ويدخل فرن ساخن على 200°C لمدة 12 - 15 دقيقة.', stepEn: 'Wrap in parchment and bake at 200°C for 12-15 mins.' },
            { stepAr: 'النتيجة: قرمشة خارجية خطيرة من الردة والسمسم مع لحم مستوي وجبن ذائب.', stepEn: 'Super crispy exterior with molten cheese inside.' }
          ],
          verified: true
        };

      case 'sojouk-oriental-skillet':
        return {
          methodTitleAr: 'تشويح سريع بالطاسة الإسكندراني',
          methodTitleEn: 'Alexandrian Sauté Skillet',
          methodIcon: '🍳',
          steps: [
            { stepAr: 'التشويح الأولي: في طاسة ساخنة بدون دهون إضافية، يشوح السجق لمدة 4 دقائق لينزل دهونه الطبيعية.', stepEn: 'Sauté in hot dry pan for 4 mins to render natural juices.' },
            { stepAr: 'إضافة الخضار: يضاف شرائح البصل والفلفل الرومي والطماطم، وتقلب المكونات معاً 6 دقائق.', stepEn: 'Add sliced onions, green peppers and tomatoes, sauté for 6 mins.' },
            { stepAr: 'التقديم: يقدم ساخناً مع صصوص الطماطم المتبل والخبز البلدي الطازج.', stepEn: 'Serve hot with warm baladi bread.' }
          ],
          verified: true
        };

      case 'special-meat-tajine':
        return {
          methodTitleAr: 'تسخين وتجمير بالفرن داخل طاجن الفخار',
          methodTitleEn: 'Oven Finishing in Clay Pot',
          methodIcon: '🥘',
          steps: [
            { stepAr: 'التجهيز: يسخن الفرن مسبقاً على حرارة 180°C.', stepEn: 'Preheat oven to 180°C.' },
            { stepAr: 'التسوية: يوضع الطاجن مغطى بورق فويل في الفرن لمدة 20 دقيقة.', stepEn: 'Place covered clay pot in oven for 20 mins.' },
            { stepAr: 'التجمير: ينزع الفويل ويترك 5 دقائق تحت الشواية ليتشرب الصوص وتتكرمل قطع البصل واللحم.', stepEn: 'Uncover under broiler for 5 mins to caramelize sauce.' }
          ],
          verified: true
        };

      case 'combo-family-feast-box':
        return {
          methodTitleAr: 'إرشادات تسوية وتحضير بوكس لمة العيلة',
          methodTitleEn: 'Family Feast Box Heating & Prep Guide',
          methodIcon: '🍱',
          steps: [
            { stepAr: 'المشويات الجاهزة (كفتة وشيش): تسخن في صينية بالفرن على 170°C لمدة 6-8 دقائق للحفاظ على العصارة وطراوة اللحم.', stepEn: 'Reheat grilled skewers in oven at 170°C for 6-8 mins to maintain tenderness.' },
            { stepAr: 'صينية المحاشي: تسوى على البوتاجاز بإضافة مرقة مغلية متبلة لنصف الصينية لمدة 35-40 دقيقة على نار هادئة.', stepEn: 'Simmer stuffed vegetables on stovetop with boiling broth for 35-40 mins on low heat.' },
            { stepAr: 'السلطات والمقبلات: تحفظ مبردة بالثلاجة وتقدم مباشرة بجانب الأطباق الساخنة.', stepEn: 'Keep salads & dips chilled, serve fresh alongside hot dishes.' }
          ],
          verified: true
        };

      default:
        return {
          methodTitleAr: 'إرشادات التقديم العامة (قيد اعتماد الشيف)',
          methodTitleEn: 'General Instructions (Pending Chef Review)',
          methodIcon: '📋',
          steps: [
            { stepAr: 'التسخين: يسخن الصنف حسب تفضيلك، إرشادات التسوية والطهي المعتمدة قيد تدقيق الشيف فرجاني.', stepEn: 'Reheat as preferred. Certified instructions are currently pending Chef review.' }
          ],
          verified: false
        };
    }
  }

  render() {
    const s = store.state;

    // Check if current route is Admin
    if (s.currentRoute === 'admin' || window.location.hash.startsWith('#admin')) {
      if (!s.adminUser) {
        this.appRoot.innerHTML = adminPortal.renderLogin() + this.renderToast();
        this.bindAdminLoginEvents();
        return;
      }
      this.appRoot.innerHTML = adminPortal.renderDashboard() + this.renderToast();
      this.bindAdminDashboardEvents();
      return;
    }

    this.appRoot.innerHTML = `
      <!-- 1. TOP UTILITY BAR (Desktop & Tablet) -->
      ${this.renderSiteTopBar()}

      <!-- 2. SITE MAIN HEADER (Desktop & Mobile) -->
      ${this.renderSiteHeader()}

      <!-- 3. MAIN CONTENT BODY (Full-width Responsive Container) -->
      <main id="app-main-content">
        <div class="site-container">
          ${this.renderActiveTabContent()}
        </div>
      </main>

      <!-- 4. SITE FOOTER (Desktop Multi-Column & Mobile Responsive) -->
      ${this.renderSiteFooter()}

      <!-- 5. FLOATING CART CAPSULE (Mobile Only) -->
      ${this.renderFloatingCartCapsule()}

      <!-- 6. MOBILE BOTTOM NAVIGATION (Mobile Only < 768px) -->
      ${this.renderMobileBottomNav()}

      <!-- 7. ACTIVE MODALS & POPUPS -->
      ${this.renderActiveModal()}

      <!-- 8. TOAST NOTIFICATIONS -->
      ${this.renderToast()}
    `;

    this.bindViewEvents();
  }

  // =========================================================================
  // 1. TOP UTILITY BAR (Desktop & Tablet)
  // =========================================================================
  renderSiteTopBar() {
    const s = store.state;
    return `
      <div class="site-top-bar">
        <div class="site-container">
          <div class="top-bar-inner">
            <div class="top-bar-notice">
              <span class="tag-badge">🔥 ${this.t('توصيل حراري فوري', 'Express Delivery')}</span>
              <span class="notice-desc-desktop">${this.t(
                'مطابخ الشيف فرجاني | أجود أنواع اللحوم البلدي 100% والمأكولات الجاهزة للتسوية | فرع الهرم: شارع العروبة متفرع من ترسا والمريوطية',
                'Chef Fergany Kitchens | 100% Baladi Meat & Ready-to-Cook Delicacies | Haram Branch: Orouba St.'
              )}</span>
              <span class="notice-desc-mobile">${this.t(
                'مطابخ الشيف فرجاني | لحوم بلدي 100%',
                'Chef Fergany | 100% Baladi Meat'
              )}</span>
            </div>

            <div class="top-bar-actions">
              <a href="#admin" class="top-bar-admin-btn" title="${this.t('لوحة الإدارة', 'Admin Portal')}">
                <span>👑</span>
                <span>${this.t('الإدارة', 'Admin')}</span>
              </a>

              <button class="top-bar-lang-btn" id="btn-lang-toggle" data-action="toggle-lang" title="${this.t('تغيير اللغة', 'Switch Language')}">
                <span class="lang-icon">🌐</span>
                <span class="lang-text">${s.lang === 'ar' ? 'English' : 'عربي'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. SITE MAIN HEADER
  // =========================================================================
  renderSiteHeader() {
    const s = store.state;
    const cartCount = store.getCartItemsCount();
    const cartTotal = store.getCartTotal();

    return `
      <header class="site-header">
        <div class="site-container">
          <!-- A. DESKTOP HEADER (Screens >= 768px) -->
          <div class="desktop-header-inner">
            <!-- Brand Badge -->
            <div class="brand-badge" id="btn-brand-home">
              <img src="/assets/chef-fergany-logo.jpg" alt="Logo Chef Fergany" class="brand-logo-img" />
              <div class="brand-title-group">
                <h1>CHEF FERGANY</h1>
                <span class="slogan-tag">${this.t('الشيف في بيتك', 'The Chef In Your Home')}</span>
              </div>
            </div>

            <!-- Primary Navigation Links -->
            <nav>
              <ul class="desktop-nav-menu">
                <li>
                  <button class="desktop-nav-link ${s.activeTab === 'home' ? 'active' : ''}" data-nav="home">
                    <span>🏠</span>
                    <span>${this.t('الرئيسية', 'Home')}</span>
                  </button>
                </li>
                <li>
                  <button class="desktop-nav-link" data-nav="catalog">
                    <span>🍽️</span>
                    <span>${this.t('قائمة الأطباق', 'Menu')}</span>
                  </button>
                </li>
                <li>
                  <button class="desktop-nav-link" data-nav="offers">
                    <span>🔥</span>
                    <span>${this.t('العروض المميزة', 'Offers')}</span>
                  </button>
                </li>

                <li>
                  <button class="desktop-nav-link" data-nav="branches">
                    <span>📍</span>
                    <span>${this.t('الفروع والتوصيل', 'Branches')}</span>
                  </button>
                </li>
              </ul>
            </nav>

            <!-- Search Bar Input -->
            <div class="desktop-search-wrap">
              <span class="desktop-search-icon">🔍</span>
              <input 
                type="text" 
                class="desktop-search-input"
                id="desktop-search-input"
                placeholder="${this.t('ابحث عن: حمام محشي، كفتة، طاجن...', 'Search dishes: Pigeon, Kofta...')}"
                value="${s.searchQuery}"
              />
            </div>

            <!-- Desktop Action Buttons -->
            <div class="desktop-actions-group">
              <button class="desktop-action-btn" id="btn-open-client-auth" title="${s.clientUser ? s.clientUser.fullName : this.t('تسجيل الدخول', 'Login')}">
                <span>${s.clientUser ? '👤' : '🔑'}</span>
                <span>${s.clientUser ? s.clientUser.fullName.split(' ')[0] : this.t('دخول / تسجيل', 'Sign In')}</span>
              </button>

              <button class="desktop-action-btn" data-nav="profile" title="${this.t('الملف الشخصي', 'Profile')}">
                <span>📋</span>
                <span>${this.t('طلباتي', 'Orders')}</span>
              </button>

              <!-- Desktop Cart Pill Button -->
              <button class="desktop-cart-pill" data-nav="cart" title="${this.t('سلة المشتريات', 'Shopping Cart')}">
                <span>🛒</span>
                <span class="cart-count-bubble">${cartCount}</span>
                <span>${cartTotal}.00 ${this.t('ج.م', 'EGP')}</span>
              </button>
            </div>
          </div>

          <!-- B. MOBILE HEADER (Screens < 768px) -->
          <div class="mobile-header-bar">
            <div class="mobile-header-top-row">
              <div class="brand-badge" id="btn-brand-home-mobile">
                <img src="/assets/chef-fergany-logo.jpg" alt="Logo Chef Fergany" class="brand-logo-img" />
                <div class="brand-title-group">
                  <h1>CHEF FERGANY</h1>
                  <span class="slogan-tag">${this.t('الشيف في بيتك', 'The Chef In Your Home')}</span>
                </div>
              </div>

              <div class="mobile-header-actions">
                <!-- 1. Dedicated & Prominent Language Toggle with Globe Icon -->
                <button class="mobile-lang-btn" id="btn-lang-toggle-mobile" data-action="toggle-lang" title="${this.t('تغيير لغة الموقع', 'Switch Website Language')}">
                  <span class="lang-icon">🌐</span>
                  <span class="lang-text">${s.lang === 'ar' ? 'English' : 'عربي'}</span>
                </button>

                <!-- 2. Compact Branch Selector -->
                <button class="mobile-branch-pill" id="btn-select-branch-mobile" title="${this.t('الفروع والتوصيل', 'Branches & Delivery')}">
                  <span class="loc-icon">📍</span>
                  <span class="branch-name">${this.t('الهرم', 'Haram')}</span>
                </button>

                <!-- 3. Mobile Cart Icon Button -->
                <button class="mobile-cart-btn" data-nav="cart" title="${this.t('سلة المشتريات', 'Shopping Cart')}">
                  <span>🛒</span>
                  ${cartCount > 0 ? `<span class="nav-cart-badge">${cartCount}</span>` : ''}
                </button>
              </div>
            </div>

            <!-- Mobile Quick Search Input -->
            <div class="header-search-bar" id="mobile-search-trigger">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="${this.t('ابحث عن: حمام محشي، كفتة، طاجن...', 'Search dishes (Pigeon, Kofta, Tagine)...')}" 
                value="${s.searchQuery}"
                id="mobile-search-input"
              />
            </div>
          </div>
        </div>
      </header>
    `;
  }

  // =========================================================================
  // 3. ACTIVE TAB CONTENT DISPATCHER
  // =========================================================================
  renderActiveTabContent() {
    switch (store.state.activeTab) {
      case 'home':
        return this.renderHomeTab();
      case 'search':
        return this.renderSearchTab();
      case 'cart':
        return this.renderCartTab();
      case 'orders':
        return this.renderOrdersTab();
      case 'profile':
        return this.renderProfileTab();
      default:
        return this.renderHomeTab();
    }
  }

  // =========================================================================
  // HOME SCREEN (Desktop & Mobile Optimized)
  // =========================================================================
  renderHomeTab() {
    const s = store.state;
    const featuredProducts = PRODUCTS.filter((p) => p.isFeatured || p.isPopular || p.category === 'offers');
    let categoryFiltered = PRODUCTS;
    if (s.selectedCategory !== 'all') {
      categoryFiltered = categoryFiltered.filter((p) => p.category === s.selectedCategory);
    }

    if (this.quickTagFilter === 'popular') {
      categoryFiltered = categoryFiltered.filter((p) => p.isPopular);
    } else if (this.quickTagFilter === 'ready') {
      categoryFiltered = categoryFiltered.filter(
        (p) =>
          (p.badgeAr && (p.badgeAr.includes('تسوية') || p.badgeAr.includes('قلي'))) ||
          (p.badgeEn && (p.badgeEn.toLowerCase().includes('ready') || p.badgeEn.toLowerCase().includes('fry')))
      );
    } else if (this.quickTagFilter === 'casseroles') {
      categoryFiltered = categoryFiltered.filter((p) => p.category === 'casseroles');
    } else if (this.quickTagFilter === 'offers') {
      categoryFiltered = categoryFiltered.filter((p) => p.category === 'offers');
    }

    return `
      <div class="animate-fade">
        <!-- A. HERO BANNER SECTION (Wide Panoramic Banner on Desktop) -->
        <section class="desktop-hero-section">
          <div class="desktop-hero-banner">
            <div class="hero-text-col">
              <span class="hero-badge-pill">
                ✨ ${this.t('مطابخ ومعارض الشيف محمد فرجاني', 'Chef Mohamed Fergany Kitchens')}
              </span>
              <h1 class="hero-main-title">
                ${this.t('أجود أنواع اللحوم والمأكولات الجاهزة للتسوية الفورية', 'Finest Meats & Delicacies Ready for Your Oven')}
              </h1>
              <p class="hero-main-subtitle">
                ${this.t(
                  'طعم بيتي أصيل متبل بأسرار وخبرة الشيف محمد فرجاني، جاهز للفرن أو الشواية في دقائق. نوفر لك ولعائلتك تجربة طعام ملكية فاخرة ولحوم بلدي 100% بدون أي مواد حافظة تصلك طازجة عند باب بيتك.',
                  'Authentic artisanal Egyptian recipes seasoned with Chef Fergany signature spices. 100% fresh local baladi meats delivered fresh to your doorstep ready to cook in minutes.'
                )}
              </p>

              <div class="hero-actions-row">
                <button class="hero-btn-primary" id="hero-order-now-btn">
                  <span>🍽️</span>
                  <span>${this.t('تصفح قائمة الأطباق', 'Explore Menu')}</span>
                  <span>←</span>
                </button>

                <button class="hero-btn-secondary" id="hero-offers-btn">
                  <span>🔥</span>
                  <span>${this.t('عروض اليوم الحصرية', 'Today’s Specials')}</span>
                </button>

                <a href="https://wa.me/201040925170" target="_blank" class="hero-btn-secondary" style="border-color:#25D366; color:#25D366; text-decoration:none;">
                  <span>💬</span>
                  <span>${this.t('طلب مباشر عبر واتساب', 'WhatsApp Order')}</span>
                </a>
              </div>

              <div class="hero-trust-strip">
                <div class="trust-badge-item">
                  <span class="t-icon">🥩</span>
                  <span>${this.t('لحوم بلدي طازجة 100%', '100% Fresh Baladi Meat')}</span>
                </div>
                <div class="trust-badge-item">
                  <span class="t-icon">⏱️</span>
                  <span>${this.t('جاهز للتسوية في دقائق', 'Ready in Minutes')}</span>
                </div>
                <div class="trust-badge-item">
                  <span class="t-icon">❄️</span>
                  <span>${this.t('تغليف حراري معقم', 'Vacuum Sealed Packaging')}</span>
                </div>
                <div class="trust-badge-item">
                  <span class="t-icon">🏍️</span>
                  <span>${this.t('توصيل حراري فوري', 'Express Hot Delivery')}</span>
                </div>
              </div>
            </div>

            <!-- Hero Right Showcase Visual (Chic Chef Showcase) -->
            <div class="hero-visual-col">
              <div class="hero-chef-chic-card" id="hero-chef-card">
                <!-- Top Chef Portrait Showcase -->
                <div class="chef-chic-portrait-wrap">
                  <img src="/assets/chef-mohamed-fergany.jpg" alt="Chef Mohamed Fergany" class="chef-chic-img" />
                  <div class="chef-chic-fade-overlay"></div>
                  
                  <div class="chef-chic-floating-tag tag-heritage">
                    <span>👑</span>
                    <span>${this.t('سر الصنعة والأصالة', 'Master Chef Heritage')}</span>
                  </div>

                  <div class="chef-chic-floating-tag tag-exp">
                    <span>⭐</span>
                    <span>${this.t('خبرة +15 عاماً', '15+ Years Exp.')}</span>
                  </div>
                </div>

                <!-- Bottom Chef Story & Information -->
                <div class="chef-chic-info">
                  <div class="chef-chic-badge-row">
                    <span class="chef-chic-kicker">
                      👨‍🍳 ${this.t('مؤسس مطابخ ومعارض فرجاني', 'Founder & Executive Chef')}
                    </span>
                    <span class="chef-chic-status-dot">
                      <span class="pulse-dot"></span>
                      ${this.t('متواجد لخدمتكم', 'At Your Service')}
                    </span>
                  </div>

                  <h3 class="chef-chic-name">${this.t('الشيف محمد فرجاني', 'Chef Mohamed Fergany')}</h3>
                  <span class="chef-chic-title">${this.t('صاحب ومؤسس مطابخ ومعارض فرجاني للحوم الفاخرة', 'Founder of Fergany Gourmet Meats & Kitchens')}</span>





                  <div class="chef-chic-action-bar">
                    <button class="chef-chic-btn-story" id="hero-scroll-to-chef">
                      <span>📖</span>
                      <span>${this.t('تعرف على قصة وخبرة الشيف', 'Chef Story & Heritage')}</span>
                      <span class="chic-arrow">←</span>
                    </button>
                    <a href="https://wa.me/201040925170" target="_blank" class="chef-chic-wa-icon" title="${this.t('تواصل مباشر عبر واتساب', 'Direct WhatsApp')}">
                      <span>💬</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- B. VALUE PROPOSITIONS SECTION -->
        <section class="value-props-section">
          <div class="value-props-grid">
            <div class="value-prop-card">
              <div class="value-prop-icon">👨‍🍳</div>
              <div>
                <h4 class="value-prop-title">${this.t('طعم بيتي أصيل', 'Authentic Taste')}</h4>
                <p class="value-prop-desc">${this.t('وصفات وتتبيلات سرية بخبرة الشيف فرجاني', 'Artisanal secret seasonings')}</p>
              </div>
            </div>

            <div class="value-prop-card">
              <div class="value-prop-icon">🥩</div>
              <div>
                <h4 class="value-prop-title">${this.t('لحوم بلدي 100%', '100% Baladi Meat')}</h4>
                <p class="value-prop-desc">${this.t('مذبوحة طازجة ومعتمدة بدون مواد حافظة', 'Daily fresh certified local meat')}</p>
              </div>
            </div>

            <div class="value-prop-card">
              <div class="value-prop-icon">⏱️</div>
              <div>
                <h4 class="value-prop-title">${this.t('جاهز على الفرن والشواية', 'Ready to Cook')}</h4>
                <p class="value-prop-desc">${this.t('وفر وقتك وجهدك في التجهيز والتتبيل', 'Save hours in kitchen prep')}</p>
              </div>
            </div>

            <div class="value-prop-card">
              <div class="value-prop-icon">🏍️</div>
              <div>
                <h4 class="value-prop-title">${this.t('توصيل حراري سريع', 'Fast Delivery')}</h4>
                <p class="value-prop-desc">${this.t('تغليف محكم يحافظ على برودة وجودة الصنف', 'Hygienic temperature-safe boxes')}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- C. CATEGORY NAVIGATION BAR -->
        <section class="category-nav-section" id="category-navigation-bar">
          <div class="category-tabs-bar">
            ${CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? PRODUCTS.length
                  : cat.id === 'offers'
                  ? PRODUCTS.filter((p) => p.category === 'offers').length
                  : PRODUCTS.filter((p) => p.category === cat.id).length;

              return `
                <button class="category-tab-btn ${s.selectedCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
                  <span class="tab-icon">${cat.icon}</span>
                  <span>${s.lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  <span class="category-tab-count">(${count})</span>
                </button>
              `;
            }).join('')}
          </div>
        </section>

        <!-- D. PROMOTIONAL VOUCHER BANNER STRIP -->
        <div class="promo-strip-banner">
          <div class="text-group">
            <h4>🎁 ${this.t('خصم 10% على طلبك الأول من مطابخ فرجاني', '10% OFF Your First Order')}</h4>
            <p>${this.t('استخدم كود الخصم عند الدفع لتستمتع بأشهى أصناف العزومات بأفضل سعر.', 'Use promo code at checkout to enjoy signature dishes at the best price.')}</p>
          </div>
          <button class="promo-badge-btn" id="btn-claim-offer">
            ${this.t('كود FERGANY10 📋', 'Code: FERGANY10 📋')}
          </button>
        </div>

        <!-- E. FEATURED SPECIALS SECTION (Multi-column responsive grid on desktop) -->
        <section class="site-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>🔥 ${this.t('العروض المميزة والأكثر طلباً', 'Featured Offers & Best Sellers')}</h2>
              <p class="section-subtitle">${this.t('أطباقنا الأكثر شهرة التي يطلبها عملاؤنا يومياً', 'Our most loved delicacies ordered daily by our community')}</p>
            </div>
            <button class="see-all-link" data-show-category="offers">
              <span>${this.t('عرض كل العروض', 'View All Offers')}</span>
              <span>←</span>
            </button>
          </div>

          <!-- Responsive Product Grid for Featured (3-5 columns on desktop) -->
          <div class="products-grid">
            ${featuredProducts.map((p) => this.renderProductCard(p)).join('')}
          </div>
        </section>

        <!-- F. FULL MENU CATALOG LISTING (Responsive 3–5 Columns) -->
        <section class="site-section" id="catalog-section" style="margin-top: 40px;">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>🍽️ ${
                s.selectedCategory === 'all'
                  ? this.t('أشهى مأكولات مطابخ فرجاني (القائمة الكاملة)', 'All Chef Fergany Specialties')
                  : CATEGORIES.find((c) => c.id === s.selectedCategory)
                  ? s.lang === 'ar'
                    ? CATEGORIES.find((c) => c.id === s.selectedCategory).nameAr
                    : CATEGORIES.find((c) => c.id === s.selectedCategory).nameEn
                  : this.t('قائمة الأطباق', 'Dishes')
              }</h2>
              <p class="section-subtitle">
                ${this.t(
                  `مجهزة بتتبيلتنا السرية ومعبأة طازجة يومياً للتسوية الفورية (${categoryFiltered.length} صنف)`,
                  `Daily prepared and vacuum-sealed for immediate cooking (${categoryFiltered.length} items)`
                )}
              </p>
            </div>

            <div style="font-size:0.85rem; font-weight:800; color:var(--color-primary); background:var(--color-primary-soft); padding:4px 12px; border-radius:var(--radius-full);">
              ${categoryFiltered.length} ${this.t('أصناف متوفرة', 'Dishes Available')}
            </div>
          </div>

          <!-- Quick Filter Tags Strip -->
          <div class="quick-tags-strip">
            <span class="quick-tags-label">⚡ ${this.t('تصفح سريع:', 'Quick Filter:')}</span>
            <button class="quick-tag-pill ${this.quickTagFilter === 'all' ? 'active' : ''}" data-filter-tag="all">✨ ${this.t('الكل', 'All')}</button>
            <button class="quick-tag-pill ${this.quickTagFilter === 'popular' ? 'active' : ''}" data-filter-tag="popular">🔥 ${this.t('الأكثر طلباً', 'Best Sellers')}</button>
            <button class="quick-tag-pill ${this.quickTagFilter === 'ready' ? 'active' : ''}" data-filter-tag="ready">⏱️ ${this.t('جاهز للتسوية', 'Ready to Cook')}</button>
            <button class="quick-tag-pill ${this.quickTagFilter === 'casseroles' ? 'active' : ''}" data-filter-tag="casseroles">🥘 ${this.t('طواجن وصواني', 'Tajines')}</button>
            <button class="quick-tag-pill ${this.quickTagFilter === 'offers' ? 'active' : ''}" data-filter-tag="offers">🏷️ ${this.t('عروض توفيرية', 'Special Offers')}</button>
            ${(this.quickTagFilter !== 'all' || s.selectedCategory !== 'all') ? `
              <button class="quick-tag-reset" id="btn-reset-filters" title="${this.t('إلغاء التصفية وعرض كل الأصناف', 'Reset all filters')}">
                ✕ ${this.t('إلغاء الفلاتر', 'Reset')}
              </button>
            ` : ''}
          </div>

          <!-- Multi-column Responsive Grid: 2 on mobile, 3 on tablet, 4 on desktop, 5 on large desktop -->
          <div class="products-grid">
            ${categoryFiltered.length > 0
              ? categoryFiltered.map((p) => this.renderProductCard(p)).join('')
              : `
                <div style="grid-column: 1 / -1; text-align:center; padding:48px 20px; background:#FFF; border-radius:var(--radius-md); border:1px dashed var(--color-bg-warm);">
                  <span style="font-size:2.4rem; display:block; margin-bottom:10px;">🔍</span>
                  <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:6px;">${this.t('لا توجد أصناف مطابقة للفلاتر الحالية', 'No dishes found matching current filters')}</h3>
                  <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:16px;">${this.t('يمكنك إلغاء التصفية لعرض كافة أطباق مطابخ الشيف فرجاني', 'Reset filters to browse the entire menu')}</p>
                  <button class="hero-btn-primary" id="btn-reset-filters-empty" style="padding:9px 22px; font-size:0.85rem; margin:0 auto;">
                    ${this.t('إلغاء الفلاتر وعرض الكل 🍽️', 'Reset Filters & Show All 🍽️')}
                  </button>
                </div>
              `
            }
          </div>
        </section>

        <!-- G. SMART FEAST CALCULATOR -->
        ${this.renderFeastCalculator()}

        <!-- G2. VERIFIED CUSTOMER TESTIMONIALS & REVIEWS -->
        ${this.renderTestimonialsSection()}

        <!-- H. FEASTS & CATERING BANNER (صواني العزومات والمناسبات) -->
        <section class="feasts-banner site-section">
          <div class="feasts-info">
            <span style="background:var(--color-primary); color:#FFF; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:var(--radius-full); display:inline-block; margin-bottom:8px;">
              👑 ${this.t('خدمة صواني العزومات والمناسبات', 'Banquets & Family Gatherings')}
            </span>
            <h3>${this.t('عندك عزومة أو مناسبة عائلية؟ سيب التجهيز على الشيف فرجاني!', 'Hosting a Family Gathering? Leave the Feast to Chef Fergany!')}</h3>
            <p>${this.t('نجهز صواني الحمام المحشي، المشويات المشكلة، طواجن اللحوم الكوندوز، وصواني الرقاق والمحاشي المشكلة بالكميات المطلوبة مع التوصيل الحراري الساخن لموقع مناسبتك.', 'We prepare large party platters, stuffed pigeon trays, mixed grills, and gourmet tagines delivered ready and piping hot to your doorstep.')}</p>
          </div>
          <a href="https://wa.me/201040925170?text=${encodeURIComponent('مرحباً شيف فرجاني، أريد الاستفسار عن صواني العزومات والمناسبات')}" target="_blank" class="hero-btn-primary feasts-banner-cta" style="white-space:nowrap; text-decoration:none;">
            <span>💬</span>
            <span>${this.t('حجز وتنسيق عزومة', 'Book Banquet Platter')}</span>
          </a>
        </section>
      </div>
    `;
  }

  // =========================================================================
  // SMART FEAST CALCULATOR COMPONENT
  // =========================================================================
  renderFeastCalculator() {
    const s = store.state;
    const pkg = this.getFeastPackage(this.calcState.size, this.calcState.style);

    return `
      <section class="feast-calculator-section site-section" id="feast-calculator">
        <div class="calculator-header">
          <span class="calc-badge">👑 ${this.t('أداة تخطيط العزومات الذكية', 'Smart Feast Planning Calculator')}</span>
          <h2 class="calc-title">${this.t('عندك عزومة أو لمة عائلية؟ احسب تشكيلة الأطباق بضغطة واحدة!', 'Planning a Feast? Calculate the Perfect Menu in One Click!')}</h2>
          <p class="calc-subtitle">${this.t('حدد عدد الضيوف وسيقترح الشيف التشكيلة المتوازنة والكميات والسعر مع كود الخصم الفوري والتوصيل المجاني.', 'Select guest count and Chef Fergany will configure the ideal balance and price.')}</p>
        </div>

        <div class="feast-calculator-card">
          <div class="calc-controls-grid">
            <div class="calc-control-group">
              <label class="calc-label">👥 ${this.t('1. حدد عدد الأفراد والضيوف:', '1. Number of Guests:')}</label>
              <div class="calc-pills-selector">
                <button class="calc-pill-btn ${this.calcState.size === 'small' ? 'active' : ''}" data-calc-size="small">
                  🍽️ 4 - 6 ${this.t('أفراد (لمة عائلية)', 'Guests (Family Lunch)')}
                </button>
                <button class="calc-pill-btn ${this.calcState.size === 'medium' ? 'active' : ''}" data-calc-size="medium">
                  👑 8 - 10 ${this.t('أفراد (العزومة الأكثر طلباً)', 'Guests (Classic Feast)')}
                </button>
                <button class="calc-pill-btn ${this.calcState.size === 'large' ? 'active' : ''}" data-calc-size="large">
                  🏆 15 - 20 ${this.t('فرداً (العزومة الملكية)', 'Guests (Grand Feast)')}
                </button>
              </div>
            </div>

            <div class="calc-control-group">
              <label class="calc-label">✨ ${this.t('2. مميزات تشكيلة العزومة المختارة:', '2. Package Highlights:')}</label>
              <div class="calc-highlights-grid">
                <div class="calc-highlight-item">
                  <span class="calc-highlight-icon">🥩</span>
                  <span><strong>${this.t('لحوم بلدي 100%:', '100% Baladi Meat:')}</strong> ${this.t('طازجة بدون مستورد', 'Fresh local meat')}</span>
                </div>
                <div class="calc-highlight-item">
                  <span class="calc-highlight-icon">❄️</span>
                  <span><strong>${this.t('تغليف حراري معقم:', 'Sterile Sealed Box:')}</strong> ${this.t('يحفظ السخونة حتى سفرتك', 'Delivered hot to your table')}</span>
                </div>
                <div class="calc-highlight-item">
                  <span class="calc-highlight-icon">🚀</span>
                  <span><strong>${this.t('شحن وتوصيل مجاني:', 'Free Delivery:')}</strong> ${this.t('مؤهلة للشحن المجاني', 'Unlocks free delivery')}</span>
                </div>
                <div class="calc-highlight-item">
                  <span class="calc-highlight-icon">🎁</span>
                  <span><strong>${this.t('توفير العرض:', 'Package Savings:')}</strong> ${this.t(`وفر ${pkg.saving} ج.م مع التشكيلة`, `Save ${pkg.saving} EGP`)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Calculated Output Result Card -->
          <div class="calc-result-box" id="calc-result-display">
            <div class="calc-res-header">
              <div class="calc-res-title">
                <div class="calc-res-title-row">
                  <h3>👑 ${s.lang === 'ar' ? pkg.titleAr : pkg.titleEn}</h3>
                  <div class="calc-pricing-badge">
                    <span class="calc-old-price">${pkg.origPrice} ${this.t('ج.م', 'EGP')}</span>
                    <span class="calc-new-price">${pkg.dealPrice} ${this.t('ج.م', 'EGP')}</span>
                  </div>
                </div>
                <p>${s.lang === 'ar' ? pkg.descAr : pkg.descEn}</p>
              </div>
            </div>

            <div class="calc-items-grid">
              ${pkg.items
                .map((item) => {
                  const p = PRODUCTS.find((prod) => prod.id === item.productId);
                  if (!p) return '';
                  return `
                  <div class="calc-item-card">
                    <img src="${p.image}" alt="${s.lang === 'ar' ? p.titleAr : p.titleEn}" />
                    <div class="calc-item-info">
                      <div class="calc-item-header-row">
                        <h4>${s.lang === 'ar' ? item.labelAr : item.labelEn}</h4>
                        <span class="calc-item-price-tag">${p.price} ${this.t('ج.م', 'EGP')} <small>(${s.lang === 'ar' ? p.unitAr : p.unitEn})</small></span>
                      </div>
                    </div>
                    <div class="calc-item-qty-stepper">
                      <button class="calc-qty-btn" data-calc-item="${item.productId}" data-calc-dir="-1" title="${this.t('تقليل', 'Decrease')}">-</button>
                      <span class="calc-qty-num">${item.qty}</span>
                      <button class="calc-qty-btn" data-calc-item="${item.productId}" data-calc-dir="1" title="${this.t('زيادة', 'Increase')}">+</button>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>

            <div class="calc-action-row">
              <div class="calc-delivery-promo">
                ${pkg.qualifiesForFreeDelivery
                  ? `🎉 ${this.t(`العرض مؤهل للتوصيل المجاني وتوفير ${pkg.saving} ج.م!`, `Includes Free Delivery & ${pkg.saving} EGP discount!`)}`
                  : `💡 ${this.t(`وفر ${pkg.saving} ج.م! (أضف أصنافاً بقيمة ${600 - pkg.dealPrice} ج.م للتوصيل المجاني)`, `Saves ${pkg.saving} EGP! (Add ${600 - pkg.dealPrice} EGP for free delivery)`)}`
                }
              </div>
              <button class="calc-add-all-btn" id="btn-add-feast-package">
                <span class="calc-btn-cart-icon">🛒</span>
                <span class="calc-btn-title">${this.t('إضافة العزومة بالكامل للسلة', 'Add Full Feast to Cart')}</span>
                <span class="calc-btn-price-badge">${pkg.dealPrice} ${this.t('ج.م', 'EGP')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // TESTIMONIALS & REAL REVIEWS SECTION
  // =========================================================================
  renderTestimonialsSection() {
    const s = store.state;
    const reviews = s.reviews || [];
    const hasReviews = reviews.length > 0;

    return `
      <section class="testimonials-section site-section" id="testimonials-section">
        <div class="section-title-wrap" style="text-align:center; max-width:680px; margin:0 auto 24px;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--color-primary); background:var(--color-primary-soft); padding:3px 12px; border-radius:var(--radius-full); display:inline-block; margin-bottom:8px;">
            ⭐️ ${this.t('تقييمات وتجارب العملاء الموثقة', 'Verified Customer Reviews')}
          </span>
          <h2 style="font-size:1.45rem; font-weight:900; color:var(--color-text-dark); margin-bottom:6px;">
            ${this.t('تجارب حقيقية من أصحاب العزومات ومحبي فرجاني', 'Authentic Feedback from Our Valued Feast Hosts')}
          </h2>
          <p style="font-size:0.84rem; color:var(--color-text-muted); margin-bottom:14px;">
            ${this.t('نلتزم بالشفافية الكاملة: ننشر التقييمات المرتبطة بطلبات حقيقية ومؤكدة فقط.', 'We maintain full transparency: only authentic verified order reviews are published.')}
          </p>
          <button class="hero-btn-secondary" id="btn-open-review-modal" style="font-size:0.82rem; padding:8px 18px; border-color:var(--color-primary); color:var(--color-primary); margin:0 auto;">
            ✍️ ${this.t('أضف تقييمك لطلب سابق', 'Submit a Review for Your Order')}
          </button>
        </div>

        ${hasReviews ? `
          <div class="testimonials-grid">
            ${reviews.map((rev) => `
              <div class="testimonial-card">
                <div class="testi-header">
                  <div class="testi-avatar">🍽️</div>
                  <div style="flex:1;">
                    <h4 class="testi-author">${rev.author}</h4>
                    <span class="testi-location">${rev.location}</span>
                    ${rev.isVerifiedPurchase ? `
                      <span class="verified-purchase-badge">✅ ${this.t(`مشترٍ معتمد (طلب #${rev.orderId})`, `Verified Buyer (#${rev.orderId})`)}</span>
                    ` : ''}
                  </div>
                  <div class="testi-rating">${'⭐'.repeat(rev.rating)}</div>
                </div>
                <p class="testi-quote">"${rev.quote}"</p>
                <div class="testi-order-tag">👑 ${this.t('الصنف:', 'Dish:')} ${rev.dishTitle}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="background:#FFF; border-radius:var(--radius-lg); border:1px solid var(--color-bg-warm); padding:36px 20px; text-align:center; max-width:620px; margin:0 auto;">
            <div style="font-size:2.2rem; margin-bottom:10px;">🌟</div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:8px;">${this.t('كن أول من يشارك تقييمه المعتمد للأطباق!', 'Be the First to Review Your Feast!')}</h3>
            <p style="font-size:0.85rem; color:var(--color-text-muted); line-height:1.6; margin-bottom:16px;">
              ${this.t('لا نقوم بنشر تقييمات وهمية أو أسماء غير حقيقية. إذا استلمت طلباً من مطابخ الشيف فرجاني، يسعدنا جداً مشاركة رأيك ليظهر فوراً هنا مع شارة المشترى المعتمد.', 'We never use fabricated reviews. Enter your order number and share your honest feedback to be displayed here with a verified buyer badge.')}
            </p>
            <button class="hero-btn-primary" id="btn-open-review-modal-empty" style="font-size:0.84rem; padding:9px 20px;">
              ✍️ ${this.t('كتابة تقييم موثق لطلبك', 'Write a Verified Review')}
            </button>
          </div>
        `}
      </section>
    `;
  }

  // =========================================================================
  // RESPONSIVE PRODUCT CARD COMPONENT
  // =========================================================================
  renderProductCard(product) {
    const s = store.state;
    const isWishlisted = s.wishlist.includes(product.id);

    return `
      <div class="product-card" data-product-id="${product.id}">
        <!-- Image & Floating Badges -->
        <div class="product-card-img-wrap" data-trigger="open-product" data-product-id="${product.id}">
          <img 
            src="${product.image}" 
            alt="${s.lang === 'ar' ? product.titleAr : product.titleEn}" 
            loading="lazy" 
          />

          <div class="product-card-badges">
            ${
              product.badgeAr
                ? `<span class="card-badge ${product.badgeType || ''}">${s.lang === 'ar' ? product.badgeAr : product.badgeEn}</span>`
                : ''
            }
          </div>

          <button class="card-fav-btn ${isWishlisted ? 'active' : ''}" data-fav-id="${product.id}" title="${this.t('المفضلة', 'Wishlist')}">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <!-- Card Body -->
        <div class="product-card-body">
          <div class="product-card-tags">
            <span class="product-card-tag">⚖️ ${s.lang === 'ar' ? product.unitAr : product.unitEn}</span>
            <span class="product-card-tag">⏱️ ${s.lang === 'ar' ? product.cookTimeAr : product.cookTimeEn}</span>
          </div>

          <h3 class="product-card-title" data-trigger="open-product" data-product-id="${product.id}">
            ${s.lang === 'ar' ? product.titleAr : product.titleEn}
          </h3>

          <span class="product-card-en-title">
            ${s.lang === 'ar' ? product.titleEn : product.titleAr}
          </span>

          <p class="product-card-desc">
            ${s.lang === 'ar' ? product.descriptionAr : product.descriptionEn}
          </p>

          <div class="product-card-footer">
            <div class="product-card-price-group">
              <div>
                <span class="product-card-price">${product.price}.00</span>
                <span class="product-card-currency">${this.t('ج.م', 'EGP')}</span>
              </div>
              <span class="product-card-unit">${s.lang === 'ar' ? product.storageAr : product.storageEn}</span>
            </div>

            <div class="product-card-actions">
              <button class="product-card-view-btn" data-trigger="open-product" data-product-id="${product.id}">
                <span>${this.t('التفاصيل', 'Details')}</span>
                <span>←</span>
              </button>

              <button class="quick-add-btn" data-quick-add="${product.id}" title="${this.t('أضف إلى السلة', 'Add to Cart')}">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SEARCH SCREEN
  // =========================================================================
  renderSearchTab() {
    const s = store.state;
    const q = s.searchQuery.trim().toLowerCase();

    const results = PRODUCTS.filter((p) => {
      const matchText = `${p.titleAr} ${p.titleEn} ${p.descriptionAr} ${p.descriptionEn}`.toLowerCase();
      const matchCat = s.selectedCategory === 'all' || p.category === s.selectedCategory;
      return matchCat && (q === '' || matchText.includes(q));
    });

    return `
      <div class="animate-fade" style="padding: 24px 0 40px;">
        <div style="margin-bottom: 24px; text-align:center; max-width:680px; margin-inline:auto;">
          <h2 style="font-size:1.6rem; font-weight:900; margin-bottom:8px;">
            🔍 ${this.t('البحث في قائمة مأكولات الشيف فرجاني', 'Search Menu & Kitchen Delicacies')}
          </h2>
          <p style="font-size:0.88rem; color:var(--color-text-muted); margin-bottom:16px;">
            ${this.t('ابحث بسهولة عن أصناف الحمام المحشي، المشويات، الكفتة، أو طواجن اللحوم البلدي', 'Search for stuffed pigeon, kofta, fresh meats, and ready-to-bake tagines')}
          </p>

          <div class="header-search-bar" style="background:#FFF; padding:8px 18px; border-radius:var(--radius-full); box-shadow:var(--shadow-card);">
            <span class="search-icon" style="font-size:1.2rem;">🔍</span>
            <input 
              type="text" 
              id="live-search-input" 
              placeholder="${this.t('اكتب اسم الصنف أو المكون (مثال: حمام، كفتة، سمبوسك...)', 'Type dish name (Pigeon, Kofta, Sambousek)...')}" 
              value="${s.searchQuery}"
              style="font-size:1rem; padding:8px 12px;"
              autofocus
            />
            ${s.searchQuery ? `<button id="btn-clear-search" style="font-size:1.1rem; color:var(--color-text-light); cursor:pointer;">✕</button>` : ''}
          </div>
        </div>

        <!-- Filter Category Tabs -->
        <div class="category-tabs-bar" style="justify-content:center; margin-bottom:24px;">
          ${CATEGORIES.map(
            (c) => `
            <button class="category-tab-btn ${s.selectedCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}">
              <span class="tab-icon">${c.icon}</span>
              <span>${s.lang === 'ar' ? c.nameAr : c.nameEn}</span>
            </button>
          `
          ).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--color-bg-warm); padding-bottom:8px;">
          <span style="font-size:0.95rem; font-weight:800; color:var(--color-text-dark);">
            ${this.t(`نتائج البحث: (${results.length} صنف متطابق)`, `Search Results: (${results.length} items found)`)}
          </span>
          ${s.searchQuery ? `<button id="btn-reset-search" style="color:var(--color-primary); font-size:0.82rem; font-weight:700; cursor:pointer;">${this.t('إعادة تعيين البحث', 'Reset Search')}</button>` : ''}
        </div>

        ${
          results.length > 0
            ? `<div class="products-grid">${results.map((p) => this.renderProductCard(p)).join('')}</div>`
            : `
            <div style="text-align:center; padding: 60px 20px; background:#FFF; border-radius:var(--radius-lg); border:1px solid var(--color-bg-warm); max-width:600px; margin:0 auto;">
              <span style="font-size:3.5rem; display:block; margin-bottom:12px;">🍽️</span>
              <h3 style="font-size:1.2rem; font-weight:800; color:var(--color-text-dark); margin-bottom:6px;">
                ${this.t('لم نجد أصناف مطابقة للبحث', 'No matching dishes found')}
              </h3>
              <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:20px;">
                ${this.t('جرب البحث بكلمات عامة مثل "لحمة" أو "حمام" أو تصفح كل الأقسام', 'Try searching with generic terms like "Pigeon" or "Meat"')}
              </p>
              <button class="hero-btn-primary" id="btn-reset-search">
                ${this.t('عرض كافة الأصناف', 'Show All Dishes')}
              </button>
            </div>
          `
        }
      </div>
    `;
  }

  // =========================================================================
  // CART SCREEN (Desktop Two-Column Layout)
  // =========================================================================
  renderCartTab() {
    const s = store.state;
    const cart = s.cart;
    const subtotal = store.getCartSubtotal();
    const delivery = store.getDeliveryFee();
    const discount = store.getDiscountAmount();
    const total = store.getCartTotal();

    if (cart.length === 0) {
      return `
        <div class="animate-fade" style="text-align:center; padding: 80px 20px; max-width:540px; margin:0 auto;">
          <div style="width:110px; height:110px; background:var(--color-primary-soft); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:3rem; color:var(--color-primary);">
            🛒
          </div>
          <h2 style="font-size:1.4rem; font-weight:900; margin-bottom:8px;">${this.t('سلة المشتريات فارغة حالياً', 'Your Shopping Cart is Empty')}</h2>
          <p style="font-size:0.88rem; color:var(--color-text-muted); margin-bottom:28px; line-height:1.5;">
            ${this.t('اختر أشهى وجبات ولحوم الشيف فرجاني المجهزة طازجة وأضفها لسلتك الآن لتصلك جاهزة للتسوية الفورية.', 'Browse Chef Fergany signature meats and dishes ready to cook at home.')}
          </p>
          <button class="hero-btn-primary" id="btn-empty-cart-browse" style="padding:12px 30px; font-size:1rem;">
            ${this.t('تصفح قائمة الطعام والبدء بالطلب', 'Browse Menu & Start Ordering')}
          </button>
        </div>
      `;
    }

    return `
      <div class="animate-fade">
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 24px 0 16px; border-bottom:1px solid var(--color-bg-warm);">
          <div>
            <h1 style="font-size:1.5rem; font-weight:900;">${this.t('سلة المشتريات', 'Shopping Cart')} (${store.getCartItemsCount()})</h1>
            <p style="font-size:0.82rem; color:var(--color-text-muted);">${this.t('أصناف مجهزة طازجة من مطابخ الشيف فرجاني', 'Daily fresh dishes from Chef Fergany Kitchens')}</p>
          </div>
          <button id="btn-clear-cart" style="color:#C62828; font-size:0.85rem; font-weight:800; cursor:pointer;">
            ${this.t('تفريغ السلة بالكامل 🗑️', 'Clear Cart 🗑️')}
          </button>
        </div>

        <!-- Free Delivery Progress Card -->
        ${(() => {
          if (s.fulfillmentType === 'pickup') {
            return `
              <div class="free-delivery-progress-card achieved">
                <div class="fd-info-row">
                  <span class="fd-icon">🏪</span>
                  <span class="fd-text">
                    ${this.t('أنت تستلم من <strong>الفرع الرئيسي مجاناً (0 ج.م)</strong> - الهرم شارع العروبة', 'You are picking up from <strong>HQ Branch for Free (0 EGP)</strong>')}
                  </span>
                </div>
              </div>
            `;
          }

          const threshold = 600;
          const grossSubtotal = store.getCartSubtotal();
          const itemDiscount = s.appliedCoupon && s.appliedCoupon.type !== 'delivery_discount' ? store.getDiscountAmount() : 0;
          const netSubtotal = Math.max(0, grossSubtotal - itemDiscount);
          const progressPercent = Math.min(100, Math.round((netSubtotal / threshold) * 100));
          const remaining = Math.max(0, threshold - netSubtotal);
          const isEligible = netSubtotal >= threshold;

          const zone = DELIVERY_ZONES.find((z) => z.id === s.deliveryZoneId) || DELIVERY_ZONES[0];
          const standardFee = zone.fee;
          const isFullyFree = standardFee <= 40;

          return `
            <div class="free-delivery-progress-card ${isEligible ? 'achieved' : ''}">
              <div class="fd-info-row">
                <span class="fd-icon">${isEligible ? '🎉' : '🚀'}</span>
                <span class="fd-text">
                  ${
                    isEligible
                      ? isFullyFree
                        ? this.t(`تهانينا! طلبيتك مؤهلة لـ <strong>التوصيل المجاني بالكامل</strong> لمنطقتك (${zone.nameAr} - وفرت ${standardFee} ج.م)`, `Congrats! You unlocked <strong>100% Free Delivery</strong> for ${zone.nameEn}`)
                        : this.t(`تم تفعيل <strong>خصم التوصيل (40 ج.م)</strong> لمنطقتك (${zone.nameAr})! تدفع فقط فرق المسافة (${Math.max(0, standardFee - 40)} ج.م)`, `40 EGP delivery discount unlocked! You pay only remote surcharge (${Math.max(0, standardFee - 40)} EGP)`)
                      : this.t(
                          `أضف مشتريات صافية بقيمة <strong>${remaining} ج.م</strong> فقط واحصل على <strong>توصيل مجاني</strong> لمنطقتك!`,
                          `Add <strong>${remaining} EGP</strong> more net merchandise to unlock <strong>Free Delivery!</strong>`
                        )
                  }
                </span>
              </div>
              <div class="fd-bar-track">
                <div class="fd-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          `;
        })()}

        <!-- Desktop Two-Column Cart Layout -->
        <div class="desktop-cart-layout">
          <!-- Left Column: Items List -->
          <div class="desktop-cart-items-col">
            <!-- FULFILLMENT METHOD TOGGLE -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size:0.95rem; font-weight:800; margin-bottom:10px;">${this.t('اختر طريقة الاستلام:', 'Choose Delivery Method:')}</h3>
              <div class="fulfillment-toggle-row">
                <div class="toggle-option-card ${s.fulfillmentType === 'delivery' ? 'selected' : ''}" data-fulfillment="delivery">
                  <span class="icon">🛵</span>
                  <div class="title">${this.t('توصيل للمنزل', 'Home Delivery')}</div>
                  <div class="desc">${this.t('توصيل حراري سريع لحد باب البيت (40 ج.م)', 'Fast doorstep delivery (40 EGP)')}</div>
                </div>

                <div class="toggle-option-card ${s.fulfillmentType === 'pickup' ? 'selected' : ''}" data-fulfillment="pickup">
                  <span class="icon">🏪</span>
                  <div class="title">${this.t('استلام من الفرع', 'Branch Pickup')}</div>
                  <div class="desc">${this.t('فرع الهرم - شارع العروبة (مجاناً)', 'El Haram - Orouba (Free)')}</div>
                </div>
              </div>
            </div>

            <!-- Items Cards List -->
            <div class="cart-items-container">
              ${cart
                .map((item) => {
                  const p = item.product;
                  return `
                  <div class="cart-item-card" data-item-key="${item.itemKey}">
                    <img src="${p.image}" alt="${s.lang === 'ar' ? p.titleAr : p.titleEn}" class="cart-item-img" />

                    <div class="cart-item-info">
                      <h4 class="cart-item-title">${s.lang === 'ar' ? p.titleAr : p.titleEn}</h4>
                      <div class="cart-item-opts">
                        ${this.formatSelectedOptionsSummary(item.selectedOptions, p)}
                      </div>
                      <div class="cart-item-price">${item.unitPrice * item.quantity}.00 <span style="font-size:0.75rem;">${this.t('ج.م', 'EGP')}</span></div>
                    </div>

                    <div class="cart-item-actions">
                      <button class="cart-delete-btn" data-delete-key="${item.itemKey}" title="${this.t('حذف الصنف', 'Delete Item')}">🗑️</button>
                      <div class="qty-stepper">
                        <button class="qty-step-btn" data-cart-qty="${item.itemKey}" data-delta="-1">-</button>
                        <span class="qty-value-display">${item.quantity}</span>
                        <button class="qty-step-btn" data-cart-qty="${item.itemKey}" data-delta="1">+</button>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>

          <!-- Right Column: Sticky Order Summary & Checkout -->
          <div class="desktop-cart-summary-col">
            <div class="order-summary-box">
              <h3 style="font-size:1.15rem; font-weight:900; margin-bottom:16px;">${this.t('ملخص الطلب', 'Order Summary')}</h3>

              <!-- Coupon Input Box -->
              <div class="coupon-input-box">
                <input 
                  type="text" 
                  id="coupon-code-input" 
                  placeholder="${this.t('أدخل كود الخصم (FERGANY10)', 'Enter Promo Code')}" 
                  value="${s.appliedCoupon ? s.appliedCoupon.code : ''}"
                  ${s.appliedCoupon ? 'disabled' : ''}
                />
                ${
                  s.appliedCoupon
                    ? `<button id="btn-remove-coupon" style="color:#C62828; font-weight:800; font-size:0.82rem; cursor:pointer;">${this.t('إلغاء', 'Remove')}</button>`
                    : `<button class="coupon-apply-btn" id="btn-apply-coupon">${this.t('تطبيق', 'Apply')}</button>`
                }
              </div>

              <div class="summary-row">
                <span>${this.t('المجموع الفرعي للأصناف', 'Subtotal')}</span>
                <span style="font-weight:700;">${subtotal}.00 ${this.t('ج.م', 'EGP')}</span>
              </div>

              <div class="summary-row">
                <span>${this.t('رسوم التوصيل', 'Delivery Fee')}</span>
                <span style="font-weight:700;">${delivery === 0 ? this.t('مجاناً', 'Free') : `${delivery}.00 ${this.t('ج.م', 'EGP')}`}</span>
              </div>

              ${
                discount > 0
                  ? `
                <div class="summary-row" style="color:var(--color-success); font-weight:800;">
                  <span>${this.t('الخصم المطبق', 'Discount Applied')} (${s.appliedCoupon ? s.appliedCoupon.code : ''})</span>
                  <span>- ${discount}.00 ${this.t('ج.م', 'EGP')}</span>
                </div>
              `
                  : ''
              }

              <div class="summary-row total-row">
                <span>${this.t('الإجمالي النهائي المطلوب', 'Grand Total')}</span>
                <span class="total-amount">${total}.00 ${this.t('ج.م', 'EGP')}</span>
              </div>

              <button class="btn-primary-block" id="btn-proceed-checkout" style="margin-top:20px;">
                <span>${this.t('متابعة إلى تفاصيل وإتمام الطلب', 'Proceed to Checkout')}</span>
                <span>←</span>
              </button>

              <div style="margin-top:14px; text-align:center; font-size:0.75rem; color:var(--color-text-muted);">
                🔒 ${this.t('دفع آمن عند الاستلام أو عبر إنستاباي وفودافون كاش', 'Safe cash on delivery, Vodafone Cash, or InstaPay')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ORDERS HISTORY SCREEN
  // =========================================================================
  renderOrdersTab() {
    const s = store.state;
    const orders = s.orders;

    return `
      <div class="animate-fade" style="padding: 24px 0 40px;">
        <div style="margin-bottom: 24px;">
          <h1 style="font-size:1.5rem; font-weight:900; margin-bottom:4px;">${this.t('سجل طلباتي', 'My Order History')}</h1>
          <p style="font-size:0.85rem; color:var(--color-text-muted);">${this.t('متابعة حالة طلبات مطابخ الشيف فرجاني وإعادة الطلب بسهولة', 'Track your orders and reorder your favorite meals')}</p>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:18px;">
          ${
            orders.length > 0
              ? orders
                  .map((order) => {
                    const statusColor =
                      order.status === 'completed'
                        ? 'var(--color-success)'
                        : order.status === 'delivering'
                        ? 'var(--color-primary)'
                        : 'var(--color-gold)';
                    const statusBg =
                      order.status === 'completed'
                        ? 'var(--color-success-bg)'
                        : order.status === 'delivering'
                        ? 'var(--color-primary-soft)'
                        : 'var(--color-gold-soft)';

                    return `
                    <div style="background:var(--color-white); border-radius:var(--radius-lg); padding:20px; border:1px solid var(--color-bg-warm); box-shadow:var(--shadow-subtle);">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                          <span style="font-weight:900; font-size:1.05rem; color:var(--color-text-dark);">#${order.id}</span>
                          <span style="font-size:0.78rem; color:var(--color-text-light); margin-inline:8px;">${s.lang === 'ar' ? order.date : order.dateEn}</span>
                        </div>
                        <span style="font-size:0.75rem; font-weight:800; color:${statusColor}; background:${statusBg}; padding:4px 12px; border-radius:var(--radius-full);">
                          ${s.lang === 'ar' ? order.statusAr : order.statusEn}
                        </span>
                      </div>

                      <!-- Thumbnails preview row -->
                      <div style="display:flex; gap:10px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px;">
                        ${order.items
                          .map(
                            (it) => `
                          <img src="${it.image}" alt="${s.lang === 'ar' ? it.titleAr : it.titleEn}" style="width:56px; height:56px; border-radius:var(--radius-sm); object-fit:cover; border:1px solid var(--color-bg-warm);" />
                        `
                          )
                          .join('')}
                      </div>

                      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-bg-warm); padding-top:14px;">
                        <div>
                          <span style="font-size:0.78rem; color:var(--color-text-muted); display:block;">${order.itemsCount} ${this.t('أصناف مطلوبة', 'items')}</span>
                          <span style="font-size:1.15rem; font-weight:900; color:var(--color-primary);">${order.total}.00 ${this.t('ج.م', 'EGP')}</span>
                        </div>

                        <button class="branch-select-btn" style="padding:8px 18px;" data-view-order="${order.id}">
                          ${this.t('عرض تفاصيل الطلب', 'View Order Details')}
                        </button>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
              : `
              <div style="text-align:center; padding: 60px 20px; grid-column:1/-1;">
                <span style="font-size:3rem; display:block; margin-bottom:12px;">📋</span>
                <h4>${this.t('لا توجد طلبات سابقة حتى الآن', 'No past orders yet')}</h4>
              </div>
            `
          }
        </div>
      </div>
    `;
  }

  // =========================================================================
  // PROFILE SCREEN
  // =========================================================================
  renderProfileTab() {
    const s = store.state;
    const isClientLoggedIn = Boolean(s.clientUser);
    const displayName = isClientLoggedIn ? s.clientUser.fullName : s.user.name;
    const displayPhone = isClientLoggedIn ? s.clientUser.phone : s.user.phone;

    return `
      <div class="animate-fade" style="padding: 24px 0 40px; max-width:850px; margin:0 auto;">
        <!-- PROFILE CARD -->
        <div style="background:var(--color-white); border-radius:var(--radius-xl); padding:24px; border:1px solid var(--color-bg-warm); box-shadow:var(--shadow-card); display:flex; align-items:center; gap:20px; margin-bottom:24px; flex-wrap:wrap;">
          <div style="width:76px; height:76px; border-radius:50%; background:var(--color-primary-soft); color:var(--color-primary); display:flex; align-items:center; justify-content:center; font-size:2.2rem; font-weight:900; border:3px solid var(--color-primary);">
            👤
          </div>
          <div style="flex:1; min-width:200px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 style="font-size:1.3rem; font-weight:900; margin-bottom:4px;">${displayName}</h2>
              ${
                isClientLoggedIn
                  ? `<span style="background:rgba(34,197,94,0.15); color:#16A34A; border:1px solid rgba(34,197,94,0.3); font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:800;">✓ ${this.t('عميل مسجل', 'Verified')}</span>`
                  : `<span style="background:rgba(245,122,33,0.12); color:var(--color-primary); border:1px solid var(--color-primary-border); font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:800;">${this.t('طلب كزائر', 'Guest')}</span>`
              }
            </div>
            <span style="font-size:0.9rem; color:var(--color-text-muted); display:block;"><bdi dir="ltr" style="direction:ltr; unicode-bidi:isolate; display:inline-block;">${displayPhone}</bdi></span>
            <span style="font-size:0.8rem; color:var(--color-text-light);">${s.user.street}</span>
          </div>

          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <button id="btn-edit-user-profile" class="desktop-action-btn">
              ${this.t('تعديل العنوان ✏️', 'Edit Address ✏️')}
            </button>
            ${
              isClientLoggedIn
                ? `
              <button id="btn-client-logout" class="desktop-action-btn" style="color:#EF4444; border-color:rgba(239,68,68,0.3);">
                ${this.t('تسجيل الخروج 🚪', 'Sign Out 🚪')}
              </button>
            `
                : `
              <button id="btn-profile-login-banner" class="desktop-action-btn" style="background:var(--color-primary); color:#FFF; border-color:var(--color-primary);">
                ${this.t('دخول / تسجيل 🔑', 'Sign In / Register 🔑')}
              </button>
            `
            }
          </div>
        </div>

        <!-- QUICK METRICS ROW -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:28px;">
          <div style="background:var(--color-white); border-radius:var(--radius-lg); padding:16px; text-align:center; border:1px solid var(--color-bg-warm); cursor:pointer; transition:transform 0.2s;" id="profile-open-orders" data-nav="orders">
            <span style="font-size:1.7rem; display:block; margin-bottom:4px;">📋</span>
            <span style="font-size:0.85rem; font-weight:800; color:var(--color-text-dark); display:block;">${this.t('طلباتي', 'My Orders')}</span>
            <span style="font-size:0.95rem; color:var(--color-primary); font-weight:900;">(${s.orders ? s.orders.length : 0})</span>
          </div>

          <div style="background:var(--color-white); border-radius:var(--radius-lg); padding:16px; text-align:center; border:1px solid var(--color-bg-warm); cursor:pointer;" id="profile-open-wishlist">
            <span style="font-size:1.7rem; display:block; margin-bottom:4px;">❤️</span>
            <span style="font-size:0.85rem; font-weight:800; color:var(--color-text-dark); display:block;">${this.t('المفضلة', 'Wishlist')}</span>
            <span style="font-size:0.95rem; color:var(--color-primary); font-weight:900;">(${s.wishlist.length})</span>
          </div>

          <div style="background:var(--color-white); border-radius:var(--radius-lg); padding:16px; text-align:center; border:1px solid var(--color-bg-warm);">
            <span style="font-size:1.7rem; display:block; margin-bottom:4px;">👛</span>
            <span style="font-size:0.85rem; font-weight:800; color:var(--color-text-dark); display:block;">${this.t('المحفظة', 'Wallet')}</span>
            <span style="font-size:0.95rem; color:var(--color-primary); font-weight:900;">150 ${this.t('ج.م', 'EGP')}</span>
          </div>

          <div style="background:var(--color-white); border-radius:var(--radius-lg); padding:16px; text-align:center; border:1px solid var(--color-bg-warm); cursor:pointer;" id="profile-open-coupons">
            <span style="font-size:1.7rem; display:block; margin-bottom:4px;">🎁</span>
            <span style="font-size:0.85rem; font-weight:800; color:var(--color-text-dark); display:block;">${this.t('الكوبونات', 'Coupons')}</span>
            <span style="font-size:0.95rem; color:var(--color-primary); font-weight:900;">(${AVAILABLE_COUPONS.length})</span>
          </div>
        </div>

        <!-- SETTINGS MENU LIST -->
        <div style="background:var(--color-white); border-radius:var(--radius-xl); overflow:hidden; border:1px solid var(--color-bg-warm); box-shadow:var(--shadow-subtle);">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--color-bg-warm); cursor:pointer; background:rgba(245, 122, 33, 0.04);" id="menu-my-orders" data-nav="orders">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">📋</span>
              <div>
                <span style="font-weight:800; font-size:0.95rem; display:block;">${this.t('طلباتي وفواتيري السابقة', 'My Orders & Invoices')}</span>
                <span style="font-size:0.78rem; color:var(--color-text-muted);">${this.t('عرض وتتبع حالة طلباتك الحالية والسابقة', 'Track active orders and previous receipts')}</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:var(--color-primary-soft); color:var(--color-primary); font-weight:800; font-size:0.8rem; padding:3px 10px; border-radius:var(--radius-full);">${s.orders ? s.orders.length : 0} ${this.t('طلب', 'orders')}</span>
              <span style="color:var(--color-primary); font-weight:800;">←</span>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--color-bg-warm); cursor:pointer;" id="menu-lang-switch">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">🌐</span>
              <span style="font-weight:800; font-size:0.95rem;">${this.t('لغة الموقع (Website Language)', 'Language')}</span>
            </div>
            <span style="color:var(--color-primary); font-weight:800; font-size:0.88rem;">${s.lang === 'ar' ? 'العربية' : 'English'}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--color-bg-warm); cursor:pointer;" id="menu-branch-info">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">📍</span>
              <span style="font-weight:800; font-size:0.95rem;">${this.t('معرض وفرع الهرم (شارع العروبة متفرع من ترسا والمريوطية)', 'El Haram Branch Location & Hours')}</span>
            </div>
            <span style="color:var(--color-primary); font-weight:800;">←</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--color-bg-warm); cursor:pointer;" id="menu-chef-story">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">👨‍🍳</span>
              <span style="font-weight:800; font-size:0.95rem;">${this.t('عن الشيف محمد فرجاني وفلسفة الجودة في اللحوم البلدي', 'About Chef Fergany & Quality Promise')}</span>
            </div>
            <span style="color:var(--color-primary); font-weight:800;">←</span>
          </div>

          <a href="https://wa.me/201040925170" target="_blank" style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--color-bg-warm); text-decoration:none; color:inherit;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">💬</span>
              <span style="font-weight:800; font-size:0.95rem;">${this.t('خدمة عملاء المطبخ عبر واتساب', 'Kitchen Support via WhatsApp')}</span>
            </div>
            <span style="color:#25D366; font-weight:800; font-size:0.9rem;"><bdi dir="ltr" style="direction:ltr; unicode-bidi:isolate; display:inline-block;">+201040925170</bdi></span>
          </a>

          <a href="tel:+201040925170" style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; text-decoration:none; color:inherit;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.3rem;">📞</span>
              <span style="font-weight:800; font-size:0.95rem;">${this.t('اتصال هاتفي مباشر لطلب الوجبات والعزومات', 'Call Kitchen Directly')}</span>
            </div>
            <span style="color:var(--color-primary); font-weight:800; font-size:0.9rem;">${this.t('اتصل الآن', 'Call Now')}</span>
          </a>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 4. PROFESSIONAL E-COMMERCE FOOTER
  // =========================================================================
  renderSiteFooter() {
    return `
      <footer class="site-footer">
        <div class="site-container">
          <div class="footer-top-grid">
            <!-- Col 1: Brand Info -->
            <div class="footer-col-brand">
              <div class="footer-brand-header">
                <img src="/assets/chef-fergany-logo.jpg" alt="Chef Fergany" class="footer-brand-logo" />
                <div>
                  <h3>CHEF FERGANY</h3>
                  <span class="brand-sub">${this.t('الشيف في بيتك', 'The Chef In Your Home')}</span>
                </div>
              </div>
              <p class="footer-brand-desc">
                ${this.t(
                  'مطابخ ومعارض الشيف محمد فرجاني بالهرم والجيزة. نقدم أجود أنواع اللحوم البلدي 100% والمصنعات والمشويات الفاخرة المتبلة بأسرار وخبرات الطهاة المحترفين، مجهزة ومعبأة بأعلى معايير السلامة الغذائية لتصلك جاهزة للتسوية الفورية.',
                  'Chef Mohamed Fergany kitchens in Haram & Giza. Delivering premium 100% baladi meats and gourmet ready-to-cook delicacies.'
                )}
              </p>
              <div style="font-size:0.78rem; color:#FFA35C; font-weight:800;">
                🥩 ${this.t('ضمان اللحم البلدي الطازج 100% بدون مواد حافظة', '100% Fresh Baladi Meat Guarantee')}
              </div>
            </div>

            <!-- Col 2: Quick Links -->
            <div>
              <h4 class="footer-heading">${this.t('قائمة المأكولات', 'Menu Categories')}</h4>
              <ul class="footer-links-list">
                <li class="footer-link-item"><button data-nav="catalog">${this.t('الحمام والمحاشي المشكلة', 'Stuffed Pigeon & Mahshi')}</button></li>
                <li class="footer-link-item"><button data-nav="catalog">${this.t('المشويات والكفتة الحاتي', 'Grilled Kofta & Kebabs')}</button></li>
                <li class="footer-link-item"><button data-nav="catalog">${this.t('مصنعات اللحوم البلدي الجاهزة', 'Prepared Fresh Meats')}</button></li>
                <li class="footer-link-item"><button data-nav="catalog">${this.t('طواجن اللحم والفرن', 'Gourmet Oven Tagines')}</button></li>
                <li class="footer-link-item"><button data-nav="catalog">${this.t('صواني العزومات والمناسبات', 'Banquets & Trays')}</button></li>
              </ul>
            </div>

            <!-- Col 3: Customer Care -->
            <div>
              <h4 class="footer-heading">${this.t('خدمة العملاء والتوصيل', 'Customer Service')}</h4>
              <ul class="footer-links-list">
                <li class="footer-link-item"><button data-nav="branches">${this.t('مناطق التوصيل بالجيزة والقاهرة', 'Delivery Zones & Coverage')}</button></li>
                <li class="footer-link-item"><button data-nav="chefStory">${this.t('قصة الشيف محمد فرجاني', 'About Chef Fergany')}</button></li>
                <li class="footer-link-item"><button data-nav="orders">${this.t('متابعة حالة الطلب الحالي', 'Track Active Order')}</button></li>
                <li class="footer-link-item"><button data-nav="profile">${this.t('حسابي وإدارة العناوين', 'My Account & Addresses')}</button></li>
                <li class="footer-link-item"><a href="https://wa.me/201040925170" target="_blank">${this.t('الدعم الفوري عبر واتساب', 'Direct WhatsApp Support')}</a></li>
                <li class="footer-link-item"><a href="#admin" style="color:var(--color-primary); font-weight:700;">🛡️ ${this.t('بوابة الإدارة والمطابخ (Admin)', 'Kitchen Admin Portal')}</a></li>
              </ul>
            </div>

            <!-- Col 4: Branches & Contact -->
            <div>
              <h4 class="footer-heading">${this.t('الفروع ومعلومات التواصل', 'Branch & Contacts')}</h4>
              <div class="footer-contact-item">
                <span class="f-icon">📍</span>
                <span>${this.t('فرع الهرم: شارع العروبة متفرع من ترسا والمريوطية، الهرم، الجيزة', 'El Haram Branch: Orouba St., Tersa / Maryouteya, Giza')}</span>
              </div>
              <div class="footer-contact-item">
                <span class="f-icon">📞</span>
                <span><a href="tel:+201040925170" style="color:#FFF; text-decoration:none; font-weight:800;"><bdi dir="ltr" style="direction:ltr; unicode-bidi:isolate; display:inline-block;">+201040925170</bdi></a></span>
              </div>
              <div class="footer-contact-item">
                <span class="f-icon">💬</span>
                <span><a href="https://wa.me/201040925170" target="_blank" style="color:#25D366; text-decoration:none; font-weight:800;"><bdi dir="ltr" style="direction:ltr; unicode-bidi:isolate; display:inline-block;">+201040925170</bdi> <span>(${this.t('واتساب', 'WhatsApp')})</span></a></span>
              </div>
              <div class="footer-contact-item">
                <span class="f-icon">⏱️</span>
                <span>${this.t('مواعيد العمل: يومياً من 10 صباحاً حتى 12 منتصف الليل', 'Working Hours: Daily 10 AM - Midnight')}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Copyright & Payment Methods -->
          <div class="footer-bottom-bar">
            <div class="footer-bottom-inner">
              <div class="footer-copy-text" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <span>© 2026 ${this.t('مطابخ ومعارض الشيف محمد فرجاني (الشيف في بيتك). جميع الحقوق محفوظة.', 'Chef Mohamed Fergany Kitchens. All rights reserved.')}</span>
                <a href="#admin" style="color:#FFA35C; font-size:0.75rem; text-decoration:none; opacity:0.85; font-weight:800; border:1px solid rgba(255,163,92,0.3); padding:2px 8px; border-radius:4px;">
                  🛡️ ${this.t('لوحة التحكم (Admin)', 'Admin')}
                </a>
              </div>

              <div class="footer-payment-badges">
                <span style="font-size:0.75rem; color:#9E9285; margin-inline-end:6px;">${this.t('طرق الدفع المعتمدة:', 'Accepted Payments:')}</span>
                <span class="payment-pill">💵 ${this.t('كاش عند الاستلام', 'Cash on Delivery')}</span>
                <span class="payment-pill">⚡ ${this.t('إنستاباي InstaPay', 'InstaPay')}</span>
                <span class="payment-pill">📱 ${this.t('فودافون كاش', 'Vodafone Cash')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // =========================================================================
  // 5. MOBILE FLOATING CART & BOTTOM NAV (Mobile Only < 768px)
  // =========================================================================
  renderFloatingCartCapsule() {
    const s = store.state;
    const count = store.getCartItemsCount();
    if (count === 0 || s.activeTab === 'cart' || s.activeTab === 'profile') {
      return '';
    }

    const total = store.getCartTotal();
    return `
      <div class="floating-cart-capsule" id="floating-cart-trigger">
        <div class="capsule-left">
          <span style="font-size:1.3rem;">🛒</span>
          <span class="capsule-count-badge">${count} ${this.t('أصناف', 'items')}</span>
        </div>
        <div class="capsule-right">
          <span>${total}.00 ${this.t('ج.م', 'EGP')}</span>
          <span style="font-size:1.1rem;">←</span>
        </div>
      </div>
    `;
  }

  renderMobileBottomNav() {
    const s = store.state;
    const count = store.getCartItemsCount();

    return `
      <nav class="bottom-nav-bar">
        <button class="nav-tab-btn ${s.activeTab === 'home' && s.selectedCategory !== 'offers' ? 'active' : ''}" data-nav="home">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">${this.t('الرئيسية', 'Home')}</span>
        </button>

        <button class="nav-tab-btn" data-nav="catalog">
          <span class="nav-icon">🍽️</span>
          <span class="nav-label">${this.t('قائمة الأطباق', 'Menu')}</span>
        </button>

        <!-- Floating Center Cart Icon -->
        <button class="nav-cart-btn ${s.activeTab === 'cart' ? 'active' : ''}" data-nav="cart" title="${this.t('سلة المشتريات', 'Shopping Cart')}">
          <span class="cart-icon">🛒</span>
          ${count > 0 ? `<span class="nav-cart-badge">${count}</span>` : ''}
        </button>

        <button class="nav-tab-btn ${s.activeTab === 'home' && s.selectedCategory === 'offers' ? 'active' : ''}" data-nav="offers">
          <span class="nav-icon">🔥</span>
          <span class="nav-label">${this.t('العروض المميزة', 'Offers')}</span>
        </button>

        <button class="nav-tab-btn ${s.activeTab === 'profile' || s.activeTab === 'orders' ? 'active' : ''}" data-nav="profile">
          <span class="nav-icon">👤</span>
          <span class="nav-label">${this.t('حسابي', 'Profile')}</span>
        </button>
      </nav>
    `;
  }

  // =========================================================================
  // 6. ACTIVE MODALS & POPUPS
  // =========================================================================
  renderActiveModal() {
    const s = store.state;
    if (!s.activeModal) return '';

    const { type, data } = s.activeModal;

    if (type === 'clientAuth') {
      return clientAuthModal.render();
    }

    return `
      <div class="modal-overlay" id="modal-backdrop">
        <div class="bottom-sheet-content" id="modal-content-panel">
          <div class="sheet-header-bar">
            <h3 style="font-size:1.05rem; font-weight:800;">
              ${this.getModalTitle(type, data)}
            </h3>
            <button class="sheet-close-btn" id="modal-close-btn">✕</button>
          </div>

          <div class="sheet-body-wrap">
            ${this.renderModalBody(type, data)}
          </div>
        </div>
      </div>
    `;
  }

  getModalTitle(type, data) {
    switch (type) {
      case 'product':
        return this.t('تفاصيل الصنف والإضافات', 'Dish Details & Options');
      case 'checkout':
        return this.t('إتمام وتأكيد بيانات الطلب', 'Confirm Order Details');
      case 'orderSuccess':
        return this.t('تم استلام طلبك بنجاح! 🎉', 'Order Confirmed! 🎉');
      case 'orderDetails':
        return this.t(`تفاصيل الطلب #${data.id}`, `Order #${data.id} Details`);
      case 'branchSelector':
        return this.t('معلومات الفرع والتوصيل', 'Branch & Delivery Zones');
      case 'chefStory':
        return this.t('عن الشيف محمد فرجاني', 'About Chef Mohamed Fergany');
      case 'editProfile':
        return this.t('تعديل البيانات الشخصية', 'Edit Personal Info');
      default:
        return '';
    }
  }

  renderModalBody(type, data) {
    const s = store.state;

    switch (type) {
      case 'product': {
        const product = PRODUCTS.find((p) => p.id === data.productId);
        if (!product) return '';
        const isWishlisted = s.wishlist.includes(product.id);

        return `
          <div>
            <img src="${product.image}" alt="${s.lang === 'ar' ? product.titleAr : product.titleEn}" class="product-modal-hero-img" />

            <div class="product-modal-body">
              <div class="product-meta-row">
                ${product.badgeAr ? `<span class="meta-pill">${s.lang === 'ar' ? product.badgeAr : product.badgeEn}</span>` : ''}
                <span class="meta-pill muted">⚖️ ${s.lang === 'ar' ? product.weightAr : product.weightEn}</span>
                <span class="meta-pill muted">❄️ ${s.lang === 'ar' ? product.storageAr : product.storageEn}</span>
                <span class="meta-pill muted">⏱️ ${s.lang === 'ar' ? product.cookTimeAr : product.cookTimeEn}</span>
              </div>

              <h2 style="font-size:1.25rem; font-weight:800; margin-bottom:4px;">
                ${s.lang === 'ar' ? product.titleAr : product.titleEn}
              </h2>
              <span style="font-size:0.8rem; color:var(--color-text-light); display:block; margin-bottom:10px; font-family:var(--font-latin);">
                ${s.lang === 'ar' ? product.titleEn : product.titleAr}
              </span>

              <p style="font-size:0.85rem; color:var(--color-text-muted); line-height:1.55; margin-bottom:14px;">
                ${s.lang === 'ar' ? product.descriptionAr : product.descriptionEn}
              </p>

              <div class="modal-price-box">
                <span class="modal-price-val">${product.price}.00 ${this.t('ج.م', 'EGP')}</span>
                <span class="modal-unit-val">/ ${s.lang === 'ar' ? product.unitAr : product.unitEn}</span>
              </div>

              <!-- CHEF COOKING GUIDE -->
              ${(() => {
                const guide = this.getCookingInstructions(product);
                return `
                <div class="product-cooking-guide-box">
                  <div class="cooking-guide-header">
                    <span class="guide-icon">${guide.methodIcon}</span>
                    <div style="flex:1;">
                      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:2px;">
                        <h4 class="guide-title">${s.lang === 'ar' ? guide.methodTitleAr : guide.methodTitleEn}</h4>
                        ${guide.verified 
                          ? `<span class="verified-chef-badge">👨‍🍳 ${this.t('معتمد من الشيف فرجاني', 'Chef Verified')}</span>` 
                          : `<span class="unverified-chef-badge">⚠️ ${this.t('قيد مراجعة الشيف', 'Pending Chef Review')}</span>`
                        }
                      </div>
                      <span class="guide-sub">${this.t('إرشادات وتوجيهات التسوية الصحيحة للحفاظ على الجودة والقوام وطراوة اللحوم', 'Proper cooking technique to ensure optimal flavor, crispiness and tenderness')}</span>
                    </div>
                  </div>
                  <div class="cooking-steps-list">
                    ${guide.steps.map((st, idx) => `
                      <div class="cook-step-item">
                        <span class="step-num">${idx + 1}</span>
                        <div>
                          <span>${s.lang === 'ar' ? st.stepAr : st.stepEn}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                `;
              })()}

              <!-- Product Customizable Options -->
              ${
                product.options && product.options.length > 0
                  ? product.options
                      .map((optGroup) => {
                        return `
                      <div class="product-options-group" data-group-id="${optGroup.id}">
                        <h4 class="options-group-title">🔹 ${s.lang === 'ar' ? optGroup.nameAr : optGroup.nameEn}</h4>
                        ${optGroup.choices
                          .map((choice, idx) => {
                            const isDefault = idx === 0;
                            return `
                            <label class="option-choice-item ${isDefault ? 'selected' : ''}">
                              <div class="choice-label">
                                <input type="radio" name="opt_${optGroup.id}" value="${choice.id}" data-extra="${choice.extraPrice}" ${isDefault ? 'checked' : ''} />
                                <span>${s.lang === 'ar' ? choice.nameAr : choice.nameEn}</span>
                              </div>
                              ${choice.extraPrice > 0 ? `<span class="choice-extra-price">+${choice.extraPrice} ${this.t('ج.م', 'EGP')}</span>` : ''}
                            </label>
                          `;
                          })
                          .join('')}
                      </div>
                    `;
                      })
                      .join('')
                  : ''
              }

              <!-- QUANTITY & ADD TO CART ACTION -->
              <div style="display:flex; align-items:center; justify-content:space-between; gap:14px; margin-top:20px; padding-top:16px; border-top:1px solid var(--color-bg-warm);">
                <div class="qty-stepper">
                  <button class="qty-step-btn" id="modal-qty-minus">-</button>
                  <span class="qty-value-display" id="modal-qty-display">1</span>
                  <button class="qty-step-btn" id="modal-qty-plus">+</button>
                </div>

                <button class="card-fav-btn ${isWishlisted ? 'active' : ''}" style="position:static; width:44px; height:44px; font-size:1.2rem;" data-fav-id="${product.id}">
                  ${isWishlisted ? '❤️' : '🤍'}
                </button>

                <button class="btn-primary-block" style="flex:1;" id="modal-add-to-cart-btn" data-product-id="${product.id}">
                  <span>${this.t('أضف إلى السلة', 'Add to Cart')}</span>
                  <span id="modal-total-btn-price">(${product.price}.00 ${this.t('ج.م', 'EGP')})</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      case 'checkout': {
        const isClientLoggedIn = Boolean(s.clientUser);
        const custName = isClientLoggedIn ? s.clientUser.fullName : s.user.name;
        const custPhone = isClientLoggedIn ? s.clientUser.phone : s.user.phone;
        const u = s.user;
        const total = store.getCartTotal();

        return `
          <div style="padding: 18px 24px 28px;">
            <div class="checkout-steps-bar" style="margin:-18px -24px 18px; border-radius:0;">
              <div class="step-indicator active">
                <span class="step-circle">1</span>
                <span>${this.t('بيانات العميل', 'Customer')}</span>
              </div>
              <div class="step-indicator active">
                <span class="step-circle">2</span>
                <span>${this.t('العنوان والتوصيل', 'Delivery')}</span>
              </div>
              <div class="step-indicator active">
                <span class="step-circle">3</span>
                <span>${this.t('طريقة الدفع', 'Payment')}</span>
              </div>
            </div>

            ${
              isClientLoggedIn
                ? `
              <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:var(--radius-sm); padding:10px 14px; font-size:0.8rem; color:#16A34A; display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                <span>✓</span>
                <span>${this.t('طلب عميل مسجل: ' + custPhone + ' (حفظ تلقائي للطلب في حسابك)', 'Signed in as: ' + custPhone)}</span>
              </div>
            `
                : `
              <div style="background:rgba(245,122,33,0.08); border:1px solid rgba(245,122,33,0.2); border-radius:var(--radius-sm); padding:10px 14px; font-size:0.8rem; color:var(--color-primary); display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <span>${this.t('طلب كزائر بدون تسجيل (أو سجل لتتبع طلباتك)', 'Guest checkout (or login to track orders)')}</span>
                <button type="button" id="btn-checkout-switch-login" style="background:none; border:none; color:var(--color-primary); font-weight:800; cursor:pointer; text-decoration:underline;">
                  ${this.t('تسجيل الدخول', 'Sign In')}
                </button>
              </div>
            `
            }

            <form id="checkout-form" style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('الاسم بالكامل', 'Full Name')} *</label>
                <input type="text" name="customerName" value="${custName}" required style="width:100%;" />
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('رقم الهاتف (للتواصل وتأكيد الطلب)', 'Phone Number (Required)')} *</label>
                <input type="tel" name="phone" value="${custPhone}" required style="width:100%; direction:ltr; text-align:${s.lang === 'ar' ? 'right' : 'left'};" />
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:6px;">${this.t('طريقة الاستلام', 'Fulfillment Method')}</label>
                <div class="fulfillment-toggle-row">
                  <div class="toggle-option-card ${s.fulfillmentType === 'delivery' ? 'selected' : ''}" data-checkout-fulfillment="delivery">
                    <span class="icon">🛵</span>
                    <div class="title">${this.t('توصيل للمنزل', 'Home Delivery')}</div>
                  </div>
                  <div class="toggle-option-card ${s.fulfillmentType === 'pickup' ? 'selected' : ''}" data-checkout-fulfillment="pickup">
                    <span class="icon">🏪</span>
                    <div class="title">${this.t('استلام من الفرع', 'Branch Pickup')}</div>
                  </div>
                </div>
              </div>

              ${
                s.fulfillmentType === 'delivery'
                  ? `
                <div>
                  <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('منطقة التوصيل', 'Delivery Zone')}</label>
                  <select name="zoneId" id="checkout-zone-select" style="width:100%;">
                    ${DELIVERY_ZONES.map(
                      (z) => `
                      <option value="${z.id}" ${s.deliveryZoneId === z.id ? 'selected' : ''}>
                        ${s.lang === 'ar' ? `${z.nameAr} (${z.fee} ج.م - ${z.timeAr})` : `${z.nameEn} (${z.fee} EGP - ${z.timeAr.replace('دقيقة', 'mins')})`}
                      </option>
                    `
                    ).join('')}
                  </select>
                </div>

                <div>
                  <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('العنوان بالتفصيل (الشارع، رقم العمارة، الشقة، علامة مميزة)', 'Full Delivery Address')} *</label>
                  <textarea name="address" rows="2" required style="width:100%;">${u.street} - ${u.building} - ${u.apartment}</textarea>
                </div>
              `
                  : `
                <div style="background:var(--color-primary-soft); border-radius:var(--radius-sm); padding:12px 16px; border:1px solid var(--color-primary-border); font-size:0.85rem;">
                  <strong>📍 ${this.t('عنوان الاستلام من الفرع:', 'Pickup Location:')}</strong><br />
                  ${s.lang === 'ar' ? BRANCHES[0].addressAr : BRANCHES[0].addressEn}
                </div>
              `
              }

              <!-- DELIVERY TIMING SCHEDULE -->
              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:6px;">
                  📅 ${this.t('موعد وتوقيت الاستلام المفضل', 'Preferred Timing')}
                </label>
                <div class="delivery-timing-toggle">
                  <div class="timing-choice ${s.deliveryTiming === 'asap' ? 'selected' : ''}" id="choice-timing-asap">
                    <span>🏍️ ${this.t('توصيل فوري (الآن خلال 45 - 60 دقيقة)', 'Instant (Now in 45-60 mins)')}</span>
                  </div>
                  <div class="timing-choice ${s.deliveryTiming === 'scheduled' ? 'selected' : ''}" id="choice-timing-scheduled">
                    <span>📅 ${this.t('حجز مسبق لعزومة / مناسبة', 'Pre-order for a Feast')}</span>
                  </div>
                </div>
                <div id="scheduled-fields-row" style="${s.deliveryTiming === 'scheduled' ? 'display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;' : 'display:none; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;'}">
                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-muted); display:block; margin-bottom:2px;">${this.t('تاريخ المناسبة / اليوم', 'Scheduled Date')}</label>
                    <select name="scheduledDay" id="select-sched-day" style="width:100%;">
                      ${(() => {
                        const now = new Date();
                        const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                        const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                        const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const options = [];
                        for (let i = 0; i < 7; i++) {
                          const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
                          const dayName = s.lang === 'ar' ? arabicDays[d.getDay()] : englishDays[d.getDay()];
                          const monthName = s.lang === 'ar' ? arabicMonths[d.getMonth()] : englishMonths[d.getMonth()];
                          const label = s.lang === 'ar'
                            ? (i === 0 ? `اليوم (${dayName} ${d.getDate()} ${monthName})` : i === 1 ? `غداً (${dayName} ${d.getDate()} ${monthName})` : `${dayName} ${d.getDate()} ${monthName}`)
                            : (i === 0 ? `Today (${dayName} ${d.getDate()} ${monthName})` : i === 1 ? `Tomorrow (${dayName} ${d.getDate()} ${monthName})` : `${dayName} ${d.getDate()} ${monthName}`);
                          const val = `${dayName} ${d.getDate()} ${monthName} ${d.getFullYear()}`;
                          options.push(`<option value="${val}">${label}</option>`);
                        }
                        return options.join('');
                      })()}
                    </select>
                  </div>
                  <div>
                    <label style="font-size:0.75rem; color:var(--color-text-muted); display:block; margin-bottom:2px;">${this.t('فترة التسليم المطلوبة', 'Requested Time Slot')}</label>
                    <select name="scheduledSlot" id="select-sched-slot" style="width:100%;">
                      <option value="12:00 - 2:00 PM">${s.lang === 'ar' ? '12:00 - 2:00 ظهراً (تجهيز الغداء المبكر)' : '12:00 - 2:00 PM (Early Lunch)'}</option>
                      <option value="2:30 - 4:30 PM" selected>${s.lang === 'ar' ? '2:30 - 4:30 عصراً (غداء العزومات الأكثر طلباً)' : '2:30 - 4:30 PM (Main Feast Lunch)'}</option>
                      <option value="5:00 - 7:00 PM">${s.lang === 'ar' ? '5:00 - 7:00 مساءً (المغرب)' : '5:00 - 7:00 PM (Sunset / Dinner)'}</option>
                      <option value="7:30 - 9:30 PM">${s.lang === 'ar' ? '7:30 - 9:30 مساءً (عشاء العائلات)' : '7:30 - 9:30 PM (Family Dinner)'}</option>
                      <option value="10:00 - 11:30 PM">${s.lang === 'ar' ? '10:00 - 11:30 مساءً (طلبات مسائية)' : '10:00 - 11:30 PM (Late Evening)'}</option>
                    </select>
                  </div>
                </div>
                <div style="font-size:0.75rem; color:#FFA35C; background:#2A1E14; padding:6px 10px; border-radius:6px; margin-top:6px; display:flex; align-items:center; gap:6px;">
                  <span>ℹ️</span>
                  <span>${this.t('تنبيه: التوقيت المحدد هو موعد استلام مفضل قيد المراجعة، ويتم تأكيده هاتفياً أو عبر الواتساب فور استلام المطبخ للطلب.', 'Notice: Selected time is a requested preference and will be confirmed via WhatsApp/Phone by our kitchen manager.')}</span>
                </div>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:6px;">${this.t('طريقة الدفع المفضلة', 'Payment Method')}</label>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <label class="option-choice-item selected" style="margin:0;">
                    <div class="choice-label">
                      <input type="radio" name="paymentMethod" value="cash" checked />
                      <span>💵 ${this.t('الدفع نقداً عند الاستلام (كاش)', 'Cash on Delivery (COD)')}</span>
                    </div>
                  </label>
                  <label class="option-choice-item" style="margin:0;">
                    <div class="choice-label">
                      <input type="radio" name="paymentMethod" value="instapay" />
                      <span>⚡ ${this.t('إنستاباي / إنستا باي (InstaPay)', 'InstaPay Transfer')}</span>
                    </div>
                  </label>
                  <label class="option-choice-item" style="margin:0;">
                    <div class="choice-label">
                      <input type="radio" name="paymentMethod" value="vodafone_cash" />
                      <span>📱 ${this.t('محفظة فودافون كاش / محافظ إلكترونية', 'Vodafone Cash / Mobile Wallet')}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('ملاحظات خاصة لمطبخ الشيف', 'Special Kitchen Instructions')}</label>
                <input type="text" name="notes" placeholder="${this.t('مثال: التتبيلة بدون فلفل حار، التسليم بعد الساعة 5', 'e.g. Mild seasoning, deliver at 5 PM')}" style="width:100%;" />
              </div>

              <div style="background:var(--color-page-bg); border-radius:var(--radius-md); padding:14px; margin-top:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:900; font-size:1.15rem;">
                  <span>${this.t('المبلغ المطلوب دفعه:', 'Total Payable:')}</span>
                  <span style="color:var(--color-primary);">${total}.00 ${this.t('ج.م', 'EGP')}</span>
                </div>
              </div>

              <button type="submit" class="btn-primary-block" style="margin-top:10px;">
                <span>${this.t('تأكيد وإرسال الطلب الآن', 'Confirm & Place Order')}</span>
                <span>✓</span>
              </button>
            </form>
          </div>
        `;
      }

      case 'orderSuccess': {
        const order = data;
        const whatsappMsg = encodeURIComponent(
          s.lang === 'ar'
            ? `*طلب جديد من موقع مطابخ الشيف فرجاني*\n` +
                `رقم الطلب: #${order.id}\n` +
                `الاسم: ${order.customerName}\n` +
                `الهاتف: ${order.phone}\n` +
                `طريقة الاستلام: ${order.fulfillmentType === 'delivery' ? 'توصيل للمنزل' : 'استلام من الفرع'}\n` +
                `العنوان: ${order.address || 'فرع الهرم - شارع العروبة'}\n\n` +
                `*الأصناف المطلوبة:*\n` +
                order.items.map((i) => `• ${i.titleAr} (${i.quantity}x) = ${i.price * i.quantity} ج.م`).join('\n') +
                `\n\nالمجموع النهائي: *${order.total} ج.م*\nطريقة الدفع: ${order.paymentMethod}\nملاحظات: ${order.notes || 'لا توجد'}`
            : `*New Order - Chef Fergany Kitchens*\n` +
                `Order ID: #${order.id}\n` +
                `Name: ${order.customerName}\n` +
                `Phone: ${order.phone}\n` +
                `Fulfillment: ${order.fulfillmentType === 'delivery' ? 'Home Delivery' : 'Branch Pickup'}\n` +
                `Address: ${order.address || 'El Haram Branch - El Orouba St.'}\n\n` +
                `*Ordered Items:*\n` +
                order.items.map((i) => `• ${i.titleEn || i.titleAr} (${i.quantity}x) = ${i.price * i.quantity} EGP`).join('\n') +
                `\n\nTotal: *${order.total} EGP*\nPayment: ${order.paymentMethod}\nNotes: ${order.notes || 'None'}`
        );

        return `
          <div class="order-success-hero">
            <div class="success-check-icon animate-fade">✓</div>
            <h2 style="font-size:1.35rem; font-weight:900; color:var(--color-text-dark); margin-bottom:4px;">
              ${this.t('تم إرسال طلبك إلى مطبخ الشيف بنجاح!', 'Your Order Was Sent Successfully!')}
            </h2>
            <p style="font-size:0.88rem; color:var(--color-text-muted); margin-bottom:16px;">
              ${this.t(`طلب رقم #${order.id} قيد المراجعة والتجهيز الفوري`, `Order #${order.id} is being prepared now`)}
            </p>

            <div style="background:var(--color-page-bg); border-radius:var(--radius-md); padding:16px; text-align:${s.lang === 'ar' ? 'right' : 'left'}; margin-bottom:18px; border:1px solid var(--color-bg-warm);">
              <div style="font-size:0.85rem; font-weight:800; color:var(--color-primary); margin-bottom:8px;">
                ⏱️ ${this.t('الوقت المتوقع للتسليم: 35 - 50 دقيقة', 'Estimated Delivery: 35-50 mins')}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--color-text-dark); font-weight:700;">
                <span style="color:var(--color-success);">${this.t('✓ تم التأكيد', '✓ Confirmed')}</span>
                <span style="color:var(--color-primary);" class="animate-pulse">${this.t('🍳 قيد التجهيز', '🍳 Preparing')}</span>
                <span style="color:var(--color-text-light);">${this.t('🛵 في الطريق', '🛵 On the Way')}</span>
                <span style="color:var(--color-text-light);">${this.t('🏠 التسليم', '🏠 Delivered')}</span>
              </div>
            </div>

            <a 
              href="https://wa.me/201040925170?text=${whatsappMsg}" 
              target="_blank" 
              class="whatsapp-dispatch-btn"
            >
              <span>💬</span>
              <span>${this.t('إرسال نسخة الطلب للواتساب للتأكيد السريع', 'Send Order Copy to WhatsApp')}</span>
            </a>

            <button class="btn-primary-block" style="margin-top:12px; background:var(--color-text-dark);" id="btn-view-order-in-list">
              <span>${this.t('عرض الطلب في قسم "طلباتي"', 'View in "My Orders"')}</span>
            </button>
          </div>
        `;
      }

      case 'orderDetails': {
        const order = data;
        return `
          <div style="padding: 18px 24px 28px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div>
                <span style="font-size:1.2rem; font-weight:900;">#${order.id}</span>
                <span style="font-size:0.82rem; color:var(--color-text-light); display:block;">${s.lang === 'ar' ? order.date : order.dateEn}</span>
              </div>
              <span style="font-size:0.8rem; font-weight:800; color:var(--color-primary); background:var(--color-primary-soft); padding:4px 14px; border-radius:var(--radius-full);">
                ${s.lang === 'ar' ? order.statusAr : order.statusEn}
              </span>
            </div>

            <div style="background:var(--color-page-bg); border-radius:var(--radius-md); padding:14px; margin-bottom:16px; font-size:0.85rem;">
              <div style="margin-bottom:6px;"><strong>${this.t('العميل:', 'Customer:')}</strong> ${order.customerName} (${order.phone})</div>
              <div style="margin-bottom:6px;"><strong>${this.t('العنوان:', 'Address:')}</strong> ${order.address || this.t('استلام من الفرع', 'Branch Pickup')}</div>
              <div><strong>${this.t('الفرع المسؤول:', 'Branch:')}</strong> ${s.lang === 'ar' ? (order.branchNameAr || 'فرع الهرم - شارع العروبة') : (order.branchNameEn || 'El Haram - El Orouba Branch')}</div>
            </div>

            <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:10px;">${this.t('قائمة الأصناف:', 'Items List:')}</h4>
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
              ${order.items
                .map(
                  (it) => `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--color-white); border:1px solid var(--color-bg-warm); border-radius:var(--radius-sm); padding:10px 14px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${it.image}" alt="" style="width:42px; height:42px; border-radius:var(--radius-xs); object-fit:cover;" />
                    <span style="font-size:0.88rem; font-weight:800;">${s.lang === 'ar' ? it.titleAr : it.titleEn} (${it.quantity}x)</span>
                  </div>
                  <span style="font-size:0.95rem; font-weight:900; color:var(--color-primary);">${it.price * it.quantity}.00 ${this.t('ج.م', 'EGP')}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div style="border-top:1px solid var(--color-bg-warm); padding-top:12px; font-size:0.9rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>${this.t('المجموع الفرعي', 'Subtotal')}</span>
                <span>${order.subtotal}.00 ${this.t('ج.م', 'EGP')}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>${this.t('رسوم التوصيل', 'Delivery Fee')}</span>
                <span>${order.deliveryFee}.00 ${this.t('ج.م', 'EGP')}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:900; font-size:1.15rem; margin-top:8px; color:var(--color-primary);">
                <span>${this.t('الإجمالي النهائي', 'Total')}</span>
                <span>${order.total}.00 ${this.t('ج.م', 'EGP')}</span>
              </div>
            </div>
          </div>
        `;
      }

      case 'branchSelector': {
        const b = BRANCHES[0];
        return `
          <div style="padding: 18px 24px 28px;">
            <div style="background:var(--color-primary-soft); border-radius:var(--radius-lg); padding:18px; border:1px solid var(--color-primary-border); margin-bottom:18px;">
              <h3 style="font-size:1.1rem; font-weight:900; color:var(--color-primary); margin-bottom:6px;">📍 ${s.lang === 'ar' ? b.nameAr : b.nameEn}</h3>
              <p style="font-size:0.85rem; color:var(--color-text-dark); line-height:1.5; margin-bottom:10px;">${s.lang === 'ar' ? b.addressAr : b.addressEn}</p>
              <div style="font-size:0.8rem; color:var(--color-text-muted); line-height:1.6;">
                ⏱️ ${this.t('مواعيد العمل:', 'Working Hours:')} ${s.lang === 'ar' ? b.hoursAr : b.hoursEn}<br />
                🛵 ${this.t('مدة التوصيل التقريبية:', 'Estimated Delivery:')} ${s.lang === 'ar' ? b.deliveryTimeAr : b.deliveryTimeEn}<br />
                📞 ${this.t('أرقام الطلبات المباشرة:', 'Direct Ordering Phones:')} <bdi dir="ltr" style="direction:ltr; unicode-bidi:isolate; display:inline-block; font-weight:800; color:var(--color-text-dark);">+201040925170</bdi>
              </div>
            </div>

            <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:10px;">${this.t('مناطق التوصيل المغطاة بالجيزة والقاهرة:', 'Delivery Coverage Zones & Estimated Fees:')}</h4>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
              ${DELIVERY_ZONES.map(
                (z) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-page-bg); border-radius:var(--radius-sm); padding:10px 14px; font-size:0.85rem;">
                  <span>🛵 ${s.lang === 'ar' ? z.nameAr : z.nameEn}</span>
                  <span style="font-weight:800; color:var(--color-primary);">${z.fee} ${this.t('ج.م', 'EGP')} (${s.lang === 'ar' ? z.timeAr : z.timeEn})</span>
                </div>
              `
              ).join('')}
            </div>

            <div style="display:flex; gap:12px;">
              <a href="tel:${b.phone}" class="btn-primary-block" style="flex:1; text-decoration:none;">
                <span>📞 ${this.t('اتصال هاتفي', 'Call Branch')}</span>
              </a>
              <a href="https://wa.me/${b.whatsapp}" target="_blank" class="whatsapp-dispatch-btn" style="flex:1; margin-top:0; text-decoration:none;">
                <span>💬 ${this.t('واتساب الفرع', 'Branch WhatsApp')}</span>
              </a>
            </div>
          </div>
        `;
      }

      case 'chefStory': {
        return `
          <div style="padding: 20px 24px 28px;">
            <div style="text-align:center; margin-bottom:18px;">
              <img src="/assets/chef-mohamed-fergany.jpg" alt="Chef Fergany" style="width:110px; height:110px; border-radius:50%; object-fit:cover; border:3px solid var(--color-primary); margin:0 auto 10px;" />
              <h3 style="font-size:1.25rem; font-weight:900;">${this.t('الشيف محمد فرجاني', 'Chef Mohamed Fergany')}</h3>
              <span style="font-size:0.85rem; color:var(--color-primary); font-weight:800;">${this.t('مؤسس مطابخ ومعارض فرجاني - الشيف في بيتك', 'Founder of Fergany Gourmet Meats & Kitchens')}</span>
            </div>

            <p style="font-size:0.88rem; color:var(--color-text-muted); line-height:1.7; margin-bottom:16px;">
              ${this.t(
                'تأسست معارض ومطابخ <strong>الشيف فرجاني</strong> في الهرم والجيزة على مبدأ أساسي: إعادة تعريف تجربة الطهي البيتي الفاخر. نوفر للأسرة المصرية أجود أنواع اللحوم البلدي 100% والمشويات والمصنعات المتبلة بأسرار وخبرات الطهاة المحترفين، مجهزة ومعبأة بأعلى معايير السلامة الغذائية لتصلك جاهزة للتسوية الفورية.',
                'Chef Fergany Gourmet Kitchens was founded in El Haram and Giza on a clear core principle: delivering authentic royal Egyptian dining to every home. We specialize in 100% fresh Egyptian baladi meats hand-marinated with Chef Fergany signature spices, vacuum-sealed and temperature-controlled to reach your door oven-ready.'
              )}
            </p>

            <div style="background:var(--color-page-bg); border-radius:var(--radius-lg); padding:16px; font-size:0.85rem; border:1px solid var(--color-bg-warm); line-height:1.8;">
              <strong style="color:var(--color-primary); font-size:0.95rem;">${this.t('ضمان فرجاني الذهبي:', 'The Fergany Golden Quality Promise:')}</strong><br />
              ${this.t(
                '• لحوم بلدي طازجة منتقاة بعناية يومياً من مذابح معتمدة.<br />• بدون أي مواد حافظة أو إضافات كيميائية.<br />• عبوات حرارية وتبريد محكم يحافظ على الطعم الأصلي والقيمة الغذائية.<br />• سرعة في التوصيل لجميع أحياء الجيزة والقاهرة الكبرى.',
                '• 100% Fresh Baladi meat sourced daily from certified abattoirs.<br />• Zero chemical additives or artificial tenderizers.<br />• Sterile vacuum sealing and thermal packaging preserving original taste and nutrition.<br />• Fast delivery across all Giza and Greater Cairo neighborhoods.'
              )}
            </div>
          </div>
        `;
      }

      case 'editProfile': {
        const u = s.user;
        return `
          <div style="padding: 18px 24px 28px;">
            <form id="edit-profile-form" style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('الاسم', 'Name')}</label>
                <input type="text" name="name" value="${u.name}" required style="width:100%;" />
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('رقم الهاتف', 'Phone')}</label>
                <input type="tel" name="phone" value="${u.phone}" required style="width:100%; direction:ltr; text-align:${s.lang === 'ar' ? 'right' : 'left'};" />
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('العنوان بالكامل', 'Full Address')}</label>
                <input type="text" name="street" value="${u.street}" style="width:100%;" />
              </div>

              <button type="submit" class="btn-primary-block" style="margin-top:10px;">
                ${this.t('حفظ التعديلات', 'Save Changes')}
              </button>
            </form>
          </div>
        `;
      }

      case 'addReview': {
        const u = s.user;
        const recentOrder = s.orders && s.orders.length > 0 ? s.orders[0] : null;
        return `
          <div style="padding: 20px 24px 28px;">
            <div style="text-align:center; margin-bottom:18px;">
              <span style="font-size:2.2rem; display:block; margin-bottom:6px;">✍️</span>
              <h3 style="font-size:1.25rem; font-weight:900; color:var(--color-text-dark); margin-bottom:4px;">
                ${this.t('إضافة تقييم موثق لمطابخ الشيف فرجاني', 'Submit a Verified Review')}
              </h3>
              <p style="font-size:0.84rem; color:var(--color-text-muted);">
                ${this.t('رأيك يهمنا ويساعدنا في تحسين وتطوير أطباقنا وخدمتنا باستمرار.', 'Your honest feedback helps us maintain our premium culinary standards.')}
              </p>
            </div>

            <form id="add-review-form" style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">
                  ${this.t('رقم الطلب (للتحقق من الشراء)', 'Order Number (For Verification)')} *
                </label>
                <input type="text" name="orderId" placeholder="${this.t('مثال: 12345', 'e.g. 12345')}" value="${recentOrder ? recentOrder.id : ''}" required style="width:100%;" />
                <span style="font-size:0.75rem; color:var(--color-text-light); display:block; margin-top:2px;">
                  ${this.t('يتم منح شارة "مشترٍ معتمد" تلقائياً عند مطابقة رقم طلب مسجل', 'Verified Buyer badge is automatically granted when matched with an order')}
                </span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('اسمك الكريم', 'Your Name')} *</label>
                  <input type="text" name="author" value="${u.name}" required style="width:100%;" />
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('المنطقة / الحي', 'Area / City')} *</label>
                  <input type="text" name="location" value="${this.t('الهرم - الجيزة', 'El Haram - Giza')}" required style="width:100%;" />
                </div>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('الصنف الذي جربته', 'Dish Tried')}</label>
                <input type="text" name="dishTitle" placeholder="${this.t('مثال: حمام محشي / كفتة حاتي / صينية العزومات', 'e.g. Stuffed Pigeon / Grilled Kofta / Feast Tray')}" value="${recentOrder && recentOrder.items[0] ? (s.lang === 'ar' ? recentOrder.items[0].titleAr : recentOrder.items[0].titleEn) : ''}" style="width:100%;" />
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('التقييم العام', 'Rating')}</label>
                <select name="rating" style="width:100%;">
                  <option value="5">⭐⭐⭐⭐⭐ ${this.t('(ممتاز جداً - 5 نجوم)', '(Excellent - 5 Stars)')}</option>
                  <option value="4">⭐⭐⭐⭐ ${this.t('(جيد جداً - 4 نجوم)', '(Very Good - 4 Stars)')}</option>
                  <option value="3">⭐⭐⭐ ${this.t('(متوسط - 3 نجوم)', '(Average - 3 Stars)')}</option>
                  <option value="2">⭐⭐ ${this.t('(أقل من المتوقع)', '(Below Average)')}</option>
                  <option value="1">⭐ ${this.t('(غير راضٍ)', '(Dissatisfied)')}</option>
                </select>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">${this.t('تفاصيل تجربتك ورأيك الصادق', 'Your Review')} *</label>
                <textarea name="quote" rows="3" required placeholder="${this.t('حدثنا عن جودة اللحوم، التتبيلة، التغليف، سرعة التوصيل وطريقة التسوية...', 'Tell us about the meat quality, seasoning, delivery, packaging...')}" style="width:100%;"></textarea>
              </div>

              <button type="submit" class="btn-primary-block" style="margin-top:6px;">
                ${this.t('إرسال ونشر التقييم ⭐️', 'Submit & Publish Review ⭐️')}
              </button>
            </form>
          </div>
        `;
      }

      default:
        return '';
    }
  }

  // Toast pill
  renderToast() {
    const t = store.state.toast;
    if (!t) return '';
    return `
      <div class="toast-capsule ${t.type}">
        <span>${t.type === 'success' ? '✓' : t.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
        <span>${t.message}</span>
      </div>
    `;
  }

  formatSelectedOptionsSummary(selectedOpts, product) {
    if (!selectedOpts || Object.keys(selectedOpts).length === 0) {
      return '';
    }
    const s = store.state;
    const parts = [];
    if (product.options) {
      product.options.forEach((grp) => {
        const choiceId = selectedOpts[grp.id];
        const match = grp.choices.find((c) => c.id === choiceId);
        if (match) {
          parts.push(s.lang === 'ar' ? match.nameAr : match.nameEn);
        }
      });
    }
    return parts.join(' • ');
  }

  // =========================================================================
  // 7. EVENT LISTENERS BINDING
  // =========================================================================
  bindViewEvents() {
    // Brand header click -> Go home
    const brandHomeBtns = [
      document.getElementById('btn-brand-home'),
      document.getElementById('btn-brand-home-mobile')
    ];
    brandHomeBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          store.setSelectedCategory('all');
          store.setActiveTab('home');
        });
      }
    });

    // Navigation triggers (data-nav attributes)
    document.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const navTarget = btn.dataset.nav;
        if (navTarget === 'home') {
          store.setSelectedCategory('all');
          store.setActiveTab('home');
        } else if (navTarget === 'catalog') {
          store.setActiveTab('home');
          setTimeout(() => {
            const catElem = document.getElementById('catalog-section');
            if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        } else if (navTarget === 'offers') {
          store.setSelectedCategory('offers');
          store.setActiveTab('home');
          setTimeout(() => {
            const catElem = document.getElementById('catalog-section');
            if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        } else if (navTarget === 'chefStory') {
          store.openModal('chefStory');
        } else if (navTarget === 'branches') {
          store.openModal('branchSelector');
        } else if (['search', 'cart', 'orders', 'profile'].includes(navTarget)) {
          store.setActiveTab(navTarget);
        }
      });
    });

    // Branch selector buttons
    const branchBtns = [
      document.getElementById('btn-select-branch'),
      document.getElementById('btn-select-branch-mobile')
    ];
    branchBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => store.openModal('branchSelector'));
      }
    });

    // Language Toggle is handled robustly via global delegated event listener in bindGlobalEvents()

    // Search Inputs: Desktop & Mobile
    const desktopSearch = document.getElementById('desktop-search-input');
    if (desktopSearch) {
      desktopSearch.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
        if (store.state.activeTab !== 'search') {
          store.setActiveTab('search');
        }
      });
      desktopSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          store.setSearchQuery(e.target.value);
          store.setActiveTab('search');
        }
      });
    }

    const mobileSearch = document.getElementById('mobile-search-input');
    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
        if (store.state.activeTab !== 'search') {
          store.setActiveTab('search');
        }
      });
    }

    const liveSearchInput = document.getElementById('live-search-input');
    if (liveSearchInput) {
      liveSearchInput.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
      });
    }

    // Clear search
    const clearSearchBtn = document.getElementById('btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        store.setSearchQuery('');
      });
    }

    const resetSearchBtn = document.getElementById('btn-reset-search');
    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        store.setSearchQuery('');
        store.setSelectedCategory('all');
      });
    }

    // Floating cart capsule click (Mobile)
    const floatingCart = document.getElementById('floating-cart-trigger');
    if (floatingCart) {
      floatingCart.addEventListener('click', () => {
        store.setActiveTab('cart');
      });
    }

    // Hero buttons
    const heroOrderBtn = document.getElementById('hero-order-now-btn');
    if (heroOrderBtn) {
      heroOrderBtn.addEventListener('click', () => {
        const catElem = document.getElementById('catalog-section');
        if (catElem) {
          catElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    const heroOffersBtn = document.getElementById('hero-offers-btn');
    if (heroOffersBtn) {
      heroOffersBtn.addEventListener('click', () => {
        store.setSelectedCategory('offers');
        const catElem = document.getElementById('catalog-section');
        if (catElem) {
          catElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Hero Chef Chic Card -> Chef Story Modal
    const heroChefBtn = document.getElementById('hero-scroll-to-chef');
    if (heroChefBtn) {
      heroChefBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.openModal('chefStory');
      });
    }

    const heroChefCard = document.getElementById('hero-chef-card');
    if (heroChefCard) {
      heroChefCard.addEventListener('click', () => {
        store.openModal('chefStory');
      });
    }

    // Claim offer button
    const claimOfferBtn = document.getElementById('btn-claim-offer');
    if (claimOfferBtn) {
      claimOfferBtn.addEventListener('click', () => {
        store.applyCoupon('FERGANY10');
      });
    }

    // Category tabs/chips click
    document.querySelectorAll('.category-tab-btn, .category-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const catId = chip.dataset.catId;
        if (catId) {
          this.quickTagFilter = 'all';
          store.setSelectedCategory(catId);
        }
      });
    });

    // Quick Tag Pills click
    document.querySelectorAll('.quick-tag-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        this.quickTagFilter = pill.dataset.filterTag;
        this.render();
        const catElem = document.getElementById('catalog-section');
        if (catElem) {
          catElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Reset Filters Buttons
    const resetFiltersHandler = () => {
      this.quickTagFilter = 'all';
      store.setSelectedCategory('all');
      this.render();
      const catElem = document.getElementById('catalog-section');
      if (catElem) {
        catElem.scrollIntoView({ behavior: 'smooth' });
      }
    };
    const resetFiltersBtn = document.getElementById('btn-reset-filters');
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFiltersHandler);
    const resetFiltersEmptyBtn = document.getElementById('btn-reset-filters-empty');
    if (resetFiltersEmptyBtn) resetFiltersEmptyBtn.addEventListener('click', resetFiltersHandler);

    // Feast Calculator: guest size selector
    document.querySelectorAll('[data-calc-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.calcState.size = btn.dataset.calcSize;
        this.calcState.customQty = {}; // reset custom quantities to package defaults
        this.render();
        const calcElem = document.getElementById('feast-calculator');
        if (calcElem) {
          calcElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Feast Calculator: Custom item stepper buttons
    document.querySelectorAll('[data-calc-item]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = btn.dataset.calcItem;
        const dir = parseInt(btn.dataset.calcDir, 10);
        const pkg = this.getFeastPackage(this.calcState.size, this.calcState.style);
        const targetItem = pkg.items.find((it) => it.productId === productId);
        if (targetItem) {
          const currentQty = this.calcState.customQty[productId] !== undefined ? this.calcState.customQty[productId] : targetItem.qty;
          const nextQty = Math.max(1, currentQty + dir);
          this.calcState.customQty[productId] = nextQty;
          this.render();
          const calcElem = document.getElementById('feast-calculator');
          if (calcElem) {
            calcElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Feast Calculator: Add all items to cart
    const addFeastBtn = document.getElementById('btn-add-feast-package');
    if (addFeastBtn) {
      addFeastBtn.addEventListener('click', () => {
        const pkg = this.getFeastPackage(this.calcState.size, this.calcState.style);
        const itemsToAdd = pkg.items
          .map((it) => {
            const p = PRODUCTS.find((prod) => prod.id === it.productId);
            return {
              product: p,
              selectedOptions: {},
              quantity: it.qty
            };
          })
          .filter((it) => it.product);

        store.addMultipleToCart(
          itemsToAdd,
          store.state.lang === 'ar'
            ? `تمت إضافة تشكيلة "${pkg.titleAr}" إلى السلة بنجاح مع التوصيل المجاني! 👑`
            : `Added "${pkg.titleEn}" package to cart with Free Delivery! 👑`
        );
      });
    }

    // Review Modal triggers & submission
    const openReviewModalHandler = () => {
      store.openModal('addReview');
    };
    const openRevBtn = document.getElementById('btn-open-review-modal');
    if (openRevBtn) openRevBtn.addEventListener('click', openReviewModalHandler);
    const openRevEmptyBtn = document.getElementById('btn-open-review-modal-empty');
    if (openRevEmptyBtn) openRevEmptyBtn.addEventListener('click', openReviewModalHandler);

    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(reviewForm);
        store.addReview({
          orderId: formData.get('orderId'),
          author: formData.get('author'),
          location: formData.get('location'),
          dishTitle: formData.get('dishTitle'),
          rating: formData.get('rating'),
          quote: formData.get('quote')
        });
      });
    }

    // See All link
    document.querySelectorAll('[data-show-category]').forEach((el) => {
      el.addEventListener('click', () => {
        const cat = el.dataset.showCategory;
        this.quickTagFilter = 'all';
        store.setSelectedCategory(cat);
        const catElem = document.getElementById('catalog-section');
        if (catElem) {
          catElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Open Product Details Modal
    document.querySelectorAll('[data-trigger="open-product"]').forEach((el) => {
      el.addEventListener('click', () => {
        const productId = el.dataset.productId;
        store.openModal('product', { productId });
      });
    });

    // Quick Add Button (+) on cards
    document.querySelectorAll('[data-quick-add]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.dataset.quickAdd;
        const product = PRODUCTS.find((p) => p.id === pId);
        if (product) {
          if (product.options && product.options.length > 0) {
            store.openModal('product', { productId: pId });
          } else {
            store.addToCart(product, {}, 1);
          }
        }
      });
    });

    // Favorite heart button
    document.querySelectorAll('[data-fav-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.dataset.favId;
        store.toggleWishlist(pId);
      });
    });

    // Modal close button and backdrop click
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => store.closeModal());
    }

    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          store.closeModal();
        }
      });
    }

    // Product Modal: Option choices selection & recalculation
    const optionRadios = document.querySelectorAll('input[type="radio"][name^="opt_"]');
    if (optionRadios.length > 0) {
      optionRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          const group = radio.closest('.product-options-group');
          if (group) {
            group.querySelectorAll('.option-choice-item').forEach((item) => item.classList.remove('selected'));
            radio.closest('.option-choice-item').classList.add('selected');
          }
          this.recalculateModalTotal();
        });
      });
    }

    // Product Modal: Qty stepper
    let modalQty = 1;
    const qtyDisplay = document.getElementById('modal-qty-display');
    const minusBtn = document.getElementById('modal-qty-minus');
    const plusBtn = document.getElementById('modal-qty-plus');

    if (minusBtn && plusBtn && qtyDisplay) {
      minusBtn.addEventListener('click', () => {
        if (modalQty > 1) {
          modalQty--;
          qtyDisplay.textContent = modalQty;
          this.recalculateModalTotal(modalQty);
        }
      });
      plusBtn.addEventListener('click', () => {
        modalQty++;
        qtyDisplay.textContent = modalQty;
        this.recalculateModalTotal(modalQty);
      });
    }

    // Product Modal: Add to Cart button
    const modalAddBtn = document.getElementById('modal-add-to-cart-btn');
    if (modalAddBtn) {
      modalAddBtn.addEventListener('click', () => {
        const pId = modalAddBtn.dataset.productId;
        const product = PRODUCTS.find((p) => p.id === pId);
        if (!product) return;

        const selectedOptions = {};
        if (product.options) {
          product.options.forEach((optGroup) => {
            const checked = document.querySelector(`input[name="opt_${optGroup.id}"]:checked`);
            if (checked) {
              selectedOptions[optGroup.id] = checked.value;
            }
          });
        }

        store.addToCart(product, selectedOptions, modalQty);
        store.closeModal();
      });
    }

    // Cart: Quantity +/- stepper
    document.querySelectorAll('[data-cart-qty]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.cartQty;
        const delta = parseInt(btn.dataset.delta, 10);
        store.updateCartQuantity(key, delta);
      });
    });

    // Cart: Delete item
    document.querySelectorAll('[data-delete-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.deleteKey;
        store.removeFromCart(key);
      });
    });

    // Cart: Clear cart
    const clearCartBtn = document.getElementById('btn-clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm(this.t('هل أنت متأكد من رغبتك في تفريغ السلة بالكامل؟', 'Are you sure you want to clear your cart?'))) {
          store.clearCart();
        }
      });
    }

    // Cart: Empty state browse button
    const browseEmptyBtn = document.getElementById('btn-empty-cart-browse');
    if (browseEmptyBtn) {
      browseEmptyBtn.addEventListener('click', () => {
        store.setSelectedCategory('all');
        store.setActiveTab('home');
      });
    }

    // Cart: Apply Coupon
    const applyCouponBtn = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('coupon-code-input');
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener('click', () => {
        store.applyCoupon(couponInput.value);
      });
    }

    const removeCouponBtn = document.getElementById('btn-remove-coupon');
    if (removeCouponBtn) {
      removeCouponBtn.addEventListener('click', () => {
        store.removeCoupon();
      });
    }

    // Cart: Fulfillment toggle (Delivery vs Pickup)
    document.querySelectorAll('[data-fulfillment]').forEach((card) => {
      card.addEventListener('click', () => {
        const type = card.dataset.fulfillment;
        store.setFulfillmentType(type);
      });
    });

    // Cart: Proceed to Checkout
    const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', () => {
        store.openModal('checkout');
      });
    }

    // Checkout: Fulfillment toggle inside modal
    document.querySelectorAll('[data-checkout-fulfillment]').forEach((card) => {
      card.addEventListener('click', () => {
        const type = card.dataset.checkoutFulfillment;
        store.setFulfillmentType(type);
      });
    });

    // Checkout: Zone select change
    const checkoutZoneSelect = document.getElementById('checkout-zone-select');
    if (checkoutZoneSelect) {
      checkoutZoneSelect.addEventListener('change', (e) => {
        store.setDeliveryZone(e.target.value);
      });
    }

    // Checkout: Delivery timing toggle
    const timingAsap = document.getElementById('choice-timing-asap');
    const timingSched = document.getElementById('choice-timing-scheduled');
    const schedRow = document.getElementById('scheduled-fields-row');

    if (timingAsap && timingSched) {
      timingAsap.addEventListener('click', () => {
        store.state.deliveryTiming = 'asap';
        timingAsap.classList.add('selected');
        timingSched.classList.remove('selected');
        if (schedRow) schedRow.style.display = 'none';
      });

      timingSched.addEventListener('click', () => {
        store.state.deliveryTiming = 'scheduled';
        timingSched.classList.add('selected');
        timingAsap.classList.remove('selected');
        if (schedRow) schedRow.style.display = 'grid';
      });
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(checkoutForm);
        const timingChoice = store.state.deliveryTiming;
        const schedDay = formData.get('scheduledDay') || '';
        const schedSlot = formData.get('scheduledSlot') || '';
        const timingStr =
          timingChoice === 'scheduled'
            ? (store.state.lang === 'ar' ? `حجز مسبق: ${schedDay} (${schedSlot})` : `Pre-order: ${schedDay} (${schedSlot})`)
            : (store.state.lang === 'ar' ? 'توصيل فوري (الآن)' : 'Immediate Delivery (Now)');

        const orderData = {
          name: formData.get('customerName'),
          phone: formData.get('phone'),
          address: formData.get('address') || (store.state.lang === 'ar' ? 'استلام من الفرع' : 'Branch Pickup'),
          paymentMethod: formData.get('paymentMethod'),
          deliveryTiming: timingChoice,
          scheduledDate: schedDay,
          scheduledSlot: schedSlot,
          notes: `${timingStr}${formData.get('notes') ? ' - ' + formData.get('notes') : ''}`
        };

        // Prepare backend order payload
        const cartItems = store.state.cart.map((it) => ({
          menuItemId: it.product.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        }));

        // Send to backend API asynchronously (supports logged in clients & guests)
        api
          .createOrder({
            customerName: orderData.name,
            customerPhone: orderData.phone,
            deliveryAddressSnapshot: orderData.address,
            totalAmount: store.getCartTotal(),
            paymentMethod: 'CASH_ON_DELIVERY',
            notes: orderData.notes,
            items: cartItems
          })
          .then((backendOrder) => {
            if (backendOrder) {
              adminPortal.adminOrders.unshift(backendOrder);
              adminPortal.playNotificationSound();
            }
          })
          .catch(() => {
            // graceful offline fallback
          });

        store.placeOrder(orderData);
      });
    }

    // Order Success Modal: View in orders tab
    const viewOrdersBtn = document.getElementById('btn-view-order-in-list');
    if (viewOrdersBtn) {
      viewOrdersBtn.addEventListener('click', () => {
        store.closeModal();
        store.setActiveTab('orders');
      });
    }

    // Order details button in Orders Tab
    document.querySelectorAll('[data-view-order]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.viewOrder;
        const order = store.state.orders.find((o) => o.id === orderId);
        if (order) {
          store.openModal('orderDetails', order);
        }
      });
    });

    // Client Authentication Modal Triggers
    const clientAuthBtn = document.getElementById('btn-open-client-auth');
    if (clientAuthBtn) {
      clientAuthBtn.addEventListener('click', () => {
        if (store.state.clientUser) {
          store.setActiveTab('profile');
        } else {
          store.openModal('clientAuth');
        }
      });
    }

    const profileLoginBannerBtn = document.getElementById('btn-profile-login-banner');
    if (profileLoginBannerBtn) {
      profileLoginBannerBtn.addEventListener('click', () => {
        store.openModal('clientAuth');
      });
    }

    const checkoutSwitchLoginBtn = document.getElementById('btn-checkout-switch-login');
    if (checkoutSwitchLoginBtn) {
      checkoutSwitchLoginBtn.addEventListener('click', () => {
        store.openModal('clientAuth');
      });
    }

    // Client Logout
    const clientLogoutBtn = document.getElementById('btn-client-logout');
    if (clientLogoutBtn) {
      clientLogoutBtn.addEventListener('click', () => {
        api.clientLogout();
        store.logoutClient();
        store.showToast(this.t('تم تسجيل الخروج بنجاح 👋', 'Signed out successfully 👋'), 'info');
      });
    }

    // Bind Client Auth Modal internal events if open
    if (store.state.activeModal?.type === 'clientAuth') {
      clientAuthModal.bindEvents();
    }

    // Admin Route Triggers (from footer or elsewhere)
    document.querySelectorAll('a[href="#admin"], [data-nav="admin"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        store.state.currentRoute = 'admin';
        window.location.hash = '#admin';
        adminPortal.loadData();
        this.render();
      });
    });

    // Profile Screen Buttons
    const editProfileBtn = document.getElementById('btn-edit-user-profile');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        store.openModal('editProfile');
      });
    }

    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
      editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(editProfileForm);
        store.setState({
          user: {
            ...store.state.user,
            name: formData.get('name'),
            phone: formData.get('phone'),
            street: formData.get('street')
          }
        });
        store.closeModal();
        store.showToast(this.t('تم تحديث البيانات بنجاح', 'Profile updated'), 'success');
      });
    }

    const profileWishlistBtn = document.getElementById('profile-open-wishlist');
    if (profileWishlistBtn) {
      profileWishlistBtn.addEventListener('click', () => {
        store.setSelectedCategory('all');
        store.setActiveTab('home');
      });
    }

    const profileCouponsBtn = document.getElementById('profile-open-coupons');
    if (profileCouponsBtn) {
      profileCouponsBtn.addEventListener('click', () => {
        alert(
          this.t(
            'كوبونات الخصم النشطة لمطابخ الشيف فرجاني:\n\n1. FERGANY10 (خصم 10% على جميع الأصناف)\n2. WELCOME (توصيل مجاني للطلب الأول)\n3. CHEF50 (خصم 50 ج.م على الطلبات فوق 500 ج.م)',
            'Active Promo Coupons for Chef Fergany Kitchens:\n\n1. FERGANY10 (10% off on all items)\n2. WELCOME (Free delivery on your first order)\n3. CHEF50 (50 EGP off on orders above 500 EGP)'
          )
        );
      });
    }

    // menu-lang-switch is handled by global delegated event listener in bindGlobalEvents()

    const menuBranchInfo = document.getElementById('menu-branch-info');
    if (menuBranchInfo) {
      menuBranchInfo.addEventListener('click', () => {
        store.openModal('branchSelector');
      });
    }

    const menuChefStory = document.getElementById('menu-chef-story');
    if (menuChefStory) {
      menuChefStory.addEventListener('click', () => {
        store.openModal('chefStory');
      });
    }
  }

  // =========================================================================
  // ADMIN AUTH & DASHBOARD EVENT BINDINGS
  // =========================================================================
  bindAdminLoginEvents() {
    const form = document.getElementById('admin-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('admin-login-id')?.value.trim();
        const password = document.getElementById('admin-login-password')?.value;
        const submitBtn = document.getElementById('btn-submit-admin-login');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'جاري التحقق من الصلاحيات...';
        }

        try {
          const res = await api.adminLogin(identifier, password);
          store.setAdminUser(res.admin || { fullName: 'Super Admin', role: 'SUPER_ADMIN' });
          await adminPortal.loadData();
          store.showToast(store.state.lang === 'ar' ? 'تم تسجيل دخول لوحة التحكم بنجاح 👑' : 'Admin logged in 👑', 'success');
          this.render();
        } catch (err) {
          store.showToast(err.message || 'بيانات الدخول غير صحيحة', 'warn');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = '🔐 تسجيل الدخول للوحة التحكم';
          }
        }
      });
    }

    const backLink = document.getElementById('link-back-to-store');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        store.state.currentRoute = 'storefront';
        window.location.hash = '';
        this.render();
      });
    }
  }

  bindAdminDashboardEvents() {
    const handleLogout = () => {
      api.adminLogout();
      store.logoutAdmin();
      store.state.currentRoute = 'storefront';
      window.location.hash = '';
      store.showToast(store.state.lang === 'ar' ? 'تم تسجيل الخروج من لوحة التحكم' : 'Admin logged out', 'info');
      this.render();
    };

    const handleViewStore = () => {
      store.state.currentRoute = 'storefront';
      window.location.hash = '';
      this.render();
    };

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const headerLogoutBtn = document.getElementById('btn-header-logout');
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

    const viewStoreBtn = document.getElementById('btn-admin-view-store');
    if (viewStoreBtn) viewStoreBtn.addEventListener('click', handleViewStore);

    const headerViewStoreBtn = document.getElementById('btn-header-view-store');
    if (headerViewStoreBtn) headerViewStoreBtn.addEventListener('click', handleViewStore);

    // Delegate dashboard events to adminPortal
    adminPortal.bindEvents();
  }

  recalculateModalTotal(qty = 1) {
    const modalAddBtn = document.getElementById('modal-add-to-cart-btn');
    const totalBtnPrice = document.getElementById('modal-total-btn-price');
    if (!modalAddBtn || !totalBtnPrice) return;

    const pId = modalAddBtn.dataset.productId;
    const product = PRODUCTS.find((p) => p.id === pId);
    if (!product) return;

    let extra = 0;
    document.querySelectorAll('input[type="radio"][name^="opt_"]:checked').forEach((radio) => {
      const extraVal = parseFloat(radio.dataset.extra) || 0;
      extra += extraVal;
    });

    const total = (product.price + extra) * qty;
    totalBtnPrice.textContent = `(${total}.00 ${this.t('ج.م', 'EGP')})`;
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ChefApp();
});
