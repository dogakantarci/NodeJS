const axios = require("axios");

document.addEventListener("DOMContentLoaded", async function () {
    const bookList = document.getElementById("book-list");

    try {
        // Backend API'yi çağır
        const response = await axios.get("http://my-app:3000/books");

        response.data.forEach(book => {
            const li = document.createElement("li");
            li.textContent = `${book.title} - ${book.author}`;
            bookList.appendChild(li);
        });
    } catch (error) {
        console.error("Kitapları çekerken hata oluştu!", error);
    }
});
