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
    images: [
      "images/products/med001-1.jpg",
      "images/products/med001-2.jfif",
      "images/products/med001-3.jfif",
      "images/products/med001-4.jfif",
      "images/products/med001-5.jfif"
    ],
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
    category: "Vitamin & Khoáng chất",
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
    "id": 7,
    "name": "Panadol Extra",
    "price": 65000,
    "category": "Thuốc cảm cúm & Sốt",
    "categoryId": 1,
    "image": "images/products/med007.jpg",
    "manufacturer": "GlaxoSmithKline",
    "ingredients": "Paracetamol 500mg, Caffeine 65mg",
    "usage": "Giảm đau đầu, đau cơ, hạ sốt.",
    "description": "Thuốc giảm đau, hạ sốt với công thức kết hợp Paracetamol và Caffeine.",
    "type": "khongkedon",
    "units": [
      { "name": "Vỉ 10 viên", "price": 65000 },
      { "name": "Hộp 5 vỉ", "price": 300000 }
    ]
  },
  {
    "id": 8,
    "name": "Vitamin D3 2000IU",
    "price": 95000,
    "category": "Vitamin & Khoáng chất",
    "categoryId": 2,
    "image": "images/products/med008.jpg",
    "manufacturer": "Nature's Bounty",
    "ingredients": "Vitamin D3 2000IU",
    "usage": "Bổ sung Vitamin D3, hỗ trợ hấp thu canxi, tốt cho xương.",
    "description": "Viên nang mềm bổ sung Vitamin D3 hàm lượng cao cho người thiếu vitamin D.",
    "type": "khongkedon",
    "units": [
      { "name": "Lọ 60 viên", "price": 95000 },
      { "name": "Lọ 120 viên", "price": 170000 }
    ]
  },
  {
    "id": 9,
    "name": "Smecta",
    "price": 45000,
    "category": "Hỗ trợ tiêu hóa",
    "categoryId": 3,
    "image": "images/products/med009.jpg",
    "manufacturer": "Ipsen Pharma",
    "ingredients": "Diosmectite 3g",
    "usage": "Điều trị tiêu chảy cấp và mãn tính.",
    "description": "Thuốc điều trị tiêu chảy, giúp bảo vệ niêm mạc đường tiêu hóa.",
    "type": "khongkedon",
    "units": [
      { "name": "Gói 3g x 12 gói", "price": 45000 },
      { "name": "Gói 3g x 30 gói", "price": 100000 }
    ]
  },
  {
    "id": 10,
    "name": "Coversyl 5mg",
    "price": 85000,
    "category": "Tim mạch",
    "categoryId": 4,
    "image": "images/products/med010.jpg",
    "manufacturer": "Servier",
    "ingredients": "Perindopril 5mg",
    "usage": "Điều trị tăng huyết áp, suy tim.",
    "description": "Thuốc ức chế men chuyển điều trị các bệnh lý tim mạch.",
    "type": "kedon",
    "units": [
      { "name": "Hộp 30 viên", "price": 85000 },
      { "name": "Hộp 90 viên", "price": 230000 }
    ]
  },
  {
    "id": 11,
    "name": "Glucosamine 1500mg",
    "price": 250000,
    "category": "Thực phẩm chức năng",
    "categoryId": 5,
    "image": "images/products/med011.png",
    "manufacturer": "Kirkland",
    "ingredients": "Glucosamine Sulfate 1500mg",
    "usage": "Hỗ trợ sức khỏe xương khớp, giảm thoái hóa khớp.",
    "description": "Bổ sung Glucosamine duy trì sụn khớp khỏe mạnh, giảm đau khớp.",
    "type": "khongkedon",
    "units": [
      { "name": "Lọ 120 viên", "price": 250000 },
      { "name": "Lọ 240 viên", "price": 450000 }
    ]
  },
  {
    "id": 12,
    "name": "Amoxicillin 500mg",
    "price": 75000,
    "category": "Thuốc cảm cúm & Sốt",
    "categoryId": 1,
    "image": "images/products/med012.jpg",
    "manufacturer": "Stada",
    "ingredients": "Amoxicillin 500mg",
    "usage": "Kháng sinh điều trị nhiễm khuẩn.",
    "description": "Kháng sinh phổ rộng điều trị các bệnh nhiễm khuẩn đường hô hấp.",
    "type": "kedon",
    "units": [
      { "name": "Hộp 12 viên", "price": 75000 },
      { "name": "Hộp 24 viên", "price": 140000 }
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
    id: "1",
    userId: 1,
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0901234567",
    fullAddress: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
    isDefault: true
  },
  {
    id: "2",
    userId: 1,
    recipientName: "Nguyễn Thị B",
    recipientPhone: "0912345678",
    fullAddress: "456 Đường DEF, Phường UVW, Quận 2, TP. HCM",
    isDefault: false
  },
  {
    id: "3",
    userId: 1,
    recipientName: "Công ty ABC",
    recipientPhone: "0283822888",
    fullAddress: "789 Đường GHI, Lầu 5, Phường KLM, Quận 3, TP. HCM",
    isDefault: false
  },
  {
    id: "4",
    userId: 2,
    recipientName: "Trần Thị B",
    recipientPhone: "0912345678",
    fullAddress: "456 Đường XYZ, Phường OPQ, Quận 2, TP. HCM",
    isDefault: true
  },
  {
    id: "5",
    userId: 2,
    recipientName: "Trần Văn C",
    recipientPhone: "0933445566",
    fullAddress: "321 Đường JKL, Phường RST, Quận 5, TP. HCM",
    isDefault: false
  },
  {
    id: "6",
    userId: 3,
    recipientName: "Lê Văn D",
    recipientPhone: "0977888999",
    fullAddress: "654 Đường MNO, Phường UVW, Quận 10, TP. HCM",
    isDefault: true
  }
];

