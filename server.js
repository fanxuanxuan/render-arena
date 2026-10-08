const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET = 'https://arena.ai';

app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,        // 让目标网站认为请求来自它自己
  secure: true,               // 验证SSL证书
  followRedirects: true,      // 自动跟随重定向
  
  // 修改响应头，让浏览器能正确处理cookie
  cookieDomainRewrite: {
    '*': ''   // 把cookie的domain属性清空，适配你的新域名
  },
  
  // 处理重定向地址，把arena.ai替换成你的域名
  onProxyRes: function (proxyRes, req, res) {
    const location = proxyRes.headers['location'];
    if (location && location.includes('arena.ai')) {
      proxyRes.headers['location'] = location.replace(
        'https://arena.ai', 
        `https://${req.headers.host}`
      );
    }
  },

  // 添加必要的请求头，伪装成正常浏览器请求
  onProxyReq: function(proxyReq, req, res) {
    proxyReq.setHeader('Referer', TARGET);
    proxyReq.setHeader('Origin', TARGET);
  },

  // 处理websocket（如果arena.ai用到了）
  ws: true,
  
  logLevel: 'debug' // 方便你在Render日志里看到详细请求情况
}));

app.listen(PORT, () => {
  console.log(`代理服务器运行在端口 ${PORT}`);
});