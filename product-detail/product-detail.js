// js/product-detail.js

let currentProduct = null;
let selectedUnit = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', function () {
    // Gọi các hàm từ common.js
    loadData();
    loadHeader();
    loadFooter();
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
    } else {
        document.getElementById('product-detail-container').innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
    }
});

function loadProductDetail(productId) {
    const products = JSON.parse(localStorage.getItem('products'));
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

function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    
    // Chọn đơn vị đầu tiên làm mặc định
    selectedUnit = currentProduct.units[0];
    
    let html = `
        <div class="product-detail">
            <div class="product-detail-image">
                <img src="${currentProduct.image}" alt="${currentProduct.name}">
            </div>
            
            <div class="product-detail-info">
                <h1>${currentProduct.name}</h1>
                <span class="price" id="product-price">${formatCurrency(selectedUnit.price)}</span>
                <div class="category">Danh mục: ${currentProduct.category}</div>
                <div class="description">
                    <h3>Mô tả:</h3>
                    <p>${currentProduct.description}</p>
                </div>
                
                <div class="product-options">
                    <h3>Tùy chọn mua hàng</h3>
                    
                    <div class="unit-selector">
                        <label for="unit-select">Chọn đơn vị:</label>
                        <select id="unit-select">
    `;
    
    currentProduct.units.forEach((unit, index) => {
        html += `<option value="${index}" ${index === 0 ? 'selected' : ''}>${unit.name} - ${formatCurrency(unit.price)}</option>`;
    });
    
    html += `
                        </select>
                    </div>
                    
                    <div class="quantity-selector">
                        <label for="quantity-input">Số lượng:</label>
                        <input type="number" id="quantity-input" min="1" value="1">
                    </div>
                    
                    <button id="add-to-cart-btn" class="add-to-cart-btn">Thêm vào giỏ hàng</button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Gắn sự kiện
    document.getElementById('unit-select').addEventListener('change', function() {
        const selectedIndex = parseInt(this.value);
        selectedUnit = currentProduct.units[selectedIndex];
        document.getElementById('product-price').textContent = formatCurrency(selectedUnit.price);
    });
    
    document.getElementById('quantity-input').addEventListener('change', function() {
        const qty = parseInt(this.value);
        if (!isNaN(qty) && qty > 0) {
            selectedQuantity = qty;
        } else {
            this.value = selectedQuantity;
        }
    });
    
    document.getElementById('add-to-cart-btn').addEventListener('click', function() {
        addToCart();
    });
}

function addToCart() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
        window.location.href = 'login.html';
        return;
    }
    
    // Lấy giỏ hàng hiện tại từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => 
        item.productId === currentProduct.id && item.unit === selectedUnit.name
    );
    
    if (existingItemIndex > -1) {
        // Nếu đã có, cập nhật số lượng
        cart[existingItemIndex].quantity += selectedQuantity;
    } else {
        // Nếu chưa có, thêm mới
        const cartItem = {
            userId: currentUser.id,
            productId: currentProduct.id,
            productName: currentProduct.name,
            unit: selectedUnit.name,
            price: selectedUnit.price,
            quantity: selectedQuantity,
            image: currentProduct.image
        };
        cart.push(cartItem);
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert(`Đã thêm ${selectedQuantity} ${selectedUnit.name} ${currentProduct.name} vào giỏ hàng!`);
    
    // Reset số lượng về 1
    selectedQuantity = 1;
    document.getElementById('quantity-input').value = '1';
}

// Hàm tiện ích: Định dạng tiền tệ (copy từ main.js nếu chưa có)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}