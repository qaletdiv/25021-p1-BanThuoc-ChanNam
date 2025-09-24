// account/my-account.js

let currentUser = null;
let addresses = [];
let orders = [];

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    checkLoginStatus();
    
    // Tải dữ liệu
    loadUserData();
    loadAddresses();
    loadOrders();
    
    // Thiết lập sự kiện
    setupEventListeners();
    
    // Hiển thị tab mặc định
    showTab('personal-info');
});

// --- Kiểm tra trạng thái đăng nhập ---
function checkLoginStatus() {
    try {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
            window.location.href = '../login/login.html';
            return;
        }
        currentUser = JSON.parse(userJson);
        if (!currentUser || !currentUser.id) {
            throw new Error("Dữ liệu người dùng không hợp lệ");
        }
    } catch (e) {
        console.error("Lỗi khi kiểm tra đăng nhập:", e);
        window.location.href = '../login/login.html';
    }
}

// --- Tải thông tin người dùng ---
function loadUserData() {
    if (!currentUser) return;
    
    // Hiển thị thông tin người dùng
    document.getElementById('display-name').textContent = currentUser.name || '';
    document.getElementById('display-email').textContent = currentUser.email || '';
    document.getElementById('display-phone').textContent = currentUser.phone || '';
    
    // Điền dữ liệu vào form chỉnh sửa
    document.getElementById('name').value = currentUser.name || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
}

// --- Tải địa chỉ ---
function loadAddresses() {
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        addresses = allAddresses.filter(addr => addr.userId === currentUser.id);
        renderAddresses();
    } catch (e) {
        console.error("Lỗi khi tải địa chỉ:", e);
        addresses = [];
        renderAddresses();
    }
}

// --- Tải đơn hàng ---
function loadOrders() {
    try {
        let allOrders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = allOrders.filter(order => order.userId === currentUser.id);
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderOrders();
    } catch (e) {
        console.error("Lỗi khi tải đơn hàng:", e);
        orders = [];
        renderOrders();
    }
}

// --- Thiết lập sự kiện ---
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    
    // Chỉnh sửa thông tin cá nhân
    document.getElementById('edit-personal-info').addEventListener('click', function() {
        document.getElementById('personal-info-view').style.display = 'none';
        document.getElementById('personal-info-edit').style.display = 'block';
    });
    
    // Hủy chỉnh sửa thông tin cá nhân
    document.getElementById('cancel-edit').addEventListener('click', function() {
        document.getElementById('personal-info-edit').style.display = 'none';
        document.getElementById('personal-info-view').style.display = 'block';
        loadUserData();
    });
    
    // Lưu thông tin cá nhân
    document.getElementById('personal-info-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePersonalInfo();
    });
    
    // Thêm địa chỉ mới
    document.getElementById('add-address').addEventListener('click', function() {
        showAddressForm();
    });
    
    // Hủy thêm/sửa địa chỉ
    document.getElementById('cancel-address').addEventListener('click', function() {
        hideAddressForm();
    });
    
    // Lưu địa chỉ
    document.getElementById('address-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAddress();
    });
    
    // Đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.removeItem('currentUser');
                window.location.href = '../login/login.html';
            }
        });
    }
}

// --- Hiển thị tab ---
function showTab(tabId) {
    // Ẩn tất cả các tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Bỏ active tất cả các menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Active menu item tương ứng
    const targetMenuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
}