// Đơn hàng mẫu
const mockOrders = [
  {
    id: "DH001",
    userId: 1,
    items: [
      { 
        productId: 1, 
        productName: "Panadol Extra",
        unit: "Vỉ 10 viên", 
        quantity: 2, 
        price: 50000,
        image: "images/products/med007.jpg"
      },
      { 
        productId: 2, 
        productName: "Vitamin C 1000mg",
        unit: "Chai 30 viên", 
        quantity: 1, 
        price: 120000,
        image: "images/products/med002.jpg"
      }
    ],
    subtotal: 220000,
    shippingCost: 15000,
    discount: 10000,
    totalPrice: 225000,
    recipientName: "Nguyễn Văn A",
    phone: "0912345678",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
    paymentMethod: "cod", // "cod" hoặc "bank_transfer"
    status: "shipping", // "pending", "processing", "shipping", "delivered", "cancelled"
    createdAt: "2024-05-20T10:30:00"
  },
  {
    id: "DH002",
    userId: 1,
    items: [
      { 
        productId: 3, 
        productName: "Bổ sung Canxi",
        unit: "Hộp 60 viên", 
        quantity: 1, 
        price: 180000,
        image: "images/products/med003.jpg"
      },
      { 
        productId: 4, 
        productName: "Omega-3",
        unit: "Lọ 100 viên", 
        quantity: 1, 
        price: 250000,
        image: "images/products/med004.jfif"
      }
    ],
    subtotal: 430000,
    shippingCost: 20000,
    discount: 0,
    totalPrice: 450000,
    recipientName: "Nguyễn Văn A",
    phone: "0912345678",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
    paymentMethod: "bank_transfer",
    status: "delivered",
    createdAt: "2024-05-15T14:20:00"
  },
  {
    id: "DH003",
    userId: 1,
    items: [
      { 
        productId: 5, 
        productName: "Thuốc ho Prospan",
        unit: "Chai 100ml", 
        quantity: 1, 
        price: 95000,
        image: "images/products/med005.jfif"
      }
    ],
    subtotal: 95000,
    shippingCost: 15000,
    discount: 5000,
    totalPrice: 105000,
    recipientName: "Nguyễn Thị B",
    phone: "0987654321",
    address: "456 Đường DEF, Phường UVW, Quận 2, TP. HCM",
    paymentMethod: "cod",
    status: "pending",
    createdAt: "2024-05-25T09:15:00"
  },
  {
    id: "DH004",
    userId: 1,
    items: [
      { 
        productId: 1, 
        productName: "Panadol Extra",
        unit: "Vỉ 10 viên", 
        quantity: 3, 
        price: 50000,
        image: "images/products/med007.jpg"
      }
    ],
    subtotal: 150000,
    shippingCost: 15000,
    discount: 0,
    totalPrice: 165000,
    recipientName: "Trần Văn C",
    phone: "0933445566",
    address: "789 Đường GHI, Phường KLM, Quận 3, TP. HCM",
    paymentMethod: "cod",
    status: "processing",
    createdAt: "2024-05-22T16:45:00"
  },
  {
    id: "DH005",
    userId: 1,
    items: [
      { 
        productId: 6, 
        productName: "Men tiêu hóa",
        unit: "Hộp 20 gói", 
        quantity: 2, 
        price: 80000,
        image: "images/products/med010.jpg"
      },
      { 
        productId: 7, 
        productName: "Dầu gió",
        unit: "Chai 10ml", 
        quantity: 1, 
        price: 35000,
        image: "images/products/med011.png"
      }
    ],
    subtotal: 195000,
    shippingCost: 15000,
    discount: 15000,
    totalPrice: 195000,
    recipientName: "Nguyễn Văn A",
    phone: "0912345678",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
    paymentMethod: "bank_transfer",
    status: "cancelled",
    createdAt: "2024-05-18T11:00:00"
  }
];

// Xuất các biến để có thể sử dụng trong các file js khác
window.MOCK_CATEGORIES = mockCategories;
window.MOCK_PRODUCTS = mockProducts;
window.MOCK_USERS = mockUsers;
window.MOCK_ADDRESSES = mockAddresses;
window.MOCK_ORDERS = mockOrders;
