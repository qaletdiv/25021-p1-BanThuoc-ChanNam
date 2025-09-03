export const categories = [
        {
            id: 1,
            name: "Thuốc kê đơn"
        },
        {
            id: 2,
            name: "Thuốc không kê đơn"
        }
    ]

export const products = [
    {
        "id": "MED001",
        "name": "Paracetamol 500mg",
        "active_ingredient": "Paracetamol",
        "dosage_form": "Viên nén",
        "strength": "500mg",
        "manufacturer": "Pharco Pharmaceuticals",
        "origin": "Việt Nam",
        "package_size": "Hộp 10 vỉ x 10 viên",
        "price": 35000,
        "description": "Thuốc giảm đau, hạ sốt phổ biến.",
        "indications": ["Hạ sốt", "Giảm đau nhẹ đến trung bình"],
        "contraindications": ["Mẫn cảm với Paracetamol", "Suy gan nặng"],
        "side_effects": ["Hiếm khi: buồn nôn, rối loạn tiêu hóa"],
        "usage": "Uống 1-2 viên/lần, cách nhau 4-6 giờ, không quá 4g/ngày.",
        "storage": "Bảo quản nơi khô ráo, dưới 30°C.",
        "expiry_date": "2026-12-31",
        "category": "Giảm đau - Hạ sốt",
        "prescription_required": false,
        "image_url": "statics/images/MED001.jpg",
        "status": "active"
    },
    {
        "id": "MED002",
        "name": "Amoxicillin 250mg",
        "active_ingredient": "Amoxicillin",
        "dosage_form": "Viên nang",
        "strength": "250mg",
        "manufacturer": "GlaxoSmithKline",
        "origin": "Anh",
        "package_size": "Hộp 20 viên",
        "price": 85000,
        "description": "Kháng sinh phổ rộng điều trị nhiễm khuẩn.",
        "indications": ["Viêm họng", "Viêm tai giữa", "Nhiễm khuẩn đường hô hấp"],
        "contraindications": ["Dị ứng với penicillin"],
        "side_effects": ["Tiêu chảy", "Phát ban", "Buồn nôn"],
        "usage": "Uống 3 lần/ngày, 1 viên/lần, theo chỉ định bác sĩ.",
        "storage": "Nơi khô ráo, tránh ánh sáng trực tiếp.",
        "expiry_date": "2025-10-15",
        "category": "Kháng sinh",
        "prescription_required": true,
        "image_url": "MED002.jpg",
        "status": "active"
    }    
]