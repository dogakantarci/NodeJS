# Base image olarak Node.js seçiyoruz
FROM node:18

# Uygulamanın çalışma dizini /app olarak ayarlanıyor
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Gerekli bağımlılıkları yükle
RUN npm install

# Uygulama dosyalarını kopyala
COPY . .

# Sunucu başlatmak için komut
CMD ["npm", "start"]
