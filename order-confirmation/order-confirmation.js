// order-confirmation/order-confirmation.js

/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        window.location.href = '../login/login.html';
        return;
    }

    loadData();
    loadHeader();
    loadFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        window.location.href = '../index.html';
        return;
    }

    renderOrderConfirmation(orderId);
});

/**
 * Hiển thị thông tin xác nhận đơn hàng - ĐÃ SỬA ĐỂ KHỚP VỚI checkout.js
 */
function renderOrderConfirmation(orderId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login/login.html';
        return;
    }

    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng:", e);
        orders = [];
    }

    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        window.location.href = '../index.html';
        return;
    }

    if (order.userId !== currentUser.id) {
        window.location.href = '../index.html';
        return;
    }

    // Hiển thị ID đơn hàng
    const orderIdElement = document.getElementById('order-id');
    if (orderIdElement) {
        orderIdElement.textContent = `#${orderId}`;
    }

    // SỬA: Sử dụng đúng cấu trúc từ checkout.js (phẳng thay vì nested)
    const recipientName = order.recipientName || (order.shippingInfo && order.shippingInfo.fullname) || 'Không có';
    const recipientPhone = order.phone || (order.shippingInfo && order.shippingInfo.phone) || 'Không có';
    const recipientAddress = order.address || (order.shippingInfo && order.shippingInfo.address) || 'Không có';

    const recipientNameElement = document.getElementById('recipient-name');
    const recipientPhoneElement = document.getElementById('recipient-phone');
    const recipientAddressElement = document.getElementById('recipient-address');
    
    if (recipientNameElement) recipientNameElement.textContent = recipientName;
    if (recipientPhoneElement) recipientPhoneElement.textContent = recipientPhone;
    if (recipientAddressElement) recipientAddressElement.textContent = recipientAddress;

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
            if (transferContentElement) {
                transferContentElement.textContent = `Thanh toán đơn hàng #${orderId}`;
            }
        } else {
            paymentMethodElement.textContent = 'Không xác định';
        }
    }

    // Hiển thị sản phẩm đã đặt
    renderOrderItems(order.items);

    // SỬA: Sử dụng đúng tên trường từ checkout.js
    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const discount = order.discount || 0;
    const totalPrice = order.totalPrice || order.total || 0; // Fallback cho cả 2 tên

    const subtotalElement = document.getElementById('subtotal');
    const shippingCostElement = document.getElementById('shipping-cost');
    const discountElement = document.getElementById('discount');
    const totalAmountElement = document.getElementById('total-amount');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (shippingCostElement) {
        shippingCostElement.textContent = shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);
    }
    
    // Hiển thị discount nếu có và phần tử tồn tại
    if (discountElement) {
        if (discount > 0) {
            discountElement.textContent = `-${formatCurrency(discount)}`;
            discountElement.parentElement.style.display = 'flex';
        } else {
            discountElement.parentElement.style.display = 'none';
        }
    }
    
    if (totalAmountElement) totalAmountElement.textContent = formatCurrency(totalPrice);

    // Hiển thị ngày đặt hàng nếu có phần tử
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement) {
        const orderDate = order.createdAt || order.orderDate;
        if (orderDate) {
            orderDateElement.textContent = formatDate(orderDate);
        }
    }

    // Hiển thị trạng thái đơn hàng nếu có phần tử
    const orderStatusElement = document.getElementById('order-status');
    if (orderStatusElement) {
        const statusInfo = getOrderStatusInfo(order.status || 'pending');
        orderStatusElement.textContent = statusInfo.text;
        orderStatusElement.className = `order-status ${statusInfo.class}`;
    }
}

/**
 * Hiển thị danh sách sản phẩm trong đơn hàng
 */
function renderOrderItems(items) {
    const orderItemsListElement = document.getElementById('order-items-list');
    if (!orderItemsListElement) return;

    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", e);
        products = [];
    }

    let itemsHTML = '';
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        itemsHTML = '<p>Không có sản phẩm trong đơn hàng.</p>';
    } else {
        items.forEach(item => {
            const product = products.find(p => p.id == item.productId);
            if (!product) return;

            const selectedUnit = product.units ? product.units.find(u => u.name === item.unit) : null;
            const unitPrice = selectedUnit ? selectedUnit.price : (item.price || 0);
            const unitDescription = selectedUnit ? selectedUnit.description : '';
            const itemTotal = unitPrice * (item.quantity || 1);

            itemsHTML += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="../${product.image || 'images/no-image.png'}" alt="${product.name}" onerror="this.src='../images/no-image.png'">
                    </div>
                    <div class="order-item-info">
                        <h4>${product.name}</h4>
                        <div class="unit">Đơn vị: ${item.unit || 'Không xác định'} ${unitDescription ? `(${unitDescription})` : ''}</div>
                        <div class="price">${formatCurrency(unitPrice)}</div>
                    </div>
                    <div class="order-item-quantity">x${item.quantity || 1}</div>
                </div>
            `;
        });
    }
    
    orderItemsListElement.innerHTML = itemsHTML;
}

/**
 * Lấy thông tin trạng thái đơn hàng - THÊM HÀM MỚI
 */
function getOrderStatusInfo(status) {
    switch (status) {
        case 'pending':
            return { class: 'status-pending', text: 'Chờ xác nhận' };
        case 'processing':
            return { class: 'status-processing', text: 'Đang xử lý' };
        case 'shipping':
            return { class: 'status-shipping', text: 'Đang giao hàng' };
        case 'delivered':
            return { class: 'status-delivered', text: 'Đã giao' };
        case 'cancelled':
            return { class: 'status-cancelled', text: 'Đã hủy' };
        default:
            return { class: 'status-pending', text: 'Chờ xác nhận' };
    }
}

/**
 * Định dạng ngày tháng - THÊM HÀM MỚI
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Không xác định';
        }
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Không xác định';
    }
}

/**
 * Hàm tiện ích: Định dạng tiền tệ
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0 VND';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}