FROM node:18-alpine 

WORKDIR /app

# Paket dosyalarını kopyala
COPY src/apps/web/package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Web uygulamasının tüm dosyalarını kopyala
COPY src/apps/web/ ./

# Geliştirme modunda çalıştır
CMD ["npm", "run", "dev"]
