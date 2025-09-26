// my-account/my-account.js

let currentUser = null;
let addresses = [];
let orders = [];
let currentPage = 1;
const ordersPerPage = 5;
let editingAddressId = null;

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadUserData();
    loadAddresses();
    loadOrders();
    setupEventListeners();
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
    
    document.getElementById('display-name').textContent = currentUser.name || '';
    document.getElementById('display-email').textContent = currentUser.email || '';
    document.getElementById('display-phone').textContent = currentUser.phone || '';
    
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
    
    // Thông tin cá nhân
    document.getElementById('edit-personal-info').addEventListener('click', function() {
        document.getElementById('personal-info-view').style.display = 'none';
        document.getElementById('personal-info-edit').style.display = 'block';
    });
    
    document.getElementById('cancel-edit').addEventListener('click', function() {
        document.getElementById('personal-info-edit').style.display = 'none';
        document.getElementById('personal-info-view').style.display = 'block';
        loadUserData();
    });
    
    document.getElementById('personal-info-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePersonalInfo();
    });
    
    // Popup địa chỉ
    document.getElementById('add-address').addEventListener('click', function() {
        showAddressPopup();
    });
    
    document.getElementById('address-popup-close').addEventListener('click', function() {
        hideAddressPopup();
    });
    
    document.getElementById('address-popup-cancel').addEventListener('click', function() {
        hideAddressPopup();
    });
    
    document.getElementById('address-popup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAddressFromPopup();
    });
    
    document.getElementById('address-popup-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            hideAddressPopup();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAddressPopup();
        }
    });
}

// --- Hiển thị tab ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        
        if (tabId === 'order-history') {
            currentPage = 1;
            renderOrders();
        }
    }
    
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Email không hợp lệ.');
        return;
    }
    
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        alert('Số điện thoại không hợp lệ.');
        return;
    }
    
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    
    try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        alert('Cập nhật thông tin thành công!');
        loadUserData();
        
        document.getElementById('personal-info-edit').style.display = 'none';
        document.getElementById('personal-info-view').style.display = 'block';
    } catch (e) {
        console.error("Lỗi khi lưu thông tin người dùng:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Popup địa chỉ ---
function showAddressPopup() {
    const popup = document.getElementById('address-popup-overlay');
    const title = document.getElementById('address-popup-title');
    
    title.textContent = 'Thêm địa chỉ mới';
    document.getElementById('address-popup-form').reset();
    document.getElementById('address-popup-id').value = '';
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('address-popup-recipient-name').focus();
    }, 100);
}

function hideAddressPopup() {
    const popup = document.getElementById('address-popup-overlay');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

function saveAddressFromPopup() {
    const recipientName = document.getElementById('address-popup-recipient-name').value.trim();
    const recipientPhone = document.getElementById('address-popup-recipient-phone').value.trim();
    const fullAddress = document.getElementById('address-popup-address-detail').value.trim();
    const isDefaultChecked = document.getElementById('address-popup-is-default').checked;
    
    if (!recipientName || !recipientPhone || !fullAddress) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
        return;
    }
    
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(recipientPhone)) {
        alert('Số điện thoại không hợp lệ.');
        return;
    }
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        
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
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        
        alert('Thêm địa chỉ thành công!');
        loadAddresses();
        hideAddressPopup();
    } catch (e) {
        console.error("Lỗi khi lưu địa chỉ:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Render và quản lý địa chỉ ---
function renderAddresses() {
    const container = document.getElementById('addresses-list');
    if (!container) return;
    
    if (addresses.length === 0) {
        container.innerHTML = '<p class="no-data">Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.</p>';
        return;
    }
    
    let html = '';
    addresses.forEach(address => {
        const isEditing = editingAddressId === address.id;
        
        html += `
            <div class="address-card ${address.isDefault ? 'default' : ''} ${isEditing ? 'editing' : ''}" data-id="${address.id}">
                <div class="address-card-header">
                    <div class="address-card-title">${address.recipientName}</div>
                    ${address.isDefault ? '<span class="address-badge">Mặc định</span>' : ''}
                </div>
                <div class="address-card-body">
                    <div><strong>Điện thoại:</strong> ${address.recipientPhone}</div>
                    <div><strong>Địa chỉ:</strong> ${address.fullAddress}</div>
                </div>
                
                ${!isEditing ? `
                    <div class="address-card-actions">
                        <button class="btn-edit edit-address-btn" data-id="${address.id}">Sửa</button>
                        <button class="btn-delete delete-address-btn" data-id="${address.id}">Xóa</button>
                        ${!address.isDefault ? `<button class="btn-default set-default-address-btn" data-id="${address.id}">Đặt làm mặc định</button>` : ''}
                    </div>
                ` : ''}
                
                ${isEditing ? `
                    <div class="address-edit-form active">
                        <h4>Chỉnh sửa địa chỉ</h4>
                        <form class="inline-address-form" data-id="${address.id}">
                            <div class="form-group">
                                <label for="edit-recipient-name-${address.id}">Họ và tên người nhận:</label>
                                <input type="text" id="edit-recipient-name-${address.id}" value="${address.recipientName}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-recipient-phone-${address.id}">Số điện thoại:</label>
                                <input type="tel" id="edit-recipient-phone-${address.id}" value="${address.recipientPhone}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-address-detail-${address.id}">Địa chỉ chi tiết:</label>
                                <input type="text" id="edit-address-detail-${address.id}" value="${address.fullAddress}" placeholder="Số nhà, tên đường..." required>
                            </div>
                            <div class="form-group checkbox-group">
                                <input type="checkbox" id="edit-is-default-${address.id}" ${address.isDefault ? 'checked' : ''}>
                                <label for="edit-is-default-${address.id}">Đặt làm địa chỉ mặc định</label>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                                <button type="button" class="btn cancel-inline-edit" data-id="${address.id}">Hủy</button>
                            </div>
                        </form>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupAddressEvents();
}

function setupAddressEvents() {
    const container = document.getElementById('addresses-list');
    if (!container) return;
    
    container.querySelectorAll('.edit-address-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const addressId = btn.getAttribute('data-id');
            startEditingAddress(addressId);
        });
    });
    
    container.querySelectorAll('.delete-address-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const addressId = btn.getAttribute('data-id');
            deleteAddress(addressId);
        });
    });
    
    container.querySelectorAll('.set-default-address-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const addressId = btn.getAttribute('data-id');
            setDefaultAddress(addressId);
        });
    });
    
    container.querySelectorAll('.inline-address-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const addressId = form.getAttribute('data-id');
            saveInlineAddress(addressId);
        });
    });
    
    container.querySelectorAll('.cancel-inline-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelInlineEditing();
        });
    });
}

