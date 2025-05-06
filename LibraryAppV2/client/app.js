document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM yüklendi, script çalıştırılıyor...");

    // JWT token işlemleri
    function decodeJWT(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (e) {
            console.error("JWT token decode hatası:", e);
            return null;
        }
    }

    function isTokenExpired(token) {
        const decoded = decodeJWT(token);
        if (!decoded) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }

    // DOM Elementleri - Tüm elementlerin varlığını kontrol et
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    const librarySection = document.getElementById("library-section");
    const logoutBtn = document.getElementById("logout-btn");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const filterApplyBtn = document.getElementById("filter-apply-btn");
    const filterClearBtn = document.getElementById("filter-clear-btn");
    const sortBy = document.getElementById("sort-by");
    const sortOrder = document.getElementById("sort-order");
    const pageLimit = document.getElementById("page-limit");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const currentPageSpan = document.getElementById("current-page");
    const totalPagesSpan = document.getElementById("total-pages");
    const bookList = document.getElementById("book-list");

    // Elementlerin varlığını kontrol et
    const elements = {
        loginContainer, registerContainer, librarySection, logoutBtn, 
        searchBtn, searchInput, filterApplyBtn, filterClearBtn,
        sortBy, sortOrder, pageLimit, prevPageBtn, nextPageBtn,
        currentPageSpan, totalPagesSpan, bookList
    };

    // DOM elementlerinin kontrolü
    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            console.error(`❌ ${name} elementi bulunamadı!`);
        } else {
            console.log(`✅ ${name} elementi bulundu.`);
        }
    });

    // Sayfalama değişkenleri
    let currentPage = 1;
    let totalPages = 1;
    function getLimit() {
        return parseInt(document.getElementById("page-limit")?.value || "10");
    }
    
    // Filtreleme ve arama durumlarını saklamak için
    let activeFilters = {};

    // Token işlemleri
    function saveToken(token) {
        if (token) {
            localStorage.setItem("token", token);
            console.log("✅ Token kaydedildi");
        } else {
            console.error("❌ Geçersiz token alındı:", token);
        }
    }
    
    // Görünüm işlemleri
    function showLibrary() {
        if (loginContainer) loginContainer.classList.add("hidden");
        if (registerContainer) registerContainer.classList.add("hidden");
        if (librarySection) librarySection.classList.remove("hidden");
    
        if (bookList) bookList.innerHTML = '';
        fetchBooks();
    }
    

    // Çıkış işlemi
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("token");
            alert("Başarıyla çıkış yaptınız.");
            location.reload();
        });
    }

    // Token kontrolü ve oturum yönetimi
    const token = localStorage.getItem("token");
    if (token) {
        if (isTokenExpired(token)) {
            alert("Token süresi dolmuş. Lütfen yeniden giriş yapın.");
            localStorage.removeItem("token");
            location.reload();
        } else {
            showLibrary();
        }
    }
    
    // Kayıt formu gönderimi
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("register-username").value;
            const password = document.getElementById("register-password").value;

            try {
                const response = await fetch("http://localhost:3000/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    saveToken(data.data.token);
                    alert("Kayıt başarılı. Giriş yapabilirsiniz.");
                    showLibrary();
                } else {
                    alert(`Kayıt başarısız: ${data.message || "Bir hata oluştu. Lütfen tekrar deneyin."}`);
                }
            } catch (error) {
                console.error("Kayıt işlemi hatası:", error);
                alert("Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            }
        });
    }

    // Giriş formu gönderimi
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch("http://localhost:3000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    saveToken(data.data.token);
                    alert("Giriş başarılı. Kitaplarınızı görüntüleyebilirsiniz.");
                    showLibrary();
                } else {
                    alert(`Giriş başarısız: ${data.message || "Bir hata oluştu. Lütfen tekrar deneyin."}`);
                }
            } catch (error) {
                console.error("Giriş işlemi hatası:", error);
                alert("Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            }
        });
    }

    // Data içindeki kitapları çıkartır
    function extractBooks(data) {
        console.log("Kitap verileri çıkarılıyor:", data);
        
        if (Array.isArray(data)) {
            return data;
        } else if (data.books && Array.isArray(data.books)) {
            return data.books;
        } else if (data.data && Array.isArray(data.data)) {
            return data.data;
        } else if (data.results && Array.isArray(data.results)) {
            return data.results;
        } else if (data.rows && Array.isArray(data.rows)) {
            return data.rows;
        } else {
            console.error("⚠️ Beklenmeyen API yanıt formatı:", data);
            return [];
        }
    }

    // Backend yanıtından sayfalama bilgilerini güncelleyen fonksiyon - daha sağlam hale getirildi
    function updatePaginationFromResponse(data, requestParams = {}) {
        console.log("📄 Sayfalama bilgileri güncellenecek:", data);
        console.log("📄 İstek parametreleri:", requestParams);
        
        // Eğer veri doğrudan bir dizi ise (sayfalama bilgisi olmayan)
        if (Array.isArray(data)) {
            const limit = requestParams.limit || getLimit();
            totalPages = Math.max(1, Math.ceil(data.length / limit));
            currentPage = 1;
            console.log(`📊 Array için sayfalama oluşturuldu: ${data.length} kitap / ${limit} limit = ${totalPages} sayfa`);
            updatePaginationUI();
            return;
        }
        
        // Önceki değerleri sakla
        let oldTotalPages = totalPages;
        let oldCurrentPage = currentPage;
        
        // Backend'den gelen sayfalama verilerini daha dikkatli işle
        // Önce doğrudan ana veri içindeki sayfalama bilgilerini kontrol et
        if (data.page !== undefined) currentPage = parseInt(data.page);
        if (data.totalPages !== undefined) totalPages = parseInt(data.totalPages);
        
        // Toplam kitap sayısı ve limit bilgisinden sayfa sayısını hesapla
        let totalBooks = null;
        let limit = requestParams.limit || getLimit();
        
        if (data.totalBooks !== undefined) totalBooks = parseInt(data.totalBooks);
        else if (data.meta && data.meta.totalBooks !== undefined) totalBooks = parseInt(data.meta.totalBooks);
        else if (data.pagination && data.pagination.totalItems !== undefined) totalBooks = parseInt(data.pagination.totalItems);
        else if (Array.isArray(data.books)) totalBooks = data.books.length;
        else if (Array.isArray(data.rows)) totalBooks = data.rows.length;
        
        // Toplam kitap sayısı varsa ve sayfalar hesaplanmamışsa hesapla
        if (totalBooks !== null && (data.totalPages === undefined && (!data.meta || data.meta.totalPages === undefined) && (!data.pagination || data.pagination.totalPages === undefined))) {
            totalPages = Math.max(1, Math.ceil(totalBooks / limit));
            console.log(`📊 Toplam sayfa sayısı hesaplandı: ${totalBooks} kitap / ${limit} limit = ${totalPages} sayfa`);
        }
        
        // Meta içindeki sayfalama bilgileri
        else if (data.meta) {
            if (data.meta.page !== undefined) currentPage = parseInt(data.meta.page);
            if (data.meta.totalPages !== undefined) totalPages = parseInt(data.meta.totalPages);
        }
        
        // Pagination içindeki sayfalama bilgileri
        else if (data.pagination) {
            if (data.pagination.page !== undefined) currentPage = parseInt(data.pagination.page);
            if (data.pagination.totalPages !== undefined) totalPages = parseInt(data.pagination.totalPages);
        }
        
        // Hiçbir meta veri yoksa, ve veri bir dizi değilse en az 1 sayfa olduğunu varsay
        if (totalPages < 1) totalPages = 1;
        
        // Değişiklik olduysa log
        if (oldTotalPages !== totalPages) {
            console.log(`📑 Toplam sayfa sayısı güncellendi: ${oldTotalPages} -> ${totalPages}`);
        }
        
        if (oldCurrentPage !== currentPage) {
            console.log(`📑 Geçerli sayfa güncellendi: ${oldCurrentPage} -> ${currentPage}`);
        }
        
        // Geçerli sayfa numarasının, toplam sayfa sayısından büyük olmamasını sağla
        if (currentPage > totalPages) {
            console.warn(`⚠️ Geçerli sayfa (${currentPage}), toplam sayfa sayısından (${totalPages}) büyük! Düzeltiliyor.`);
            currentPage = totalPages;
        }
        
        // Sayfalama bileşenlerini güncelle
        updatePaginationUI();
    }
    // Sayfalama UI'sını günceller
    function updatePaginationUI() {
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        
        // Sayfalama butonlarının durumunu güncelle
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
        }
        
        console.log(`📄 Sayfa ${currentPage}/${totalPages}`);
        
        // Sayfalama butonlarını yeniden ayarla
        setupPaginationButtons();
    }

    // Kitapları getir - filtreleme, arama ve sayfalama seçenekleriyle
    async function fetchBooks(params = {}) {
        try {
            // Eğer params içinde page parametresi varsa, currentPage'i güncelle
            if (params.page !== undefined) {
                currentPage = parseInt(params.page);
            }
            
            // Varsayılan parametreler
            const defaultParams = {
                page: currentPage,
                limit: getLimit(),
                sortBy: sortBy?.value || "createdAt",
                sortOrder: sortOrder?.value || "DESC",
                _nocache: params._nocache || Date.now() // Her zaman cache bypass ekleyelim
            };
            
            // Parametreleri birleştir (params öncelikli)
            const allParams = { ...defaultParams, ...activeFilters, ...params };
            
            console.log("🔍 İstek parametreleri:", allParams);
            
            // URL parametrelerini oluştur
            const queryParams = Object.keys(allParams)
                .filter(key => allParams[key] !== null && allParams[key] !== undefined && allParams[key] !== '')
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
                .join('&');
            
            const url = `http://localhost:3000/books?${queryParams}`;
    
            console.log("📡 Fetch URL:", url);
            
            // İstek zamanını logla
            const fetchStartTime = Date.now();
            
            const response = await fetch(url, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    // Cache kontrolü için güçlendirilmiş header'lar
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            });
    
            // İstek tamamlandı zamanını logla
            const fetchEndTime = Date.now();
            console.log(`⏱️ Fetch tamamlandı: ${fetchEndTime - fetchStartTime}ms`);
    
            if (!response.ok) {
                throw new Error(`Kitaplar alınırken hata oluştu! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("📚 Backend yanıtı:", data);
            
            // Kitapları çıkart
            let books = extractBooks(data);
            console.log(`📊 ${books.length} kitap alındı.`);
            
            // Sayfalama bilgilerini güncelle
            updatePaginationFromResponse(data, allParams);
            
            // Kitap listesini güncelle
            renderBooks(books);
    
        } catch (error) {
            console.error("❌ Hata:", error);
            alert("Kitaplar alınırken bir hata oluştu: " + error.message);
        }
    }
    // Butonlara event listener ekle - Bu kodu sadece bir kez çalıştırın!
    function setupPaginationButtons() {
        if (prevPageBtn) {
            prevPageBtn.onclick = function() {
                if (currentPage > 1) {
                    console.log("◀️ Önceki sayfa tıklaması");
                    fetchBooks({ page: currentPage - 1, _nocache: Date.now() });
                }
            };
        }
    
        if (nextPageBtn) {
            nextPageBtn.onclick = function() {
                if (currentPage < totalPages) {
                    console.log("▶️ Sonraki sayfa tıklaması");
                    fetchBooks({ page: currentPage + 1, _nocache: Date.now() });
                }
            };
        }
    }

    // Kitap listesini render etme
    function renderBooks(books) {
        if (!bookList) return;
        
        bookList.innerHTML = "";
        
        if (books.length === 0) {
            bookList.innerHTML = `
                <li class="text-center p-4 border border-gray-300 rounded-md bg-gray-50">
                    Kitap bulunamadı.
                </li>`;
            return;
        }

        books.forEach(book => {
            const li = document.createElement("li");
            li.className = "flex justify-between items-center p-4 border border-gray-300 rounded-md bg-white shadow-sm";
            li.innerHTML = `
                <span>${book.title || 'İsimsiz'} - ${book.author || 'Yazar belirtilmemiş'}</span>
                <div>
                    <button class="update-btn bg-green-500 text-white py-1 px-3 rounded-md text-sm mr-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" data-id="${book.id}" data-title="${book.title || ''}" data-author="${book.author || ''}">Düzenle</button>
                    <button class="delete-btn bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500" data-id="${book.id}">Sil</button>
                </div>
            `;
            bookList.appendChild(li);
        });
        
        // Event dinleyicileri ekle
        addButtonEventListeners();
    }
    
    // Düğmelere olay dinleyicileri ekle
    function addButtonEventListeners() {
        // Silme butonları için
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                if (confirm("Bu kitabı silmek istediğinizden emin misiniz?")) {
                    deleteBook(bookId);
                }
            });
        });

        // Düzenleme butonları için
        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                const title = this.getAttribute('data-title');
                const author = this.getAttribute('data-author');
                editBook(bookId, title, author);
            });
        });
    }

    async function deleteBook(bookId) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Oturum süresi dolmuş olabilir. Lütfen yeniden giriş yapın.");
                return;
            }
    
            const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            });
    
            console.log("Silme isteği yanıtı:", response.status);
    
            if (response.status >= 200 && response.status < 300) {
                alert("Kitap başarıyla silindi.");
    
                // Sayfadaki kitap sayısı 1 ise ve son sayfadaysak, önceki sayfaya dön
                const currentPageItems = document.querySelectorAll('#book-list li').length;
                if (currentPageItems <= 1 && currentPage > 1) {
                    currentPage = currentPage - 1;
                }
    
                // Listeyi hemen temizle
                if (bookList) bookList.innerHTML = '';
    
                // Kitapları yeniden yükle
                fetchBooks({
                    page: currentPage,
                    _nocache: Date.now()
                });
                return;
            }
    
            const errorData = await response.json().catch(() => ({}));
            alert(`Kitap silinirken bir hata oluştu: ${errorData.message || response.statusText || 'Bilinmeyen hata'}`);
        } 
        catch (error) {
            console.error("❌ Silme işlemi hatası:", error);
            alert("Kitap silinirken beklenmeyen bir hata oluştu: " + error.message);
        }
    }
    

    // Kitap düzenleme
    async function editBook(bookId, oldTitle, oldAuthor) {
        const newTitle = prompt("Yeni Başlık", oldTitle);
        const newAuthor = prompt("Yeni Yazar", oldAuthor);

        if (!newTitle || !newAuthor) {
            alert("Başlık ve yazar adı boş bırakılamaz.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token bulunamadı. Lütfen giriş yapın.");
            return;
        }

        try {
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
                alert("Kitap başarıyla güncellendi.");
            } else {
                const errorData = await response.json();
                alert(`Kitap güncellenirken hata oluştu: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Güncelleme hatası:", error);
            alert("Kitap güncellenirken bir hata oluştu: " + error.message);
        }
    }

    // Yeni kitap ekleme
const bookForm = document.getElementById("book-form");
if (bookForm) {
    bookForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const token = localStorage.getItem("token");
        
        if (!token) {
            alert("Token bulunamadı. Lütfen giriş yapın.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    // Cache kontrolü için güçlendirilmiş header'lar
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                },
                body: JSON.stringify({ title, author })
            });

            if (response.ok) {
                // Form alanlarını temizle
                document.getElementById("title").value = "";
                document.getElementById("author").value = "";
                
                // Backend'den gelen yanıtı işle
                const data = await response.json();
                
                // Backend'den direkt kitap listesi dönüyorsa, hemen render et
                if (data.books && Array.isArray(data.books)) {
                    renderBooks(data.books);
                    
                    // Sayfalama bilgilerini güncelle
                    if (data.totalPages) totalPages = data.totalPages;
                    if (data.page) currentPage = data.page;
                    updatePaginationUI();
                    
                    alert("Kitap başarıyla eklendi.");
                } else {
                    // Backend direkt kitap listesi dönmüyorsa, zorla yeniden yükle
                    alert("Kitap başarıyla eklendi.");
                    
                    // _nocache parametresi ekleyerek cache'i bypass et
                    fetchBooks({
                        page: 1,
                        _nocache: Date.now()
                    });
                }
            } else {
                const errorData = await response.json();
                alert(`Kitap eklenirken hata oluştu: ${errorData.message || "Bir hata oluştu."}`);
            }
        } catch (error) {
            console.error("Kitap ekleme hatası:", error);
            alert("Kitap eklenirken bir hata oluştu: " + error.message);
        }
    });
}
    // Kayıt ve giriş formları arasında geçiş
    const showRegisterBtn = document.getElementById("show-register");
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener("click", function () {
            if (loginContainer) loginContainer.classList.add("hidden");
            if (registerContainer) registerContainer.classList.remove("hidden");
        });
    }

    const showLoginBtn = document.getElementById("show-login");
    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", function () {
            if (registerContainer) registerContainer.classList.add("hidden");
            if (loginContainer) loginContainer.classList.remove("hidden");
        });
    }

    // Arama fonksiyonu
    if (searchBtn) {
        searchBtn.addEventListener("click", function() {
            const query = searchInput?.value.trim() || "";
            console.log("🔍 Arama yapılıyor:", query);
            
            // Sayfayı resetle ve arama yap
            currentPage = 1;
            
            // Aktif filtreleri sıfırla ve sadece arama parametresini ekle
            activeFilters = {};
            if (query) {
                activeFilters.q = query;
            }
            
            fetchBooks({
                page: 1,
                q: query
            });
        });
    }

    // Enter tuşu ile arama
    if (searchInput) {
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if (searchBtn) searchBtn.click();
            }
        });
    }

    // Filtreleme uygulama
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener("click", function() {
            const title = document.getElementById("filter-title")?.value.trim() || "";
            const author = document.getElementById("filter-author")?.value.trim() || "";
            const startDate = document.getElementById("filter-start-date")?.value || "";
            const endDate = document.getElementById("filter-end-date")?.value || "";
            
            console.log("🔍 Filtreleme yapılıyor:", {title, author, startDate, endDate});
            
            // Sayfayı resetle
            currentPage = 1;
            
            // Aktif filtreleri güncelleyelim
            activeFilters = {};
            
            // Boş olmayan filtreleri ekle
            if (title) activeFilters.title = title;
            if (author) activeFilters.author = author;
            if (startDate) activeFilters.startDate = startDate;
            if (endDate) activeFilters.endDate = endDate;
            
            fetchBooks({
                page: 1,
                title,
                author,
                startDate,
                endDate
            });
        });
    }

    // Filtreleri temizleme
    if (filterClearBtn) {
        filterClearBtn.addEventListener("click", function() {
            // Form alanlarını temizle
            const titleInput = document.getElementById("filter-title");
            const authorInput = document.getElementById("filter-author");
            const startDateInput = document.getElementById("filter-start-date");
            const endDateInput = document.getElementById("filter-end-date");
            
            if (titleInput) titleInput.value = "";
            if (authorInput) authorInput.value = "";
            if (startDateInput) startDateInput.value = "";
            if (endDateInput) endDateInput.value = "";
            
            console.log("🧹 Filtreler temizlendi");
            
            // Aktif filtreleri sıfırla
            activeFilters = {};
            currentPage = 1;
            
            // Filtrelenmiş kitapları getir
            fetchBooks({page: 1});
        });
    }

    // Sıralama değiştiğinde yeniden yükle
    if (sortBy) {
        sortBy.addEventListener("change", function() {
            console.log("🔄 Sıralama değişti:", sortBy.value);
            fetchBooks();
        });
    }

    if (sortOrder) {
        sortOrder.addEventListener("change", function() {
            console.log("🔄 Sıralama yönü değişti:", sortOrder.value);
            fetchBooks();
        });
    }

    // Sayfa başına gösterilecek kitap sayısı değiştiğinde
    if (pageLimit) {
        pageLimit.addEventListener("change", function() {
            limit = parseInt(pageLimit.value);
            currentPage = 1; // İlk sayfaya dön
            console.log("📊 Sayfa başına limit değişti:", limit);
            fetchBooks();
        });
    }

    // Pagination butonlarını ayarla ve ilk verileri yükle
    setupPaginationButtons();
    
    // NOT: showLibrary() fonksiyonu oturum kontrolü sırasında çağrılıyor
    // Bu nedenle token varsa otomatik olarak kitaplar yüklenecek
});