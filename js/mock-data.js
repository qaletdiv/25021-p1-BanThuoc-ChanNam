// js/mock-data.js

// Danh mục sản phẩm
const mockCategories = [
  { 
    id: 1, 
    name: "Thuốc cảm cúm & Sốt",
    description: "Các loại thuốc điều trị cảm cúm, sốt, đau đầu" 
  },
  { id: 2, 
    name: "Vitamin & Khoáng chất",
    description: "Bổ sung vitamin, khoáng chất thiết yếu"
  },
  { id: 3, 
    name: "Hỗ trợ tiêu hóa",
    description: "Thuốc hỗ trợ tiêu hóa, đau dạ dày"
  },
  { id: 4, 
    name: "Tim mạch",
    description: "Thuốc hỗ trợ tim mạch, huyết áp"
  },
  { id: 5, 
    name: "Thực phẩm chức năng",
    description: "Khám phá các sản phẩm trong danh mục này"
  }
];

// Sản phẩm mẫu
const mockProducts = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 50000,
    category: "Thuốc cảm cúm & Sốt",
    categoryId: 1,
    image: "images/products/med001.jpg",
    manufacturer: "Công ty Dược phẩm ABC",
    ingredients: "Paracetamol 500mg",
    usage: "Giảm đau, hạ sốt.",
    description: "Thuốc giảm đau, hạ sốt hiệu quả. Mỗi viên nén chứa 500mg Paracetamol.",
    type: "khongkedon",
    units: [
      { name: "Vỉ 10 viên", price: 50000 },
      { name: "Hộp 10 vỉ", price: 480000 }
    ]
  },
  {
    id: 2,
    name: "Vitamin C 1000mg",
    price: 120000,
    category: "Vitamin & Khoáng chất",
    categoryId: 2,
    image: "images/products/med002.jpg",
    manufacturer: "Công ty TNHH Dinh Dưỡng XYZ",
    ingredients: "Vitamin C (L-Ascorbic Acid) 1000mg",
    usage: "Tăng cường sức đề kháng, chống oxy hóa, hỗ trợ làm đẹp da.",
    description: "Tăng cường sức đề kháng, chống oxy hóa, hỗ trợ làm đẹp da.",
    type: "khongkedon",
    units: [
      { name: "Chai 30 viên", price: 120000 },
      { name: "Hộp 60 viên", price: 230000 }
    ]
  },
  {
    id: 3,
    name: "Men vi sinh Đại Bắc (Probiotics)",
    price: 85000,
    category: "Hỗ trợ tiêu hóa",
    categoryId: 3,
    image: "images/products/med003.jpg",
    manufacturer: "Công ty Cổ phần Dược phẩm Đại Bắc",
    ingredients: "Lactobacillus acidophilus, Bifidobacterium bifidum, Enterococcus faecium, Bacillus subtilis.",
    usage: "Hỗ trợ tiêu hóa, cải thiện hệ vi sinh đường ruột, giảm đầy bụng khó tiêu.",
    description: "Hỗ trợ tiêu hóa, cải thiện hệ vi sinh đường ruột, giảm đầy bụng khó tiêu.",
    type: "khongkedon",
    units: [
      { name: "Hộp 10 gói", price: 85000 },
      { name: "Hộp 30 gói", price: 240000 }
    ]
  },
  {
    id: 4,
    name: "Thuốc nhỏ mắt Tobrex",
    price: 65000,
    category: "Chăm sóc cá nhân",
    categoryId: 4, 
    image: "images/products/med004.jfif",
    manufacturer: "GlaxoSmithKline",
    ingredients: "Tobramycin 0.3% (3mg/g)",
    usage: "Điều trị các bệnh về mắt do vi khuẩn gây ra như viêm kết mạc, loét giác mạc.",
    description: "Điều trị các bệnh về mắt do vi khuẩn gây ra như viêm kết mạc, loét giác mạc.",
    type: "kedon",
    units: [
      { name: "Ống 5ml", price: 65000 }
    ]
  },
  {
    id: 5,
    name: "Omega 3 Total",
    price: 350000,
    category: "Thực phẩm chức năng",
    categoryId: 5,
    image: "images/products/med005.jfif",
    manufacturer: "Công ty TNHH Một Thành Viên Dược Phẩm Omega",
    ingredients: "Omega-3 (EPA và DHA) từ dầu cá.",
    usage: "Hỗ trợ tim mạch, não bộ và thị lực. Giàu EPA và DHA.",
    description: "Hỗ trợ tim mạch, não bộ và thị lực. Giàu EPA và DHA.",
    type: "khongkedon",
    units: [
      { name: "Chai 30 viên", price: 350000 },
      { name: "Hộp 90 viên", price: 990000 }
    ]
  },
  {
    id: 6,
    name: "Thuốc ho Bảo Thanh",
    price: 75000,
    category: "Thuốc cảm cúm & Sốt",
    categoryId: 1,
    image: "images/products/med006.jfif",
    manufacturer: "Công ty Cổ phần Dược phẩm Yên Bái",
    ingredients: "Vỏ rễ cây rẻ quạt, lá thường sơn, lá tía tô, gừng, đường phèn, chất bảo quản (E211).",
    usage: "Giúp long đờm, giảm ho, thanh nhiệt, giải độc.",
    description: "Giúp long đờm, giảm ho, thanh nhiệt, giải độc.",
    type: "khongkedon",
    units: [
      { name: "Chai 100ml", price: 75000 },
      { name: "Hộp 2 chai", price: 140000 }
    ]
  },
  {
    id: 7,
    name: "Paracetamol 500mg",
    price: 50000,
    category: "Thuốc cảm cúm & Sốt",
    categoryId: 1,
    image: "images/products/med001.jpg",
    manufacturer: "Công ty Dược phẩm ABC",
    ingredients: "Paracetamol 500mg",
    usage: "Giảm đau, hạ sốt.",
    description: "Thuốc giảm đau, hạ sốt hiệu quả. Mỗi viên nén chứa 500mg Paracetamol.",
    type: "khongkedon",
    units: [
      { name: "Vỉ 10 viên", price: 50000 },
      { name: "Hộp 10 vỉ", price: 480000 }
    ]
  },
  {
    id: 8,
    name: "Vitamin C 1000mg",
    price: 120000,
    category: "Vitamin & Khoáng chất",
    categoryId: 2,
    image: "images/products/med002.jpg",
    manufacturer: "Công ty TNHH Dinh Dưỡng XYZ",
    ingredients: "Vitamin C (L-Ascorbic Acid) 1000mg",
    usage: "Tăng cường sức đề kháng, chống oxy hóa, hỗ trợ làm đẹp da.",
    description: "Tăng cường sức đề kháng, chống oxy hóa, hỗ trợ làm đẹp da.",
    type: "khongkedon",
    units: [
      { name: "Chai 30 viên", price: 120000 },
      { name: "Hộp 60 viên", price: 230000 }
    ]
  },
  {
    id: 9,
    name: "Men vi sinh Đại Bắc (Probiotics) (Lặp lại)",
    price: 85000,
    category: "Hỗ trợ tiêu hóa",
    categoryId: 3,
    image: "images/products/med003.jpg",
    manufacturer: "Công ty Cổ phần Dược phẩm Đại Bắc",
    ingredients: "Lactobacillus acidophilus, Bifidobacterium bifidum, Enterococcus faecium, Bacillus subtilis.",
    usage: "Hỗ trợ tiêu hóa, cải thiện hệ vi sinh đường ruột, giảm đầy bụng khó tiêu.",
    description: "Hỗ trợ tiêu hóa, cải thiện hệ vi sinh đường ruột, giảm đầy bụng khó tiêu.",
    type: "khongkedon",
    units: [
      { name: "Hộp 10 gói", price: 85000 },
      { name: "Hộp 30 gói", price: 240000 }
    ]
  },
  {
    id: 10,
    name: "Thuốc nhỏ mắt Tobrex (Lặp lại)",
    price: 65000,
    category: "Chăm sóc cá nhân",
    categoryId: 4,
    image: "images/products/med004.jfif",
    manufacturer: "GlaxoSmithKline",
    ingredients: "Tobramycin 0.3% (3mg/g)",
    usage: "Điều trị các bệnh về mắt do vi khuẩn gây ra như viêm kết mạc, loét giác mạc.",
    description: "Điều trị các bệnh về mắt do vi khuẩn gây ra như viêm kết mạc, loét giác mạc.",
    type: "kedon",
    units: [
      { name: "Ống 5ml", price: 65000 }
    ]
  },
  {
    id: 11,
    name: "Omega 3 Total",
    price: 350000,
    category: "Thực phẩm chức năng",
    categoryId: 5,
    image: "images/products/med005.jfif",
    manufacturer: "Công ty TNHH Một Thành Viên Dược Phẩm Omega",
    ingredients: "Omega-3 (EPA và DHA) từ dầu cá.",
    usage: "Hỗ trợ tim mạch, não bộ và thị lực. Giàu EPA và DHA.",
    description: "Hỗ trợ tim mạch, não bộ và thị lực. Giàu EPA và DHA.",
    type: "khongkedon",
    units: [
      { name: "Chai 30 viên", price: 350000 },
      { name: "Hộp 90 viên", price: 990000 }
    ]
  },
  {
    id: 12,
    name: "Thuốc ho Bảo Thanh",
    price: 75000,
    category: "Thuốc cảm cúm & Sốt",
    categoryId: 1,
    image: "images/products/med006.jfif",
    manufacturer: "Công ty Cổ phần Dược phẩm Yên Bái",
    ingredients: "Vỏ rễ cây rẻ quạt, lá thường sơn, lá tía tô, gừng, đường phèn, chất bảo quản (E211).",
    usage: "Giúp long đờm, giảm ho, thanh nhiệt, giải độc.",
    description: "Giúp long đờm, giảm ho, thanh nhiệt, giải độc.",
    type: "khongkedon",
    units: [
      { name: "Chai 100ml", price: 75000 },
      { name: "Hộp 2 chai", price: 140000 }
    ]
  }
];

