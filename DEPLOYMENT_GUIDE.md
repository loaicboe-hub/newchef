# 👑 دليل تشغيل ونشر نظام مطابخ الشيف فرجاني على سيرفر Hostinger VPS

يشرح هذا الدليل خطوات إعداد وتشغيل السيرفر بالكامل على **Ubuntu 22.04 / 24.04 VPS** في Hostinger مع ربطه بالواجهة الأمامية المنشورة على Vercel.

---

## 1. متطلبات السيرفر (Hostinger VPS)
- **نظام التشغيل:** Ubuntu 22.04 LTS أو 24.04 LTS
- **الذاكرة:** 1GB RAM أو أكثر (KVM 1 أو KVM 2 مناسب جداً)
- **المنافذ المفتوحة:** 80 (HTTP), 443 (HTTPS), 22 (SSH)

---

## 2. الإعداد الأوتوماتيكي السريع للسيرفر (One-Click Setup)
بعد الاتصال بالسيرفر عبر SSH:
```bash
ssh root@YOUR_SERVER_IP
```

قم بتشغيل سكربت الإعداد التلقائي:
```bash
mkdir -p /var/www/chef-fergany
cd /var/www/chef-fergany
git clone https://github.com/loaicboe-hub/newchef.git .
bash deploy/setup-vps.sh
```

---

## 3. إعداد قاعدة بيانات PostgreSQL
السكربت يقوم بإنشاء القاعدة أوتوماتيكياً. للتأكد أو التعديل يدوياً:
```bash
sudo -u postgres psql
```
داخل موجه PostgreSQL:
```sql
CREATE USER chef_user WITH PASSWORD 'SuperStrongPassword2026';
CREATE DATABASE chef_fergany OWNER chef_user;
GRANT ALL PRIVILEGES ON DATABASE chef_fergany TO chef_user;
\q
```

---

## 4. إعداد ملف البيئة (.env)
داخل مسار الباك إند:
```bash
cd /var/www/chef-fergany/backend
cp .env.example .env
nano .env
```
تأكد من تعديل القيم:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://chef_user:SuperStrongPassword2026@localhost:5432/chef_fergany"
JWT_SECRET="YOUR_RANDOM_SECURE_JWT_SECRET_STRING_2026"
FRONTEND_URL="https://newchef-azure.vercel.app"
UPLOAD_PATH="/var/www/chef-fergany/uploads"
```

---

## 5. تثبيت الاعتمادات وتجهيز قاعدة البيانات (Prisma)
```bash
cd /var/www/chef-fergany/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run build
```

> **ملاحظة:** سكريبت الـ Seed يقوم بإنشاء حساب المدير السوبر والأقسام الرئيسية والأصناف:
> - **رقم هاتف الأدمن:** `01040925170`
> - **البريد:** `admin@cheffergany.com`
> - **كلمة المرور الافتراضية:** `Admin@Fergany2026!`

---

## 6. تشغيل السيرفر بواسطة PM2
من المجلد الرئيسي للمشروع:
```bash
cd /var/www/chef-fergany
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

فحص حالة السيرفر:
```bash
pm2 status
pm2 logs chef-fergany-api
```

---

## 7. ضبط سيرفر Nginx وتفعيل شهادة الأمان SSL (Certbot)
1. انسخ ملف الإعداد:
```bash
sudo cp /var/www/chef-fergany/nginx.conf /etc/nginx/sites-available/chef-fergany.conf
sudo ln -sf /etc/nginx/sites-available/chef-fergany.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

2. تفعيل شهادة SSL مجانية من Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 8. اختبار فحص الخادم (Health Check)
افتح المتصفح أو قم بتشغيل cURL:
```bash
curl http://localhost:5000/api/health
```
النتيجة المتوقعة:
```json
{
  "status": "ok",
  "service": "Chef Fergany API",
  "timestamp": "2026-10-21T..."
}
```
