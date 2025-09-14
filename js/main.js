const basePath = '/'; 

/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    loadData(); // Kiểm tra và load dữ liệu từ mock-data nếu cần
    loadHeader(); // Render header vào phần tử có id="main-header"
    loadFooter(); // Render footer vào phần tử có id="main-footer"
    renderFeaturedProducts();
    renderCategories();
}

/*
 * Kiểm tra localStorage, nếu không có thì copy từ mock-data
 */
function loadData() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(window.MOCK_PRODUCTS));
    }
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(window.MOCK_CATEGORIES));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(window.MOCK_USERS));
    }
    if (!localStorage.getItem('addresses')) {
        localStorage.setItem('addresses', JSON.stringify(window.MOCK_ADDRESSES));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(window.MOCK_ORDERS));
    }
    // Khởi tạo giỏ hàng nếu chưa có
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}


/**
 * Render Header (dùng chung cho nhiều trang)
 */
function loadHeader() {
    const header = document.getElementById('main-header');
    if (!header) {
        console.error("Không tìm thấy phần tử header với id='main-header'");
        return;
    }

    const currentUserJson = localStorage.getItem('currentUser');
    let navLinks = '';

    if (currentUserJson) {
        try {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser && currentUser.name) {
                // Tính số lượng sản phẩm trong giỏ hàng cho người dùng hiện tại
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const userCartItems = cart.filter(item => item.userId == currentUser.id);
                const cartCount = userCartItems.length;
                const cartText = cartCount > 0 ? `Giỏ hàng (${cartCount})` : 'Giỏ hàng';

                // --- Sử dụng basePath ---
                navLinks = `
                    <a href="${basePath}index.html" class="nav-link">Trang chủ</a>
                    <a href="${basePath}product-list/product-list.html" class="nav-link">Sản phẩm</a>
                    <a href="${basePath}contact/contact.html" class="nav-link">Liên hệ</a>
                    <a href="${basePath}my-account/my-account.html" class="nav-link">Tài khoản của tôi (${currentUser.name})</a>
                    <a href="#" id="logout-link" class="nav-link">Đăng xuất</a>
                    <a href="${basePath}cart/cart.html" class="nav-link">${cartText}</a>
                `;
            } else {
                throw new Error("Dữ liệu người dùng không hợp lệ");
            }
        } catch (e) {
            console.error("Lỗi khi phân tích dữ liệu người dùng:", e);
            localStorage.removeItem('currentUser');
            navLinks = getGuestNavLinks();
        }
    } else {
        navLinks = getGuestNavLinks();
    }

    // --- Cập nhật HTML nội dung header để phù hợp với style.css ---
    header.innerHTML = `
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <a href="${basePath}index.html" style="text-decoration: none; color: inherit;"><span>PharmaHub</span></a>
            </div>
            <div class="search-bar">
              <input type="text" id="search-input" placeholder="Tìm kiếm tên thuốc...">
              <button id="search-btn" type="submit" title="Tìm kiếm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            <nav class="nav-menu">
              ${navLinks}
              <div class="cart">
                <span class="cart-count" id="header-cart-count">0</span> <!-- Placeholder, sẽ cập nhật sau -->
              </div>
            </nav>
          </div>
        </div>
    `;

    // Gắn sự kiện cho nút đăng xuất nếu có
    if (currentUserJson) {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
             // Ngăn chặn hành vi mặc định của liên kết
            logoutLink.addEventListener('click', function(e) {
                 e.preventDefault();
                 if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                     localStorage.removeItem('currentUser');
                     alert('Đăng xuất thành công!');
                     location.reload(); // Reload trang để cập nhật header
                 }
            });
        }
    }

    // Gắn sự kiện cho tìm kiếm (có thể phát triển sau)
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                 alert('Tìm kiếm cho: ' + query); // Placeholder cho chức năng tìm kiếm
                 // TODO: Thực hiện tìm kiếm hoặc chuyển hướng
                 // window.location.href = `${basePath}product-list/product-list.html?search=${encodeURIComponent(query)}`;
            }
        });

        // Cho phép nhấn Enter để tìm kiếm
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Cập nhật số lượng giỏ hàng trên icon header
    updateHeaderCartCount();
}

// Hàm tiện ích để lấy liên kết cho khách
// --- Cập nhật để sử dụng basePath ---
function getGuestNavLinks() {
    return `
        <a href="${basePath}index.html" class="nav-link">Trang chủ</a>
        <a href="${basePath}product-list/product-list.html" class="nav-link">Sản phẩm</a>
        <a href="${basePath}contact/contact.html" class="nav-link">Liên hệ</a>
        <a href="${basePath}login/login.html" class="nav-link">Đăng nhập</a>
        <a href="${basePath}sign-up/sign-up.html" class="nav-link register">Đăng ký</a>
    `;
}


/**
 * Render Footer (dùng chung cho nhiều trang)
 * Cập nhật để render vào phần tử có id="main-footer"
 */