function startEditingAddress(addressId) {
    editingAddressId = addressId;
    hideAddressPopup();
    renderAddresses();
    scrollToEditingAddress(addressId);
}

function cancelInlineEditing() {
    editingAddressId = null;
    renderAddresses();
}

function saveInlineAddress(addressId) {
    const form = document.querySelector(`.inline-address-form[data-id="${addressId}"]`);
    if (!form) return;
    
    const recipientName = form.querySelector(`#edit-recipient-name-${addressId}`).value.trim();
    const recipientPhone = form.querySelector(`#edit-recipient-phone-${addressId}`).value.trim();
    const fullAddress = form.querySelector(`#edit-address-detail-${addressId}`).value.trim();
    const isDefaultChecked = form.querySelector(`#edit-is-default-${addressId}`).checked;
    
    if (!recipientName || !recipientPhone || !fullAddress) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
        return;
    }
    
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(recipientPhone)) {
        alert('Số điện thoại không hợp lệ.');
        return;
    }
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
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
            
            localStorage.setItem('addresses', JSON.stringify(allAddresses));
            alert('Cập nhật địa chỉ thành công!');
            
            editingAddressId = null;
            loadAddresses();
        } else {
            alert('Không tìm thấy địa chỉ để cập nhật.');
        }
    } catch (e) {
        console.error("Lỗi khi lưu địa chỉ:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

function scrollToEditingAddress(addressId) {
    setTimeout(() => {
        const editingCard = document.querySelector(`.address-card[data-id="${addressId}"]`);
        if (editingCard) {
            editingCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, 100);
}

function deleteAddress(addressId) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        allAddresses = allAddresses.filter(addr => !(addr.id === addressId && addr.userId === currentUser.id));
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        
        if (editingAddressId === addressId) {
            editingAddressId = null;
        }
        
        loadAddresses();
        alert('Xóa địa chỉ thành công!');
    } catch (e) {
        console.error("Lỗi khi xóa địa chỉ:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

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

// --- Quản lý đơn hàng ---
function renderOrders() {
    const container = document.getElementById('orders-list');
    const paginationContainer = document.getElementById('orders-pagination');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">Bạn chưa có đơn hàng nào.</p>';
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }
    
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
    const currentOrders = orders.slice(startIndex, endIndex);
    
    let html = '';
    currentOrders.forEach(order => {
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
    renderPagination(totalPages, paginationContainer);
    setupOrderEvents();
}

function setupOrderEvents() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    container.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const orderId = btn.getAttribute('data-id');
            showOrderDetail(orderId);
        });
    });
    
    container.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => {
            const orderId = card.getAttribute('data-id');
            showOrderDetail(orderId);
        });
    });
}

function renderPagination(totalPages, container) {
    if (!container || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <div class="pagination-info">
            Hiển thị ${Math.min((currentPage - 1) * ordersPerPage + 1, orders.length)}-${Math.min(currentPage * ordersPerPage, orders.length)} của ${orders.length} đơn hàng
        </div>
        <div class="pagination-controls">
    `;
    
    if (currentPage > 1) {
        html += `<button class="pagination-btn prev-btn" data-page="${currentPage - 1}">‹</button>`;
    } else {
        html += `<button class="pagination-btn prev-btn disabled" disabled>‹</button>`;
    }
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<button class="pagination-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="pagination-btn active" data-page="${i}">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn next-btn" data-page="${currentPage + 1}">›</button>`;
    } else {
        html += `<button class="pagination-btn next-btn disabled" disabled>›</button>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    setupPaginationEvents();
}

function setupPaginationEvents() {
    const container = document.getElementById('orders-pagination');
    if (!container) return;
    
    container.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderOrders();
                
                const ordersContainer = document.getElementById('orders-list');
                if (ordersContainer) {
                    ordersContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

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
                        <img src="../${item.image}" alt="${item.productName}" class="order-item-image" onerror="this.src='https://placehold.co/80x80?text=Ảnh+lỗi'">
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
        setupOrderDetailModalEvents(container);
        
    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết đơn hàng:', error);
        alert('Có lỗi xảy ra khi tải thông tin đơn hàng.');
    }
}

function setupOrderDetailModalEvents(container) {
    const closeBtn = document.getElementById('close-order-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            container.style.display = 'none';
        });
    }

    container.addEventListener('click', function(e) {
        if (e.target === container) {
            container.style.display = 'none';
        }
    });

    const escapeHandler = function(e) {
        if (e.key === 'Escape' && container.style.display === 'flex') {
            container.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

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

function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}