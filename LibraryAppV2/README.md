### English 🇬🇧

# LibraryAppV2 📚

LibraryAppV2 is a library application that allows users to manage, add, update, and delete books. This project is developed using Node.js and Express.js and stores data using MongoDB.

## Table of Contents 📋
- [Features](#features-✨)
- [Technologies](#technologies-⚙️)
- [Installation](#installation-🛠️)
- [Usage](#usage-🚀)
- [Tests](#tests-🧪)
- [License](#license-📄)
- [Contact](#contact-😊)

## Features ✨

- Add, update, and delete books
- List all books
- Search for a specific book by ID
- Error handling and appropriate feedback messages

## Technologies ⚙️

- Node.js
- Express.js
- Mongoose
- JSON Web Token
- Sinon (for testing)
- Jest (for testing)

## Installation 🛠️

To set up your project in your local environment, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/dogakantarci/NodeJS.git
   cd NodeJS/LibraryAppV2

2. **Install Required Packages:**

   ```bash
    npm install

3. **Set Environment Variables:**

    Create a .env file and add the necessary environment variables. An example setup may look like this:

   ```env
    MONGODB_URI=your_mongodb_uri
    PORT=3000
4. **Start the Server:**

   ```bash
    npm start

## Usage 🚀
Once the application is up and running, you can use the following API endpoints:

    List All Books: GET /books
    Add a Book: POST /books
    Get a Specific Book: GET /books/:id
    Update a Book: PUT /books/:id
    Delete a Book: DELETE /books/:id

## Tests 🧪

To run the tests:

```bash
npm test

## License 📄
This project is licensed under the GNU General Public License.

## Contact 😊
Please feel free to reach out with any questions or feedback!

### Türkçe 🇹🇷

# LibraryAppV2 📚

LibraryAppV2, kullanıcıların kitapları yönetmesine, eklemesine, güncellemesine ve silmesine olanak tanıyan bir kütüphane uygulamasıdır. Bu proje, Node.js ve Express.js kullanılarak geliştirilmiştir ve MongoDB ile veri saklamaktadır.

## İçindekiler 📋
- [Özellikler](#ozellikler-✨)
- [Teknolojiler](#teknolojiler-⚙️)
- [Kurulum](#kurulum-🛠️)
- [Kullanım](#kullanım-🚀)
- [Testler](#testler-🧪)
- [Lisans](#lisans-📄)
- [İletişim](#iletisim-😊)

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