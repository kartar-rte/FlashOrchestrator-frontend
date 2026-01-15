module.exports = {
  apps: [{
    name: 'flashorchestrator-frontend',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
