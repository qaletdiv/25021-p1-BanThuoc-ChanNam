// checkout/checkout.js

// Thêm biến toàn cục để theo dõi trạng thái
let isUsingSavedAddress = false;

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

    // Kiểm tra giỏ hàng có sản phẩm không
    const currentUser = JSON.parse(currentUserJson);
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    if (userCartItems.length === 0) {
        window.location.href = '../cart/cart.html';
        return;
    }

    loadData();
    loadHeader();
    loadFooter();
    renderCheckout();
    registerEventListeners();
});

/**
 * Hiển thị thông tin thanh toán
 */
function renderCheckout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        window.location.href = '../login/login.html';
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    const userCartItems = cart.filter(item => item.userId == currentUser.id);
    renderOrderSummary(userCartItems);
    renderSavedAddresses(currentUser.id);
    
    if (!isUsingSavedAddress) {
        prefillUserInfo(currentUser);
    }
}

/**
 * Điền thông tin người dùng vào form
 */
function prefillUserInfo(user) {
    if (isUsingSavedAddress) return;
    
    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');
    
    if (fullnameInput && !fullnameInput.value && user.name) {
        fullnameInput.value = user.name;
    }
    
    if (phoneInput && !phoneInput.value && user.phone) {
        phoneInput.value = user.phone;
    }
}

/**
 * Render tóm tắt đơn hàng
 */
function renderOrderSummary(cartItems) {
    const checkoutItemsElement = document.getElementById('checkout-items');
    const totalItemsElement = document.getElementById('checkout-total-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const totalElement = document.getElementById('checkout-total');

    if (!checkoutItemsElement) return;

    let subtotal = 0;
    let totalQuantity = 0;
    
    let itemsHTML = '';
    cartItems.forEach(item => {
        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('products')) || [];
        } catch (e) {
            console.error("Lỗi khi lấy dữ liệu sản phẩm:", e);
        }
        
        const product = products.find(p => p.id == item.productId);
        if (!product) return;

        const selectedUnit = product.units.find(u => u.name === item.unit);
        if (!selectedUnit) return;

        const itemTotal = selectedUnit.price * item.quantity;
        subtotal += itemTotal;
        totalQuantity += item.quantity;

        itemsHTML += `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    <img src="../${product.image || 'images/no-image.png'}" alt="${product.name}" onerror="this.src='../images/no-image.png'">
                </div>
                <div class="checkout-item-info">
                    <h3>${product.name}</h3>
                    <div class="unit">Đơn vị: ${item.unit}</div>
                    <div class="price">${formatCurrency(selectedUnit.price)}</div>
                </div>
                <div class="checkout-item-quantity">x${item.quantity}</div>
            </div>
        `;
    });
    
    checkoutItemsElement.innerHTML = itemsHTML;

    const freeShippingThreshold = 500000;
    const standardShippingCost = 25000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
    const totalPrice = subtotal + shippingCost;

    if (totalItemsElement) totalItemsElement.textContent = totalQuantity;
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (shippingElement) shippingElement.textContent = shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);
    if (totalElement) totalElement.textContent = formatCurrency(totalPrice);
}

/**
 * Render địa chỉ đã lưu - ĐÃ SỬA ĐỂ KHỚP VỚI my-account.js
 */
function renderSavedAddresses(userId) {
    const savedAddressesElement = document.getElementById('saved-addresses-list');
    if (!savedAddressesElement) return;

    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    const userAddresses = addresses.filter(addr => addr.userId == userId);

    if (userAddresses.length === 0) {
        savedAddressesElement.innerHTML = '<p>Bạn chưa có địa chỉ nào được lưu.</p>';
        return;
    }

    let addressesHTML = '';
    userAddresses.forEach(address => {
        // SỬA: Sử dụng đúng tên thuộc tính từ my-account.js
        const recipientName = address.recipientName || address.fullname || '';
        const recipientPhone = address.recipientPhone || address.phone || '';
        const fullAddress = address.fullAddress || address.address || '';
        
        addressesHTML += `
            <div class="saved-address-item" data-address-id="${address.id}">
                <p><strong>${recipientName}</strong> ${address.isDefault ? '(Mặc định)' : ''}</p>
                <p>${recipientPhone}</p>
                <p>${fullAddress}</p>
                <div class="address-actions">
                    <button type="button" class="use-address-btn" data-address-id="${address.id}">Sử dụng</button>
                    <button type="button" class="delete-address-btn" data-address-id="${address.id}">Xóa</button>
                </div>
            </div>
        `;
    });
    
    savedAddressesElement.innerHTML = addressesHTML;
    registerAddressEvents();
}

/**
 * Đăng ký các sự kiện cho trang
 */
function registerEventListeners() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const bankInfo = document.getElementById('bank-info');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (bankInfo) {
                bankInfo.classList.toggle('hidden', this.value !== 'bank');
            }
        });
    });

    const completeOrderBtn = document.getElementById('complete-order-btn');
    if (completeOrderBtn) {
        completeOrderBtn.addEventListener('click', completeOrder);
    }
    
    const toggleSavedAddressesBtn = document.getElementById('toggle-saved-addresses');
    const savedAddressesList = document.getElementById('saved-addresses-list');
    
    if (toggleSavedAddressesBtn && savedAddressesList) {
        toggleSavedAddressesBtn.addEventListener('click', function() {
            const isHidden = savedAddressesList.classList.toggle('hidden');
            this.textContent = isHidden ? 'Hiển thị' : 'Ẩn';
        });
    }
    
    const saveAddressBtn = document.getElementById('save-address-btn');
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', saveCurrentAddress);
    }
}

