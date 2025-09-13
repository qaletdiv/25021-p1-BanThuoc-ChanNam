// login/login.js

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

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
});

/**
 * Xử lý sự kiện submit form đăng ký
 */
function handleRegisterSubmit(e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // 1. Lấy dữ liệu từ form
    const formData = new FormData(e.target);
    const fullname = formData.get('fullname').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    const termsAccepted = formData.get('terms') === 'on';

    // 2. Xóa tất cả lỗi trước đó
    clearAllErrors();

    // 3. Kiểm tra dữ liệu đầu vào
    const errors = validateRegistrationData(fullname, email, phone, password, confirmPassword, termsAccepted);

    // 4. Nếu có lỗi, hiển thị lỗi tại vị trí tương ứng
    if (errors.length > 0) {
        console.log("Validation errors found:", errors); // Dòng debug 8
        // --- SỬA ĐỔI TẠI ĐÂY ---
        // Thay vì gọi showFieldErrors(errors), hãy gọi trực tiếp với từng lỗi
        // Nhưng cách tốt nhất là đảm bảo showFieldErrors hoạt động đúng
        showFieldErrors(errors); // Gọi hàm này
        return; // Dừng lại nếu có lỗi
    }

    // 5. Kiểm tra trùng lặp email/số điện thoại (nếu cần)
    if (isEmailExists(email)) {
        showFieldError('email', 'Email này đã được đăng ký. Vui lòng dùng email khác.');
        return;
    }

    if (isPhoneExists(phone)) {
        showFieldError('phone', 'Số điện thoại này đã được đăng ký. Vui lòng dùng số khác.');
        return;
    }

    // 6. Nếu không có lỗi, thực hiện đăng ký
    registerUser(fullname, email, phone, password);
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
        // Chuyển đổi chuỗi lỗi thành chữ thường để so sánh
        const lowerCaseError = error.toLowerCase();
        // Duyệt qua từng lỗi và hiển thị nó ở vị trí tương ứng
        if (lowerCaseError.includes('họ và tên')) {
            showFieldError('fullname', error);
        } else if (lowerCaseError.includes('email')) {
            showFieldError('email', error);
        } else if (lowerCaseError.includes('số điện thoại')) {
            showFieldError('phone', error);
        } else if (lowerCaseError.includes('mật khẩu')) {
             if (lowerCaseError.includes('nhập lại')) {
                 showFieldError('confirm-password', error);
             } else {
                 showFieldError('password', error);
             }
        } else if (lowerCaseError.includes('đồng ý')) {
            showFieldError('terms', error);
        }
        // Thêm các trường hợp khác nếu cần
    });
}

/**
 * Hiển thị lỗi cho một trường cụ thể
 * @param {string} fieldName - Tên trường (fullname, email, phone, password, confirm-password, terms)
 * @param {string} message - Nội dung thông báo lỗi
 */
function showFieldError(fieldName, message) {
    const errorElementId = `error-${fieldName}`; // Tạo ID dựa trên tên trường
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// --- Các hàm kiểm tra dữ liệu (giữ nguyên hoặc cập nhật nếu cần) ---

function validateRegistrationData(fullname, email, phone, password, confirmPassword, termsAccepted) {
    const errors = [];

    if (!fullname) {
        // errors.push('Vui lòng nhập họ và tên.'); // Có thể thay bằng chuỗi dễ nhận diện hơn
         errors.push('Họ và tên không được để trống.');
    } else if (fullname.length < 2) {
        errors.push('Họ và tên phải có ít nhất 2 ký tự.');
    }

    if (!email) {
        errors.push('Email không được để trống.');
    } else if (!isValidEmail(email)) {
        errors.push('Email không hợp lệ.');
    }

    if (!phone) {
        errors.push('Số điện thoại không được để trống.');
    } else if (!isValidPhone(phone)) {
        errors.push('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.');
    }

    if (!password) {
        errors.push('Mật khẩu không được để trống.');
    } else if (password.length < 6) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    if (!confirmPassword) {
        errors.push('Vui lòng nhập lại mật khẩu.');
    } else if (password !== confirmPassword) {
        errors.push('Mật khẩu và nhập lại mật khẩu không khớp.');
    }

    if (!termsAccepted) {
        errors.push('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
    }

    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function isEmailExists(email) {
    try {
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return false;
        const users = JSON.parse(usersJson);
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    } catch (e) {
        console.error("Lỗi khi kiểm tra email:", e);
        return false;
    }
}

function isPhoneExists(phone) {
    try {
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return false;
        const users = JSON.parse(usersJson);
        const cleanedPhone = phone.replace(/\D/g, '');
        return users.some(user => user.phone.replace(/\D/g, '') === cleanedPhone);
    } catch (e) {
        console.error("Lỗi khi kiểm tra số điện thoại:", e);
        return false;
    }
}

// --- Hàm đăng ký và các hàm hỗ trợ khác (giữ nguyên) ---

function registerUser(fullname, email, phone, password) {
    try {
        const newUser = {
            id: Date.now(),
            name: fullname,
            email: email,
            phone: phone,
            password: password,
            role: 'customer',
            createdAt: new Date().toISOString()
        };

        let users = [];
        try {
            const usersJson = localStorage.getItem('users');
            if (usersJson) {
                users = JSON.parse(usersJson);
            }
        } catch (e) {
            console.error("Lỗi khi lấy danh sách người dùng:", e);
        }

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showSuccessMessage('Đăng ký thành công!');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 2000);

    } catch (e) {
        console.error("Lỗi khi đăng ký:", e);
        // Hiển thị lỗi chung nếu có lỗi không mong đợi
        const generalErrorDiv = document.createElement('div'); // Tạo div lỗi tạm thời nếu cần
        generalErrorDiv.className = 'error-message';
        generalErrorDiv.textContent = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
        generalErrorDiv.style.display = 'block';
        generalErrorDiv.style.color = '#dc2626';
        generalErrorDiv.style.backgroundColor = '#fee2e2';
        generalErrorDiv.style.padding = '10px';
        generalErrorDiv.style.borderRadius = '6px';
        generalErrorDiv.style.marginTop = '10px';
        document.querySelector('.login-form').prepend(generalErrorDiv); // Thêm vào đầu form
    }
}

function showSuccessMessage(message) {
     // Xóa lỗi cũ nếu có
     clearAllErrors();
     // Tìm hoặc tạo div thông báo thành công
     let successContainer = document.getElementById('register-success-message');
     if (!successContainer) {
         successContainer = document.createElement('div');
         successContainer.id = 'register-success-message';
         successContainer.className = 'error-message'; // Có thể tạo class riêng cho success
         successContainer.style.backgroundColor = '#dcfce7'; // Màu xanh nhạt cho thành công
         successContainer.style.color = '#10b981'; // Màu xanh đậm cho chữ
         // Thêm vào đầu form hoặc vị trí mong muốn
         const form = document.getElementById('register-form');
         form.insertBefore(successContainer, form.firstChild);
     }
     successContainer.textContent = message;
     successContainer.style.display = 'block';

     // Tự động ẩn sau 3 giây
     setTimeout(() => {
         if(successContainer) {
             successContainer.style.display = 'none';
         }
     }, 3000);
}

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