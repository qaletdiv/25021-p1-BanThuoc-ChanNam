// cart/cart.js

/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        window.location.href = '../login/login.html';
        return;
    }

    loadData();
    loadHeader();
    loadFooter();

    // Hiển thị giỏ hàng
    renderCart();
});

/**
 * Hiển thị giỏ hàng
 */
function renderCart() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("renderCart: Không tìm thấy thông tin người dùng hợp lệ.");
        window.location.href = '../login/login.html';
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("renderCart: Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    // Lọc các item thuộc về người dùng hiện tại
    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    // Cập nhật số lượng sản phẩm trong giỏ hàng trên giao diện
    const itemCountElement = document.getElementById('item-count');
    const totalItemsElement = document.getElementById('total-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalPriceElement = document.getElementById('total-price');

    // Nếu không có sản phẩm, hiển thị thông báo
    const cartItemContainer = document.getElementById('cart-item-list');
    if (userCartItems.length === 0) {
        cartItemContainer.innerHTML = '<p>Giỏ hàng của bạn hiện đang trống.</p>';
        if (itemCountElement) itemCountElement.textContent = '0';
        if (totalItemsElement) totalItemsElement.textContent = '0';
        if (subtotalElement) subtotalElement.textContent = '0 VND';
        if (totalPriceElement) totalPriceElement.textContent = '0 VND';
        return;
    }

    // Tính tổng giá trị đơn hàng
    let subtotal = 0;
    userCartItems.forEach(item => {
        // Đảm bảo giá và số lượng là số hợp lệ
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        subtotal += price * quantity;
    });

    // Tính tổng cộng (tạm tính + phí vận chuyển)
    const shippingCost = 25000; // Giả sử phí vận chuyển cố định
    const totalPrice = subtotal + shippingCost;

    // Cập nhật các phần tử trên giao diện
    if (itemCountElement) itemCountElement.textContent = userCartItems.length;
    if (totalItemsElement) totalItemsElement.textContent = userCartItems.length;
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (totalPriceElement) totalPriceElement.textContent = formatCurrency(totalPrice);

    // Render danh sách sản phẩm
    let cartHTML = '';
    userCartItems.forEach(item => {
        // Tìm sản phẩm từ danh sách sản phẩm để lấy thông tin chi tiết
        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('products')) || [];
        } catch (e) {
            console.error("renderCart: Lỗi khi lấy dữ liệu sản phẩm:", e);
        }
        const product = products.find(p => p.id == item.productId);
        if (!product) {
            console.warn("renderCart: Không tìm thấy thông tin sản phẩm với ID:", item.productId);
            return; // Bỏ qua item này nếu không tìm thấy sản phẩm
        }

        // Lấy đơn vị đã chọn
        const selectedUnit = product.units.find(u => u.name === item.unit);
        if (!selectedUnit) {
            console.warn("renderCart: Không tìm thấy đơn vị sản phẩm:", item.unit, "cho sản phẩm ID:", item.productId);
            return; // Bỏ qua item này nếu không tìm thấy đơn vị
        }

        // Tính thành tiền cho sản phẩm này
        const itemTotal = selectedUnit.price * item.quantity;

        // --- QUAN TRỌNG: Sử dụng item.id cho data-item-id ---
        cartHTML += `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="../${product.image || 'https://placehold.co/80x80?text=No+Image'}" alt="${product.name}">
                </div>
                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <div class="unit">Đơn vị: ${item.unit} (${selectedUnit.description || ''})</div>
                    <div class="price">${formatCurrency(selectedUnit.price)}</div>
                </div>
                <div class="quantity-control">
                    <button class="decrease-qty" data-item-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-item-id="${item.id}" class="quantity-input">
                    <button class="increase-qty" data-item-id="${item.id}">+</button>
                </div>
                <div class="item-price">${formatCurrency(itemTotal)}</div>
                <div class="remove-item" data-item-id="${item.id}">🗑️ Xóa</div>
            </div>
        `;
    });
    cartItemContainer.innerHTML = cartHTML;

    // --- Gắn sự kiện cho tất cả các nút "Tăng", "Giảm" và "Xóa" ---
    // Sử dụng Event Delegation để xử lý sự kiện cho các phần tử được tạo động
    const cartContainer = document.querySelector('.cart-container');
    if (cartContainer) {
        cartContainer.addEventListener('click', function(e) {
            // Tìm phần tử cha .cart-item gần nhất để lấy data-item-id
            const cartItemElement = e.target.closest('.cart-item');
            if (!cartItemElement) return;

            const itemId = cartItemElement.dataset.itemId;
            if (!itemId) {
                console.error("renderCart EventListener: Không tìm thấy data-item-id trên phần tử .cart-item");
                return;
            }

            if (e.target.classList.contains('decrease-qty')) {
                updateQuantity(itemId, -1);
            } else if (e.target.classList.contains('increase-qty')) {
                updateQuantity(itemId, 1);
            } else if (e.target.classList.contains('remove-item')) {
                removeFromCart(itemId);
            }
        });
    } else {
        console.error("renderCart: Không tìm thấy phần tử .cart-container để gắn sự kiện.");
    }

    // Gắn sự kiện cho nút "Tiến hành thanh toán"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            alert("Chức năng thanh toán đang được phát triển.");
        });
    }

    // Gắn sự kiện cho nút "Tiếp tục mua hàng"
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {string} itemId - ID của MỤC trong giỏ hàng (dưới dạng chuỗi)
 * @param {number} delta - Số lượng cần thay đổi (+1, -1)
 */
