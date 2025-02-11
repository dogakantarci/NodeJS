document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    const librarySection = document.getElementById("library-section");
    const logoutBtn = document.getElementById("logout-btn");

    // 📌 Giriş yapınca veya kayıt olunca token'ı kaydet
    function saveToken(token) {
        if (token) {
            localStorage.setItem("token", token);
            console.log("✅ Token kaydedildi:", token);
        } else {
            console.error("❌ Geçersiz token alındı:", token);
        }
    }

    // 📌 Kullanıcı giriş yaptıysa kitap listesini göster
    function showLibrary() {
        loginContainer.classList.add("hidden");
        registerContainer.classList.add("hidden");
        librarySection.classList.remove("hidden");
        fetchBooks();
    }

    // 📌 Çıkış yap
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        location.reload();
    });

    // 📌 Token var mı kontrol et
    const token = localStorage.getItem("token");
    if (token) {
        showLibrary();
    }

    // 📌 Kayıt Olma
    document.getElementById("register-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            saveToken(data.token); // Kayıt sonrası token'ı kaydet
            window.location.href = "/books"; // Giriş sonrası otomatik yönlendirme
        } else {
            alert(data.message); // Hata mesajını göster
        }
    });

    // 📌 Giriş Yapma
    document.getElementById("login-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log("Giriş yanıtı:", data);

        if (response.ok) {
            saveToken(data.data.token); // ✅ Doğru şekilde kaydediyoruz!
            window.location.href = "/books"; // Giriş sonrası otomatik yönlendirme
        } else {
            alert("Giriş başarısız: " + data.message);
        }
    });

    // 📌 Kitapları Getir
    async function fetchBooks() {
        try {
            const response = await fetch("http://localhost:3000/books", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            if (!response.ok) {
                throw new Error('Kitaplar alınırken bir hata oluştu!');
            }

            const books = await response.json();
            const bookList = document.getElementById("book-list");
            bookList.innerHTML = "";
            books.forEach(book => {
                const li = document.createElement("li");
                li.textContent = `${book.title} - ${book.author}`;
                bookList.appendChild(li);
            });
        } catch (error) {
            alert(error.message); // Hata mesajı göster
        }
    }

    // 📌 Kitap Ekleme
    document.getElementById("book-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token bulunamadı. Lütfen giriş yapın.");
            return;
        }

        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Token'ı doğru şekilde gönderdiğinizden emin olun
            },
            body: JSON.stringify({ title, author })
        });

        if (response.ok) {
            fetchBooks();
            event.target.reset();
        } else {
            const data = await response.json();
            alert("Kitap eklenirken hata oluştu: " + data.message);
        }
    });

    // 📌 Formlar arasında geçiş yap
    document.getElementById("show-register").addEventListener("click", function () {
        loginContainer.classList.add("hidden");
        registerContainer.classList.remove("hidden");
    });

    document.getElementById("show-login").addEventListener("click", function () {
        registerContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });
});
