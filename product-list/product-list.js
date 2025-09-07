// Biến toàn cục cho trạng thái hiện tại
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

// Chờ DOM load xong
document.addEventListener('DOMContentLoaded', function () {
    initializeProductList();
});

function initializeProductList() {
    loadData(); // Đảm bảo dữ liệu đã được load
    loadHeader();
    loadFooter();
    renderFilters();
    setupEventListeners();
    applyFiltersAndSort(); // Load lần đầu với tất cả sản phẩm
}

function setupEventListeners() {
    // Áp dụng bộ lọc
    document.getElementById('apply-filters').addEventListener('click', function() {
        collectFilters();
        currentPage = 1; // Reset về trang đầu
        applyFiltersAndSort();
    });

    // Xóa bộ lọc
    document.getElementById('clear-filters').addEventListener('click', function() {
        clearFilters();
    });

    // Sắp xếp
    document.getElementById('sort-select').addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 1; // Reset về trang đầu
        applyFiltersAndSort();
    });
}

// --- RENDERING ---

function renderFilters() {
    const filterSection = document.getElementById('filter-section');
    const categories = JSON.parse(localStorage.getItem('categories'));
    
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

    // Lọc theo loại thuốc
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
        const price = product.units[0].price; // Lấy giá từ đơn vị đầu tiên
        productHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <span class="price">${formatCurrency(price)}</span>
                <a href="product-detail.html?id=${product.id}" class="btn btn-primary">Xem chi tiết</a>
            </div>
        `;
    });

    productGrid.innerHTML = productHTML;
    renderPagination(totalItems);
}

function renderPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination');
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
            if (page !== currentPage) {
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
    currentFilters.minPrice = document.getElementById('min-price').value;
    currentFilters.maxPrice = document.getElementById('max-price').value;

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
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';

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
        products = JSON.parse(localStorage.getItem('products'));
    }

    let result = [...products]; // Sao chép mảng để không làm thay đổi dữ liệu gốc

    // Lọc theo danh mục
    if (currentFilters.categories.length > 0) {
        result = result.filter(p => currentFilters.categories.includes(p.category));
    }

    // Lọc theo loại thuốc
    if (currentFilters.types.length > 0) {
        result = result.filter(p => currentFilters.types.includes(p.type));
    }

    // Lọc theo khoảng giá
    const minPrice = parseFloat(currentFilters.minPrice);
    const maxPrice = parseFloat(currentFilters.maxPrice);
    
    if (!isNaN(minPrice)) {
        result = result.filter(p => {
            const price = p.units[0].price; // Lấy giá từ đơn vị đầu tiên
            return price >= minPrice;
        });
    }
    
    if (!isNaN(maxPrice)) {
        result = result.filter(p => {
            const price = p.units[0].price; // Lấy giá từ đơn vị đầu tiên
            return price <= maxPrice;
        });
    }

    return result;
}

function applySorting(products) {
    switch(currentSort) {
        case 'name-asc':
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return products.sort((a, b) => b.name.localeCompare(a.name));
        case 'price-asc':
            return products.sort((a, b) => a.units[0].price - b.units[0].price);
        case 'price-desc':
            return products.sort((a, b) => b.units[0].price - a.units[0].price);
        default:
            return products; // Mặc định không sắp xếp
    }
}

function applyFiltersAndSort() {
    let products = JSON.parse(localStorage.getItem('products'));
    
    // Áp dụng bộ lọc
    filteredProducts = applyFilters(products);
    
    // Áp dụng sắp xếp
    filteredProducts = applySorting(filteredProducts);
    
    // Render kết quả
    renderProductList(filteredProducts);
}

// Hàm tiện ích: Định dạng tiền tệ (copy từ main.js nếu chưa có)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}