function updateQuantity(itemId, delta) {
    if (!itemId) {
        console.error("updateQuantity: Thiếu itemId");
        return;
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("updateQuantity: Người dùng chưa đăng nhập");
        window.location.href = '../login/login.html';
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("updateQuantity: Lỗi khi lấy giỏ hàng:", e);
        return;
    }

    // --- ĐÃ SỬA: Tìm item dựa trên item.id ---
    const itemIndex = cart.findIndex(item => item.id == itemId && item.userId == currentUser.id);

    if (itemIndex > -1) {
        const item = cart[itemIndex];
        const newQuantity = item.quantity + delta;

        if (delta === -1 && newQuantity < 1) {
            // Nếu giảm xuống dưới 1, có thể xem như xóa hoặc giữ nguyên ở 1
            // Ở đây, chúng ta sẽ không cho giảm xuống dưới 1
            console.log("Số lượng không thể nhỏ hơn 1");
            return;
        }

        // Cập nhật số lượng
        cart[itemIndex].quantity = newQuantity;

        // Lưu lại vào localStorage
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            // Cập nhật lại giao diện
            renderCart();
        } catch (e) {
            console.error("updateQuantity: Lỗi khi lưu giỏ hàng:", e);
        }
    } else {
        console.warn("updateQuantity: Không tìm thấy item với ID:", itemId, "cho user:", currentUser.id);
    }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {string} itemId - ID của MỤC trong giỏ hàng (dưới dạng chuỗi)
 */
function removeFromCart(itemId) {
    if (!itemId) {
        console.error("removeFromCart: Thiếu itemId");
        return;
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("removeFromCart: Người dùng chưa đăng nhập");
        window.location.href = '../login/login.html';
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("removeFromCart: Lỗi khi lấy giỏ hàng:", e);
        return;
    }

    // --- ĐÃ SỬA: Lọc item dựa trên item.id ---
    const newCart = cart.filter(item => {
        // Giữ lại item nếu:
        // 1. Nó không thuộc về người dùng hiện tại, hoặc
        // 2. Nó thuộc về người dùng hiện tại nhưng ID không khớp với itemId cần xóa
        return !(item.userId == currentUser.id && item.id == itemId);
    });

    // Kiểm tra xem có item nào bị xóa không
    if (newCart.length === cart.length) {
        console.warn("removeFromCart: Không tìm thấy item với ID:", itemId, "để xóa cho user:", currentUser.id);
        return; // Không có gì thay đổi
    }

    // Lưu lại giỏ hàng mới vào localStorage
    try {
        localStorage.setItem('cart', JSON.stringify(newCart));
        console.log("removeFromCart: Item với ID", itemId, "đã được xóa khỏi giỏ hàng của user", currentUser.id);
        // Cập nhật lại giao diện
        renderCart();
    } catch (e) {
        console.error("removeFromCart: Lỗi khi lưu giỏ hàng mới:", e);
    }
}


/**
 * Hàm tiện ích: Định dạng tiền tệ
 */
function formatCurrency(amount) {
    // Kiểm tra đầu vào hợp lệ
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0 VND'; // Trả về giá trị mặc định nếu lỗi
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}