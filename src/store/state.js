// Global Reactive State Store for Chef Fergany Web Application
import { PRODUCTS } from '../data/products.js';
import { BRANCHES, DELIVERY_ZONES } from '../data/branches.js';
import { AVAILABLE_COUPONS } from '../data/coupons.js';

const STORAGE_KEYS = {
  CART: 'chef_fergany_cart_v1',
  WISHLIST: 'chef_fergany_wishlist_v1',
  ORDERS: 'chef_fergany_orders_v1',
  USER: 'chef_fergany_user_v1',
  CLIENT_USER: 'chef_fergany_client_user_v1',
  ADMIN_USER: 'chef_fergany_admin_user_v1',
  LANG: 'chef_fergany_lang_v1',
  FULFILLMENT: 'chef_fergany_fulfillment_v1',
  REVIEWS: 'chef_fergany_reviews_v1'
};

const INITIAL_ORDERS = [
  {
    id: '12345',
    date: '19 أكتوبر 2026',
    dateEn: '19 Oct 2026',
    status: 'delivering', // 'preparing' | 'delivering' | 'completed'
    statusAr: 'جاري التوصيل',
    statusEn: 'Out for Delivery',
    items: [
      { productId: 'hamam-mahshi-rice', titleAr: 'حمام محشي جاهز على التسوية', titleEn: 'Stuffed Pigeon', quantity: 2, price: 280, image: '/assets/dishes/hamam_mahshi_dish.jpg' },
      { productId: 'kofta-hati-shish-combo', titleAr: 'كفتة مشوية مع شيش طاووق', titleEn: 'Kofta & Shish Combo', quantity: 1, price: 285, image: '/assets/dishes/kofta_grilled_shish.jpg' },
      { productId: 'sambousek-mix-cheese', titleAr: 'سمبوسك مكس جبن كيري', titleEn: 'Cheese Sambousek', quantity: 1, price: 95, image: '/assets/dishes/sambousek_cheese_dish.jpg' }
    ],
    itemsCount: 3,
    subtotal: 940,
    deliveryFee: 40,
    discount: 0,
    total: 980,
    fulfillmentType: 'delivery',
    branchNameAr: 'الهرم - شارع العروبة',
    branchNameEn: 'El Haram - El Orouba',
    customerName: 'أحمد محمد',
    phone: '+201040925170',
    address: 'شارع الهرم الرئيسي، برج الصفا، شقة 14'
  },
  {
    id: '12344',
    date: '8 أكتوبر 2026',
    dateEn: '8 Oct 2026',
    status: 'completed',
    statusAr: 'مكتملة',
    statusEn: 'Delivered',
    items: [
      { productId: 'chicken-mahshi-special', titleAr: 'دجاج بلدي محشي أرز', titleEn: 'Stuffed Chicken', quantity: 1, price: 250, image: '/assets/dishes/chicken_mahshi_dish.jpg' },
      { productId: 'special-meat-tajine', titleAr: 'طاجن لحمة كوندوز بالبصل', titleEn: 'Beef Tagine', quantity: 1, price: 285, image: '/assets/dishes/special_tajine_pot.jpg' },
      { productId: 'sambousek-mix-cheese', titleAr: 'سمبوسك مكس جبن', titleEn: 'Cheese Sambousek', quantity: 2, price: 95, image: '/assets/dishes/sambousek_cheese_dish.jpg' },
      { productId: 'hawawshi-baladi-crisp', titleAr: 'حواوشي لحم بلدي', titleEn: 'Baladi Hawawshi', quantity: 1, price: 90, image: '/assets/dishes/hawawshi_baladi_crispy.jpg' }
    ],
    itemsCount: 5,
    subtotal: 720,
    deliveryFee: 40,
    discount: 40,
    total: 720,
    fulfillmentType: 'delivery',
    branchNameAr: 'الهرم - شارع العروبة',
    branchNameEn: 'El Haram - El Orouba',
    customerName: 'أحمد محمد',
    phone: '+201040925170',
    address: 'شارع فيصل، محطة المساحة، برج النور'
  }
];

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      lang: this.loadStorage(STORAGE_KEYS.LANG, 'ar'),
      activeTab: 'home', // 'home' | 'categories' | 'search' | 'cart' | 'orders' | 'profile'
      selectedCategory: 'all',
      searchQuery: '',
      cart: this.loadStorage(STORAGE_KEYS.CART, []),
      wishlist: this.loadStorage(STORAGE_KEYS.WISHLIST, ['hamam-mahshi-rice', 'kofta-hati-shish-combo']),
      orders: this.loadStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
      activeBranchId: 'haram-orouba',
      fulfillmentType: this.loadStorage(STORAGE_KEYS.FULFILLMENT, 'delivery'), // 'delivery' | 'pickup'
      deliveryZoneId: 'haram_maryouteya',
      appliedCoupon: null,
      user: this.loadStorage(STORAGE_KEYS.USER, {
        name: 'أحمد محمد',
        phone: '+201040925170',
        city: 'الجيزة',
        street: 'شارع الهرم الرئيسي، برج الصفا',
        building: 'عمارة 14',
        floor: 'الدور الرابع',
        apartment: 'شقة 402',
        landmark: 'بجوار مدرسة الزهراء',
        notes: 'الرجاء رن الجرس والتسليم على الباب'
      }),
      clientUser: this.loadStorage(STORAGE_KEYS.CLIENT_USER, null),
      adminUser: this.loadStorage(STORAGE_KEYS.ADMIN_USER, null),
      currentRoute: window.location.hash.startsWith('#admin') ? 'admin' : 'storefront',
      adminTab: 'orders', // 'orders' | 'menu' | 'categories' | 'customers'
      adminSoundEnabled: true,
      deliveryTiming: 'asap', // 'asap' | 'scheduled'
      scheduledDate: '',
      scheduledTime: '',
      reviews: this.loadStorage(STORAGE_KEYS.REVIEWS, []),
      activeModal: null, // { type, data }
      toast: null // { message, type: 'info' | 'success' | 'warn' }
    };
  }

  loadStorage(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  saveStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  setLang(lang) {
    this.state.lang = lang;
    this.saveStorage(STORAGE_KEYS.LANG, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.notify();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  setSelectedCategory(catId) {
    this.state.selectedCategory = catId;
    this.notify();
  }

  setSearchQuery(q) {
    this.state.searchQuery = q;
    this.notify();
  }

  setFulfillmentType(type) {
    this.state.fulfillmentType = type;
    this.saveStorage(STORAGE_KEYS.FULFILLMENT, type);
    this.notify();
  }

  setDeliveryZone(zoneId) {
    this.state.deliveryZoneId = zoneId;
    this.notify();
  }

  // Cart Operations
  addToCart(product, selectedOptions = {}, quantity = 1) {
    const optionKey = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}:${v}`)
      .sort()
      .join('|');
    const itemKey = `${product.id}__${optionKey}`;

    // calculate unit price with options
    let extraPrice = 0;
    if (product.options && selectedOptions) {
      product.options.forEach((optGroup) => {
        const chosenId = selectedOptions[optGroup.id];
        const match = optGroup.choices.find((c) => c.id === chosenId);
        if (match && match.extraPrice) {
          extraPrice += match.extraPrice;
        }
      });
    }

    const unitPrice = product.price + extraPrice;
    const existingIndex = this.state.cart.findIndex((item) => item.itemKey === itemKey);

    let updatedCart = [...this.state.cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        itemKey,
        product,
        selectedOptions,
        unitPrice,
        quantity
      });
    }

    this.state.cart = updatedCart;
    this.saveStorage(STORAGE_KEYS.CART, updatedCart);
    this.showToast(
      this.state.lang === 'ar'
        ? `تمت إضافة "${product.titleAr}" إلى السلة`
        : `Added "${product.titleEn}" to cart`,
      'success'
    );
    this.notify();
  }

  addMultipleToCart(items, customToastMsg = '') {
    let updatedCart = [...this.state.cart];
    items.forEach(({ product, selectedOptions = {}, quantity = 1 }) => {
      const optionKey = Object.entries(selectedOptions)
        .map(([k, v]) => `${k}:${v}`)
        .sort()
        .join('|');
      const itemKey = `${product.id}__${optionKey}`;

      let extraPrice = 0;
      if (product.options && selectedOptions) {
        product.options.forEach((optGroup) => {
          const chosenId = selectedOptions[optGroup.id];
          const match = optGroup.choices.find((c) => c.id === chosenId);
          if (match && match.extraPrice) {
            extraPrice += match.extraPrice;
          }
        });
      }

      const unitPrice = product.price + extraPrice;
      const existingIndex = updatedCart.findIndex((item) => item.itemKey === itemKey);
      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart.push({
          itemKey,
          product,
          selectedOptions,
          unitPrice,
          quantity
        });
      }
    });

    this.state.cart = updatedCart;
    this.saveStorage(STORAGE_KEYS.CART, updatedCart);
    this.showToast(
      customToastMsg ||
        (this.state.lang === 'ar'
          ? `تمت إضافة التشكيلة بالكامل إلى السلة بنجاح! 👑`
          : `Package added to cart successfully! 👑`),
      'success'
    );
    this.notify();
  }

  setDeliveryTiming(timing, date = '', time = '') {
    this.state.deliveryTiming = timing;
    this.state.scheduledDate = date;
    this.state.scheduledTime = time;
    this.notify();
  }

  updateCartQuantity(itemKey, delta) {
    let updatedCart = this.state.cart
      .map((item) => {
        if (item.itemKey === itemKey) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    this.state.cart = updatedCart;
    this.saveStorage(STORAGE_KEYS.CART, updatedCart);
    this.notify();
  }

  removeFromCart(itemKey) {
    const updatedCart = this.state.cart.filter((i) => i.itemKey !== itemKey);
    this.state.cart = updatedCart;
    this.saveStorage(STORAGE_KEYS.CART, updatedCart);
    this.notify();
  }

  clearCart() {
    this.state.cart = [];
    this.state.appliedCoupon = null;
    this.saveStorage(STORAGE_KEYS.CART, []);
    this.notify();
  }

  // Wishlist
  toggleWishlist(productId) {
    const exists = this.state.wishlist.includes(productId);
    let updated = exists
      ? this.state.wishlist.filter((id) => id !== productId)
      : [...this.state.wishlist, productId];
    this.state.wishlist = updated;
    this.saveStorage(STORAGE_KEYS.WISHLIST, updated);
    this.showToast(
      exists
        ? (this.state.lang === 'ar' ? 'تم الحذف من المفضلة' : 'Removed from wishlist')
        : (this.state.lang === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to wishlist'),
      'info'
    );
    this.notify();
  }

  // Coupon
  applyCoupon(codeStr) {
    const code = codeStr.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === code);
    const subtotal = this.getCartSubtotal();

    if (!coupon) {
      this.showToast(
        this.state.lang === 'ar' ? 'كود الخصم غير صحيح' : 'Invalid promo code',
        'warn'
      );
      return false;
    }

    if (subtotal < coupon.minOrder) {
      this.showToast(
        this.state.lang === 'ar'
          ? `الحد الأدنى للطلب لتطبيق هذا الكوبون هو ${coupon.minOrder} ج.م`
          : `Minimum order for this coupon is ${coupon.minOrder} EGP`,
        'warn'
      );
      return false;
    }

    this.state.appliedCoupon = coupon;
    this.showToast(
      this.state.lang === 'ar' ? `تم تفعيل الخصم: ${coupon.titleAr}` : `Coupon applied: ${coupon.titleEn}`,
      'success'
    );
    this.notify();
    return true;
  }

  removeCoupon() {
    this.state.appliedCoupon = null;
    this.notify();
  }

  // Calculations
  getCartSubtotal() {
    return this.state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  getCartItemsCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getDeliveryFee() {
    if (this.state.fulfillmentType === 'pickup') return 0;

    const zone = DELIVERY_ZONES.find((z) => z.id === this.state.deliveryZoneId);
    const standardFee = zone ? zone.fee : 40;

    // Delivery discount coupon
    if (this.state.appliedCoupon && this.state.appliedCoupon.type === 'delivery_discount') {
      return 0;
    }

    // Free delivery check against net payable merchandise amount
    const grossSubtotal = this.getCartSubtotal();
    const itemDiscount =
      this.state.appliedCoupon && this.state.appliedCoupon.type !== 'delivery_discount'
        ? this.getDiscountAmount()
        : 0;
    const netSubtotal = Math.max(0, grossSubtotal - itemDiscount);

    if (netSubtotal >= 600) {
      // Standard local zones (fees <= 40 EGP: Haram, Faisal) are 100% free (0 EGP)
      // Remote zones (October, Zayed, Greater Cairo) get 40 EGP discount, customer pays only remote differential
      return Math.max(0, standardFee - 40);
    }

    return standardFee;
  }

  getDiscountAmount() {
    const subtotal = this.getCartSubtotal();
    if (!this.state.appliedCoupon) return 0;
    if (this.state.appliedCoupon.type === 'percent') {
      return Math.round((subtotal * this.state.appliedCoupon.value) / 100);
    }
    if (this.state.appliedCoupon.type === 'fixed') {
      return this.state.appliedCoupon.value;
    }
    if (this.state.appliedCoupon.type === 'delivery_discount') {
      return 40;
    }
    return 0;
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const delivery = this.getDeliveryFee();
    const discount = this.getDiscountAmount();
    return Math.max(0, subtotal + delivery - discount);
  }

  // Modals & Popups
  openModal(type, data = null) {
    this.state.activeModal = { type, data };
    document.body.style.overflow = 'hidden';
    this.notify();
  }

  closeModal() {
    this.state.activeModal = null;
    document.body.style.overflow = '';
    this.notify();
  }

  showToast(message, type = 'info') {
    this.state.toast = { message, type, id: Date.now() };
    this.notify();
    setTimeout(() => {
      if (this.state.toast && Date.now() - this.state.toast.id >= 2800) {
        this.state.toast = null;
        this.notify();
      }
    }, 3000);
  }

  // Orders
  placeOrder(orderData) {
    const isScheduled = orderData.deliveryTiming === 'scheduled';
    const newOrder = {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      date: new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date()),
      dateEn: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date()),
      status: isScheduled ? 'pending_confirmation' : 'preparing',
      statusAr: isScheduled ? 'موعد مطلوب - بانتظار تأكيد المطبخ' : 'قيد التجهيز بمطبخ الشيف',
      statusEn: isScheduled ? 'Requested Timing - Pending Confirmation' : 'Preparing in Kitchen',
      deliveryTiming: isScheduled ? 'scheduled' : 'asap',
      scheduledDate: orderData.scheduledDate || '',
      scheduledSlot: orderData.scheduledSlot || '',
      isTimeConfirmed: false,
      items: this.state.cart.map((item) => ({
        productId: item.product.id,
        titleAr: item.product.titleAr,
        titleEn: item.product.titleEn,
        quantity: item.quantity,
        price: item.unitPrice,
        image: item.product.image,
        selectedOptions: item.selectedOptions
      })),
      itemsCount: this.getCartItemsCount(),
      subtotal: this.getCartSubtotal(),
      deliveryFee: this.getDeliveryFee(),
      discount: this.getDiscountAmount(),
      total: this.getCartTotal(),
      fulfillmentType: this.state.fulfillmentType,
      branchNameAr: 'الهرم - شارع العروبة',
      branchNameEn: 'El Haram - El Orouba',
      paymentMethod: orderData.paymentMethod,
      customerName: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      notes: orderData.notes,
      timestamp: Date.now()
    };

    const updatedOrders = [newOrder, ...this.state.orders];
    this.state.orders = updatedOrders;
    this.saveStorage(STORAGE_KEYS.ORDERS, updatedOrders);

    // Save user info
    const updatedUser = {
      ...this.state.user,
      name: orderData.name,
      phone: orderData.phone,
      street: orderData.address
    };
    this.state.user = updatedUser;
    this.saveStorage(STORAGE_KEYS.USER, updatedUser);

    // Reset delivery timing state
    this.state.deliveryTiming = 'asap';
    this.state.scheduledDate = '';
    this.state.scheduledTime = '';

    // Clear Cart
    this.clearCart();

    // Open Success Modal with Order details
    this.openModal('orderSuccess', newOrder);
    return newOrder;
  }

  // Customer Reviews Verification System
  addReview(reviewData) {
    const existingOrder = this.state.orders.find((o) => o.id === String(reviewData.orderId).trim());
    const isVerifiedPurchase = Boolean(existingOrder);

    const newReview = {
      id: 'rev_' + Date.now(),
      orderId: reviewData.orderId || '',
      isVerifiedPurchase,
      author: reviewData.author || (this.state.lang === 'ar' ? 'عميل مطابخ فرجاني' : 'Chef Fergany Customer'),
      location: reviewData.location || (this.state.lang === 'ar' ? 'الجيزة' : 'Giza'),
      rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
      quote: reviewData.quote || '',
      dishTitle: reviewData.dishTitle || (existingOrder && existingOrder.items[0] ? (this.state.lang === 'ar' ? existingOrder.items[0].titleAr : existingOrder.items[0].titleEn) : (this.state.lang === 'ar' ? 'صينية عزومات فرجاني' : 'Fergany Feast Platter')),
      date: new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date()),
      dateEn: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date()),
      timestamp: Date.now()
    };

    const updated = [newReview, ...this.state.reviews];
    this.state.reviews = updated;
    this.saveStorage(STORAGE_KEYS.REVIEWS, updated);

    this.showToast(
      this.state.lang === 'ar'
        ? (isVerifiedPurchase 
            ? 'شكراً لك! تم اعتماد تقييمك كمشترٍ موثق ونشره بنجاح ⭐️' 
            : 'شكراً لك! تم إرسال تقييمك بنجاح.')
        : 'Thank you! Your verified review has been submitted successfully ⭐️',
      'success'
    );
    this.closeModal();
    this.notify();
    return newReview;
  }

  // Client Auth Management
  setClientUser(clientUser) {
    this.state.clientUser = clientUser;
    this.saveStorage(STORAGE_KEYS.CLIENT_USER, clientUser);
    if (clientUser && clientUser.phone) {
      this.state.user.name = clientUser.fullName || this.state.user.name;
      this.state.user.phone = clientUser.phone;
      this.saveStorage(STORAGE_KEYS.USER, this.state.user);
    }
    this.notify();
  }

  logoutClient() {
    this.state.clientUser = null;
    this.saveStorage(STORAGE_KEYS.CLIENT_USER, null);
    localStorage.removeItem('chef_auth_token');
    this.showToast(this.state.lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
    this.notify();
  }

  // Admin Auth Management
  setAdminUser(adminUser) {
    this.state.adminUser = adminUser;
    this.saveStorage(STORAGE_KEYS.ADMIN_USER, adminUser);
    this.notify();
  }

  logoutAdmin() {
    this.state.adminUser = null;
    this.saveStorage(STORAGE_KEYS.ADMIN_USER, null);
    localStorage.removeItem('chef_admin_token');
    this.state.currentRoute = 'storefront';
    window.location.hash = '';
    this.showToast(this.state.lang === 'ar' ? 'تم تسجيل خروج الأدمن' : 'Admin logged out', 'info');
    this.notify();
  }

  setCurrentRoute(route) {
    this.state.currentRoute = route;
    if (route === 'admin') {
      window.location.hash = '#admin';
    } else {
      window.location.hash = '';
    }
    this.notify();
  }

  setAdminTab(tab) {
    this.state.adminTab = tab;
    this.notify();
  }

  toggleAdminSound() {
    this.state.adminSoundEnabled = !this.state.adminSoundEnabled;
    this.showToast(
      this.state.adminSoundEnabled
        ? (this.state.lang === 'ar' ? 'تم تفعيل التنبيهات الصوتية للطلبات' : 'Sound notifications enabled')
        : (this.state.lang === 'ar' ? 'تم كتم التنبيهات الصوتية' : 'Sound notifications muted'),
      'info'
    );
    this.notify();
  }
}

export const store = new StateStore();
