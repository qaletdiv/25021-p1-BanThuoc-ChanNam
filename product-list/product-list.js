// product-list/product-list.js

// --- Biến toàn cục ---
let currentPage = 1;
const itemsPerPage = 6; // Tăng lên 6 sản phẩm mỗi trang
let currentFilters = {
    categories: [],
    types: [],
    minPrice: '',
    maxPrice: ''
};
let currentSort = 'default';
let filteredProducts = [];
let currentSearchQuery = '';
let isLoading = false;

// --- Khởi tạo khi DOM load xong ---
document.addEventListener('DOMContentLoaded', function () {
    initializeProductList();
});

// --- Hàm khởi tạo chính ---
function initializeProductList() {
    // Đọc tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    // Xử lý tham số tìm kiếm
    if (searchParam) {
        currentSearchQuery = decodeURIComponent(searchParam);
        showSearchResultInfo();
    }
    
    // Xử lý tham số danh mục
    if (categoryParam) {
        currentFilters.categories = [decodeURIComponent(categoryParam)];
        updateFilterCheckboxes();
    }
    
    renderFilters();
    setupEventListeners();
    applyFiltersAndSort();
    
    // Ẩn loading sau khi khởi tạo
    setTimeout(() => {
        hideLoading();
    }, 500);
}

// --- Thiết lập sự kiện ---
function setupEventListeners() {
    // Áp dụng bộ lọc
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFiltersHandler);
    }

    // Xóa bộ lọc
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFiltersHandler);
    }

    // Sắp xếp
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortHandler);
    }
    
    // Xóa tìm kiếm
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearchHandler);
    }
    
    // Xóa tất cả filter
    const clearAllFiltersBtn = document.getElementById('clear-all-filters');
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllFiltersHandler);
    }
    
    // Reset tất cả
    const resetAllBtn = document.getElementById('reset-all');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetAllHandler);
    }
    
    // Toggle filter sidebar trên mobile
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    if (toggleFiltersBtn) {
        toggleFiltersBtn.addEventListener('click', toggleFiltersHandler);
    }
}

// --- Event Handlers ---
function applyFiltersHandler() {
    showLoading();
    collectFilters();
    currentPage = 1;
    applyFiltersAndSort();
}

function clearFiltersHandler() {
    showLoading();
    clearFilters();
    applyFiltersAndSort();
}

function sortHandler() {
    showLoading();
    currentSort = this.value;
    currentPage = 1;
    applyFiltersAndSort();
}

function clearSearchHandler() {
    showLoading();
    clearSearch();
    applyFiltersAndSort();
}

function clearAllFiltersHandler() {
    showLoading();
    clearAllFilters();
    applyFiltersAndSort();
}

function resetAllHandler() {
    showLoading();
    resetAll();
    applyFiltersAndSort();
}

function toggleFiltersHandler() {
    const filterContent = document.getElementById('filter-content');
    const toggleIcon = this.querySelector('.icon');
    
    filterContent.classList.toggle('collapsed');
    toggleIcon.textContent = filterContent.classList.contains('collapsed') ? '►' : '▼';
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
        const isChecked = currentFilters.categories.includes(cat.name) ? 'checked' : '';
        filterHTML += `
            <li>
                <input type="checkbox" id="cat-${cat.id}" value="${cat.name}" data-type="category" ${isChecked}>
                <label for="cat-${cat.id}">${cat.name}</label>
            </li>
        `;
    });
    filterHTML += `
            </ul>
        </div>
    `;
    
    // Lọc theo loại thuốc
    filterHTML += `
        <div class="filter-group">
            <h4>Loại thuốc</h4>
            <ul>
    `;
    const typeOptions = [
        { id: 'kedon', value: 'kedon', label: 'Thuốc kê đơn' },
        { id: 'khongkedon', value: 'khongkedon', label: 'Thuốc không kê đơn' }
    ];
    
    typeOptions.forEach(type => {
        const isChecked = currentFilters.types.includes(type.value) ? 'checked' : '';
        filterHTML += `
            <li>
                <input type="checkbox" id="type-${type.id}" value="${type.value}" data-type="type" ${isChecked}>
                <label for="type-${type.id}">${type.label}</label>
            </li>
        `;
    });
    filterHTML += `
            </ul>
        </div>
    `;
    
    // Lọc theo khoảng giá
    filterHTML += `
        <div class="filter-group">
            <h4>Khoảng giá (VND)</h4>
            <div class="price-range">
                <input type="number" id="min-price" placeholder="Từ" min="0" value="${currentFilters.minPrice}">
                <span>-</span>
                <input type="number" id="max-price" placeholder="Đến" min="0" value="${currentFilters.maxPrice}">
            </div>
        </div>
    `;
    
    filterSection.innerHTML = filterHTML;
}

