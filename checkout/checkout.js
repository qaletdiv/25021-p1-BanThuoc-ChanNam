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
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
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

    // Lọc các item thuộc về người dùng hiện tại
    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    if (userCartItems.length === 0) {
        // Nếu giỏ hàng trống, chuyển hướng đến trang giỏ hàng
        window.location.href = '../cart/cart.html';
        return;
    }

    loadData();
    loadHeader();
    loadFooter();

    // Hiển thị thông tin thanh toán
    renderCheckout();
    
    // Đăng ký sự kiện cho form
    registerEventListeners();
});

/**
 * Hiển thị thông tin thanh toán
 */
function renderCheckout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("renderCheckout: Không tìm thấy thông tin người dùng hợp lệ.");
        window.location.href = '../login/login.html';
        return;
    }

    // Lấy dữ liệu giỏ hàng
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("renderCheckout: Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    // Lọc các item thuộc về người dùng hiện tại
    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    // Render danh sách sản phẩm trong tóm tắt đơn hàng
    renderOrderSummary(userCartItems);
    
    // Render địa chỉ đã lưu
    renderSavedAddresses(currentUser.id);
    
    // Điền thông tin người dùng hiện tại vào form nếu có
    // Chỉ điền nếu người dùng không đang sử dụng địa chỉ đã lưu
    if (!isUsingSavedAddress) {
        prefillUserInfo(currentUser);
    }
}

/**
 * Điền thông tin người dùng vào form
 * @param {Object} user - Thông tin người dùng
 */
function prefillUserInfo(user) {
    // Nếu người dùng đang sử dụng địa chỉ đã lưu, không điền thông tin mặc định
    if (isUsingSavedAddress) {
        return;
    }
    
    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');
    
    // Chỉ điền nếu trường đang trống
    if (fullnameInput && !fullnameInput.value && user.name) {
        fullnameInput.value = user.name;
    }
    
    if (phoneInput && !phoneInput.value && user.phone) {
        phoneInput.value = user.phone;
    }
}

/**
 * Render tóm tắt đơn hàng
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ hàng
 */
function renderOrderSummary(cartItems) {
    const checkoutItemsElement = document.getElementById('checkout-items');
    const totalItemsElement = document.getElementById('checkout-total-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const totalElement = document.getElementById('checkout-total');

    if (!checkoutItemsElement || !totalItemsElement || !subtotalElement || !shippingElement || !totalElement) {
        console.error("renderOrderSummary: Không tìm thấy các phần tử cần thiết");
        return;
    }

    // Tính tổng giá trị đơn hàng và tổng số lượng sản phẩm
    let subtotal = 0;
    let totalQuantity = 0;
    
    // Render danh sách sản phẩm
    let itemsHTML = '';
    cartItems.forEach(item => {
        // Tìm sản phẩm từ danh sách sản phẩm để lấy thông tin chi tiết
        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('products')) || [];
        } catch (e) {
            console.error("renderOrderSummary: Lỗi khi lấy dữ liệu sản phẩm:", e);
        }
        const product = products.find(p => p.id == item.productId);
        if (!product) {
            console.warn("renderOrderSummary: Không tìm thấy thông tin sản phẩm với ID:", item.productId);
            return;
        }

        // Lấy đơn vị đã chọn
        const selectedUnit = product.units.find(u => u.name === item.unit);
        if (!selectedUnit) {
            console.warn("renderOrderSummary: Không tìm thấy đơn vị sản phẩm:", item.unit, "cho sản phẩm ID:", item.productId);
            return;
        }

        // Tính thành tiền cho sản phẩm này
        const itemTotal = selectedUnit.price * item.quantity;
        subtotal += itemTotal;
        totalQuantity += item.quantity;

        itemsHTML += `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    <img src="../${product.image || 'https://placehold.co/60x60?text=No+Image'}" alt="${product.name}">
                </div>
                <div class="checkout-item-info">
                    <h3>${product.name}</h3>
                    <div class="unit">Đơn vị: ${item.unit} (${selectedUnit.description || ''})</div>
                    <div class="price">${formatCurrency(selectedUnit.price)}</div>
                </div>
                <div class="checkout-item-quantity">x${item.quantity}</div>
            </div>
        `;
    });
    checkoutItemsElement.innerHTML = itemsHTML;

    // Tính phí vận chuyển (miễn phí cho đơn hàng từ 500.000 VND)
    const freeShippingThreshold = 500000;
    const standardShippingCost = 25000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;

    // Tính tổng cộng (tạm tính + phí vận chuyển)
    const totalPrice = subtotal + shippingCost;

    // Cập nhật các phần tử trên giao diện
    totalItemsElement.textContent = totalQuantity;
    subtotalElement.textContent = formatCurrency(subtotal);
    shippingElement.textContent = shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);
    totalElement.textContent = formatCurrency(totalPrice);
}

/**
 * Render địa chỉ đã lưu
 * @param {string} userId - ID của người dùng
 */