function registerAddressEvents() {
    document.querySelectorAll('.use-address-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            useSavedAddress(e.target.dataset.addressId);
        });
    });

    document.querySelectorAll('.delete-address-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            deleteSavedAddress(e.target.dataset.addressId);
        });
    });
}

/**
 * Sử dụng địa chỉ đã lưu - ĐÃ SỬA ĐỂ KHỚP VỚI my-account.js
 */
function useSavedAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    isUsingSavedAddress = true;

    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    const address = addresses.find(addr => addr.id == addressId && addr.userId == currentUser.id);
    if (!address) return;

    // SỬA: Sử dụng đúng tên thuộc tính từ my-account.js
    const recipientName = address.recipientName || address.fullname || '';
    const recipientPhone = address.recipientPhone || address.phone || '';
    const fullAddress = address.fullAddress || address.address || '';

    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    
    if (fullnameInput) fullnameInput.value = recipientName;
    if (phoneInput) phoneInput.value = recipientPhone;
    if (addressInput) addressInput.value = fullAddress;

    showNotification('Đã sử dụng địa chỉ đã lưu');
    
    document.querySelectorAll('.saved-address-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedAddressItem = document.querySelector(`.saved-address-item[data-address-id="${addressId}"]`);
    if (selectedAddressItem) {
        selectedAddressItem.classList.add('selected');
    }
    
    setTimeout(() => {
        isUsingSavedAddress = false;
    }, 100);
}

/**
 * Xóa địa chỉ đã lưu
 */
function deleteSavedAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    const newAddresses = addresses.filter(addr => !(addr.id == addressId && addr.userId == currentUser.id));
    
    if (newAddresses.length === addresses.length) return;

    try {
        localStorage.setItem('addresses', JSON.stringify(newAddresses));
        showNotification('Đã xóa địa chỉ thành công!');
        renderSavedAddresses(currentUser.id);
    } catch (e) {
        console.error("Lỗi khi lưu địa chỉ:", e);
        showNotification('Đã xảy ra lỗi khi xóa địa chỉ.');
    }
}

/**
 * Lưu địa chỉ hiện tại từ form - ĐÃ SỬA ĐỂ KHỚP VỚI my-account.js
 */
function saveCurrentAddress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!fullname || !phone || !address) {
        showNotification('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
    }

    // Validate số điện thoại
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('Số điện thoại không hợp lệ.');
        return;
    }

    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    // SỬA: Sử dụng đúng cấu trúc từ my-account.js
    const newAddress = {
        id: Date.now().toString(),
        userId: currentUser.id,
        recipientName: fullname,      // ← Sửa thành recipientName
        recipientPhone: phone,        // ← Sửa thành recipientPhone
        fullAddress: address,         // ← Sửa thành fullAddress
        isDefault: false              // ← Thêm trường isDefault
    };
    
    addresses.push(newAddress);

    try {
        localStorage.setItem('addresses', JSON.stringify(addresses));
        showNotification('Lưu địa chỉ thành công!');
        renderSavedAddresses(currentUser.id);
    } catch (e) {
        console.error("Lỗi khi lưu địa chỉ:", e);
        showNotification('Đã xảy ra lỗi khi lưu địa chỉ.');
    }
}

/**
 * Hoàn tất đơn hàng - ĐÃ SỬA ĐỂ KHỚP VỚI my-account.js
 */
function completeOrder() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login/login.html';
        return;
    }

    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethodElement = document.querySelector('input[name="payment-method"]:checked');
    
    if (!paymentMethodElement) {
        alert('Vui lòng chọn phương thức thanh toán.');
        return;
    }
    
    const paymentMethod = paymentMethodElement.value;

    if (!fullname || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    if (userCartItems.length === 0) {
        window.location.href = '../cart/cart.html';
        return;
    }

    // Tính tổng giá trị đơn hàng
    let subtotal = 0;
    userCartItems.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        subtotal += price * quantity;
    });

    const freeShippingThreshold = 500000;
    const standardShippingCost = 25000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
    const totalPrice = subtotal + shippingCost;

    // SỬA: Sử dụng đúng cấu trúc từ my-account.js
    const newOrder = {
        id: Date.now().toString(),
        userId: currentUser.id,
        createdAt: new Date().toISOString(),  // ← Sửa thành createdAt
        status: 'pending',
        items: userCartItems,
        // SỬA: Sử dụng cấu trúc phẳng thay vì shippingInfo
        recipientName: fullname,              // ← Sửa thành recipientName
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingCost: shippingCost,
        discount: 0,                          // ← Thêm discount
        totalPrice: totalPrice,               // ← Sửa thành totalPrice
        // Thêm các trường khác để khớp với my-account.js nếu cần
        updatedAt: new Date().toISOString()
    };

    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng:", e);
        orders = [];
    }

    orders.push(newOrder);
    
    try {
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Xóa giỏ hàng
        const newCart = cart.filter(item => item.userId != currentUser.id);
        localStorage.setItem('cart', JSON.stringify(newCart));
        
        // Chuyển đến trang xác nhận
        window.location.href = '../order-confirmation/order-confirmation.html?id=' + newOrder.id;
    } catch (e) {
        console.error("Lỗi khi lưu đơn hàng:", e);
        alert('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
    }
}

/**
 * Hiển thị thông báo
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
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