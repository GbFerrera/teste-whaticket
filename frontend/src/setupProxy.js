const httpProxy = require('http-proxy');

module.exports = function(app) {
  const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:8080',
    changeOrigin: true
  });

  app.use('/api', (req, res, next) => {
    proxy.web(req, res, next);
  });
};