function renderSavedAddresses(userId) {
    const savedAddressesElement = document.getElementById('saved-addresses-list');
    if (!savedAddressesElement) {
        console.error("renderSavedAddresses: Không tìm thấy phần tử saved-addresses-list");
        return;
    }

    // Lấy danh sách địa chỉ đã lưu
    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("renderSavedAddresses: Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    // Lọc địa chỉ của người dùng hiện tại
    const userAddresses = addresses.filter(addr => addr.userId == userId);

    if (userAddresses.length === 0) {
        savedAddressesElement.innerHTML = '<p>Bạn chưa có địa chỉ nào được lưu.</p>';
        return;
    }

    // Render danh sách địa chỉ
    let addressesHTML = '';
    userAddresses.forEach(address => {
        addressesHTML += `
            <div class="saved-address-item" data-address-id="${address.id}">
                <p><strong>${address.fullname}</strong></p>
                <p>${address.phone}</p>
                <p>${address.address}</p>
                <div class="address-actions">
                    <button type="button" class="use-address-btn" data-address-id="${address.id}">Sử dụng</button>
                    <button type="button" class="delete-address-btn" data-address-id="${address.id}">Xóa</button>
                </div>
            </div>
        `;
    });
    savedAddressesElement.innerHTML = addressesHTML;
    // Đăng ký sự kiện cho các nút trong danh sách địa chỉ đã lưu
    registerAddressEvents();
}

/**
 * Đăng ký các sự kiện cho trang
 */
function registerEventListeners() {
    // Xử lý thay đổi phương thức thanh toán
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const bankInfo = document.getElementById('bank-info');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'bank') {
                bankInfo.classList.remove('hidden');
            } else {
                bankInfo.classList.add('hidden');
            }
        });
    });

    // Xử lý nút "Hoàn tất đơn hàng"
    const completeOrderBtn = document.getElementById('complete-order-btn');
    if (completeOrderBtn) {
        completeOrderBtn.addEventListener('click', function() {
            completeOrder();
        });
    }
    
    // Xử lý nút "Hiển thị/Ẩn" địa chỉ đã lưu
    const toggleSavedAddressesBtn = document.getElementById('toggle-saved-addresses');
    const savedAddressesList = document.getElementById('saved-addresses-list');
    
    if (toggleSavedAddressesBtn && savedAddressesList) {
        toggleSavedAddressesBtn.addEventListener('click', function() {
            if (savedAddressesList.classList.contains('hidden')) {
                savedAddressesList.classList.remove('hidden');
                this.textContent = 'Ẩn';
            } else {
                savedAddressesList.classList.add('hidden');
                this.textContent = 'Hiển thị';
            }
        });
    }
    
    // Xử lý nút "Lưu địa chỉ"
    const saveAddressBtn = document.getElementById('save-address-btn');
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', function() {
            saveCurrentAddress();
        });

    }
}

function registerAddressEvents() {
    // Xử lý nút "Sử dụng" địa chỉ đã lưu
    const useAddressBtns = document.querySelectorAll('.use-address-btn');
    useAddressBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const addressId = e.target.dataset.addressId;
            useSavedAddress(addressId);
        });
    });

    // Xử lý nút "Xóa" địa chỉ đã lưu
    const deleteAddressBtns = document.querySelectorAll('.delete-address-btn');
    deleteAddressBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const addressId = e.target.dataset.addressId;
            deleteSavedAddress(addressId);
        });
    });
}

/**
 * Sử dụng địa chỉ đã lưu
 * @param {string} addressId - ID của địa chỉ
 */
function useSavedAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("useSavedAddress: Không tìm thấy thông tin người dùng hợp lệ.");
        return;
    }

    // Đặt cờ là true để ngăn việc điền thông tin mặc định
    isUsingSavedAddress = true;

    // Lấy danh sách địa chỉ
    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("useSavedAddress: Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    // Tìm địa chỉ theo ID
    const address = addresses.find(addr => addr.id == addressId && addr.userId == currentUser.id);
    if (!address) {
        console.error("useSavedAddress: Không tìm thấy địa chỉ với ID:", addressId);
        return;
    }

    // Điền thông tin vào form
    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    
    if (fullnameInput) fullnameInput.value = address.fullname;
    if (phoneInput) phoneInput.value = address.phone;
    if (addressInput) addressInput.value = address.address;

    // Hiển thị thông báo
    showNotification('Đã sử dụng địa chỉ đã lưu');
    
    // Cập nhật UI: Bỏ chọn tất cả các địa chỉ khác và chọn địa chỉ hiện tại
    document.querySelectorAll('.saved-address-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedAddressItem = document.querySelector(`.saved-address-item[data-address-id="${addressId}"]`);
    if (selectedAddressItem) {
        selectedAddressItem.classList.add('selected');
    }
    
    // Reset cờ sau một khoảng thời gian ngắn để đảm bảo thông tin không bị ghi đè
    setTimeout(() => {
        isUsingSavedAddress = false;
    }, 100);
}

/**
 * Xóa địa chỉ đã lưu
 * @param {string} addressId - ID của địa chỉ
 */
function deleteSavedAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("deleteSavedAddress: Không tìm thấy thông tin người dùng hợp lệ.");
        return;
    }

    // Lấy danh sách địa chỉ
    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("deleteSavedAddress: Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    // Lọc bỏ địa chỉ cần xóa
    const newAddresses = addresses.filter(addr => !(addr.id == addressId && addr.userId == currentUser.id));
    
    // Kiểm tra xem có địa chỉ nào bị xóa không
    if (newAddresses.length === addresses.length) {
        console.error("deleteSavedAddress: Không tìm thấy địa chỉ với ID:", addressId);
        return;
    }

    // Lưu danh sách địa chỉ mới
    try {
        localStorage.setItem('addresses', JSON.stringify(newAddresses));
        showNotification('Đã xóa địa chỉ thành công!');
        
        // Render lại danh sách địa chỉ
        renderSavedAddresses(currentUser.id);
    } catch (e) {
        console.error("deleteSavedAddress: Lỗi khi lưu địa chỉ:", e);
        showNotification('Đã xảy ra lỗi khi xóa địa chỉ. Vui lòng thử lại.');
    }
}

