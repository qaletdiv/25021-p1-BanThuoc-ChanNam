/**
 * Khởi tạo ứng dụng khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    loadHeader();
    loadFooter();

    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

/**
 * Xử lý sự kiện submit form đăng nhập
 */
function handleLoginSubmit(e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // 1. Lấy dữ liệu từ form
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const rememberMe = formData.get('remember-me') === 'on';

    // 2. Xóa tất cả lỗi trước đó
    clearAllErrors();

    // 3. Kiểm tra dữ liệu đầu vào
    const errors = validateLoginData(email, password);

    // 4. Nếu có lỗi, hiển thị lỗi tại vị trí tương ứng
    if (errors.length > 0) {
        showFieldErrors(errors);
        return;
    }

    // 5. Kiểm tra xác thực người dùng
    if (authenticateUser(email, password)) {
        // 6. Nếu xác thực thành công, cập nhật currentUser và chuyển hướng
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Cập nhật header sau khi đăng nhập
        loadHeader(); // Gọi lại hàm để cập nhật nội dung header
        // Chuyển hướng về trang trước đó hoặc trang chủ
        window.location.href = '../index.html'; // Chuyển hướng đến trang chủ
    } else {
        // 7. Nếu xác thực thất bại, hiển thị thông báo lỗi chung
        showGeneralError("Email hoặc mật khẩu không chính xác.");
    }
}

// --- Hàm xử lý lỗi ---

/**
 * Xóa tất cả thông báo lỗi
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

/**
 * Hiển thị lỗi cho từng trường cụ thể
 * @param {Array} errors - Mảng các chuỗi lỗi
 */
function showFieldErrors(errors) {
    errors.forEach(error => {
        if (error.includes('Email')) {
            showFieldError('email', error);
        } else if (error.includes('Mật khẩu')) {
            showFieldError('password', error);
        }
    });
}

/**
 * Hiển thị lỗi cho một trường cụ thể
 * @param {string} fieldName - Tên trường (email, password)
 * @param {string} message - Nội dung thông báo lỗi
 */
function showFieldError(fieldName, message) {
    const errorElementId = `error-${fieldName}`;
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Hiển thị lỗi chung
 * @param {string} message - Nội dung thông báo lỗi
 */
function showGeneralError(message) {
    const generalErrorDiv = document.createElement('div');
    generalErrorDiv.className = 'error-message';
    generalErrorDiv.textContent = message;
    generalErrorDiv.style.display = 'block';
    generalErrorDiv.style.color = '#dc2626';
    generalErrorDiv.style.backgroundColor = '#fee2e2';
    generalErrorDiv.style.padding = '10px';
    generalErrorDiv.style.borderRadius = '6px';
    generalErrorDiv.style.marginTop = '10px';

    const form = document.getElementById('login-form');
    form.insertBefore(generalErrorDiv, form.firstChild);
}

// --- Các hàm kiểm tra dữ liệu ---

function validateLoginData(email, password) {
    const errors = [];
    if (!email) {
        errors.push('Vui lòng nhập email.');
    } else if (!isValidEmail(email)) {
        errors.push('Email không hợp lệ.');
    }
    if (!password) {
        errors.push('Vui lòng nhập mật khẩu.');
    }
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// --- Hàm xác thực người dùng ---
function authenticateUser(email, password) {
    try {
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return false;
        const users = JSON.parse(usersJson);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return false;
        return user.password === password;
    } catch (e) {
        console.error("Lỗi khi xác thực người dùng:", e);
        return false;
    }
}

// --- Hàm hỗ trợ khác ---

/**
 * Chuyển đổi trạng thái hiện/ẩn mật khẩu
 */
function togglePasswordVisibility(e) {
    const inputWrapper = e.target.closest('.input-wrapper');
    const input = inputWrapper ? inputWrapper.querySelector('input[type="password"], input[type="text"]') : null;
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            e.target.textContent = '🙈';
        } else {
            input.type = 'password';
            e.target.textContent = '👁️';
        }
    }
}