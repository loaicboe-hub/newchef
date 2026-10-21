#!/usr/bin/env bash
# ==============================================================================
# Chef Fergany Restaurant - Hostinger Ubuntu VPS Automated Setup Script
# Run on fresh Ubuntu 22.04 / 24.04 as root or with sudo:
# bash setup-vps.sh
# ==============================================================================

set -e

echo "👑 ============================================================"
echo "👑 Installing Chef Fergany Full Production System on Ubuntu VPS"
echo "👑 ============================================================"

# 1. Update OS packages
echo "📦 1. Updating APT packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw software-properties-common nginx postgresql postgresql-contrib

# 2. Install Node.js 20 LTS
echo "🟢 2. Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 tsx

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"

# 3. Setup PostgreSQL Database & User
echo "🐘 3. Configuring PostgreSQL Database..."
DB_NAME="chef_fergany"
DB_USER="chef_user"
DB_PASS="SuperStrongPassword2026" # Change this password in production!

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true

echo "✅ PostgreSQL database '$DB_NAME' and user '$DB_USER' configured."

# 4. Create App Directories
echo "📁 4. Creating Application & Upload Directories..."
sudo mkdir -p /var/www/chef-fergany/uploads
sudo mkdir -p /var/log/chef-fergany
sudo chown -R $USER:$USER /var/www/chef-fergany
sudo chown -R $USER:$USER /var/log/chef-fergany
chmod -R 755 /var/www/chef-fergany/uploads

# 5. Configure Firewall (UFW)
echo "🛡️ 5. Setting up UFW Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status

# 6. Configure Nginx
echo "🌐 6. Configuring Nginx..."
if [ -f "/var/www/chef-fergany/nginx.conf" ]; then
    sudo cp /var/www/chef-fergany/nginx.conf /etc/nginx/sites-available/chef-fergany.conf
    sudo ln -sf /etc/nginx/sites-available/chef-fergany.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
fi

echo "🎉 VPS Setup Script Completed Successfully!"
echo "Next steps:"
echo "1. Clone or copy backend files into /var/www/chef-fergany"
echo "2. Run 'npm install' in /var/www/chef-fergany/backend"
echo "3. Run 'npx prisma migrate dev' and 'npx prisma db seed'"
echo "4. Build and start with 'pm2 start ecosystem.config.js'"
echo "5. Issue SSL certificate via: 'sudo certbot --nginx -d your-domain.com'"
