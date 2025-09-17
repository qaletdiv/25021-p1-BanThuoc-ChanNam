// account/account.js

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
            // Chưa đăng nhập, chuyển hướng về trang đăng nhập
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
        addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        // Lọc địa chỉ của người dùng hiện tại
        addresses = addresses.filter(addr => addr.userId === currentUser.id);
        renderAddresses();
    } catch (e) {
        console.error("Lỗi khi tải địa chỉ:", e);
        addresses = [];
    }
}

// --- Tải đơn hàng ---
function loadOrders() {
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
        // Lọc đơn hàng của người dùng hiện tại
        orders = orders.filter(order => order.userId === currentUser.id);
        // Sắp xếp theo ngày giảm dần
        orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        renderOrders();
    } catch (e) {
        console.error("Lỗi khi tải đơn hàng:", e);
        orders = [];
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
        // Reset form
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
    
    // Đóng chi tiết đơn hàng
    document.getElementById('close-order-detail').addEventListener('click', function() {
        document.getElementById('order-detail-container').style.display = 'none';
    });
    
    // Tải quận/huyện khi chọn tỉnh/thành
    document.getElementById('province').addEventListener('change', function() {
        loadDistricts(this.value);
    });
    
    // Tải phường/xã khi chọn quận/huyện
    document.getElementById('district').addEventListener('change', function() {
        loadWards(this.value);
    });
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
    document.getElementById(tabId).classList.add('active');
    
    // Active menu item tương ứng
    document.querySelector(`.menu-item[data-tab="${tabId}"]`).classList.add('active');
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
    
    // Cập nhật thông tin người dùng
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    
    // Lưu vào localStorage
    try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Cập nhật trong danh sách người dùng
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Hiển thị thông báo
        alert('Cập nhật thông tin thành công!');
        
        // Cập nhật hiển thị
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
        container.innerHTML = '<p>Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.</p>';
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
                    <div>Địa chỉ: ${address.addressDetail}, ${address.ward}, ${address.district}, ${address.province}</div>
                    <div>Điện thoại: ${address.recipientPhone}</div>
                </div>
                <div class="address-card-actions">
                    <button onclick="editAddress('${address.id}')">Sửa</button>
                    <button onclick="deleteAddress('${address.id}')">Xóa</button>
                    ${!address.isDefault ? `<button onclick="setDefaultAddress('${address.id}')">Đặt làm mặc định</button>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// --- Hiển thị form địa chỉ ---
function showAddressForm(addressId = null) {
    const formContainer = document.getElementById('address-form-container');
    const formTitle = document.getElementById('address-form-title');
    
    if (addressId) {
        // Chỉnh sửa địa chỉ
        formTitle.textContent = 'Chỉnh sửa địa chỉ';
        
        // Tìm địa chỉ cần sửa
        const address = addresses.find(addr => addr.id === addressId);
        if (!address) return;
        
        // Điền dữ liệu vào form
        document.getElementById('address-id').value = address.id;
        document.getElementById('recipient-name').value = address.recipientName;
        document.getElementById('recipient-phone').value = address.recipientPhone;
        document.getElementById('province').value = address.province;
        document.getElementById('district').value = address.district;
        document.getElementById('ward').value = address.ward;
        document.getElementById('address-detail').value = address.addressDetail;
        document.getElementById('is-default').checked = address.isDefault;
        
        // Tải lại quận/huyện và phường/xã
        loadDistricts(address.province, address.district);
        loadWards(address.district, address.ward);
    } else {
        // Thêm địa chỉ mới
        formTitle.textContent = 'Thêm địa chỉ mới';
        
        // Reset form
        document.getElementById('address-form').reset();
        document.getElementById('address-id').value = '';
        
        // Tải lại quận/huyện và phường/xã
        loadDistricts('');
        loadWards('');
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
    const province = document.getElementById('province').value;
    const district = document.getElementById('district').value;
    const ward = document.getElementById('ward').value;
    const addressDetail = document.getElementById('address-detail').value.trim();
    const isDefault = document.getElementById('is-default').checked;
    
    if (!recipientName || !recipientPhone || !province || !district || !ward || !addressDetail) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
        return;
    }
    
    try {
        let allAddresses = JSON.parse(localStorage.getItem('addresses')) || [];
        
        if (addressId) {
            // Cập nhật địa chỉ hiện có
            const index = allAddresses.findIndex(addr => addr.id === addressId);
            if (index !== -1) {
                allAddresses[index] = {
                    ...allAddresses[index],
                    recipientName,
                    recipientPhone,
                    province,
                    district,
                    ward,
                    addressDetail,
                    isDefault
                };
                
                // Nếu đặt làm mặc định, cập nhật các địa chỉ khác
                if (isDefault) {
                    allAddresses = allAddresses.map(addr => ({
                        ...addr,
                        isDefault: addr.id === addressId
                    }));
                }
            }
        } else {
            // Thêm địa chỉ mới
            const newAddress = {
                id: Date.now().toString(),
                userId: currentUser.id,
                recipientName,
                recipientPhone,
                province,
                district,
                ward,
                addressDetail,
                isDefault
            };
            
            // Nếu đặt làm mặc định, cập nhật các địa chỉ khác
            if (isDefault) {
                allAddresses = allAddresses.map(addr => ({
                    ...addr,
                    isDefault: false
                }));
            }
            
            allAddresses.push(newAddress);
        }
        
        // Lưu vào localStorage
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        
        // Hiển thị thông báo
        alert(addressId ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!');
        
        // Tải lại danh sách địa chỉ
        loadAddresses();
        
        // Ẩn form
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
        
        // Lọc bỏ địa chỉ cần xóa
        allAddresses = allAddresses.filter(addr => addr.id !== addressId);
        
        // Lưu vào localStorage
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        
        // Tải lại danh sách địa chỉ
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
        
        // Cập nhật địa chỉ mặc định
        allAddresses = allAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        
        // Lưu vào localStorage
        localStorage.setItem('addresses', JSON.stringify(allAddresses));
        
        // Tải lại danh sách địa chỉ
        loadAddresses();
        
        alert('Đặt địa chỉ mặc định thành công!');
    } catch (e) {
        console.error("Lỗi khi đặt địa chỉ mặc định:", e);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
}

// --- Tải quận/huyện ---
function loadDistricts(province, selectedDistrict = '') {
    const districtSelect = document.getElementById('district');
    
    // Xóa các option hiện tại
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
    
    if (!province) return;
    
    // Dữ liệu mẫu về quận/huyện
    const districtsData = {
        'hanoi': ['Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy'],
        'hcm': ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 10'],
        'danang': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu']
    };
    
    const districts = districtsData[province] || [];
    
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        if (district === selectedDistrict) {
            option.selected = true;
        }
        districtSelect.appendChild(option);
    });
}

// --- Tải phường/xã ---
function loadWards(district, selectedWard = '') {
    const wardSelect = document.getElementById('ward');
    
    // Xóa các option hiện tại
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!district) return;
    
    // Dữ liệu mẫu về phường/xã
    const wardsData = {
        'Ba Đình': ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị'],
        'Hoàn Kiếm': ['Chương Dương Độ', 'Cửa Đông', 'Đồng Xuân', 'Hàng Bạc'],
        'Quận 1': ['Bến Nghé', 'Bến Thành', 'Cầu Kho', 'Cầu Ông Lãnh'],
        'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4'],
        'Hải Châu': ['Phước Ninh', 'Thuận Phước', 'Hòa Thuận Đông', 'Hòa Thuận Tây']
    };
    
    const wards = wardsData[district] || [];
    
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        if (ward === selectedWard) {
            option.selected = true;
        }
        wardSelect.appendChild(option);
    });
}

// --- Render đơn hàng ---
function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        // Xác định lớp CSS cho trạng thái
        let statusClass = '';
        let statusText = '';
        
        switch (order.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Chờ xác nhận';
                break;
            case 'processing':
                statusClass = 'status-processing';
                statusText = 'Đang xử lý';
                break;
            case 'shipping':
                statusClass = 'status-processing';
                statusText = 'Đang giao hàng';
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'Đã giao';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Đã hủy';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Chờ xác nhận';
        }
        
        html += `
            <div class="order-card" onclick="showOrderDetail('${order.id}')">
                <div class="order-card-header">
                    <div class="order-id">Mã đơn: #${order.id}</div>
                    <div class="order-status ${statusClass}">${statusText}</div>
                </div>
                <div class="order-card-body">
                    <div class="order-date">Ngày đặt: ${formatDate(order.orderDate)}</div>
                    <div class="order-total">Tổng tiền: ${formatCurrency(order.totalAmount)}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// --- Hiển thị chi tiết đơn hàng ---
function showOrderDetail(orderId) {
    // Tìm đơn hàng
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const container = document.getElementById('order-detail-container');
    const content = document.getElementById('order-detail-content');
    
    // Xác định trạng thái
    let statusText = '';
    switch (order.status) {
        case 'pending':
            statusText = 'Chờ xác nhận';
            break;
        case 'processing':
            statusText = 'Đang xử lý';
            break;
        case 'shipping':
            statusText = 'Đang giao hàng';
            break;
        case 'delivered':
            statusText = 'Đã giao';
            break;
        case 'cancelled':
            statusText = 'Đã hủy';
            break;
        default:
            statusText = 'Chờ xác nhận';
    }
    
    // Render chi tiết đơn hàng
    let html = `
        <div class="order-detail-section">
            <h4>Thông tin đơn hàng</h4>
            <div class="order-info">
                <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.orderDate)}</p>
                <p><strong>Trạng thái:</strong> <span class="order-status ${getStatusClass(order.status)}">${statusText}</span></p>
                ${order.shippingDate ? `<p><strong>Ngày giao hàng:</strong> ${formatDate(order.shippingDate)}</p>` : ''}
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4>Địa chỉ giao hàng</h4>
            <div class="shipping-address">
                <p><strong>Người nhận:</strong> ${order.shippingAddress.recipientName}</p>
                <p><strong>Điện thoại:</strong> ${order.shippingAddress.recipientPhone}</p>
                <p><strong>Địa chỉ:</strong> ${order.shippingAddress.addressDetail}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}</p>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4>Sản phẩm</h4>
            <div class="order-items-list">
    `;
    
    // Render các sản phẩm trong đơn hàng
    order.items.forEach(item => {
        html += `
            <div class="order-item">
                <img src="../${item.image}" alt="${item.productName}" class="order-item-image">
                <div class="order-item-info">
                    <div class="order-item-name">${item.productName}</div>
                    <div class="order-item-details">${item.unit} - SL: ${item.quantity}</div>
                </div>
                <div class="order-item-price">${formatCurrency(item.price * item.quantity)}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div class="order-detail-section">
            <h4>Thanh toán</h4>
            <div class="payment-summary">
                <div class="order-summary">
                    <span>Tạm tính:</span>
                    <span>${formatCurrency(order.subtotal)}</span>
                </div>
                <div class="order-summary">
                    <span>Phí vận chuyển:</span>
                    <span>${formatCurrency(order.shippingFee)}</span>
                </div>
                ${order.discount > 0 ? `
                <div class="order-summary">
                    <span>Giảm giá:</span>
                    <span>-${formatCurrency(order.discount)}</span>
                </div>
                ` : ''}
                <div class="order-summary order-summary-total">
                    <span>Tổng cộng:</span>
                    <span>${formatCurrency(order.totalAmount)}</span>
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
}

// --- Lấy lớp CSS cho trạng thái ---
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'processing':
        case 'shipping':
            return 'status-processing';
        case 'delivered':
            return 'status-delivered';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}

// --- Định dạng ngày ---
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// --- Định dạng tiền tệ ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}