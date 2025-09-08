// js/common.js

// Hàm tiện ích: Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const basePath = '../'

// Hàm tiện ích để lấy liên kết cho khách
function getGuestNavLinks() { 
    return `
        <a href="${basePath}index.html">Trang chủ</a>
        <a href="${basePath}product-list/product-list.html">Sản phẩm</a>
        <a href="${basePath}login.html">Đăng nhập</a>
        <a href="${basePath}register.html">Đăng ký</a>
        <a href="${basePath}cart.html">Giỏ hàng</a>
    `;
}

/**
 * Render Header (dùng chung cho nhiều trang)
 */
function loadHeader() {
    const header = document.getElementById('header');
    if (!header) {
        console.error("Không tìm thấy phần tử header với id='header'");
        return;
    }

    const currentUserJson = localStorage.getItem('currentUser');
    let navLinks = '';

    if (currentUserJson) {
        try {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser && currentUser.name) {              
                // Tính số lượng sản phẩm trong giỏ hàng
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const userCartItems = cart.filter(item => item.userId == currentUser.id);
                const cartCount = userCartItems.length;
                const cartText = cartCount > 0 ? `Giỏ hàng (${cartCount})` : 'Giỏ hàng';
                
                navLinks = `
                    <a href="${basePath}index.html">Trang chủ</a>
                    <a href="${basePath}product-list/product-list.html">Sản phẩm</a>
                    <a href="${basePath}account.html">Tài khoản của tôi (${currentUser.name})</a>
                    <a href="#" id="logout-link">Đăng xuất</a>
                    <a href="${basePath}cart.html">${cartText}</a>
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

    if (currentUserJson) {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                alert('Đăng xuất thành công!');
                location.reload();
            });
        }
    }
}

/**
 * Render Footer (dùng chung cho nhiều trang)
 */
function loadFooter() {
    const footer = document.getElementById('footer');
    if (!footer) {
        console.error("Không tìm thấy phần tử footer với id='footer'");
        return;
    }
    
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
}