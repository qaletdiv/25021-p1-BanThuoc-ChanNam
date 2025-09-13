let currentProduct = null;
let selectedUnit = null;
let selectedQuantity = 1;

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        loadProductDetail(productId);
    } else {
        document.getElementById('product-detail-container').innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
    }
});

// --- Hàm load chi tiết sản phẩm ---
function loadProductDetail(productId) {
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", e);
    }
    currentProduct = products.find(p => p.id == productId);
    if (!currentProduct) {
        document.getElementById('product-detail-container').innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
        return;
    }
    // Cập nhật breadcrumb
    document.getElementById('breadcrumb-product-name').textContent = currentProduct.name;
    // Render chi tiết sản phẩm
    renderProductDetail();
}

// --- Hàm render chi tiết sản phẩm ---
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    // Chọn đơn vị đầu tiên làm mặc định
    selectedUnit = currentProduct.units && currentProduct.units.length > 0 ? currentProduct.units[0] : null;
    if (!selectedUnit) {
         container.innerHTML = '<p>Sản phẩm không có đơn vị bán.</p>';
         return;
    }

    // --- Cập nhật HTML để phù hợp với style.css và cấu trúc mới ---
    let html = `
        <div class="product-detail-content"> <!-- Wrapper mới cho layout -->
            <div class="product-detail-image">
                <img src="../${currentProduct.image || 'https://placehold.co/600x400?text=No+Image'}" alt="${currentProduct.name}">
            </div>
            <div class="product-detail-info">
                <h1>${currentProduct.name}</h1>
                <p class="product-description">${currentProduct.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
                <div class="product-meta">
                    <p><strong>Danh mục:</strong> <span>${currentProduct.category || 'Không xác định'}</span></p>
                    <!-- Có thể thêm thông tin khác như loại thuốc, nhà sản xuất nếu có -->
                </div>
                <div class="product-options">
                    <h3>Tùy chọn mua hàng</h3>
                    <div class="unit-selector">
                        <label for="unit-select">Chọn đơn vị:</label>
                        <select id="unit-select">
    `;
    if (currentProduct.units && currentProduct.units.length > 0) {
        currentProduct.units.forEach((unit, index) => {
            html += `<option value="${index}" ${index === 0 ? 'selected' : ''}>${unit.name} - ${formatCurrency(unit.price)}</option>`;
        });
    } else {
        html += `<option value="">Không có đơn vị</option>`;
    }
    html += `
                        </select>
                    </div>
                    <div class="quantity-selector">
                        <label for="quantity-input">Số lượng:</label>
                        <input type="number" id="quantity-input" min="1" value="1">
                    </div>
                    <button id="add-to-cart-btn" class="btn btn-primary">Thêm vào giỏ hàng</button>
                </div>
                 <div class="product-price-display">
                    <span class="current-price" id="product-price">${formatCurrency(selectedUnit.price)}</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    // Gắn sự kiện
    const unitSelect = document.getElementById('unit-select');
    const quantityInput = document.getElementById('quantity-input');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (unitSelect) {
        unitSelect.addEventListener('change', function() {
            const selectedIndex = parseInt(this.value);
            if (!isNaN(selectedIndex) && currentProduct.units[selectedIndex]) {
                selectedUnit = currentProduct.units[selectedIndex];
                document.getElementById('product-price').textContent = formatCurrency(selectedUnit.price);
            }
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const qty = parseInt(this.value);
            if (!isNaN(qty) && qty > 0) {
                selectedQuantity = qty;
            } else {
                this.value = selectedQuantity;
            }
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart();
        });
    }
}

// --- Hàm thêm vào giỏ hàng ---
function addToCart() {
    // Kiểm tra đăng nhập
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
        window.location.href = '../login/login.html'; // Cập nhật đường dẫn
        return;
    }
    let currentUser;
    try {
         currentUser = JSON.parse(currentUserJson);
         if (!currentUser || !currentUser.id) {
             throw new Error("Dữ liệu người dùng không hợp lệ");
         }
    } catch (e) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", e);
        alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '../login/login.html'; // Cập nhật đường dẫn
        return;
    }

    if (!currentProduct || !selectedUnit) {
        alert('Không thể thêm sản phẩm vào giỏ hàng.');
        return;
    }

    // Lấy giỏ hàng hiện tại từ localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy giỏ hàng:", e);
        cart = []; // Khởi tạo lại nếu lỗi
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa (cùng productId và unit)
    const existingItemIndex = cart.findIndex(item =>
        item.userId == currentUser.id && // Chỉ tìm trong giỏ của user hiện tại
        item.productId === currentProduct.id &&
        item.unit === selectedUnit.name
    );

    if (existingItemIndex > -1) {
        // Nếu đã có, cập nhật số lượng
        cart[existingItemIndex].quantity += selectedQuantity;
        alert(`Đã cập nhật số lượng. Giỏ hàng hiện có ${cart[existingItemIndex].quantity} ${selectedUnit.name} ${currentProduct.name}.`);
    } else {
        // Nếu chưa có, thêm mới
        const cartItem = {
            userId: currentUser.id, // Gán userId
            productId: currentProduct.id,
            productName: currentProduct.name,
            unit: selectedUnit.name,
            price: selectedUnit.price,
            quantity: selectedQuantity,
            image: currentProduct.image || ''
        };
        cart.push(cartItem);
        alert(`Đã thêm ${selectedQuantity} ${selectedUnit.name} ${currentProduct.name} vào giỏ hàng!`);
    }

    // Lưu lại vào localStorage
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
         // Cập nhật số lượng giỏ hàng trên header nếu có hàm
        if (typeof updateHeaderCartCount === 'function') {
             updateHeaderCartCount();
        }
    } catch (e) {
        console.error("Lỗi khi lưu giỏ hàng:", e);
        alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }

    // Reset số lượng về 1
    selectedQuantity = 1;
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.value = '1';
    }
}
