# 备用部署方式：nginx 托管纯静态产物
# 构建：pnpm build && docker build -t master-tailor .
# 运行：docker run -p 8080:80 master-tailor
FROM nginx:alpine

COPY dist /usr/share/nginx/html

# hash 路由的 SPA 无需 fallback 配置；开启 gzip 提升字体与 JS 传输效率
RUN printf 'gzip on;\ngzip_types text/css application/javascript application/json image/svg+xml font/woff2 text/markdown;\ngzip_min_length 1024;\n' \
  > /etc/nginx/conf.d/gzip.conf

EXPOSE 80
