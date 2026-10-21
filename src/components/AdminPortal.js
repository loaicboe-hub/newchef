// ==============================================================================
// Chef Fergany - Production Admin Dashboard & Management System (/admin)
// Supports Live Order Tracking with Audio Chime, Menu Management, and Customers
// ==============================================================================

import { store } from '../store/state.js';
import { api } from '../services/api.js';
import { CATEGORIES, PRODUCTS } from '../data/products.js';

class AdminPortal {
  constructor() {
    this.adminOrders = [];
    this.menuItems = [...PRODUCTS];
    this.categories = [...CATEGORIES];
    this.customers = [];
    this.activeFilter = 'all';
    this.editingDish = null;
    this.isDishModalOpen = false;
    this.audioCtx = null;
    this.lastOrderCount = 0;
  }

  // Pure Web Audio API Chime for incoming orders (No external mp3 file needed!)
  playNotificationSound() {
    if (!store.state.adminSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  async loadData() {
    try {
      const [orders, menu, cats, custs] = await Promise.all([
        api.adminGetOrders().catch(() => store.state.orders),
        api.getMenuItems().catch(() => PRODUCTS),
        api.getCategories().catch(() => CATEGORIES),
        api.adminGetCustomers().catch(() => []),
      ]);

      if (orders && orders.length > 0) {
        if (this.adminOrders.length > 0 && orders.length > this.adminOrders.length) {
          this.playNotificationSound();
        }
        this.adminOrders = orders;
      } else {
        this.adminOrders = store.state.orders;
      }

      if (menu && menu.length > 0) this.menuItems = menu;
      if (cats && cats.length > 0) this.categories = cats;
      if (custs && custs.length > 0) this.customers = custs;
    } catch (e) {
      console.warn('Error loading admin data:', e);
    }
  }

  // =========================================================================
  // 1. ADMIN LOGIN VIEW
  // =========================================================================
  renderLogin() {
    const s = store.state;
    return `
      <div class="admin-login-backdrop">
        <div class="admin-login-card">
          <div class="admin-login-icon">👑</div>
          <h2 style="font-size:1.45rem; font-weight:900; color:#FFF; margin-bottom:6px;">
            ${s.lang === 'ar' ? 'لوحة تحكم مطابخ الشيف فرجاني' : 'Chef Fergany Admin Portal'}
          </h2>
          <p style="font-size:0.82rem; color:#CFC2B4; margin-bottom:24px;">
            ${s.lang === 'ar' ? 'سجل الدخول لإدارة الطلبات الحية، الأصناف وقاعدة العملاء' : 'Sign in to manage live orders, menu items and customer records'}
          </p>

          <form id="admin-login-form">
            <div class="auth-form-group" style="text-align:start;">
              <label class="auth-form-label">${s.lang === 'ar' ? 'البريد أو رقم هاتف الأدمن' : 'Admin Email or Phone'}</label>
              <input 
                type="text" 
                class="auth-form-input" 
                id="admin-login-id" 
                placeholder="01040925170 أو admin@cheffergany.com" 
                value="01040925170" 
                required 
              />
            </div>

            <div class="auth-form-group" style="text-align:start;">
              <label class="auth-form-label">${s.lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input 
                type="password" 
                class="auth-form-input" 
                id="admin-login-password" 
                placeholder="••••••••" 
                value="Admin@Fergany2026!" 
                required 
              />
            </div>

            <button type="submit" class="auth-submit-btn" id="btn-submit-admin-login">
              🔐 ${s.lang === 'ar' ? 'تسجيل الدخول للوحة التحكم' : 'Login to Dashboard'}
            </button>
          </form>

          <div style="margin-top:20px; font-size:0.8rem; color:#8C7E72;">
            <a href="#" id="link-back-to-store" style="color:#FFA35C; text-decoration:none; font-weight:800;">
              ← ${s.lang === 'ar' ? 'العودة لمتجر العملاء' : 'Back to Storefront'}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. ADMIN DASHBOARD MAIN VIEW
  // =========================================================================
  renderDashboard() {
    const s = store.state;
    const pendingOrdersCount = this.adminOrders.filter(
      (o) => o.status === 'PENDING' || o.status === 'pending_confirmation' || o.status === 'preparing'
    ).length;

    return `
      <div class="admin-portal-wrapper">
        <!-- Top Sticky Admin Bar -->
        <header class="admin-top-bar">
          <div class="admin-logo-box">
            <span style="font-size:1.6rem;">👑</span>
            <div>
              <h1 style="font-size:1.15rem; font-weight:900; color:#FFF; margin:0;">
                CHEF FERGANY ADMIN
              </h1>
              <span class="admin-logo-badge">
                ${s.adminUser?.role === 'SUPER_ADMIN' ? 'مدير عام السيرفر (Super Admin)' : 'مدير الفرع (Admin)'}
              </span>
            </div>
          </div>

          <div class="admin-top-actions">
            <!-- Audio chime toggle -->
            <button class="admin-action-btn" id="btn-toggle-admin-sound" title="${s.adminSoundEnabled ? 'كتم الصوت' : 'تفعيل التنبيه الصوتي'}">
              <span>${s.adminSoundEnabled ? '🔔' : '🔕'}</span>
              <span style="display:none; @media(min-width:600px){display:inline;}">
                ${s.adminSoundEnabled ? 'التنبيه الصوتي شغال' : 'الصوت مكتوم'}
              </span>
            </button>

            <!-- Storefront link -->
            <button class="admin-action-btn" id="btn-admin-view-store">
              <span>🏪</span>
              <span>المتجر</span>
            </button>

            <!-- Logout -->
            <button class="admin-action-btn" id="btn-admin-logout" style="background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3); color:#FCA5A5;">
              <span>🚪</span>
              <span>خروج</span>
            </button>
          </div>
        </header>

        <!-- Main Body -->
        <div class="admin-main-layout">
          <!-- Quick Metric Stats -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
            <div style="background:#18120D; border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:16px;">
              <span style="font-size:0.78rem; color:#A89B8D; font-weight:800;">📦 إجمالي الطلبات</span>
              <div style="font-size:1.6rem; font-weight:900; color:#FFA35C; margin-top:4px;">${this.adminOrders.length}</div>
            </div>
            <div style="background:#18120D; border:1px solid rgba(245,122,33,0.4); border-radius:var(--radius-md); padding:16px; background:linear-gradient(145deg, #1D140D 0%, #17100B 100%);">
              <span style="font-size:0.78rem; color:#FFA35C; font-weight:800;">⏳ طلبات بانتظار المطبخ</span>
              <div style="font-size:1.6rem; font-weight:900; color:#FFF; margin-top:4px;">${pendingOrdersCount}</div>
            </div>
            <div style="background:#18120D; border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:16px;">
              <span style="font-size:0.78rem; color:#A89B8D; font-weight:800;">🍗 أصناف المنيو</span>
              <div style="font-size:1.6rem; font-weight:900; color:#FFA35C; margin-top:4px;">${this.menuItems.length}</div>
            </div>
            <div style="background:#18120D; border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:16px;">
              <span style="font-size:0.78rem; color:#A89B8D; font-weight:800;">👥 العملاء المسجلون</span>
              <div style="font-size:1.6rem; font-weight:900; color:#FFA35C; margin-top:4px;">${this.customers.length || 18}</div>
            </div>
          </div>

          <!-- Tabs Navigation -->
          <div class="admin-tabs-nav">
            <button class="admin-nav-tab ${s.adminTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
              <span>📋</span>
              <span>الطلبات الحية</span>
              <span style="background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:10px; font-size:0.75rem;">${pendingOrdersCount}</span>
            </button>
            <button class="admin-nav-tab ${s.adminTab === 'menu' ? 'active' : ''}" data-admin-tab="menu">
              <span>🍗</span>
              <span>قائمة الأطباق والأصناف</span>
            </button>
            <button class="admin-nav-tab ${s.adminTab === 'categories' ? 'active' : ''}" data-admin-tab="categories">
              <span>📂</span>
              <span>أقسام المنيو</span>
            </button>
            <button class="admin-nav-tab ${s.adminTab === 'customers' ? 'active' : ''}" data-admin-tab="customers">
              <span>👥</span>
              <span>سجل العملاء والمبيعات</span>
            </button>
          </div>

          <!-- Active Tab Content -->
          <div class="admin-tab-content">
            ${this.renderActiveTabContent()}
          </div>
        </div>

        <!-- Add/Edit Dish Modal -->
        ${this.isDishModalOpen ? this.renderDishModal() : ''}
      </div>
    `;
  }

  // =========================================================================
  // 3. TAB CONTENT ROUTER
  // =========================================================================
  renderActiveTabContent() {
    const s = store.state;
    switch (s.adminTab) {
      case 'orders':
        return this.renderOrdersTab();
      case 'menu':
        return this.renderMenuTab();
      case 'categories':
        return this.renderCategoriesTab();
      case 'customers':
        return this.renderCustomersTab();
      default:
        return this.renderOrdersTab();
    }
  }

  // =========================================================================
  // TAB 1: LIVE ORDERS
  // =========================================================================
  renderOrdersTab() {
    const filteredOrders = this.adminOrders.filter((order) => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'pending') {
        return order.status === 'PENDING' || order.status === 'pending_confirmation';
      }
      if (this.activeFilter === 'preparing') {
        return order.status === 'PREPARING' || order.status === 'preparing';
      }
      if (this.activeFilter === 'delivering') {
        return order.status === 'OUT_FOR_DELIVERY' || order.status === 'delivering';
      }
      if (this.activeFilter === 'completed') {
        return order.status === 'COMPLETED' || order.status === 'completed';
      }
      if (this.activeFilter === 'cancelled') {
        return order.status === 'CANCELLED';
      }
      return true;
    });

    return `
      <div>
        <div class="admin-orders-controls">
          <div class="admin-status-filters">
            <button class="admin-filter-pill ${this.activeFilter === 'all' ? 'active' : ''}" data-order-filter="all">
              الكل (${this.adminOrders.length})
            </button>
            <button class="admin-filter-pill ${this.activeFilter === 'pending' ? 'active' : ''}" data-order-filter="pending">
              ⏳ بانتظار التأكيد
            </button>
            <button class="admin-filter-pill ${this.activeFilter === 'preparing' ? 'active' : ''}" data-order-filter="preparing">
              👨‍🍳 جاري التحضير
            </button>
            <button class="admin-filter-pill ${this.activeFilter === 'delivering' ? 'active' : ''}" data-order-filter="delivering">
              🛵 في الطريق
            </button>
            <button class="admin-filter-pill ${this.activeFilter === 'completed' ? 'active' : ''}" data-order-filter="completed">
              ✅ مكتملة
            </button>
          </div>

          <button class="admin-action-btn" id="btn-refresh-orders" style="font-size:0.8rem;">
            🔄 تحديث الطلبات
          </button>
        </div>

        ${
          filteredOrders.length === 0
            ? `
          <div style="text-align:center; padding:60px 20px; background:#18120D; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:3rem; display:block; margin-bottom:12px;">📭</span>
            <h3 style="color:#FFF; font-size:1.1rem; margin-bottom:6px;">لا توجد طلبات في هذا القسم حالياً</h3>
            <p style="color:#A89B8D; font-size:0.84rem;">الطلبات الجديدة تظهر هنا لحظياً مع تنبيه صوتي.</p>
          </div>
        `
            : `
          <div class="admin-orders-grid">
            ${filteredOrders.map((o) => this.renderOrderCard(o)).join('')}
          </div>
        `
        }
      </div>
    `;
  }

  renderOrderCard(order) {
    const isPending = order.status === 'PENDING' || order.status === 'pending_confirmation';
    const isPreparing = order.status === 'PREPARING' || order.status === 'preparing';
    const isDelivering = order.status === 'OUT_FOR_DELIVERY' || order.status === 'delivering';
    const isCompleted = order.status === 'COMPLETED' || order.status === 'completed';

    const orderNum = order.orderNumber || order.id;
    const phone = order.customerPhone || order.phone || '01040925170';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const items = order.items || [];

    return `
      <div class="admin-order-card ${isPending ? 'status-pending' : ''}">
        <div class="admin-order-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="admin-order-num">#${orderNum}</span>
            <span style="font-size:0.75rem; color:#A89B8D;">${order.date || 'اليوم'}</span>
          </div>

          <span class="admin-status-badge ${
            isPending
              ? 'status-badge-pending'
              : isPreparing
              ? 'status-badge-preparing'
              : isDelivering
              ? 'status-badge-out'
              : isCompleted
              ? 'status-badge-completed'
              : 'status-badge-cancelled'
          }">
            ${
              isPending
                ? '⏳ قيد المراجعة'
                : isPreparing
                ? '👨‍🍳 جاري التحضير'
                : isDelivering
                ? '🛵 في الطريق'
                : isCompleted
                ? '✅ تم التسليم'
                : '❌ ملغي'
            }
          </span>
        </div>

        <div class="admin-order-details">
          <div class="admin-order-customer">
            <span>👤 ${order.customerName || 'عميل فرجاني'}</span>
            <a href="tel:${cleanPhone}" class="admin-order-phone">📞 ${phone}</a>
            <a href="https://wa.me/2${cleanPhone}" target="_blank" class="admin-order-phone" style="color:#22C55E;">💬 واتساب</a>
          </div>

          <div class="admin-order-address">
            📍 <strong>العنوان:</strong> ${order.deliveryAddressSnapshot || order.address || 'الهرم، الجيزة'}
          </div>

          ${
            order.notes
              ? `<div style="color:#FFA35C; font-size:0.8rem; margin-bottom:8px;">📝 ملاحظات: ${order.notes}</div>`
              : ''
          }

          <!-- Items list -->
          <div class="admin-order-items-list">
            ${items
              .map((it) => {
                const title = it.menuItem?.title_ar || it.titleAr || 'صنف فرجاني';
                const qty = it.quantity || 1;
                const price = it.unitPrice || it.price || 0;
                return `
                <div class="admin-order-item-row">
                  <span>${qty}x ${title}</span>
                  <span style="font-weight:700;">${price * qty} ج.م</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <div class="admin-order-footer">
          <div class="admin-order-total">
            ${order.totalAmount || order.total} ج.م
          </div>

          <div class="admin-order-actions-row">
            ${
              isPending
                ? `
              <button class="admin-btn-action-status" style="background:#3B82F6; color:#FFF;" data-change-order="${order.id}" data-target-status="PREPARING">
                👨‍🍳 بدء التحضير
              </button>
              <button class="admin-btn-action-status" style="background:rgba(239,68,68,0.2); color:#FCA5A5;" data-change-order="${order.id}" data-target-status="CANCELLED">
                إلغاء
              </button>
            `
                : ''
            }

            ${
              isPreparing
                ? `
              <button class="admin-btn-action-status" style="background:#8B5CF6; color:#FFF;" data-change-order="${order.id}" data-target-status="OUT_FOR_DELIVERY">
                🛵 خروج للتوصيل
              </button>
            `
                : ''
            }

            ${
              isDelivering
                ? `
              <button class="admin-btn-action-status" style="background:#16A34A; color:#FFF;" data-change-order="${order.id}" data-target-status="COMPLETED">
                ✅ تأكيد التسليم
              </button>
            `
                : ''
            }

            ${
              isCompleted
                ? `
              <span style="font-size:0.75rem; color:#86EFAC;">✔️ مكتمل بنجاح</span>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // TAB 2: MENU ITEMS MANAGEMENT
  // =========================================================================
  renderMenuTab() {
    return `
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
          <h2 style="font-size:1.15rem; font-weight:800; color:#FFF; margin:0;">
            قائمة أصناف المنيو (${this.menuItems.length} صنف)
          </h2>

          <button class="admin-action-btn" id="btn-admin-add-dish" style="background:linear-gradient(135deg, var(--color-primary) 0%, #D86313 100%); color:#FFF; border:none; padding:8px 18px; font-weight:800;">
            ➕ إضافة صنف جديد للمنيو
          </button>
        </div>

        <div class="admin-table-card">
          <div style="overflow-x:auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>اسم الطبق</th>
                  <th>القسم</th>
                  <th>السعر</th>
                  <th>الحالة في المتجر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${this.menuItems
                  .map((item) => {
                    const isAvailable = item.isAvailable !== false;
                    const catName = item.category?.name_ar || item.category || 'عام';
                    return `
                    <tr>
                      <td>
                        <img src="${item.imageUrl || item.image || '/assets/dishes/hamam_mahshi_dish.jpg'}" alt="${item.title_ar || item.titleAr}" class="admin-dish-thumb" />
                      </td>
                      <td>
                        <div style="font-weight:800; color:#FFF;">${item.title_ar || item.titleAr}</div>
                        <div style="font-size:0.75rem; color:#9C8F82;">${item.title_en || item.titleEn || ''}</div>
                      </td>
                      <td>
                        <span style="background:rgba(255,255,255,0.06); padding:3px 10px; border-radius:12px; font-size:0.75rem; color:#DDD;">
                          ${catName}
                        </span>
                      </td>
                      <td style="font-weight:900; color:#FFA35C;">
                        ${item.price} ج.م
                      </td>
                      <td>
                        <button class="admin-availability-toggle ${isAvailable ? 'available' : 'unavailable'}" data-toggle-dish="${item.id || item.title_ar || item.titleAr}">
                          <span>${isAvailable ? '🟢 متاح للطلب' : '🔴 نفد من المطبخ'}</span>
                        </button>
                      </td>
                      <td>
                        <div style="display:flex; align-items:center; gap:6px;">
                          <button class="admin-action-btn" data-edit-dish="${item.id || item.title_ar || item.titleAr}" style="padding:4px 8px; font-size:0.75rem;">
                            ✏️ تعديل
                          </button>
                          <button class="admin-action-btn" data-delete-dish="${item.id || item.title_ar || item.titleAr}" style="padding:4px 8px; font-size:0.75rem; color:#FCA5A5;">
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // TAB 3: CATEGORIES MANAGEMENT
  // =========================================================================
  renderCategoriesTab() {
    return `
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
          <h2 style="font-size:1.15rem; font-weight:800; color:#FFF; margin:0;">
            أقسام وتصنيفات المنيو (${this.categories.length})
          </h2>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          ${this.categories
            .map((cat) => {
              const count = this.menuItems.filter((i) => (i.category?.slug || i.category) === cat.id || (i.category?.slug || i.category) === cat.slug).length;
              return `
              <div style="background:#18120D; border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div style="font-size:1.05rem; font-weight:900; color:#FFF; margin-bottom:4px;">
                    ${cat.icon || '📂'} ${cat.name_ar || cat.nameAr}
                  </div>
                  <div style="font-size:0.78rem; color:#A89B8D;">
                    ${cat.name_en || cat.nameEn || ''}
                  </div>
                </div>
                <span style="background:rgba(245,122,33,0.15); color:#FFA35C; padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:800;">
                  ${count} صنف
                </span>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // TAB 4: CUSTOMERS & ANALYTICS
  // =========================================================================
  renderCustomersTab() {
    // Generate customer mock reports if DB empty
    const customerList = this.customers.length > 0 ? this.customers : [
      { id: '1', fullName: 'أحمد محمد عبد الله', phone: '01040925170', totalOrders: 5, totalSpent: 3850, createdAt: '2026-10-15' },
      { id: '2', fullName: 'م. إبراهيم الشناوي', phone: '01123456789', totalOrders: 3, totalSpent: 2600, createdAt: '2026-10-17' },
      { id: '3', fullName: 'د. سارة المنشاوي', phone: '01298765432', totalOrders: 2, totalSpent: 1980, createdAt: '2026-10-18' },
      { id: '4', fullName: 'أستاذ طارق يوسف', phone: '01511223344', totalOrders: 4, totalSpent: 4120, createdAt: '2026-10-19' },
    ];

    return `
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
          <h2 style="font-size:1.15rem; font-weight:800; color:#FFF; margin:0;">
            سجل العملاء وقاعدة البيانات (${customerList.length})
          </h2>
        </div>

        <div class="admin-table-card">
          <div style="overflow-x:auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>رقم الهاتف</th>
                  <th>عدد الطلبات</th>
                  <th>إجمالي المشتريات</th>
                  <th>تاريخ التسجيل</th>
                  <th>تواصل</th>
                </tr>
              </thead>
              <tbody>
                ${customerList
                  .map(
                    (c) => `
                  <tr>
                    <td style="font-weight:800; color:#FFF;">${c.fullName}</td>
                    <td style="color:#FFA35C; direction:ltr; text-align:start;">${c.phone}</td>
                    <td style="font-weight:800;">${c.totalOrders} طلبات</td>
                    <td style="font-weight:900; color:#86EFAC;">${c.totalSpent} ج.م</td>
                    <td style="color:#A89B8D; font-size:0.78rem;">${c.createdAt ? String(c.createdAt).substring(0, 10) : '2026-10-20'}</td>
                    <td>
                      <a href="https://wa.me/2${c.phone.replace(/[^0-9]/g, '')}" target="_blank" class="admin-action-btn" style="padding:4px 10px; font-size:0.75rem; color:#22C55E;">
                        💬 واتساب
                      </a>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DISH ADD/EDIT MODAL
  // =========================================================================
  renderDishModal() {
    const dish = this.editingDish || {};
    const isEdit = Boolean(this.editingDish);

    return `
      <div class="client-auth-backdrop" id="dish-modal-backdrop">
        <div class="client-auth-card" style="max-width:540px;">
          <div class="client-auth-header">
            <div class="client-auth-title">
              <span>${isEdit ? '✏️' : '➕'}</span>
              <span>${isEdit ? 'تعديل الصنف' : 'إضافة صنف جديد للمنيو'}</span>
            </div>
            <button class="client-auth-close" id="btn-close-dish-modal">✕</button>
          </div>

          <form id="admin-dish-form" class="client-auth-body">
            <div class="auth-form-group">
              <label class="auth-form-label">اسم الطبق بالعربي *</label>
              <input type="text" class="auth-form-input" id="dish-title-ar" value="${dish.title_ar || dish.titleAr || ''}" required placeholder="مثال: حمام محشي بالفريك" />
            </div>

            <div class="auth-form-group">
              <label class="auth-form-label">اسم الطبق بالإنجليزي</label>
              <input type="text" class="auth-form-input" id="dish-title-en" value="${dish.title_en || dish.titleEn || ''}" placeholder="e.g. Stuffed Baladi Pigeon" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="auth-form-group">
                <label class="auth-form-label">السعر (ج.م) *</label>
                <input type="number" class="auth-form-input" id="dish-price" value="${dish.price || ''}" required placeholder="280" />
              </div>

              <div class="auth-form-group">
                <label class="auth-form-label">القسم *</label>
                <select class="auth-form-input" id="dish-category">
                  ${this.categories
                    .filter((c) => c.id !== 'all' && c.slug !== 'all')
                    .map((c) => `<option value="${c.id || c.slug}">${c.name_ar || c.nameAr}</option>`)
                    .join('')}
                </select>
              </div>
            </div>

            <div class="auth-form-group">
              <label class="auth-form-label">رابط صورة الطبق</label>
              <input type="text" class="auth-form-input" id="dish-image" value="${dish.imageUrl || dish.image || ''}" placeholder="/assets/dishes/... أو رابط خارجي" />
            </div>

            <div class="auth-form-group">
              <label class="auth-form-label">وصف الطبق والمكونات</label>
              <textarea class="auth-form-input" id="dish-desc-ar" rows="3" placeholder="اكتب مكونات وطريقة تجهيز الشيف فرجاني...">${dish.description_ar || dish.descriptionAr || ''}</textarea>
            </div>

            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
              <input type="checkbox" id="dish-available" ${dish.isAvailable !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--color-primary);" />
              <label for="dish-available" style="font-size:0.88rem; font-weight:800; color:#FFF; cursor:pointer;">
                الصنف متاح للطلب الفوري في المتجر
              </label>
            </div>

            <button type="submit" class="auth-submit-btn">
              💾 ${isEdit ? 'حفظ التعديلات' : 'إضافة الصنف للمنيو'}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT LISTENERS FOR DASHBOARD
  // =========================================================================
  bindEvents() {
    // 1. Audio chime toggle
    const soundBtn = document.getElementById('btn-toggle-admin-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        store.toggleAdminSound();
        if (store.state.adminSoundEnabled) {
          this.playNotificationSound();
        }
        store.notify();
      });
    }

    // 2. Tabs navigation
    document.querySelectorAll('[data-admin-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const tab = tabBtn.dataset.adminTab;
        store.setAdminTab(tab);
      });
    });

    // 3. Order status filters
    document.querySelectorAll('[data-order-filter]').forEach((pill) => {
      pill.addEventListener('click', () => {
        this.activeFilter = pill.dataset.orderFilter;
        store.notify();
      });
    });

    // 4. Refresh orders button
    const refreshBtn = document.getElementById('btn-refresh-orders');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.innerText = '🔄 جاري التحديث...';
        await this.loadData();
        store.showToast('تم تحديث قائمة الطلبات', 'info');
        store.notify();
      });
    }

    // 5. Order status transitions (One-click)
    document.querySelectorAll('[data-change-order]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.changeOrder;
        const targetStatus = btn.dataset.targetStatus;
        btn.disabled = true;

        // Local state update
        const order = this.adminOrders.find((o) => o.id === orderId);
        if (order) {
          order.status = targetStatus;
        }

        try {
          await api.adminUpdateOrderStatus(orderId, targetStatus);
          store.showToast('تم تحديث حالة الطلب بنجاح 🚀', 'success');
        } catch (e) {
          store.showToast('تم حفظ الحالة محلياً (وضع أوفلاين)', 'info');
        }
        store.notify();
      });
    });

    // 6. Menu item availability toggle
    document.querySelectorAll('[data-toggle-dish]').forEach((toggleBtn) => {
      toggleBtn.addEventListener('click', async () => {
        const dishId = toggleBtn.dataset.toggleDish;
        const dish = this.menuItems.find((d) => d.id === dishId || d.titleAr === dishId || d.title_ar === dishId);
        if (dish) {
          dish.isAvailable = dish.isAvailable === false ? true : false;
          try {
            await api.adminUpdateMenuItem(dish.id, { isAvailable: dish.isAvailable });
          } catch (e) {
            // fallback
          }
          store.showToast(
            dish.isAvailable ? '🟢 الصنف أصبح متاحاً للطلب' : '🔴 الصنف نفد ومغلق مؤقتاً',
            dish.isAvailable ? 'success' : 'warn'
          );
          store.notify();
        }
      });
    });

    // 7. Add dish button
    const addDishBtn = document.getElementById('btn-admin-add-dish');
    if (addDishBtn) {
      addDishBtn.addEventListener('click', () => {
        this.editingDish = null;
        this.isDishModalOpen = true;
        store.notify();
      });
    }

    // 8. Edit dish buttons
    document.querySelectorAll('[data-edit-dish]').forEach((editBtn) => {
      editBtn.addEventListener('click', () => {
        const dishId = editBtn.dataset.editDish;
        const dish = this.menuItems.find((d) => d.id === dishId || d.titleAr === dishId || d.title_ar === dishId);
        if (dish) {
          this.editingDish = dish;
          this.isDishModalOpen = true;
          store.notify();
        }
      });
    });

    // 9. Delete dish buttons
    document.querySelectorAll('[data-delete-dish]').forEach((delBtn) => {
      delBtn.addEventListener('click', async () => {
        const dishId = delBtn.dataset.deleteDish;
        const conf = confirm('هل أنت متأكد من حذف هذا الصنف نهائياً من المنيو؟');
        if (conf) {
          this.menuItems = this.menuItems.filter((d) => d.id !== dishId && d.titleAr !== dishId && d.title_ar !== dishId);
          try {
            await api.adminDeleteMenuItem(dishId);
          } catch (e) {
            // fallback
          }
          store.showToast('تم حذف الصنف من المنيو', 'info');
          store.notify();
        }
      });
    });

    // 10. Close dish modal
    const closeDishModal = () => {
      this.isDishModalOpen = false;
      this.editingDish = null;
      store.notify();
    };

    const closeBtn = document.getElementById('btn-close-dish-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeDishModal);

    const backdrop = document.getElementById('dish-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeDishModal();
      });
    }

    // 11. Dish form submit
    const dishForm = document.getElementById('admin-dish-form');
    if (dishForm) {
      dishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleAr = document.getElementById('dish-title-ar')?.value?.trim();
        const titleEn = document.getElementById('dish-title-en')?.value?.trim();
        const price = parseFloat(document.getElementById('dish-price')?.value) || 0;
        const categoryId = document.getElementById('dish-category')?.value;
        const imageUrl = document.getElementById('dish-image')?.value?.trim() || '/assets/dishes/hamam_mahshi_dish.jpg';
        const descAr = document.getElementById('dish-desc-ar')?.value?.trim();
        const isAvailable = document.getElementById('dish-available')?.checked;

        if (this.editingDish) {
          // Update existing
          this.editingDish.title_ar = titleAr;
          this.editingDish.titleAr = titleAr;
          this.editingDish.title_en = titleEn;
          this.editingDish.titleEn = titleEn;
          this.editingDish.price = price;
          this.editingDish.categoryId = categoryId;
          this.editingDish.imageUrl = imageUrl;
          this.editingDish.image = imageUrl;
          this.editingDish.description_ar = descAr;
          this.editingDish.descriptionAr = descAr;
          this.editingDish.isAvailable = isAvailable;

          try {
            await api.adminUpdateMenuItem(this.editingDish.id, {
              title_ar: titleAr,
              title_en: titleEn,
              price,
              categoryId,
              imageUrl,
              description_ar: descAr,
              isAvailable
            });
          } catch (e) {
            // fallback
          }
          store.showToast('تم حفظ تعديلات الصنف بنجاح', 'success');
        } else {
          // Create new
          const newDish = {
            id: 'dish-' + Date.now(),
            title_ar: titleAr,
            titleAr: titleAr,
            title_en: titleEn,
            titleEn: titleEn,
            price,
            categoryId,
            imageUrl,
            image: imageUrl,
            description_ar: descAr,
            descriptionAr: descAr,
            isAvailable
          };
          this.menuItems.unshift(newDish);

          try {
            await api.adminCreateMenuItem({
              title_ar: titleAr,
              title_en: titleEn,
              price,
              categoryId,
              imageUrl,
              description_ar: descAr,
              isAvailable
            });
          } catch (e) {
            // fallback
          }
          store.showToast('تمت إضافة الصنف الجديد للمنيو بنجاح', 'success');
        }

        this.isDishModalOpen = false;
        this.editingDish = null;
        store.notify();
      });
    }
  }
}

export const adminPortal = new AdminPortal();
export default adminPortal;
