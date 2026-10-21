module.exports = {
  apps: [
    {
      name: 'chef-fergany-api',
      script: './backend/dist/server.js',
      cwd: '/var/www/chef-fergany',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/chef-fergany/err.log',
      out_file: '/var/log/chef-fergany/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
