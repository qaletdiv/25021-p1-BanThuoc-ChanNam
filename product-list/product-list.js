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
let currentSearchQuery = ''; // Thêm biến lưu từ khóa tìm kiếm

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function () {
    initializeProductList(); // Khởi tạo phần riêng của trang product-list
});

// --- Hàm khởi tạo riêng của trang product-list ---
function initializeProductList() {
    // Đọc tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search'); // Thêm đọc tham số tìm kiếm
    
    // Nếu có tham số tìm kiếm, lưu lại và hiển thị thông tin tìm kiếm
    if (searchParam) {
        currentSearchQuery = decodeURIComponent(searchParam);
        // Hiển thị thông tin tìm kiếm
        const searchResultInfo = document.getElementById('search-result-info');
        if (searchResultInfo) {
            searchResultInfo.style.display = 'flex';
            document.getElementById('search-keyword').textContent = currentSearchQuery;
        }
    }
    
    // Nếu có tham số danh mục, áp dụng bộ lọc
    if (categoryParam) {
        currentFilters.categories = [decodeURIComponent(categoryParam)];
        
        // Cập nhật giao diện bộ lọc để hiển thị danh mục đã chọn
        setTimeout(() => {
            const categoryCheckbox = document.querySelector(`input[data-type="category"][value="${decodeURIComponent(categoryParam)}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
            }
        }, 100);
    }
    
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
    
    // Xóa tìm kiếm (thêm mới)
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            clearSearch();
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
               <img src="../${product.image}" alt="${product.name}">
               <h3>${product.name}</h3>
               <p>${product.description}</p>
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

// Thêm hàm xóa tìm kiếm
function clearSearch() {
    currentSearchQuery = '';
    // Ẩn phần hiển thị kết quả tìm kiếm
    const searchResultInfo = document.getElementById('search-result-info');
    if (searchResultInfo) {
        searchResultInfo.style.display = 'none';
    }
    
    // Cập nhật URL không có tham số tìm kiếm
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // Reset trang và áp dụng lại bộ lọc
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
    
    // Lọc theo từ khóa tìm kiếm (thêm mới)
    if (currentSearchQuery) {
        const searchLower = currentSearchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.category && p.category.toLowerCase().includes(searchLower))
        );
    }
    
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
            return products.sort((a, b) => b.name.localeCompare(b.name, 'vi'));
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
    
    // Cập nhật tiêu đề trang dựa trên bộ lọc
    updatePageTitle();
    
    // Áp dụng sắp xếp
    filteredProducts = applySorting(filteredProducts);
    
    // Render kết quả
    renderProductList(filteredProducts);
}

/**
 * Cập nhật tiêu đề trang dựa trên bộ lọc đang áp dụng
 */
function updatePageTitle() {
    const pageTitleElement = document.getElementById('page-title');
    const pageSubtitleElement = document.getElementById('page-subtitle');
    
    if (!pageTitleElement || !pageSubtitleElement) return;
    
    // Ưu tiên hiển thị thông tin tìm kiếm nếu có
    if (currentSearchQuery) {
        pageTitleElement.textContent = 'Kết quả tìm kiếm';
        pageSubtitleElement.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm cho từ khóa "${currentSearchQuery}"`;
    } else if (currentFilters.categories.length > 0) {
        const categoryName = currentFilters.categories[0];
        pageTitleElement.textContent = `Danh mục: ${categoryName}`;
        pageSubtitleElement.textContent = `Các sản phẩm thuộc danh mục ${categoryName}`;
    } else if (currentFilters.types.length > 0) {
        const typeNames = {
            'kedon': 'Thuốc kê đơn',
            'khongkedon': 'Thuốc không kê đơn'
        };
        const typeName = currentFilters.types.map(type => typeNames[type] || type).join(', ');
        pageTitleElement.textContent = `Loại sản phẩm: ${typeName}`;
        pageSubtitleElement.textContent = `Các sản phẩm thuộc loại ${typeName}`;
    } else {
        pageTitleElement.textContent = 'Danh sách sản phẩm';
        pageSubtitleElement.textContent = 'Tất cả sản phẩm';
    }
}

// --- Hàm tiện ích: Định dạng tiền tệ ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}