function renderProductList(products) {
    const productGrid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!productGrid) return;

    // Hiển thị empty state nếu không có sản phẩm
    if (products.length === 0) {
        productGrid.style.display = 'none';
        emptyState.style.display = 'block';
        renderPagination(0);
        updateResultsCount(0);
        return;
    }

    // Ẩn empty state và hiển thị grid
    emptyState.style.display = 'none';
    productGrid.style.display = 'grid';

    // Phân trang
    const totalItems = products.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    let productHTML = '';
    paginatedProducts.forEach(product => {
        const priceInfo = getProductPriceInfo(product);
        
        productHTML += `
            <div class="product-card fade-in">
                ${getProductBadgeHTML(product)}
                <img src="../${product.image}" alt="${product.name}" onerror="this.src='../images/placeholder-product.jpg'">
                <h3>${product.name}</h3>
                <p class="multiline-ellipsis">${product.description || 'Không có mô tả'}</p>
                <div class="price">
                    <span class="current-price">${priceInfo.current}</span>
                    ${priceInfo.original ? `<span class="old-price">${priceInfo.original}</span>` : ''}
                </div>
                <a href="../product-detail/product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
            </div>
        `;
    });
    
    productGrid.innerHTML = productHTML;
    renderPagination(totalItems);
    updateResultsCount(totalItems);
}

function getProductPriceInfo(product) {
    let currentPrice = 'Liên hệ';
    let originalPrice = '';
    
    if (product.units && product.units.length > 0) {
        const validPrices = product.units.map(unit => unit.price).filter(price => !isNaN(price));
        if (validPrices.length > 0) {
            const minPrice = Math.min(...validPrices);
            currentPrice = formatCurrency(minPrice);
            
            // Giả sử có trường discount hoặc originalPrice
            if (product.originalPrice && product.originalPrice > minPrice) {
                originalPrice = formatCurrency(product.originalPrice);
            }
        }
    }
    
    return {
        current: currentPrice,
        original: originalPrice
    };
}

function getProductBadgeHTML(product) {
    if (product.discount && product.discount > 0) {
        return `<div class="product-badge sale">-${product.discount}%</div>`;
    } else if (product.isBestSeller) {
        return `<div class="product-badge bestseller">Bán chạy</div>`;
    }
    return '';
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
        <button id="prev-page" class="pagination-prev" ${currentPage === 1 ? 'disabled' : ''}>
            ‹ Trước
        </button>
    `;
    
    // Các số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Hiển thị trang đầu nếu cần
    if (startPage > 1) {
        paginationHTML += `<button data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Hiển thị các trang
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button data-page="${i}" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // Hiển thị trang cuối nếu cần
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Nút Next
    paginationHTML += `
        <button id="next-page" class="pagination-next" ${currentPage === totalPages ? 'disabled' : ''}>
            Sau ›
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Gắn sự kiện phân trang
    setupPaginationEvents();
}

function setupPaginationEvents() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    // Các nút số trang
    paginationContainer.querySelectorAll('button[data-page]').forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) {
                showLoading();
                currentPage = page;
                renderProductList(filteredProducts);
                hideLoading();
                // Scroll to top of product grid
                document.getElementById('product-grid').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });

    // Nút Previous
    document.getElementById('prev-page')?.addEventListener('click', function() {
        if (currentPage > 1) {
            showLoading();
            currentPage--;
            renderProductList(filteredProducts);
            hideLoading();
            document.getElementById('product-grid').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });

    // Nút Next
    document.getElementById('next-page')?.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            showLoading();
            currentPage++;
            renderProductList(filteredProducts);
            hideLoading();
            document.getElementById('product-grid').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
}

// --- FILTERING & SORTING ---
function collectFilters() {
    currentFilters.categories = [];
    currentFilters.types = [];
    
    // Lấy giá
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    currentFilters.minPrice = minPriceInput ? minPriceInput.value.trim() : '';
    currentFilters.maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
    
    // Lấy danh mục
    document.querySelectorAll('input[data-type="category"]:checked').forEach(checkbox => {
        currentFilters.categories.push(checkbox.value);
    });
    
    // Lấy loại thuốc
    document.querySelectorAll('input[data-type="type"]:checked').forEach(checkbox => {
        currentFilters.types.push(checkbox.value);
    });
}

function clearFilters() {
    // Bỏ chọn checkbox
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Xóa giá
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Reset filters (giữ lại search)
    currentFilters = {
        categories: [],
        types: [],
        minPrice: '',
        maxPrice: ''
    };
}

function clearSearch() {
    currentSearchQuery = '';
    hideSearchResultInfo();
    updateUrl();
}

function clearAllFilters() {
    clearFilters();
    clearSearch();
}

function resetAll() {
    clearAllFilters();
    currentSort = 'default';
    
    // Reset select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    currentPage = 1;
}

function updateFilterCheckboxes() {
    // Cập nhật trạng thái checkbox từ currentFilters
    currentFilters.categories.forEach(category => {
        const checkbox = document.querySelector(`input[data-type="category"][value="${category}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    currentFilters.types.forEach(type => {
        const checkbox = document.querySelector(`input[data-type="type"][value="${type}"]`);
        if (checkbox) checkbox.checked = true;
    });
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
    
    let result = [...products];
    
    // QUAN TRỌNG: Áp dụng filter trước, search sau
    // 1. Lọc theo danh mục
    if (currentFilters.categories.length > 0) {
        result = result.filter(p => currentFilters.categories.includes(p.category));
    }
    
    // 2. Lọc theo loại thuốc
    if (currentFilters.types.length > 0) {
        result = result.filter(p => currentFilters.types.includes(p.type));
    }
    
    // 3. Lọc theo khoảng giá
    const minPrice = parseFloat(currentFilters.minPrice);
    const maxPrice = parseFloat(currentFilters.maxPrice);
    
    if (!isNaN(minPrice)) {
        result = result.filter(p => {
            const productMinPrice = getProductMinPrice(p);
            return productMinPrice >= minPrice;
        });
    }
    
    if (!isNaN(maxPrice)) {
        result = result.filter(p => {
            const productMinPrice = getProductMinPrice(p);
            return productMinPrice <= maxPrice;
        });
    }
    
    // 4. Cuối cùng: Lọc theo từ khóa tìm kiếm (chỉ trong phạm vi đã lọc)
    if (currentSearchQuery) {
        const searchLower = currentSearchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.category && p.category.toLowerCase().includes(searchLower)) ||
            (p.ingredients && p.ingredients.toLowerCase().includes(searchLower))
        );
    }
    
    return result;
}