/**
 * Lưu địa chỉ hiện tại từ form
 */
function saveCurrentAddress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("saveCurrentAddress: Không tìm thấy thông tin người dùng hợp lệ.");
        return;
    }

    // Lấy thông tin từ form
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    // Kiểm tra thông tin bắt buộc
    if (!fullname || !phone || !address) {
        showNotification('Vui lòng điền đầy đủ thông tin giao hàng trước khi lưu địa chỉ.');
        return;
    }

    // Lấy danh sách địa chỉ
    let addresses = [];
    try {
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    } catch (e) {
        console.error("saveCurrentAddress: Lỗi khi lấy dữ liệu địa chỉ:", e);
        addresses = [];
    }

    // Thêm địa chỉ mới
    const newAddress = {
        id: Date.now().toString(), // ID địa chỉ (dùng timestamp)
        userId: currentUser.id,
        fullname: fullname,
        phone: phone,
        address: address
    };
    
    addresses.push(newAddress);

    // Lưu danh sách địa chỉ
    try {
        localStorage.setItem('addresses', JSON.stringify(addresses));
        showNotification('Lưu địa chỉ thành công!');
        
        // Render lại danh sách địa chỉ
        renderSavedAddresses(currentUser.id);
    } catch (e) {
        console.error("saveCurrentAddress: Lỗi khi lưu địa chỉ:", e);
        showNotification('Đã xảy ra lỗi khi lưu địa chỉ. Vui lòng thử lại.');
    }
}

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 */
function showNotification(message) {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Hiển thị thông báo
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Hoàn tất đơn hàng
 */
function completeOrder() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error("completeOrder: Không tìm thấy thông tin người dùng hợp lệ.");
        window.location.href = '../login/login.html';
        return;
    }

    // Lấy thông tin từ form
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    // Kiểm tra thông tin bắt buộc
    if (!fullname || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
    }

    // Lấy dữ liệu giỏ hàng
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("completeOrder: Lỗi khi lấy dữ liệu giỏ hàng:", e);
        cart = [];
    }

    // Lọc các item thuộc về người dùng hiện tại
    const userCartItems = cart.filter(item => item.userId == currentUser.id);

    if (userCartItems.length === 0) {
        alert('Giỏ hàng của bạn đang trống.');
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

    // Tính phí vận chuyển
    const freeShippingThreshold = 500000;
    const standardShippingCost = 25000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;

    // Tính tổng cộng
    const totalPrice = subtotal + shippingCost;

    // Tạo đơn hàng mới
    const newOrder = {
        id: Date.now().toString(), // ID đơn hàng (dùng timestamp)
        userId: currentUser.id,
        orderDate: new Date().toISOString(),
        status: 'pending', // Trạng thái đơn hàng: pending (chờ xử lý), confirmed (đã xác nhận), shipping (đang giao), completed (hoàn thành), cancelled (đã hủy)
        items: userCartItems,
        shippingInfo: {
            fullname: fullname,
            phone: phone,
            address: address
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: totalPrice
    };

    // Lưu đơn hàng vào localStorage
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error("completeOrder: Lỗi khi lấy dữ liệu đơn hàng:", e);
        orders = [];
    }

    orders.push(newOrder);
    try {
        localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
        console.error("completeOrder: Lỗi khi lưu đơn hàng:", e);
        alert('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
        return;
    }

    // Xóa các sản phẩm của người dùng khỏi giỏ hàng
    const newCart = cart.filter(item => item.userId != currentUser.id);
    try {
        localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (e) {
        console.error("completeOrder: Lỗi khi cập nhật giỏ hàng:", e);
    }

    // Chuyển đến trang xác nhận đơn hàng
    window.location.href = '../order-confirmation/order-confirmation.html?id=' + newOrder.id;
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