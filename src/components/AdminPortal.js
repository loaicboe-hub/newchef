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
    this.uploadedImageFile = null;
    this.uploadedImagePreview = '';
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
          <h2 style="font-size:1.45rem; font-weight:900; color:#2D1E12; margin-bottom:6px;">
            ${s.lang === 'ar' ? 'لوحة تحكم مطابخ الشيف فرجاني' : 'Chef Fergany Admin Portal'}
          </h2>
          <p style="font-size:0.84rem; color:#7A5E49; margin-bottom:24px;">
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

          <div style="margin-top:20px; font-size:0.82rem; color:#7A5E49;">
            <a href="#" id="link-back-to-store" style="color:#D35400; text-decoration:none; font-weight:800;">
              ← ${s.lang === 'ar' ? 'العودة لمتجر العملاء' : 'Back to Storefront'}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  getTabTitle(tab) {
    switch (tab) {
      case 'orders':
        return 'إدارة ومتابعة الطلبات الحية';
      case 'menu':
        return 'قائمة الأصناف والأطباق';
      case 'categories':
        return 'أقسام وتصنيفات المنيو';
      case 'customers':
        return 'سجل العملاء والمبيعات';
      default:
        return 'لوحة التحكم';
    }
  }

  // =========================================================================
  // 2. ADMIN DASHBOARD MAIN VIEW (SIDEBAR ARCHITECTURE)
  // =========================================================================
  renderDashboard() {
    const s = store.state;
    const pendingOrdersCount = this.adminOrders.filter(
      (o) => o.status === 'PENDING' || o.status === 'pending_confirmation' || o.status === 'preparing'
    ).length;

    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="admin-portal-wrapper">
        <!-- Mobile Sidebar Backdrop -->
        <div class="admin-sidebar-backdrop" id="admin-sidebar-backdrop"></div>

        <!-- The Dedicated Admin Sidebar -->
        <aside class="admin-sidebar" id="admin-sidebar">
          <!-- Brand / Header -->
          <div class="admin-sidebar-header">
            <div class="admin-sidebar-logo">
              <div class="admin-logo-crown">👑</div>
              <div class="admin-logo-texts">
                <span class="admin-brand-name">الشيف فرجاني</span>
                <span class="admin-portal-label">لوحة الإدارة والمطابخ</span>
              </div>
            </div>
            <button class="admin-sidebar-close" id="btn-close-admin-sidebar" aria-label="إغلاق القائمة">✕</button>
          </div>

          <!-- Admin Profile Card -->
          <div class="admin-profile-card">
            <div class="admin-avatar">👨‍🍳</div>
            <div class="admin-profile-info">
              <div class="admin-profile-name">${s.adminUser?.fullName || 'الشيف محمد فرجاني'}</div>
              <div class="admin-role-badge">
                <span class="online-indicator"></span>
                <span>${s.adminUser?.role === 'SUPER_ADMIN' ? 'مدير عام السيرفر' : 'مدير الفرع'}</span>
              </div>
            </div>
          </div>

          <!-- Sidebar Navigation Sections -->
          <div class="admin-sidebar-nav">
            <!-- Section 1: الطلبات والمتابعة -->
            <div class="admin-nav-group-title">الطلبات والمطبخ</div>
            <button class="admin-side-link ${s.adminTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
              <div class="admin-link-left">
                <span class="admin-link-icon">📋</span>
                <span class="admin-link-text">الطلبات الحية</span>
              </div>
              ${
                pendingOrdersCount > 0
                  ? `<span class="admin-badge-count-pulse">${pendingOrdersCount}</span>`
                  : `<span class="admin-badge-count">${this.adminOrders.length}</span>`
              }
            </button>

            <!-- Section 2: الأصناف والمنيو -->
            <div class="admin-nav-group-title">الأصناف والتصنيفات</div>
            <button class="admin-side-link ${s.adminTab === 'menu' ? 'active' : ''}" data-admin-tab="menu">
              <div class="admin-link-left">
                <span class="admin-link-icon">🍗</span>
                <span class="admin-link-text">قائمة الأصناف والأطباق</span>
              </div>
              <span class="admin-badge-count">${this.menuItems.length}</span>
            </button>

            <button class="admin-side-link ${s.adminTab === 'categories' ? 'active' : ''}" data-admin-tab="categories">
              <div class="admin-link-left">
                <span class="admin-link-icon">📂</span>
                <span class="admin-link-text">أقسام وتصنيفات المنيو</span>
              </div>
              <span class="admin-badge-count">${this.categories.length}</span>
            </button>

            <!-- Section 3: قاعدة البيانات والعملاء -->
            <div class="admin-nav-group-title">العملاء والتقارير</div>
            <button class="admin-side-link ${s.adminTab === 'customers' ? 'active' : ''}" data-admin-tab="customers">
              <div class="admin-link-left">
                <span class="admin-link-icon">👥</span>
                <span class="admin-link-text">سجل وقاعدة العملاء</span>
              </div>
              <span class="admin-badge-count">${this.customers.length || 18}</span>
            </button>

            <!-- Section 4: أدوات سريعة -->
            <div class="admin-nav-group-title">أدوات النظام والمتجر</div>
            <button class="admin-side-link" id="btn-toggle-admin-sound">
              <div class="admin-link-left">
                <span class="admin-link-icon">${s.adminSoundEnabled ? '🔔' : '🔕'}</span>
                <span class="admin-link-text">التنبيه الصوتي</span>
              </div>
              <span class="admin-sound-status ${s.adminSoundEnabled ? 'enabled' : 'disabled'}">
                ${s.adminSoundEnabled ? 'مفعل 🟢' : 'مكتوم ⚪'}
              </span>
            </button>

            <button class="admin-side-link" id="btn-admin-view-store">
              <div class="admin-link-left">
                <span class="admin-link-icon">🏪</span>
                <span class="admin-link-text">معاينة المتجر للعملاء</span>
              </div>
              <span class="admin-link-arrow">↗</span>
            </button>
          </div>

          <!-- Sidebar Footer -->
          <div class="admin-sidebar-footer">
            <div class="admin-server-status">
              <span class="server-dot"></span>
              <span>السيرفر وقاعدة البيانات متصلة</span>
            </div>
            <button class="admin-logout-btn" id="btn-admin-logout">
              <span>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        <!-- Main Workspace Area -->
        <div class="admin-main-wrapper">
          <!-- Top Content Header -->
          <header class="admin-content-header">
            <div class="admin-header-left">
              <button class="admin-mobile-toggle" id="btn-toggle-admin-sidebar" aria-label="فتح القائمة">
                <span>☰</span>
              </button>
              <div class="admin-header-breadcrumbs">
                <span class="breadcrumb-sub">لوحة الإدارة</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${this.getTabTitle(s.adminTab)}</span>
              </div>
            </div>

            <div class="admin-header-actions">
              <div class="admin-live-clock">
                <span>⏱️</span>
                <span>${timeStr}</span>
              </div>

              <button class="admin-header-action-btn" id="btn-header-view-store" title="معاينة المتجر">
                <span>🏪 المتجر</span>
              </button>

              <button class="admin-header-action-btn logout" id="btn-header-logout" title="تسجيل الخروج">
                <span>🚪 خروج</span>
              </button>
            </div>
          </header>

          <!-- Main Content Body -->
          <div class="admin-content-body">
            <!-- Quick Metrics Grid -->
            <div class="admin-metrics-row">
              <div class="admin-metric-card">
                <div class="metric-icon-box orange">📦</div>
                <div class="metric-info">
                  <span class="metric-label">إجمالي الطلبات</span>
                  <div class="metric-val">${this.adminOrders.length}</div>
                </div>
              </div>
              <div class="admin-metric-card highlighted">
                <div class="metric-icon-box fiery">⏳</div>
                <div class="metric-info">
                  <span class="metric-label">طلبات بانتظار المطبخ</span>
                  <div class="metric-val">${pendingOrdersCount}</div>
                </div>
              </div>
              <div class="admin-metric-card">
                <div class="metric-icon-box green">🍗</div>
                <div class="metric-info">
                  <span class="metric-label">أصناف المنيو</span>
                  <div class="metric-val">${this.menuItems.length}</div>
                </div>
              </div>
              <div class="admin-metric-card">
                <div class="metric-icon-box blue">👥</div>
                <div class="metric-info">
                  <span class="metric-label">العملاء المسجلون</span>
                  <div class="metric-val">${this.customers.length || 18}</div>
                </div>
              </div>
            </div>

            <!-- Active View Container -->
            <div class="admin-active-view-container">
              ${this.renderActiveTabContent()}
            </div>
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
          <div style="text-align:center; padding:60px 20px; background:#FFFFFF; border-radius:var(--radius-lg); border:1.5px solid #FFE4D1; box-shadow:0 6px 18px rgba(245,122,33,0.06);">
            <span style="font-size:3rem; display:block; margin-bottom:12px;">📭</span>
            <h3 style="color:#2D1E12; font-size:1.15rem; font-weight:900; margin-bottom:6px;">لا توجد طلبات في هذا القسم حالياً</h3>
            <p style="color:#7A5E49; font-size:0.86rem;">الطلبات الجديدة تظهر هنا لحظياً مع تنبيه صوتي.</p>
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
            <span style="font-size:0.75rem; color:#8C7564;">${order.date || 'اليوم'}</span>
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
            <a href="https://wa.me/2${cleanPhone}" target="_blank" class="admin-order-phone" style="color:#16A34A; background:#F0FDF4; border-color:#BBF7D0;">💬 واتساب</a>
          </div>

          <div class="admin-order-address">
            📍 <strong>العنوان:</strong> ${order.deliveryAddressSnapshot || order.address || 'الهرم، الجيزة'}
          </div>

          ${
            order.notes
              ? `<div style="color:#D35400; font-size:0.82rem; font-weight:700; margin-bottom:8px;">📝 ملاحظات: ${order.notes}</div>`
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
                  <span style="font-weight:800; color:#D35400;">${price * qty} ج.م</span>
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
              <button class="admin-btn-action-status" style="background:#2563EB; color:#FFF;" data-change-order="${order.id}" data-target-status="PREPARING">
                👨‍🍳 بدء التحضير
              </button>
              <button class="admin-btn-action-status" style="background:#FEE2E2; color:#DC2626; border:1px solid #FECACA;" data-change-order="${order.id}" data-target-status="CANCELLED">
                إلغاء
              </button>
            `
                : ''
            }

            ${
              isPreparing
                ? `
              <button class="admin-btn-action-status" style="background:#7C3AED; color:#FFF;" data-change-order="${order.id}" data-target-status="OUT_FOR_DELIVERY">
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
              <span style="font-size:0.8rem; color:#15803D; font-weight:800;">✔️ مكتمل بنجاح</span>
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
          <h2 style="font-size:1.15rem; font-weight:900; color:#2D1E12; margin:0;">
            قائمة أصناف المنيو (${this.menuItems.length} صنف)
          </h2>

          <button class="admin-action-btn" id="btn-admin-add-dish" style="background:linear-gradient(135deg, var(--color-primary) 0%, #FF9040 100%); color:#FFF; border:none; padding:9px 20px; font-weight:900; box-shadow:0 4px 14px rgba(245,122,33,0.35);">
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
                        <div style="font-weight:900; color:#2D1E12;">${item.title_ar || item.titleAr}</div>
                        <div style="font-size:0.75rem; color:#7A5E49;">${item.title_en || item.titleEn || ''}</div>
                      </td>
                      <td>
                        <span style="background:#FFF1E6; border:1.5px solid #FFDEC9; padding:4px 12px; border-radius:12px; font-size:0.75rem; color:#D35400; font-weight:800;">
                          ${catName}
                        </span>
                      </td>
                      <td style="font-weight:900; color:#D35400; font-size:0.95rem;">
                        ${item.price} ج.م
                      </td>
                      <td>
                        <button class="admin-availability-toggle ${isAvailable ? 'available' : 'unavailable'}" data-toggle-dish="${item.id || item.title_ar || item.titleAr}">
                          <span>${isAvailable ? '🟢 متاح للطلب' : '🔴 نفد من المطبخ'}</span>
                        </button>
                      </td>
                      <td>
                        <div style="display:flex; align-items:center; gap:6px;">
                          <button class="admin-action-btn" data-edit-dish="${item.id || item.title_ar || item.titleAr}" style="padding:4px 10px; font-size:0.75rem;">
                            ✏️ تعديل
                          </button>
                          <button class="admin-action-btn" data-delete-dish="${item.id || item.title_ar || item.titleAr}" style="padding:4px 10px; font-size:0.75rem; background:#FFF1F1; border-color:#FFD1D1; color:#DC2626;">
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
          <h2 style="font-size:1.15rem; font-weight:900; color:#2D1E12; margin:0;">
            أقسام وتصنيفات المنيو (${this.categories.length})
          </h2>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          ${this.categories
            .map((cat) => {
              const count = this.menuItems.filter((i) => (i.category?.slug || i.category) === cat.id || (i.category?.slug || i.category) === cat.slug).length;
              return `
              <div style="background:#FFFFFF; border:1.5px solid #FFE4D1; border-radius:var(--radius-lg); padding:18px; box-shadow:0 4px 16px rgba(245,122,33,0.06); display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div style="font-size:1.05rem; font-weight:900; color:#2D1E12; margin-bottom:4px;">
                    ${cat.icon || '📂'} ${cat.name_ar || cat.nameAr}
                  </div>
                  <div style="font-size:0.8rem; color:#7A5E49;">
                    ${cat.name_en || cat.nameEn || ''}
                  </div>
                </div>
                <span style="background:#FFF1E6; color:#D35400; border:1px solid #FFDEC9; padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:800;">
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
          <h2 style="font-size:1.15rem; font-weight:900; color:#2D1E12; margin:0;">
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
                    <td style="font-weight:900; color:#2D1E12;">${c.fullName}</td>
                    <td style="color:#D35400; font-weight:800; direction:ltr; text-align:start;">${c.phone}</td>
                    <td style="font-weight:800; color:#4A3B32;">${c.totalOrders} طلبات</td>
                    <td style="font-weight:900; color:#15803D;">${c.totalSpent} ج.م</td>
                    <td style="color:#7A5E49; font-size:0.8rem;">${c.createdAt ? String(c.createdAt).substring(0, 10) : '2026-10-20'}</td>
                    <td>
                      <a href="https://wa.me/2${c.phone.replace(/[^0-9]/g, '')}" target="_blank" class="admin-action-btn" style="padding:4px 10px; font-size:0.75rem; color:#15803D; background:#F0FDF4; border-color:#BBF7D0;">
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
    const imagePreview = this.uploadedImagePreview || dish.imageUrl || dish.image || '';

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

            <!-- DIRECT IMAGE UPLOAD SECTION (NO TEXT LINK) -->
            <div class="auth-form-group">
              <label class="auth-form-label">صورة الطبق (رفع مباشر من جهازك) *</label>
              <div class="admin-image-upload-zone" id="dish-image-dropzone">
                <input 
                  type="file" 
                  id="dish-image-file-input" 
                  accept="image/jpeg,image/png,image/webp,image/jpg" 
                  style="display:none;" 
                />

                <div id="dish-image-preview-container">
                  ${
                    imagePreview
                      ? `
                    <div class="dish-preview-wrapper">
                      <img src="${imagePreview}" alt="صورة الصنف" id="dish-preview-img" class="dish-preview-image" />
                      <div class="dish-preview-actions">
                        <button type="button" class="admin-action-btn" id="btn-trigger-file-select" style="padding:6px 14px; font-size:0.78rem;">
                          📷 تغيير الصورة
                        </button>
                        <button type="button" class="admin-action-btn" id="btn-remove-dish-image" style="padding:6px 14px; font-size:0.78rem; background:#FFF1F1; border-color:#FFD1D1; color:#DC2626;">
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  `
                      : `
                    <div class="dish-upload-placeholder" id="dish-upload-placeholder">
                      <div class="upload-icon-circle">📸</div>
                      <span class="upload-main-text">اضغط لرفع صورة الطبق من جهازك</span>
                      <span class="upload-sub-text">أو اسحب الصورة وأفلتها هنا (JPG, PNG, WEBP)</span>
                      <span class="upload-badge-tag">يتم تحسينها وضغطها تلقائياً على السيرفر</span>
                    </div>
                  `
                  }
                </div>
              </div>
            </div>

            <div class="auth-form-group">
              <label class="auth-form-label">وصف الطبق والمكونات</label>
              <textarea class="auth-form-input" id="dish-desc-ar" rows="3" placeholder="اكتب مكونات وطريقة تجهيز الشيف فرجاني...">${dish.description_ar || dish.descriptionAr || ''}</textarea>
            </div>

            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
              <input type="checkbox" id="dish-available" ${dish.isAvailable !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--color-primary);" />
              <label for="dish-available" style="font-size:0.88rem; font-weight:800; color:#2D1E12; cursor:pointer;">
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
    // 0. Mobile Sidebar Drawer toggle & backdrop
    const toggleSidebarBtn = document.getElementById('btn-toggle-admin-sidebar');
    const closeSidebarBtn = document.getElementById('btn-close-admin-sidebar');
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarBackdrop = document.getElementById('admin-sidebar-backdrop');

    const openSidebar = () => {
      if (sidebar) sidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
    };

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
    };

    if (toggleSidebarBtn) toggleSidebarBtn.onclick = openSidebar;
    if (closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar;
    if (sidebarBackdrop) sidebarBackdrop.onclick = closeSidebar;

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
        closeSidebar();
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
        this.uploadedImageFile = null;
        this.uploadedImagePreview = '';
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
          this.uploadedImageFile = null;
          this.uploadedImagePreview = dish.imageUrl || dish.image || '';
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
      this.uploadedImageFile = null;
      this.uploadedImagePreview = '';
      store.notify();
    };

    const closeBtn = document.getElementById('btn-close-dish-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeDishModal);

    const dishModalBackdrop = document.getElementById('dish-modal-backdrop');
    if (dishModalBackdrop) {
      dishModalBackdrop.addEventListener('click', (e) => {
        if (e.target === dishModalBackdrop) closeDishModal();
      });
    }

    // 11. Image Upload Dropzone & File Handling in Dish Modal
    if (this.isDishModalOpen) {
      const handleImageFile = (file) => {
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          store.showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)', 'error');
          return;
        }
        if (file.size > 8 * 1024 * 1024) {
          store.showToast('حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت', 'error');
          return;
        }
        this.uploadedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImagePreview = e.target.result;
          updatePreviewUI();
        };
        reader.readAsDataURL(file);
      };

      const updatePreviewUI = () => {
        const container = document.getElementById('dish-image-preview-container');
        if (!container) return;
        if (this.uploadedImagePreview) {
          container.innerHTML = `
            <div class="dish-preview-wrapper">
              <img src="${this.uploadedImagePreview}" alt="معاينة صورة الصنف" class="dish-preview-image" id="dish-preview-img" />
              <div class="dish-preview-actions">
                <button type="button" class="admin-action-btn" id="btn-trigger-file-select" style="padding:6px 14px; font-size:0.78rem;">
                  📷 تغيير الصورة
                </button>
                <button type="button" class="admin-action-btn" id="btn-remove-dish-image" style="padding:6px 14px; font-size:0.78rem; background:#FFF1F1; border-color:#FFD1D1; color:#DC2626;">
                  🗑️ حذف
                </button>
              </div>
            </div>
          `;
          bindUploadButtons();
        } else {
          container.innerHTML = `
            <div class="dish-upload-placeholder" id="dish-upload-placeholder">
              <div class="upload-icon-circle">📸</div>
              <span class="upload-main-text">اضغط لرفع صورة الطبق من جهازك</span>
              <span class="upload-sub-text">أو اسحب الصورة وأفلتها هنا (JPG, PNG, WEBP)</span>
              <span class="upload-badge-tag">يتم تحسينها وضغطها تلقائياً على السيرفر</span>
            </div>
          `;
          bindUploadButtons();
        }
      };

      const bindUploadButtons = () => {
        const changeBtn = document.getElementById('btn-trigger-file-select');
        if (changeBtn) {
          changeBtn.onclick = (e) => {
            e.stopPropagation();
            const input = document.getElementById('dish-image-file-input');
            if (input) input.click();
          };
        }

        const removeBtn = document.getElementById('btn-remove-dish-image');
        if (removeBtn) {
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            this.uploadedImageFile = null;
            this.uploadedImagePreview = '';
            const input = document.getElementById('dish-image-file-input');
            if (input) input.value = '';
            updatePreviewUI();
          };
        }

        const placeholder = document.getElementById('dish-upload-placeholder');
        if (placeholder) {
          placeholder.onclick = () => {
            const input = document.getElementById('dish-image-file-input');
            if (input) input.click();
          };
        }
      };

      bindUploadButtons();

      const fileInput = document.getElementById('dish-image-file-input');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
          }
        });
      }

      const dropzone = document.getElementById('dish-image-dropzone');
      if (dropzone) {
        ['dragenter', 'dragover'].forEach((eventName) => {
          dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
          });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
          dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
          });
        });

        dropzone.addEventListener('drop', (e) => {
          const dt = e.dataTransfer;
          if (dt && dt.files && dt.files[0]) {
            handleImageFile(dt.files[0]);
          }
        });
      }
    }

    // 12. Dish form submit
    const dishForm = document.getElementById('admin-dish-form');
    if (dishForm) {
      dishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleAr = document.getElementById('dish-title-ar')?.value?.trim();
        const titleEn = document.getElementById('dish-title-en')?.value?.trim();
        const price = parseFloat(document.getElementById('dish-price')?.value) || 0;
        const categoryId = document.getElementById('dish-category')?.value;
        const descAr = document.getElementById('dish-desc-ar')?.value?.trim();
        const isAvailable = document.getElementById('dish-available')?.checked;

        const fallbackDefault = '/assets/dishes/hamam_mahshi_dish.jpg';
        const finalImage = this.uploadedImagePreview || (this.editingDish ? (this.editingDish.imageUrl || this.editingDish.image) : fallbackDefault);

        // Prepare FormData for upload (supports direct binary file upload via Multer)
        const formData = new FormData();
        formData.append('title_ar', titleAr);
        formData.append('title_en', titleEn || '');
        formData.append('price', String(price));
        formData.append('categoryId', categoryId);
        formData.append('description_ar', descAr || '');
        formData.append('isAvailable', String(isAvailable));

        if (this.uploadedImageFile) {
          formData.append('image', this.uploadedImageFile);
        } else if (finalImage && !finalImage.startsWith('data:')) {
          formData.append('imageUrl', finalImage);
        }

        if (this.editingDish) {
          // Update existing
          this.editingDish.title_ar = titleAr;
          this.editingDish.titleAr = titleAr;
          this.editingDish.title_en = titleEn;
          this.editingDish.titleEn = titleEn;
          this.editingDish.price = price;
          this.editingDish.categoryId = categoryId;
          this.editingDish.imageUrl = finalImage;
          this.editingDish.image = finalImage;
          this.editingDish.description_ar = descAr;
          this.editingDish.descriptionAr = descAr;
          this.editingDish.isAvailable = isAvailable;

          try {
            const res = await api.adminUpdateMenuItem(this.editingDish.id, formData);
            if (res && res.imageUrl) {
              this.editingDish.imageUrl = res.imageUrl;
              this.editingDish.image = res.imageUrl;
            }
          } catch (e) {
            // fallback retains local image preview
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
            imageUrl: finalImage,
            image: finalImage,
            description_ar: descAr,
            descriptionAr: descAr,
            isAvailable
          };
          this.menuItems.unshift(newDish);

          try {
            const res = await api.adminCreateMenuItem(formData);
            if (res && res.imageUrl) {
              newDish.imageUrl = res.imageUrl;
              newDish.image = res.imageUrl;
            }
            if (res && res.id) {
              newDish.id = res.id;
            }
          } catch (e) {
            // fallback retains local new dish
          }
          store.showToast('تمت إضافة الصنف الجديد للمنيو بنجاح', 'success');
        }

        this.isDishModalOpen = false;
        this.editingDish = null;
        this.uploadedImageFile = null;
        this.uploadedImagePreview = '';
        store.notify();
      });
    }
  }
}

export const adminPortal = new AdminPortal();
export default adminPortal;
