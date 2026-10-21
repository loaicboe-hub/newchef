// ==============================================================================
// Chef Fergany - Client Zero-Friction Authentication Modal (No OTP / No SMS)
// Quick registration and login with Egyptian Phone & Password
// ==============================================================================

import { store } from '../store/state.js';
import { api } from '../services/api.js';

class ClientAuthModal {
  constructor() {
    this.mode = 'login'; // 'login' | 'register'
  }

  render() {
    const s = store.state;
    const isRegister = this.mode === 'register';

    return `
      <div class="client-auth-backdrop" id="client-auth-backdrop">
        <div class="client-auth-card">
          <div class="client-auth-header">
            <div class="client-auth-title">
              <span>👑</span>
              <span>${s.lang === 'ar' ? 'مطابخ الشيف فرجاني' : 'Chef Fergany Kitchens'}</span>
            </div>
            <button class="client-auth-close" id="btn-close-client-auth">✕</button>
          </div>

          <div class="client-auth-tabs">
            <button class="client-auth-tab-btn ${!isRegister ? 'active' : ''}" id="tab-auth-login">
              ${s.lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button class="client-auth-tab-btn ${isRegister ? 'active' : ''}" id="tab-auth-register">
              ${s.lang === 'ar' ? 'إنشاء حساب جديد' : 'New Account'}
            </button>
          </div>

          <form id="client-auth-form" class="client-auth-body">
            ${
              isRegister
                ? `
              <div class="auth-form-group">
                <label class="auth-form-label">${s.lang === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                <input 
                  type="text" 
                  class="auth-form-input" 
                  id="client-auth-fullname" 
                  placeholder="${s.lang === 'ar' ? 'مثال: أحمد فرج' : 'e.g. Ahmed Farag'}" 
                  required 
                />
              </div>
            `
                : ''
            }

            <div class="auth-form-group">
              <label class="auth-form-label">${s.lang === 'ar' ? 'رقم الهاتف المحمول (11 رقم) *' : 'Mobile Phone (11 digits) *'}</label>
              <input 
                type="tel" 
                class="auth-form-input" 
                id="client-auth-phone" 
                placeholder="010XXXXXXXX" 
                dir="ltr"
                style="text-align:start;"
                required 
              />
              <span class="auth-hint-text">
                ${s.lang === 'ar' ? 'يبدأ بـ 010 أو 011 أو 012 أو 015 - بدون كود دولي' : 'Starts with 010, 011, 012, or 015'}
              </span>
            </div>

            <div class="auth-form-group">
              <label class="auth-form-label">${s.lang === 'ar' ? 'كلمة المرور *' : 'Password *'}</label>
              <input 
                type="password" 
                class="auth-form-input" 
                id="client-auth-password" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button type="submit" class="auth-submit-btn" id="btn-submit-client-auth">
              ${
                isRegister
                  ? (s.lang === 'ar' ? '🚀 إنشاء الحساب والدخول فوراً' : 'Create Account & Login')
                  : (s.lang === 'ar' ? '🔓 تسجيل الدخول' : 'Sign In')
              }
            </button>

            <div style="text-align:center; margin-top:14px; font-size:0.78rem; color:#A89B8D;">
              ${
                isRegister
                  ? (s.lang === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? ')
                  : (s.lang === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? ")
              }
              <button type="button" id="btn-switch-auth-mode" style="background:none; border:none; color:#FFA35C; font-weight:800; cursor:pointer; text-decoration:underline;">
                ${
                  isRegister
                    ? (s.lang === 'ar' ? 'سجل دخولك الآن' : 'Sign in here')
                    : (s.lang === 'ar' ? 'أنشئ حساباً مجاناً' : 'Register now')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = document.getElementById('client-auth-backdrop');
    const closeBtn = document.getElementById('btn-close-client-auth');
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const switchBtn = document.getElementById('btn-switch-auth-mode');
    const form = document.getElementById('client-auth-form');

    const closeModal = () => store.closeModal();

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        this.mode = 'login';
        store.notify();
      });
    }

    if (tabRegister) {
      tabRegister.addEventListener('click', () => {
        this.mode = 'register';
        store.notify();
      });
    }

    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.mode = this.mode === 'login' ? 'register' : 'login';
        store.notify();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('client-auth-phone')?.value.trim();
        const password = document.getElementById('client-auth-password')?.value;
        const fullName = document.getElementById('client-auth-fullname')?.value?.trim();

        const submitBtn = document.getElementById('btn-submit-client-auth');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = store.state.lang === 'ar' ? 'جاري التحقق...' : 'Checking...';
        }

        try {
          if (this.mode === 'register') {
            const res = await api.registerClient(fullName, phone, password);
            store.setClientUser(res.user);
            store.showToast(
              store.state.lang === 'ar'
                ? `أهلاً بك يا ${res.user.fullName} في مطابخ فرجاني! 👑`
                : `Welcome ${res.user.fullName}! 👑`,
              'success'
            );
          } else {
            const res = await api.loginClient(phone, password);
            store.setClientUser(res.user);
            store.showToast(
              store.state.lang === 'ar'
                ? `مرحباً بعودتك يا ${res.user.fullName}! 👋`
                : `Welcome back, ${res.user.fullName}! 👋`,
              'success'
            );
          }
          store.closeModal();
        } catch (err) {
          store.showToast(err.message || 'حدث خطأ في تسجيل الدخول', 'warn');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = this.mode === 'register' ? '🚀 إنشاء الحساب' : '🔓 تسجيل الدخول';
          }
        }
      });
    }
  }
}

export const clientAuthModal = new ClientAuthModal();
export default clientAuthModal;