// Người dùng mẫu
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    password: "123456", // Trong thực tế nên hash mật khẩu
    role: "user" // hoặc "admin"
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    phone: "0912345678",
    password: "123456",
    role: "user"
  }
];

// Địa chỉ mẫu cho người dùng
const mockAddresses = [
  {
    id: 1,
    userId: 1,
    receiver: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Đường ABC, Quận 1, TP. HCM"
  },
  {
    id: 2,
    userId: 2,
    receiver: "Trần Thị B",
    phone: "0912345678",
    address: "456 Đường XYZ, Quận 2, TP. HCM"
  }
];

// Đơn hàng mẫu
const mockOrders = [
  {
    id: "DH001",
    userId: 1,
    items: [
      { productId: 1, unit: "Vỉ 10 viên", quantity: 2, price: 50000 },
      { productId: 2, unit: "Chai 30 viên", quantity: 1, price: 120000 }
    ],
    totalAmount: 220000,
    shippingAddress: "123 Đường ABC, Quận 1, TP. HCM",
    paymentMethod: "cod", // hoặc "bank_transfer"
    status: "Đang giao hàng", // "Chờ xác nhận", "Đang giao hàng", "Đã giao", "Đã hủy"
    orderDate: "2024-05-20"
  }
];

// Xuất các biến để có thể sử dụng trong các file js khác
// (Không cần dùng `var`, `let`, `const` khi export trong file script thường, nhưng để rõ ràng)
window.MOCK_CATEGORIES = mockCategories;
window.MOCK_PRODUCTS = mockProducts;
window.MOCK_USERS = mockUsers;
window.MOCK_ADDRESSES = mockAddresses;
window.MOCK_ORDERS = mockOrders;
