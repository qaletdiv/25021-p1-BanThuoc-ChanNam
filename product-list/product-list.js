// --- Biến toàn cục cho trạng thái hiện tại ---
let currentPage = 1;
const itemsPerPage = 6; // Số sản phẩm mỗi trang
let currentFilters = {
    categories: [],
    types: [],
    minPrice: '',
    maxPrice: ''
};
let currentSort = 'default';
let filteredProducts = [];

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function () {
    initializeProductList(); // Khởi tạo phần riêng của trang product-list
});

// --- Hàm khởi tạo riêng của trang product-list ---
function initializeProductList() {
    renderFilters();
    setupEventListeners();
    applyFiltersAndSort(); // Load lần đầu với tất cả sản phẩm
}

// --- Thiết lập sự kiện ---
function setupEventListeners() {
    // Áp dụng bộ lọc
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            collectFilters();
            currentPage = 1; // Reset về trang đầu
            applyFiltersAndSort();
        });
    }

    // Xóa bộ lọc
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearFilters();
        });
    }

    // Sắp xếp
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1; // Reset về trang đầu
            applyFiltersAndSort();
        });
    }
}

// --- RENDERING ---
function renderFilters() {
    const filterSection = document.getElementById('filter-section');
    if (!filterSection) return;

    let categories = [];
    try {
        categories = JSON.parse(localStorage.getItem('categories')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu danh mục:", e);
    }

    let filterHTML = '';
    // Lọc theo danh mục
    filterHTML += `
        <div class="filter-group">
            <h4>Danh mục</h4>
            <ul>
    `;
    categories.forEach(cat => {
        filterHTML += `
            <li>
                <input type="checkbox" id="cat-${cat.id}" value="${cat.name}" data-type="category">
                <label for="cat-${cat.id}">${cat.name}</label>
            </li>
        `;
    });
    filterHTML += `
            </ul>
        </div>
    `;
    // Lọc theo loại thuốc (Giả sử có trường 'type' trong dữ liệu sản phẩm)
    filterHTML += `
        <div class="filter-group">
            <h4>Loại thuốc</h4>
            <ul>
                <li>
                    <input type="checkbox" id="type-kedon" value="kedon" data-type="type">
                    <label for="type-kedon">Thuốc kê đơn</label>
                </li>
                <li>
                    <input type="checkbox" id="type-khongkedon" value="khongkedon" data-type="type">
                    <label for="type-khongkedon">Thuốc không kê đơn</label>
                </li>
            </ul>
        </div>
    `;
    // Lọc theo khoảng giá
    filterHTML += `
        <div class="filter-group">
            <h4>Khoảng giá (VND)</h4>
            <div class="price-range">
                <input type="number" id="min-price" placeholder="Từ" min="0">
                <span>-</span>
                <input type="number" id="max-price" placeholder="Đến" min="0">
            </div>
        </div>
    `;
    filterSection.innerHTML = filterHTML;
}

function renderProductList(products) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    if (products.length === 0) {
        productGrid.innerHTML = '<p>Không tìm thấy sản phẩm nào phù hợp.</p>';
        renderPagination(0);
        return;
    }
    // Phân trang
    const totalItems = products.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    let productHTML = '';
    paginatedProducts.forEach(product => {
        // --- Cập nhật để render giống product-card trong index.html ---
        // Giả sử lấy giá từ đơn vị đầu tiên, hoặc giá thấp nhất nếu có nhiều đơn vị
        let priceDisplay = 'Liên hệ';
        let originalPriceDisplay = ''; // Hiển thị giá gốc nếu có giảm giá
        if (product.units && product.units.length > 0) {
             // Tìm giá thấp nhất trong các đơn vị
            const prices = product.units.map(unit => unit.price).filter(price => !isNaN(price));
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                priceDisplay = formatCurrency(minPrice);
                // Giả sử có trường discount hoặc originalPrice
                if (product.originalPrice && product.originalPrice > minPrice) {
                   originalPriceDisplay = `<span class="old-price">${formatCurrency(product.originalPrice)}</span>`;
                }
            }
        }

        // Xử lý badge (giả sử có trường isBestSeller hoặc discount)
        let badgeHTML = '';
        // Ví dụ đơn giản: nếu có trường discount > 0
        if (product.discount && product.discount > 0) {
             badgeHTML = `<div class="product-badge sale">-${product.discount}%</div>`;
        } else if (product.isBestSeller) { // Giả sử có trường isBestSeller
             badgeHTML = `<div class="product-badge bestseller">Bán chạy</div>`;
        }

        productHTML += `
           <div class="product-card">
               ${badgeHTML} <!-- Chèn badge nếu có -->
               <img src="${product.image || 'https://placehold.co/200x200?text=No+Image'}" alt="${product.name}">
               <h3>${product.name}</h3>
               <p>${product.description || 'Không có mô tả'}</p>
               <div class="price">
                   <span class="current-price">${priceDisplay}</span>
                   ${originalPriceDisplay} <!-- Hiển thị giá cũ nếu có -->
               </div>
               <a href="../product-detail/product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
           </div>
        `;
    });
    productGrid.innerHTML = productHTML;
    renderPagination(totalItems);
}

function renderPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    let paginationHTML = '';
    // Nút Previous
    paginationHTML += `
        <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
            &laquo; Trước
        </button>
    `;
    // Các số trang (hiển thị tối đa 5 trang gần trang hiện tại)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (startPage > 1) {
        paginationHTML += `<button data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button data-page="${i}" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button data-page="${totalPages}">${totalPages}</button>`;
    }
    // Nút Next
    paginationHTML += `
        <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
            Sau &raquo;
        </button>
    `;
    paginationContainer.innerHTML = paginationHTML;
    // Gắn sự kiện cho các nút phân trang
    paginationContainer.querySelectorAll('button[data-page]').forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) { // Kiểm tra page hợp lệ
                currentPage = page;
                renderProductList(filteredProducts);
            }
        });
    });
    // Gắn sự kiện cho nút Previous/Next
    document.getElementById('prev-page')?.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderProductList(filteredProducts);
        }
    });
    document.getElementById('next-page')?.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderProductList(filteredProducts);
        }
    });
}

// --- FILTERING & SORTING ---
function collectFilters() {
    currentFilters.categories = [];
    currentFilters.types = [];
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    currentFilters.minPrice = minPriceInput ? minPriceInput.value : '';
    currentFilters.maxPrice = maxPriceInput ? maxPriceInput.value : '';
    // Lấy danh mục được chọn
    document.querySelectorAll('input[data-type="category"]:checked').forEach(checkbox => {
        currentFilters.categories.push(checkbox.value);
    });
    // Lấy loại thuốc được chọn
    document.querySelectorAll('input[data-type="type"]:checked').forEach(checkbox => {
        currentFilters.types.push(checkbox.value);
    });
}

function clearFilters() {
    // Bỏ chọn tất cả checkbox
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    // Xóa giá trị input khoảng giá
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Reset filters
    currentFilters = {
        categories: [],
        types: [],
        minPrice: '',
        maxPrice: ''
    };
    currentPage = 1;
    applyFiltersAndSort();
}

function applyFilters(products = null) {
    if (!products) {
        try {
            products = JSON.parse(localStorage.getItem('products')) || [];
        } catch (e) {
            console.error("Lỗi khi lấy dữ liệu sản phẩm:", e);
            products = [];
        }
    }
    let result = [...products]; // Sao chép mảng để không làm thay đổi dữ liệu gốc
    // Lọc theo danh mục
    if (currentFilters.categories.length > 0) {
        result = result.filter(p => currentFilters.categories.includes(p.category));
    }
    // Lọc theo loại thuốc
    if (currentFilters.types.length > 0) {
        result = result.filter(p => currentFilters.types.includes(p.type)); // Giả sử có trường 'type'
    }
    // Lọc theo khoảng giá
    const minPrice = parseFloat(currentFilters.minPrice);
    const maxPrice = parseFloat(currentFilters.maxPrice);
    if (!isNaN(minPrice)) {
        result = result.filter(p => {
            // Giả sử lấy giá thấp nhất từ units
            const prices = p.units && p.units.length > 0 ?
                          p.units.map(u => u.price).filter(pr => !isNaN(pr)) : [];
            if (prices.length === 0) return false; // Không có giá hợp lệ
            const productMinPrice = Math.min(...prices);
            return productMinPrice >= minPrice;
        });
    }
    if (!isNaN(maxPrice)) {
        result = result.filter(p => {
             // Giả sử lấy giá thấp nhất từ units
            const prices = p.units && p.units.length > 0 ?
                          p.units.map(u => u.price).filter(pr => !isNaN(pr)) : [];
            if (prices.length === 0) return false; // Không có giá hợp lệ
            const productMinPrice = Math.min(...prices);
            return productMinPrice <= maxPrice;
        });
    }
    return result;
}

function applySorting(products) {
    switch(currentSort) {
        case 'name-asc':
            return products.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        case 'name-desc':
            return products.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        case 'price-asc':
            return products.sort((a, b) => {
                const priceA = a.units && a.units.length > 0 ?
                               Math.min(...a.units.map(u => u.price).filter(p => !isNaN(p))) : Infinity;
                const priceB = b.units && b.units.length > 0 ?
                               Math.min(...b.units.map(u => u.price).filter(p => !isNaN(p))) : Infinity;
                return priceA - priceB;
            });
        case 'price-desc':
            return products.sort((a, b) => {
                const priceA = a.units && a.units.length > 0 ?
                               Math.min(...a.units.map(u => u.price).filter(p => !isNaN(p))) : -Infinity;
                const priceB = b.units && b.units.length > 0 ?
                               Math.min(...b.units.map(u => u.price).filter(p => !isNaN(p))) : -Infinity;
                return priceB - priceA;
            });
        default:
            return products; // Mặc định không sắp xếp
    }
}

function applyFiltersAndSort() {
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (e) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", e);
        products = [];
    }
    // Áp dụng bộ lọc
    filteredProducts = applyFilters(products);
    // Áp dụng sắp xếp
    filteredProducts = applySorting(filteredProducts);
    // Render kết quả
    renderProductList(filteredProducts);
}
