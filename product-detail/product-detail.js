// product-detail/product-detail.js
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

    // Xử lý hình ảnh sản phẩm
    let productImages = [];
    if (currentProduct.images && Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
        productImages = currentProduct.images;
    } else if (currentProduct.image) {
        productImages = [currentProduct.image];
    }

    // Giới hạn số lượng thumbnail tối đa là 5
    const maxThumbnails = 5;
    const mainImage = productImages[0] || 'https://placehold.co/600x400?text=No+Image';
    const thumbnails = productImages.slice(0, maxThumbnails);

    // --- Tạo nội dung cho các tab ---
    let tabsHTML = `
        <div class="product-tabs">
            <div class="tab-header">
                <button class="tab-button active" data-tab="category">Danh mục</button>
                <button class="tab-button" data-tab="description">Mô tả sản phẩm</button>
                <button class="tab-button" data-tab="manufacturer">Nhà sản xuất</button>
                <button class="tab-button" data-tab="ingredients">Thành phần</button>
                <button class="tab-button" data-tab="usage">Công dụng</button>
            </div>
            <div class="tab-content">
                <div id="category" class="tab-pane active">
                    <p>${currentProduct.category || 'Không xác định'}</p>
                </div>
                <div id="description" class="tab-pane">
                    <p>${currentProduct.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
                </div>
                <div id="manufacturer" class="tab-pane">
                    <p>${currentProduct.manufacturer || 'Thông tin nhà sản xuất chưa được cung cấp.'}</p>
                </div>
                <div id="ingredients" class="tab-pane">
                    <p>${currentProduct.ingredients || 'Thông tin thành phần chưa được cung cấp.'}</p>
                </div>
                <div id="usage" class="tab-pane">
                    <p>${currentProduct.usage || 'Thông tin công dụng chưa được cung cấp.'}</p>
                </div>
            </div>
        </div>
    `;

    let html = `
        <div class="product-detail-content"> <!-- Wrapper mới cho layout -->
            <div class="product-detail-image">
                <img src="../${mainImage}" alt="${currentProduct.name}" class="main-image" id="main-product-image" onerror="this.src='https://placehold.co/600x400?text=Image+Not+Found'">
                <div class="product-thumbnails">
    `;

    // Tạo các thumbnail
    if (thumbnails.length > 0) {
        thumbnails.forEach((img, index) => {
            html += `
                <img src="../${img}" alt="${currentProduct.name} ${index+1}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}" onerror="this.src='https://placehold.co/80x80?text=Error'">
            `;
        });
    } else {
        html += '<p>Không có hình ảnh</p>';
    }

    html += `
                </div>
            </div>
            <div class="product-detail-info">
                <h1>${currentProduct.name}</h1>
                <!-- Di chuyển phần tabs lên đây -->
                ${tabsHTML}
                <div class="product-price-display">
                    <span class="current-price" id="product-price">${formatCurrency(selectedUnit.price)}</span>
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
                <!-- Di chuyển phần meta (danh mục) vào tabs -->
                <!-- <div class="product-meta">
                    <p><strong>Danh mục:</strong> <span>${currentProduct.category || 'Không xác định'}</span></p>
                </div> -->
            </div>
        </div>
    `;

    container.innerHTML = html;

    // --- Gắn sự kiện cho các tab ---
    attachTabEventListeners();

    // Xử lý sự kiện click thumbnail
    const thumbnailElements = document.querySelectorAll('.thumbnail');
    const mainImageElement = document.getElementById('main-product-image');
    if (thumbnailElements.length > 0 && mainImageElement) {
        thumbnailElements.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Xóa class active của tất cả thumbnail
                thumbnailElements.forEach(t => t.classList.remove('active'));
                // Thêm class active cho thumbnail được click
                this.classList.add('active');
                // Thay đổi hình chính
                const index = parseInt(this.dataset.index);
                if (!isNaN(index) && productImages[index]) {
                    mainImageElement.src = '../' + productImages[index];
                }
            });
        });
    }

    // Gắn sự kiện cho các thành phần khác
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

// --- Hàm gắn sự kiện cho các tab ---
function attachTabEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Xóa class 'active' khỏi tất cả nút và pane
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Thêm class 'active' cho nút được click và pane tương ứng
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
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
            // Tạo một ID duy nhất cho mục giỏ hàng này
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
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

// --- Hàm tiện ích: Định dạng tiền tệ ---
function formatCurrency(amount) {
    // Kiểm tra đầu vào hợp lệ
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}