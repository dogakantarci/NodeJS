# Nginx temel imajını kullan
FROM nginx:alpine

# HTML, CSS ve JS dosyalarını Nginx'in servis ettiği klasöre kopyala
COPY . /usr/share/nginx/html

# Nginx portunu aç
EXPOSE 80

# Nginx başlat
CMD ["nginx", "-g", "daemon off;"]