function applySorting(products) {
    const sortedProducts = [...products];
    
    switch(currentSort) {
        case 'name-asc':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        case 'name-desc':
            return sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        case 'price-asc':
            return sortedProducts.sort((a, b) => {
                const priceA = getProductMinPrice(a);
                const priceB = getProductMinPrice(b);
                return priceA - priceB;
            });
        case 'price-desc':
            return sortedProducts.sort((a, b) => {
                const priceA = getProductMinPrice(a);
                const priceB = getProductMinPrice(b);
                return priceB - priceA;
            });
        default:
            return sortedProducts;
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
    
    filteredProducts = applyFilters(products);
    filteredProducts = applySorting(filteredProducts);
    
    updatePageTitle();
    renderProductList(filteredProducts);
    renderActiveFilters();
    updateUrl();
    
    setTimeout(hideLoading, 300);
}

// --- HELPER FUNCTIONS ---
function getProductMinPrice(product) {
    if (product.units && product.units.length > 0) {
        const prices = product.units.map(u => u.price).filter(price => !isNaN(price));
        if (prices.length > 0) {
            return Math.min(...prices);
        }
    }
    return Infinity;
}

function updatePageTitle() {
    const pageTitleElement = document.getElementById('page-title');
    const pageSubtitleElement = document.getElementById('page-subtitle');
    
    if (!pageTitleElement || !pageSubtitleElement) return;
    
    if (currentSearchQuery) {
        pageTitleElement.textContent = 'Kết quả tìm kiếm';
        pageSubtitleElement.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm cho "${currentSearchQuery}"`;
    } else if (currentFilters.categories.length > 0) {
        const categoryName = currentFilters.categories.join(", ");
        pageTitleElement.textContent = `Danh mục: ${categoryName}`;
        pageSubtitleElement.textContent = `${filteredProducts.length} sản phẩm thuộc danh mục ${categoryName}`;
    } else if (currentFilters.types.length > 0) {
        const typeNames = {
            'kedon': 'Thuốc kê đơn',
            'khongkedon': 'Thuốc không kê đơn'
        };
        const typeName = currentFilters.types.map(type => typeNames[type] || type).join(', ');
        pageTitleElement.textContent = `Loại sản phẩm: ${typeName}`;
        pageSubtitleElement.textContent = `${filteredProducts.length} sản phẩm thuộc loại ${typeName}`;
    } else {
        pageTitleElement.textContent = 'Danh sách sản phẩm';
        pageSubtitleElement.textContent = `Tất cả sản phẩm (${filteredProducts.length} sản phẩm)`;
    }
}

function renderActiveFilters() {
    const activeFiltersContainer = document.getElementById('active-filters');
    const filterTagsContainer = document.getElementById('filter-tags');
    
    if (!activeFiltersContainer || !filterTagsContainer) return;
    
    const activeFilters = [];
    
    // Danh mục
    if (currentFilters.categories.length > 0) {
        currentFilters.categories.forEach(cat => {
            activeFilters.push({ 
                type: 'category', 
                value: cat, 
                label: `Danh mục: ${cat}` 
            });
        });
    }
    
    // Loại thuốc
    if (currentFilters.types.length > 0) {
        const typeLabels = {
            'kedon': 'Thuốc kê đơn',
            'khongkedon': 'Thuốc không kê đơn'
        };
        currentFilters.types.forEach(type => {
            activeFilters.push({ 
                type: 'type', 
                value: type, 
                label: `Loại: ${typeLabels[type] || type}` 
            });
        });
    }
    
    // Khoảng giá
    if (currentFilters.minPrice || currentFilters.maxPrice) {
        let priceLabel = 'Giá: ';
        if (currentFilters.minPrice && currentFilters.maxPrice) {
            priceLabel += `Từ ${formatCurrency(parseFloat(currentFilters.minPrice))} đến ${formatCurrency(parseFloat(currentFilters.maxPrice))}`;
        } else if (currentFilters.minPrice) {
            priceLabel += `Từ ${formatCurrency(parseFloat(currentFilters.minPrice))}`;
        } else if (currentFilters.maxPrice) {
            priceLabel += `Đến ${formatCurrency(parseFloat(currentFilters.maxPrice))}`;
        }
        activeFilters.push({ 
            type: 'price', 
            value: 'price', 
            label: priceLabel 
        });
    }
    
    // Tìm kiếm
    if (currentSearchQuery) {
        activeFilters.push({ 
            type: 'search', 
            value: currentSearchQuery, 
            label: `Tìm kiếm: "${currentSearchQuery}"` 
        });
    }
    
    if (activeFilters.length > 0) {
        activeFiltersContainer.style.display = 'block';
        filterTagsContainer.innerHTML = activeFilters.map(filter => `
            <span class="filter-tag">
                ${filter.label}
                <span class="remove" onclick="removeFilter('${filter.type}', '${filter.value}')">×</span>
            </span>
        `).join('');
    } else {
        activeFiltersContainer.style.display = 'none';
    }
}

function removeFilter(type, value) {
    showLoading();
    
    switch(type) {
        case 'category':
            currentFilters.categories = currentFilters.categories.filter(cat => cat !== value);
            const categoryCheckbox = document.querySelector(`input[data-type="category"][value="${value}"]`);
            if (categoryCheckbox) categoryCheckbox.checked = false;
            break;
        case 'type':
            currentFilters.types = currentFilters.types.filter(t => t !== value);
            const typeCheckbox = document.querySelector(`input[data-type="type"][value="${value}"]`);
            if (typeCheckbox) typeCheckbox.checked = false;
            break;
        case 'price':
            currentFilters.minPrice = '';
            currentFilters.maxPrice = '';
            const minPriceInput = document.getElementById('min-price');
            const maxPriceInput = document.getElementById('max-price');
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            break;
        case 'search':
            currentSearchQuery = '';
            hideSearchResultInfo();
            break;
    }
    
    currentPage = 1;
    applyFiltersAndSort();
}

function updateUrl() {
    const url = new URL(window.location);
    const params = new URLSearchParams();
    
    // Thêm search parameter
    if (currentSearchQuery) {
        params.set('search', encodeURIComponent(currentSearchQuery));
    }
    
    // Thêm category parameter (chỉ lấy category đầu tiên để đơn giản)
    if (currentFilters.categories.length > 0) {
        params.set('category', encodeURIComponent(currentFilters.categories[0]));
    }
    
    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
}

function showSearchResultInfo() {
    const searchResultInfo = document.getElementById('search-result-info');
    if (searchResultInfo) {
        document.getElementById('search-keyword').textContent = currentSearchQuery;
        searchResultInfo.style.display = 'flex';
    }
}

function hideSearchResultInfo() {
    const searchResultInfo = document.getElementById('search-result-info');
    if (searchResultInfo) {
        searchResultInfo.style.display = 'none';
    }
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = count.toLocaleString();
    }
}

function showLoading() {
    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    const productGrid = document.getElementById('product-grid');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    if (productGrid) {
        productGrid.style.opacity = '0.5';
    }
}

function hideLoading() {
    isLoading = false;
    const loadingIndicator = document.getElementById('loading-indicator');
    const productGrid = document.getElementById('product-grid');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (productGrid) {
        productGrid.style.opacity = '1';
    }
}

function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

// --- Hàm toàn cục để có thể gọi từ HTML ---
window.removeFilter = removeFilter;

// --- Hàm để gọi từ header search (nếu cần) ---
function handleSearchFromHeader(searchQuery) {
    showLoading();
    currentSearchQuery = searchQuery;
    showSearchResultInfo();
    currentPage = 1;
    applyFiltersAndSort();
}