function loadFooter() {
    const footer = document.getElementById('main-footer'); // Thay đổi target
    if (!footer) {
        console.error("Không tìm thấy phần tử footer với id='main-footer'");
        return;
    }

    // --- Cập nhật HTML nội dung footer để phù hợp với style.css ---
    footer.innerHTML = `
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <div class="footer-logo">
                <span>PharmaHub</span>
              </div>
              <p>Nhà thuốc trực tuyến uy tín, cung cấp thuốc chất lượng cao và dịch vụ tư vấn chuyên nghiệp.</p>
            </div>
            <div class="footer-section">
              <h3>Liên kết nhanh</h3>
              <ul>
                <li><a href="#">Về chúng tôi</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
                <li><a href="#">Điều khoản sử dụng</a></li>
                <li><a href="#">Hướng dẫn mua hàng</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Thông tin liên hệ</h3>
              <ul>
                <li>📞 Hotline: 1900 1234</li>
                <li>📧 Email: info@pharmahub.vn</li>
                <li>📍 Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
                <li>🕒 Giờ làm việc: 5:00 ~ 22:00 mỗi ngày</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 PharmaHub. All rights reserved.</p>
          </div>
        </div>
    `;
}

/**
 * Render sản phẩm nổi bật
 */
function renderFeaturedProducts() {
    const productsContainer = document.getElementById('featured-products');
    if (!productsContainer) {
        // console.error("Không tìm thấy phần tử với id='featured-products'");
        return;
    }

    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm từ localStorage:", e);
        products = [];
    }

    // Lấy 4 sản phẩm đầu tiên làm sản phẩm nổi bật
    const featuredProducts = products.slice(0, 4);

    if (featuredProducts.length === 0) {
        productsContainer.innerHTML = '<p>Không có sản phẩm nổi bật.</p>';
        return;
    }

    let productHTML = '';
    featuredProducts.forEach(product => {
        // Giả sử lấy giá từ đơn vị đầu tiên, hoặc giá thấp nhất nếu có nhiều đơn vị
        let priceDisplay = 'Liên hệ';
        if (product.units && product.units.length > 0) {
             // Tìm giá thấp nhất trong các đơn vị
            const prices = product.units.map(unit => unit.price).filter(price => !isNaN(price));
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                priceDisplay = formatCurrency(minPrice);
            }
        }

        // Xử lý badge (giả sử có trường isBestSeller hoặc discount)
        let badgeHTML = '';
        // Nếu có trường discount > 0
        if (product.discount && product.discount > 0) {
             badgeHTML = `<div class="product-badge sale">-${product.discount}%</div>`;
        } else if (product.isBestSeller) { // Giả sử có trường isBestSeller
             badgeHTML = `<div class="product-badge bestseller">Bán chạy</div>`;
        }

        // --- Sử dụng basePath cho liên kết chi tiết sản phẩm ---
        productHTML += `
            <div class="product-card">
                ${badgeHTML} <!-- Chèn badge nếu có -->
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">
                    <span class="current-price">${priceDisplay}</span>
                    <!-- Hiển thị giá cũ nếu có -->
                    ${product.originalPrice ? `<span class="old-price">${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <a href="${basePath}product-detail/product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
            </div>
        `;
    });
    productsContainer.innerHTML = productHTML;
}


/**
 * Render danh mục sản phẩm
 */
function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
     if (!categoriesContainer) {
        // console.error("Không tìm thấy phần tử với id='categories'");
        return;
    }

    let categories = [];
    try {
        categories = JSON.parse(localStorage.getItem('categories')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu danh mục từ localStorage:", e);
        categories = [];
    }


    if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p>Không có danh mục sản phẩm.</p>';
        return;
    }

    let categoryHTML = '';
    const colors = ['blue', 'green', 'orange', 'purple', 'pink', 'yellow']; // Danh sách màu từ CSS

    categories.forEach((category, index) => {
        const colorClass = colors[index % colors.length]; // Luân phiên màu

        // --- Sử dụng basePath cho liên kết danh mục ---
        categoryHTML += `
            <div class="category-card">
                <div class="category-icon ${colorClass}">
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || 'Khám phá các sản phẩm trong danh mục này.'}</p>
                <a href="${basePath}product-list/product-list.html?category=${encodeURIComponent(category.name)}" class="category-link">Xem tất cả</a>
            </div>
        `;
    });
    categoriesContainer.innerHTML = categoryHTML;
}

/**
 * Hàm tiện ích: Định dạng tiền tệ
 */
function formatCurrency(amount) {
    // Kiểm tra đầu vào hợp lệ
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Hàm tiện ích: Cập nhật số lượng giỏ hàng hiển thị trên header
 */
function updateHeaderCartCount() {
    const cartCountElement = document.getElementById('header-cart-count');
    if (!cartCountElement) return;

    let count = 0;
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
        try {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser && currentUser.id) {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const userCartItems = cart.filter(item => item.userId == currentUser.id);
                count = userCartItems.reduce((total, item) => total + (item.quantity || 1), 0); // Tính tổng số lượng
            }
        } catch (e) {
            console.error("Lỗi khi cập nhật số lượng giỏ hàng header:", e);
        }
    }
    cartCountElement.textContent = count > 0 ? count : '0'; // Hiển thị 0 nếu không có item
    // Ẩn/hiện badge nếu không có sản phẩm (tùy chọn)
    cartCountElement.style.display = count > 0 ? 'flex' : 'none';
}