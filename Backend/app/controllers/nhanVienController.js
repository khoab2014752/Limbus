// controllers/nhanVienController.js
const NhanVien = require('../models/NhanVien');
const bcrypt = require('bcryptjs');

// Lấy tất cả nhân viên
exports.getAllNhanVien = async (req, res) => {
    try {
        // Loại bỏ trường password trong kết quả trả về
        const nhanVienList = await NhanVien.find().select('-Password').sort({ HoTenNV: 1 });

        res.status(200).json({
            count: nhanVienList.length,
            data: nhanVienList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách nhân viên',
            error: error.message
        });
    }
};

// Lấy chi tiết một nhân viên theo ID
exports.getNhanVienById = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findById(req.params.id).select('-Password');

        if (!nhanVien) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên với ID này'
            });
        }

        res.status(200).json({
            success: true,
            data: nhanVien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin nhân viên',
            error: error.message
        });
    }
};

// Lấy nhân viên theo mã số
exports.getNhanVienByMa = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findOne({ MSNV: req.params.MSNV }).select('-Password');

        if (!nhanVien) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên với mã số này'
            });
        }

        res.status(200).json({
            success: true,
            data: nhanVien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin nhân viên',
            error: error.message
        });
    }
};

// Hàm tạo MSNV không trùng lặp
const taoMaNhanVien = async () => {
    let count = await NhanVien.countDocuments();
    let msnv;
    let isUnique = false;

    while (!isUnique) {
        count++;
        msnv = `NV${String(count).padStart(3, '0')}`; // Tạo mã dạng NV001, NV002,...
        const existingNhanVien = await NhanVien.findOne({ MSNV: msnv });
        if (!existingNhanVien) {
            isUnique = true; // Thoát vòng lặp khi tìm được mã không trùng
        }
    }

    return msnv;
};
// Hàm tách Họ và Tên
const tachHoTen = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
        return { HoLot: '', Ten: '' };
    }

    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
        return { HoLot: '', Ten: parts[0] };
    }

    const Ten = parts.pop(); // Lấy phần cuối làm Tên
    const HoLot = parts.join(' '); // Phần còn lại là Họ lót

    return { HoLot, Ten };
};
// Tạo nhân viên mới
exports.createNhanVien = async (req, res) => {
    try {
        // Kiểm tra email đã tồn tại chưa
        const existingEmail = await NhanVien.findOne({ Email: req.body.Email });
        
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email này đã được sử dụng'
                    });
                }

        // Tạo mã số nhân viên mới tự động
        const msnv = await taoMaNhanVien();

        // Tách Họ và Tên
        const { HoLot, Ten } = tachHoTen(req.body.HoTen);

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.Password, salt);

        const nhanVien = await NhanVien.create({
            MSNV: msnv, // Sử dụng MSNV tự động tạo
            HoLot: HoLot || "",
            Ten: Ten || "",
            Email: req.body.Email || "",
            Password: hashedPassword,
            DienThoai: req.body.DienThoai || "",
            DiaChi: req.body.DiaChi || "",
            NgaySinh: req.body.NgaySinh || "",
            ChucVu: req.body.ChucVu || "",
        });

        // Không trả về mật khẩu trong response
        const response = {
            ...nhanVien._doc,
            Password: undefined
        };

        res.status(201).json({
            success: true,
            message: 'Tạo nhân viên mới thành công',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Không thể tạo nhân viên mới',
            error: error.message
        });
    }
};

// Cập nhật thông tin nhân viên
exports.updateNhanVien = async (req, res) => {
    try {
        // Nếu cập nhật MSNV, kiểm tra xem mã mới đã tồn tại chưa
        if (req.body.MSNV) {
            const existingNhanVien = await NhanVien.findOne({
                MSNV: req.body.MSNV,
                _id: { $ne: req.params.id }
            });

            if (existingNhanVien) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã số nhân viên này đã tồn tại'
                });
            }
        }

        // Nếu cập nhật mật khẩu, mã hóa mật khẩu mới
        if (req.body.Password) {
            const salt = await bcrypt.genSalt(10);
            req.body.Password = await bcrypt.hash(req.body.Password, salt);
        }

        const nhanVien = await NhanVien.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-Password');

        if (!nhanVien) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên với ID này'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật nhân viên thành công',
            data: nhanVien
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Không thể cập nhật nhân viên',
            error: error.message
        });
    }
};

// Xóa nhân viên
exports.deleteNhanVien = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findByIdAndDelete(req.params.id);

        if (!nhanVien) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên với ID này'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa nhân viên thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể xóa nhân viên',
            error: error.message
        });
    }
};


// Lấy thông tin nhân viên hiện tại (theo token)
exports.getCurrentNhanVien = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findById(req.user.id).select('-Password');
        res.status(200).json({
            success: true,
            data: nhanVien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin nhân viên',
            error: error.message
        });
    }
};

// Tìm kiếm nhân viên
exports.searchNhanVien = async (req, res) => {
    try {
        const { keyword } = req.query;

        const nhanVienList = await NhanVien.find({
            $or: [
                { MSNV: new RegExp(keyword, 'i') },
                { HoTenNV: new RegExp(keyword, 'i') },
                { Chucvu: new RegExp(keyword, 'i') }
            ]
        }).select('-Password').sort({ HoTenNV: 1 });

        res.status(200).json({
            success: true,
            count: nhanVienList.length,
            data: nhanVienList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể tìm kiếm nhân viên',
            error: error.message
        });
    }
};

// Đặt lại mật khẩu (dành cho Admin)
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mật khẩu mới'
            });
        }

        // Kiểm tra quyền admin
        if (req.user.Chucvu !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện chức năng này'
            });
        }

        const nhanVien = await NhanVien.findById(id);

        if (!nhanVien) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên với ID này'
            });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới
        nhanVien.Password = hashedPassword;
        await nhanVien.save();

        res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể đặt lại mật khẩu',
            error: error.message
        });
    }
};
