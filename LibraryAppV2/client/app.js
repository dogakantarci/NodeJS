document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    const librarySection = document.getElementById("library-section");
    const logoutBtn = document.getElementById("logout-btn");

    function saveToken(token) {
        if (token) {
            localStorage.setItem("token", token);
            console.log("✅ Token kaydedildi:", token);
        } else {
            console.error("❌ Geçersiz token alındı:", token);
        }
    }

    function showLibrary() {
        loginContainer.classList.add("hidden");
        registerContainer.classList.add("hidden");
        librarySection.classList.remove("hidden");
        fetchBooks();
    }

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        location.reload();
    });

    const token = localStorage.getItem("token");
    if (token) {
        showLibrary();
    }

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
            saveToken(data.token);
            window.location.href = "/books";
        } else {
            alert(data.message);
        }
    });

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
        if (response.ok) {
            saveToken(data.data.token);
            window.location.href = "/books";
        } else {
            alert("Giriş başarısız: " + data.message);
        }
    });

    async function fetchBooks() {
        try {
            const response = await fetch("http://localhost:3000/books", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            if (!response.ok) {
                throw new Error(`Kitaplar alınırken hata oluştu! Status: ${response.status}`);
            }

            const books = await response.json();
            console.log("Kitaplar alındı:", books);
            const bookList = document.getElementById("book-list");
            bookList.innerHTML = "";

            books.forEach(book => {
                const li = document.createElement("li");
                li.innerHTML = `${book.title} - ${book.author} 
                    <button id="delete-${book.id}">Sil</button>
                    <button id="edit-${book.id}">Düzenle</button>`;
                bookList.appendChild(li);

                // Silme butonuna event listener ekleyelim
                const deleteButton = li.querySelector(`#delete-${book.id}`);
                if (deleteButton) {  // deleteButton null değilse, event listener ekle
                    deleteButton.addEventListener('click', function () {
                        if (confirm(`Kitap "${book.title}"'i silmek istediğinizden emin misiniz?`)) {
                            deleteBook(book.id);  // book.id'yi kullan
                        }
                    });
                }

                // Düzenleme butonuna event listener ekleyelim
                const editButton = li.querySelector(`#edit-${book.id}`);
                if (editButton) {
                    editButton.addEventListener('click', function () {
                        editBook(book.id, book.title, book.author);
                    });
                }
            });

        } catch (error) {
            console.error("Hata:", error);
            alert(error.message);
        }
    }

    // Silme işlemi
    async function deleteBook(bookId) {
        console.log("Silme işlemi için gönderilen kitap ID'si:", bookId);
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(`Kitap silme hatası: ${data.message || response.statusText}`);
            }

            alert("Kitap başarıyla silindi.");
            fetchBooks(); // Kitapları tekrar yükle
        } catch (error) {
            console.error("Silme işlemi başarısız:", error);
            alert("Silme işlemi sırasında bir hata oluştu: " + error.message);
        }
    }

    // Kitap düzenleme işlemi
    async function editBook(bookId, oldTitle, oldAuthor) {
        const newTitle = prompt("Yeni Başlık", oldTitle);
        const newAuthor = prompt("Yeni Yazar", oldAuthor);

        // Boş başlık veya yazar girilmesine izin verilmez
        if (!newTitle || !newAuthor) {
            alert("Başlık ve yazar adı boş bırakılamaz.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token bulunamadı. Lütfen giriş yapın.");
            return;
        }

        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: newTitle, author: newAuthor })
        });

        if (response.ok) {
            fetchBooks();
        } else {
            alert("Kitap güncellenirken hata oluştu!");
        }
    }

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
                "Authorization": `Bearer ${token}`
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

    document.getElementById("show-register").addEventListener("click", function () {
        loginContainer.classList.add("hidden");
        registerContainer.classList.remove("hidden");
    });

    document.getElementById("show-login").addEventListener("click", function () {
        registerContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });
});
