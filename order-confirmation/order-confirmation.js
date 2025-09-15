// order-confirmation/order-confirmation.js

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

    // Lấy ID đơn hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        // Nếu không có ID đơn hàng, chuyển hướng đến trang chủ
        window.location.href = '../index.html';
        return;
    }

    // Hiển thị thông tin đơn hàng
    renderOrderConfirmation(orderId);
});

/**
 * Hiển thị thông tin xác nhận đơn hàng
 * @param {string} orderId - ID của đơn hàng
 */
function renderOrderConfirmation(orderId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("renderOrderConfirmation: Không tìm thấy thông tin người dùng hợp lệ.");
        window.location.href = '../login/login.html';
        return;
    }

    // Lấy danh sách đơn hàng
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error("renderOrderConfirmation: Lỗi khi lấy dữ liệu đơn hàng:", e);
        orders = [];
    }

    // Tìm đơn hàng theo ID
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        // Nếu không tìm thấy đơn hàng, chuyển hướng đến trang chủ
        window.location.href = '../index.html';
        return;
    }

    // Kiểm tra đơn hàng có thuộc về người dùng hiện tại không
    if (order.userId !== currentUser.id) {
        // Nếu đơn hàng không thuộc về người dùng hiện tại, chuyển hướng đến trang chủ
        window.location.href = '../index.html';
        return;
    }

    // Hiển thị ID đơn hàng
    const orderIdElement = document.getElementById('order-id');
    if (orderIdElement) {
        orderIdElement.textContent = `#${orderId}`;
    }

    // Hiển thị thông tin người nhận
    const recipientNameElement = document.getElementById('recipient-name');
    const recipientPhoneElement = document.getElementById('recipient-phone');
    const recipientAddressElement = document.getElementById('recipient-address');
    
    if (recipientNameElement) recipientNameElement.textContent = order.shippingInfo.fullname;
    if (recipientPhoneElement) recipientPhoneElement.textContent = order.shippingInfo.phone;
    if (recipientAddressElement) recipientAddressElement.textContent = order.shippingInfo.address;

    // Hiển thị phương thức thanh toán
    const paymentMethodElement = document.getElementById('payment-method');
    const bankTransferInfoElement = document.getElementById('bank-transfer-info');
    const transferContentElement = document.getElementById('transfer-content');
    
    if (paymentMethodElement) {
        if (order.paymentMethod === 'cod') {
            paymentMethodElement.textContent = 'Thanh toán khi nhận hàng (COD)';
            if (bankTransferInfoElement) bankTransferInfoElement.classList.add('hidden');
        } else if (order.paymentMethod === 'bank') {
            paymentMethodElement.textContent = 'Chuyển khoản ngân hàng';
            if (bankTransferInfoElement) bankTransferInfoElement.classList.remove('hidden');
            if (transferContentElement) transferContentElement.textContent = `Thanh toan don hang #${orderId}`;
        }
    }

    // Hiển thị sản phẩm đã đặt
    renderOrderItems(order.items);

    // Hiển thị tổng tiền
    const subtotalElement = document.getElementById('subtotal');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalAmountElement = document.getElementById('total-amount');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(order.subtotal);
    if (shippingCostElement) shippingCostElement.textContent = order.shippingCost === 0 ? 'Miễn phí' : formatCurrency(order.shippingCost);
    if (totalAmountElement) totalAmountElement.textContent = formatCurrency(order.total);
}

/**
 * Hiển thị danh sách sản phẩm trong đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 */
function renderOrderItems(items) {
    const orderItemsListElement = document.getElementById('order-items-list');
    if (!orderItemsListElement) {
        console.error("renderOrderItems: Không tìm thấy phần tử order-items-list");
        return;
    }

    // Lấy danh sách sản phẩm
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error("renderOrderItems: Lỗi khi lấy dữ liệu sản phẩm:", e);
        products = [];
    }

    // Render danh sách sản phẩm
    let itemsHTML = '';
    items.forEach(item => {
        // Tìm sản phẩm từ danh sách sản phẩm để lấy thông tin chi tiết
        const product = products.find(p => p.id == item.productId);
        if (!product) {
            console.warn("renderOrderItems: Không tìm thấy thông tin sản phẩm với ID:", item.productId);
            return;
        }

        // Lấy đơn vị đã chọn
        const selectedUnit = product.units.find(u => u.name === item.unit);
        if (!selectedUnit) {
            console.warn("renderOrderItems: Không tìm thấy đơn vị sản phẩm:", item.unit, "cho sản phẩm ID:", item.productId);
            return;
        }

        // Tính thành tiền cho sản phẩm này
        const itemTotal = selectedUnit.price * item.quantity;

        itemsHTML += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="../${product.image || 'https://placehold.co/60x60?text=No+Image'}" alt="${product.name}">
                </div>
                <div class="order-item-info">
                    <h4>${product.name}</h4>
                    <div class="unit">Đơn vị: ${item.unit} (${selectedUnit.description || ''})</div>
                    <div class="price">${formatCurrency(selectedUnit.price)}</div>
                </div>
                <div class="order-item-quantity">x${item.quantity}</div>
            </div>
        `;
    });
    orderItemsListElement.innerHTML = itemsHTML;
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