/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    loadData(); // Kiểm tra và load dữ liệu từ mock-data nếu cần
    loadHeader();
    loadFooter();
    renderFeaturedProducts();
    renderCategories();
}

/**
 * Kiểm tra localStorage, nếu không có thì copy từ mock-data
 */
function loadData() {
    // Kiểm tra và load sản phẩm
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(window.MOCK_PRODUCTS));
    }

    // Kiểm tra và load danh mục
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(window.MOCK_CATEGORIES));
    }

    // Kiểm tra và load người dùng (nếu có)
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(window.MOCK_USERS));
    }

    // Kiểm tra và load địa chỉ (nếu có)
    if (!localStorage.getItem('addresses')) {
        localStorage.setItem('addresses', JSON.stringify(window.MOCK_ADDRESSES));
    }

    // Kiểm tra và load đơn hàng (nếu có)
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(window.MOCK_ORDERS));
    }
}

/**
 * Render Header
 */
function loadHeader() {
    const header = document.getElementById('header');
    if (!header) {
        console.error("Không tìm thấy phần tử header với id='header'");
        return; // Dừng hàm nếu không tìm thấy phần tử
    }

    const currentUserJson = localStorage.getItem('currentUser');
    let navLinks = '';

    if (currentUserJson) {
        // Người dùng đã đăng nhập
        try {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser && currentUser.name) { // Kiểm tra thêm currentUser và currentUser.name
                // --- PHẦN CẬP NHẬT: Tính số lượng sản phẩm trong giỏ hàng ---
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const userCartItems = cart.filter(item => item.userId == currentUser.id);
                const cartCount = userCartItems.length;
                const cartText = cartCount > 0 ? `Giỏ hàng (${cartCount})` : 'Giỏ hàng';
                // --- HẾT PHẦN CẬP NHẬT ---
                
                navLinks = `
                    <a href="../index.html">Trang chủ</a>
                    <a href="product-list/product-list.html">Sản phẩm</a>
                    <a href="account.html">Tài khoản của tôi (${currentUser.name})</a>
                    <a href="#" id="logout-link">Đăng xuất</a>
                    <a href="cart.html">${cartText}</a> <!-- Liên kết giỏ hàng đã cập nhật -->
                `;
            } else {
                // Dữ liệu currentUser không hợp lệ
                throw new Error("Dữ liệu người dùng không hợp lệ");
            }
        } catch (e) {
            console.error("Lỗi khi phân tích dữ liệu người dùng:", e);
            // Nếu có lỗi, coi như chưa đăng nhập
            localStorage.removeItem('currentUser'); // Xóa dữ liệu lỗi
            navLinks = getGuestNavLinks(); // Lấy liên kết cho khách
        }
    } else {
        // Người dùng chưa đăng nhập
        navLinks = getGuestNavLinks(); // Liên kết cho khách cũng đã bao gồm Giỏ hàng
    }

    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1><a href="../index.html" style="text-decoration: none; color: inherit;">Nhà thuốc ABC</a></h1>
            <nav>${navLinks}</nav>
        </div>
        <div style="margin-top: 10px;">
            <input type="text" id="search-input" placeholder="Tìm kiếm sản phẩm..." style="width: 70%; padding: 8px;">
            <button id="search-btn" style="padding: 8px 15px;">Tìm</button>
        </div>
    `;

    // Gắn sự kiện cho nút đăng xuất nếu có
    if (currentUserJson) {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                alert('Đăng xuất thành công!');
                location.reload(); // Reload trang để cập nhật header
            });
        }
    }
}

// Hàm tiện ích để lấy liên kết cho khách (đã bao gồm Giỏ hàng)
function getGuestNavLinks() {
    return `
        <a href="../index.html">Trang chủ</a>
        <a href="product-list/product-list.html">Sản phẩm</a>
        <a href="login.html">Đăng nhập</a>
        <a href="register.html">Đăng ký</a>
        <a href="cart.html">Giỏ hàng</a>
    `;
}

// Hàm tiện ích để lấy liên kết cho khách
function getGuestNavLinks() {
    return `
        <a href="../index.html">Trang chủ</a>
        <a href="product-list/product-list.html">Sản phẩm</a>
        <a href="login.html">Đăng nhập</a>
        <a href="register.html">Đăng ký</a>
        <a href="cart.html">Giỏ hàng</a>
    `;
}

/**
 * Render Footer
 */
function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <p>&copy; 2024 Nhà thuốc ABC. All rights reserved.</p>
        <p>
            <a href="#">Về chúng tôi</a> |
            <a href="#">Chính sách bảo mật</a> |
            <a href="#">Điều khoản sử dụng</a> |
            Liên hệ: info@nhathuocabc.com | Hotline: 1900 1234
        </p>
    `;
}

/**
 * Render sản phẩm nổi bật
 */
function renderFeaturedProducts() {
    const productsContainer = document.getElementById('featured-products');
    // Lấy 4 sản phẩm đầu tiên làm sản phẩm nổi bật
    const products = JSON.parse(localStorage.getItem('products')).slice(0, 4);

    let productHTML = '';
    products.forEach(product => {
        // Lấy giá từ đơn vị đầu tiên
        const price = product.units[0].price;
        productHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <span class="price">${formatCurrency(price)}</span>
                <a href="product-detail/product-detail.html?id=${product.id}" class="btn">Xem chi tiết</a>
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
    const categories = JSON.parse(localStorage.getItem('categories'));

    let categoryHTML = '';
    categories.forEach(category => {
        // Dùng placeholder image cho danh mục
        categoryHTML += `
            <div class="category-item">
                <a href="product-list/product-list.html?category=${encodeURIComponent(category.name)}">
                    <img src="https://placehold.co/150x100?text=${encodeURIComponent(category.name)}" alt="${category.name}">
                    <div>${category.name}</div>
                </a>
            </div>
        `;
    });

    categoriesContainer.innerHTML = categoryHTML;
}

/**
 * Hàm tiện ích: Định dạng tiền tệ
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