// --- Lưu thông tin cá nhân ---
function savePersonalInfo() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!name || !email || !phone) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Email không hợp lệ.');
        return;
    }
    
    // Validate phone
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        alert('Số điện thoại không hợp lệ.');
        return;
    }
    
    // Cập nhật thông tin người dùng
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    
    try {
        // Cập nhật currentUser trong localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Cập nhật trong danh sách người dùng
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        alert('Cập nhật thông tin thành công!');
        loadUserData();
        
        // Ẩn form, hiển thị thông tin
        document.getElementById('personal-info-edit').style.display = 'none';
        document.getElementById('personal-info-view').style.display = 'block';
    } catch (e) {
        console.error("Lỗi khi lưu thông tin người dùng:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Render địa chỉ ---
function renderAddresses() {
    const container = document.getElementById('addresses-list');
    if (!container) return;
    
    if (addresses.length === 0) {
        container.innerHTML = '<p class="no-data">Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.</p>';
        return;
    }
    
    let html = '';
    addresses.forEach(address => {
        html += `
            <div class="address-card ${address.isDefault ? 'default' : ''}">
                <div class="address-card-header">
                    <div class="address-card-title">${address.recipientName}</div>
                    ${address.isDefault ? '<span class="address-badge">Mặc định</span>' : ''}
                </div>
                <div class="address-card-body">
                    <div><strong>Điện thoại:</strong> ${address.recipientPhone}</div>
                    <div><strong>Địa chỉ:</strong> ${address.fullAddress}</div>
                </div>
                <div class="address-card-actions">
                    <button class="btn-edit edit-address-btn" data-id="${address.id}">Sửa</button>
                    <button class="btn-delete delete-address-btn" data-id="${address.id}">Xóa</button>
                    ${!address.isDefault ? `<button class="btn-default set-default-address-btn" data-id="${address.id}">Đặt làm mặc định</button>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    // Gắn sự kiện sau khi render
    container.querySelectorAll('.edit-address-btn').forEach(btn => {
        btn.addEventListener('click', () => editAddress(btn.getAttribute('data-id')));
    });
    container.querySelectorAll('.delete-address-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteAddress(btn.getAttribute('data-id')));
    });
    container.querySelectorAll('.set-default-address-btn').forEach(btn => {
        btn.addEventListener('click', () => setDefaultAddress(btn.getAttribute('data-id')));
    });
}

// --- Hiển thị form địa chỉ ---
function showAddressForm(addressId = null) {
    const formContainer = document.getElementById('address-form-container');
    const formTitle = document.getElementById('address-form-title');
    
    if (addressId) {
        // Chỉnh sửa địa chỉ
        formTitle.textContent = 'Chỉnh sửa địa chỉ';
        
        const address = addresses.find(addr => addr.id === addressId);
        if (!address) {
            alert('Không tìm thấy địa chỉ để chỉnh sửa.');
            return;
        }
        
        document.getElementById('address-id').value = address.id;
        document.getElementById('recipient-name').value = address.recipientName;
        document.getElementById('recipient-phone').value = address.recipientPhone;
        document.getElementById('address-detail').value = address.fullAddress;
        document.getElementById('is-default').checked = address.isDefault;
        
    } else {
        // Thêm địa chỉ mới
        formTitle.textContent = 'Thêm địa chỉ mới';
        document.getElementById('address-form').reset();
        document.getElementById('address-id').value = '';
    }
    
    formContainer.style.display = 'block';
}

// --- Ẩn form địa chỉ ---
function hideAddressForm() {
    document.getElementById('address-form-container').style.display = 'none';
}

// --- Lưu địa chỉ ---
function saveAddress() {
    const addressId = document.getElementById('address-id').value;
    const recipientName = document.getElementById('recipient-name').value.trim();
    const recipientPhone = document.getElementById('recipient-phone').value.trim();
    const fullAddress = document.getElementById('address-detail').value.trim();
    const isDefaultChecked = document.getElementById('is-default').checked;
    
    if (!recipientName || !recipientPhone || !fullAddress) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
        return;
    }
    
    // Validate phone
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(recipientPhone)) {
        alert('Số điện thoại không hợp lệ.');
        return;
    }
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        
        if (addressId) {
            // Cập nhật địa chỉ hiện có
            const index = allAddresses.findIndex(addr => addr.id === addressId && addr.userId === currentUser.id);
            if (index !== -1) {
                allAddresses[index] = {
                    ...allAddresses[index],
                    recipientName,
                    recipientPhone,
                    fullAddress,
                    isDefault: isDefaultChecked
                };
                
                if (isDefaultChecked) {
                    allAddresses = allAddresses.map(addr => {
                        if (addr.userId === currentUser.id && addr.id !== addressId) {
                            return { ...addr, isDefault: false };
                        }
                        return addr;
                    });
                }
            } else {
                alert('Không tìm thấy địa chỉ để cập nhật.');
                return;
            }
        } else {
            // Thêm địa chỉ mới
            const newAddress = {
                id: Date.now().toString(),
                userId: currentUser.id,
                recipientName,
                recipientPhone,
                fullAddress,
                isDefault: isDefaultChecked
            };
            
            if (isDefaultChecked) {
                allAddresses = allAddresses.map(addr => {
                    if (addr.userId === currentUser.id) {
                        return { ...addr, isDefault: false };
                    }
                    return addr;
                });
            }
            
            allAddresses.push(newAddress);
        }
        
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        alert(addressId ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!');
        loadAddresses();
        hideAddressForm();
    } catch (e) {
        console.error("Lỗi khi lưu địa chỉ:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Chỉnh sửa địa chỉ ---
function editAddress(addressId) {
    showAddressForm(addressId);
}

// --- Xóa địa chỉ ---
function deleteAddress(addressId) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        allAddresses = allAddresses.filter(addr => !(addr.id === addressId && addr.userId === currentUser.id));
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        loadAddresses();
        alert('Xóa địa chỉ thành công!');
    } catch (e) {
        console.error("Lỗi khi xóa địa chỉ:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Đặt địa chỉ mặc định ---
function setDefaultAddress(addressId) {
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        allAddresses = allAddresses.map(addr => {
            if (addr.userId === currentUser.id) {
                return { ...addr, isDefault: addr.id === addressId };
            }
            return addr;
        });
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        loadAddresses();
        alert('Đặt địa chỉ mặc định thành công!');
    } catch (e) {
        console.error("Lỗi khi đặt địa chỉ mặc định:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Render đơn hàng ---
function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        const statusInfo = getOrderStatusInfo(order.status);
        
        html += `
            <div class="order-card" data-id="${order.id}">
                <div class="order-card-header">
                    <div class="order-id">Mã đơn: #${order.id}</div>
                    <div class="order-status ${statusInfo.class}">${statusInfo.text}</div>
                </div>
                <div class="order-card-body">
                    <div class="order-date">Ngày đặt: ${formatDate(order.createdAt)}</div>
                    <div class="order-total">Tổng tiền: ${formatCurrency(order.totalPrice)}</div>
                </div>
                <div class="order-card-footer">
                    <button class="btn-view-order view-order-btn" data-id="${order.id}">Xem chi tiết</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    // Gắn sự kiện click sau khi render
    container.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showOrderDetail(btn.getAttribute('data-id'));
        });
    });
    
    // Gắn sự kiện click cho toàn bộ card order
    container.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => {
            showOrderDetail(card.getAttribute('data-id'));
        });
    });
}

// --- Hiển thị chi tiết đơn hàng ---
function showOrderDetail(orderId) {
    try {
        const order = orders.find(o => o.id == orderId);
        if (!order) {
            alert('Không tìm thấy thông tin đơn hàng.');
            return;
        }
        
        const container = document.getElementById('order-detail-container');
        const content = document.getElementById('order-detail-content');
        
        if (!container || !content) {
            console.error("Không tìm thấy phần tử modal chi tiết đơn hàng.");
            return;
        }

        const statusInfo = getOrderStatusInfo(order.status);
        
        // Render chi tiết đơn hàng
        let html = `
            <div class="order-detail-header">
                <h3>Chi tiết đơn hàng #${order.id}</h3>
                <button id="close-order-detail" class="btn-close">&times;</button>
            </div>
            
            <div class="order-detail-section">
                <h4>Thông tin đơn hàng</h4>
                <div class="order-info">
                    <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                    <p><strong>Ngày đặt:</strong> ${formatDate(order.createdAt)}</p>
                    <p><strong>Trạng thái:</strong> <span class="order-status ${statusInfo.class}">${statusInfo.text}</span></p>
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4>Địa chỉ giao hàng</h4>
                <div class="shipping-address">
                    <p><strong>Người nhận:</strong> ${order.recipientName || 'N/A'}</p>
                    <p><strong>Điện thoại:</strong> ${order.phone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4>Sản phẩm</h4>
                <div class="order-items-list">
        `;
        
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                html += `
                    <div class="order-item">
                        <img src="../${item.image}" alt="${item.productName}" class="order-item-image">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.productName}</div>
                            <div class="order-item-details">${item.unit || ''} - SL: ${item.quantity}</div>
                        </div>
                        <div class="order-item-price">${formatCurrency((item.price || 0) * (item.quantity || 0))}</div>
                    </div>
                `;
            });
        } else {
            html += `<p class="no-data">Không có thông tin sản phẩm.</p>`;
        }
        
        html += `
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4>Thanh toán</h4>
                <div class="payment-summary">
                    <div class="order-summary">
                        <span>Tạm tính:</span>
                        <span>${formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div class="order-summary">
                        <span>Phí vận chuyển:</span>
                        <span>${formatCurrency(order.shippingCost || 0)}</span>
                    </div>
        `;
        
        if (order.discount && order.discount > 0) {
            html += `
                <div class="order-summary">
                    <span>Giảm giá:</span>
                    <span>-${formatCurrency(order.discount)}</span>
                </div>
            `;
        }
        
        html += `
                    <div class="order-summary order-summary-total">
                        <span>Tổng cộng:</span>
                        <span>${formatCurrency(order.totalPrice || 0)}</span>
                    </div>
                    <div class="order-summary">
                        <span>Phương thức thanh toán:</span>
                        <span>${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        container.style.display = 'flex';

        // Gắn sự kiện đóng modal
        setupOrderDetailModalEvents(container);
        
    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết đơn hàng:', error);
        alert('Có lỗi xảy ra khi tải thông tin đơn hàng.');
    }
}

// --- Thiết lập sự kiện cho modal chi tiết đơn hàng ---
function setupOrderDetailModalEvents(container) {
    // Đóng khi click nút X
    const closeBtn = document.getElementById('close-order-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            container.style.display = 'none';
        });
    }

    // Đóng khi click bên ngoài modal
    container.addEventListener('click', function(e) {
        if (e.target === container) {
            container.style.display = 'none';
        }
    });

    // Đóng khi nhấn phím ESC
    const escapeHandler = function(e) {
        if (e.key === 'Escape' && container.style.display === 'flex') {
            container.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// --- Lấy thông tin trạng thái đơn hàng ---
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

// --- Định dạng ngày ---
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'N/A';
    }
}

// --- Định dạng tiền tệ ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

// --- Xử lý trước khi rời trang ---
window.addEventListener('beforeunload', function() {
    // Dọn dẹp các sự kiện nếu cần
});