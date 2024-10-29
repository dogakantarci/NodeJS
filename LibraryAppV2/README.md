# LibraryAppV2 📚

LibraryAppV2, kullanıcıların kitapları yönetmesine, eklemesine, güncellemesine ve silmesine olanak tanıyan bir kütüphane uygulamasıdır. Bu proje, Node.js ve Express.js kullanılarak geliştirilmiştir ve MongoDB ile veri saklamaktadır.

## İçindekiler 📋

- [Özellikler](#özellikler-✨)
- [Teknolojiler](#teknolojiler-⚙️)
- [Kurulum](#kurulum-🛠️)
- [Kullanım](#kullanım-🚀)
- [Testler](#testler-🧪)
- [Lisans](#lisans-📄)
- [İletişim](#iletişim-😊)

## Özellikler ✨

- Kitap ekleme, güncelleme ve silme
- Tüm kitapları listeleme
- Belirli bir kitabı ID ile arama
- Hata yönetimi ve uygun geri bildirim mesajları

## Teknolojiler ⚙️

- Node.js
- Express.js
- Mongoose
- JSON Web Token
- Sinon (test için)
- Jest (test için)

## Kurulum 🛠️

Projenizi yerel ortamınıza kurmak için aşağıdaki adımları izleyin:

1. **Repository'yi Klonlayın:**

   ```bash
   git clone https://github.com/dogakantarci/NodeJS.git
   cd NodeJS/LibraryAppV2

2. **Gerekli Paketleri Yükleyin:**
   
   ```bash
    npm install

3. **Ortam Değişkenlerini Ayarlayın:**

    .env dosyasını oluşturun ve gerekli ortam değişkenlerini ekleyin. Örnek bir yapı şu şekilde olabilir:

   ```env
    MONGODB_URI=your_mongodb_uri
    PORT=3000

4. **Sunucuyu Başlatın:**

   ```bash
    npm start

## Kullanım 🚀
    Uygulama çalışmaya başladıktan sonra, aşağıdaki API uç noktalarını kullanabilirsiniz:

    Tüm Kitapları Listele: GET /books
    Kitap Ekle: POST /books
    Belirli Bir Kitabı Getir: GET /books/:id
    Kitap Güncelle: PUT /books/:id
    Kitap Sil: DELETE /books/:id

## Testler 🧪

    Testleri çalıştırmak için:

    ```bash
    npm test

## Lisans 📄

Bu proje GNU Genel Kamu Lisansı ile lisanslanmıştır.

## İletişim 😊
Herhangi bir sorun veya geri bildirim için lütfen iletişime geçin!