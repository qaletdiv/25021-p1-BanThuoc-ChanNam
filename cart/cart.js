// cart/cart.js

/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        window.location.href = '../login/login.html';
        return;
    }

    loadData();
    loadHeader();
    loadFooter();

    // Hiển thị giỏ hàng
    renderCart();
    
    // Đăng ký sự kiện cho nút "Tiến hành thanh toán"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            window.location.href = '../checkout/checkout.html';
        });
    }

    // Đăng ký sự kiện cho nút "Tiếp tục mua hàng"
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }
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
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalPriceElement = document.getElementById('total-price');

    // Nếu không có sản phẩm, hiển thị thông báo
    const cartItemContainer = document.getElementById('cart-item-list');
    if (userCartItems.length === 0) {
        cartItemContainer.innerHTML = '<p>Giỏ hàng của bạn hiện đang trống.</p>';
        if (itemCountElement) itemCountElement.textContent = '0';
        if (totalItemsElement) totalItemsElement.textContent = '0';
        if (subtotalElement) subtotalElement.textContent = '0 VND';
        if (shippingCostElement) shippingCostElement.textContent = '0 VND';
        if (totalPriceElement) totalPriceElement.textContent = '0 VND';
        
        // Cập nhật thông báo miễn phí vận chuyển
        updateFreeShippingInfo(0);
        
        // Cập nhật số lượng giỏ hàng trên header
        updateHeaderCartCount();
        return;
    }

    // Tính tổng giá trị đơn hàng và tổng số lượng sản phẩm
    let subtotal = 0;
    let totalQuantity = 0; // Thêm biến để tính tổng số lượng sản phẩm
    
    userCartItems.forEach(item => {
        // Đảm bảo giá và số lượng là số hợp lệ
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        
        // Cộng vào tổng giá trị và tổng số lượng
        subtotal += price * quantity;
        totalQuantity += quantity; // Cộng số lượng của mỗi sản phẩm
    });

    // Tính phí vận chuyển (miễn phí cho đơn hàng từ 500.000 VND)
    const freeShippingThreshold = 500000;
    const standardShippingCost = 25000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;

    // Tính tổng cộng (tạm tính + phí vận chuyển)
    const totalPrice = subtotal + shippingCost;

    // Cập nhật các phần tử trên giao diện
    // Sửa lại: sử dụng totalQuantity thay vì userCartItems.length
    if (itemCountElement) itemCountElement.textContent = totalQuantity;
    if (totalItemsElement) totalItemsElement.textContent = totalQuantity;
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (shippingCostElement) shippingCostElement.textContent = shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);
    if (totalPriceElement) totalPriceElement.textContent = formatCurrency(totalPrice);

    // Cập nhật thông báo miễn phí vận chuyển
    updateFreeShippingInfo(subtotal);

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
                    <button class="decrease-qty" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                    <button class="increase-qty" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="item-price">${formatCurrency(itemTotal)}</div>
                <div class="remove-item" onclick="removeFromCart('${item.id}')">🗑️ Xóa</div>
            </div>
        `;
    });
    cartItemContainer.innerHTML = cartHTML;
    
    // Cập nhật số lượng giỏ hàng trên header
    updateHeaderCartCount();
}

/**
 * Cập nhật thông tin miễn phí vận chuyển
 * @param {number} subtotal - Tổng giá trị đơn hàng
 */
function updateFreeShippingInfo(subtotal) {
    const freeShippingThreshold = 500000;
    const freeShippingInfo = document.querySelector('.free-shipping-info');
    
    if (!freeShippingInfo) return;
    
    if (subtotal >= freeShippingThreshold) {
        // Đã đạt điều kiện miễn phí vận chuyển
        freeShippingInfo.innerHTML = `
            <div class="icon">✅</div>
            <div class="text">
                <strong>Chúc mừng! Bạn được miễn phí vận chuyển</strong>
                <p>Đơn hàng của bạn đã đạt điều kiện miễn phí vận chuyển</p>
            </div>
        `;
        freeShippingInfo.style.backgroundColor = '#f0fdf4';
    } else {
        // Chưa đạt điều kiện miễn phí vận chuyển
        const remaining = freeShippingThreshold - subtotal;
        freeShippingInfo.innerHTML = `
            <div class="icon">🚚</div>
            <div class="text">
                <strong>Miễn phí vận chuyển cho đơn hàng từ 500.000 VND</strong>
                <p>Thêm ${formatCurrency(remaining)} để được miễn phí vận chuyển</p>
            </div>
        `;
        freeShippingInfo.style.backgroundColor = '#f0f9f1';
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

    // Tìm item dựa trên item.id
    const itemIndex = cart.findIndex(item => item.id == itemId && item.userId == currentUser.id);

    if (itemIndex > -1) {
        const item = cart[itemIndex];
        const newQuantity = item.quantity + delta;

        if (newQuantity < 1) {
            // Nếu giảm xuống dưới 1, giữ nguyên ở 1
            console.log("Số lượng không thể nhỏ hơn 1");
            return;
        }

        // Cập nhật số lượng
        cart[itemIndex].quantity = newQuantity;

        // Lưu lại vào localStorage
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log("Quantity updated successfully");
            // Cập nhật lại giao diện
            renderCart();
            // Cập nhật số lượng giỏ hàng trên header
            updateHeaderCartCount();
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

    // Lọc item dựa trên item.id
    const newCart = cart.filter(item => {
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
        console.log("Item removed successfully");
        // Cập nhật lại giao diện
        renderCart();
        // Cập nhật số lượng giỏ hàng trên header
        updateHeaderCartCount();
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