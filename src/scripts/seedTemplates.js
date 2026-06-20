import { GET_DB, CONNECT_DB, CLOSE_DB } from '../config/mongodb.js'
import { boardModel } from '../models/boardModel.js'
import { columnModel } from '../models/columnModel.js'
import { cardModel } from '../models/cardModel.js'
import { ObjectId } from 'mongodb'
import { labelModel } from '../models/labelModel.js'

// The templates we want to insert
const TEMPLATE_BOARDS = [
  {
    _id: new ObjectId(),
    title: 'Phát triển Sản phẩm (Agile)',
    slug: 'agile-product-development',
    description: 'Mẫu quy trình phát triển sản phẩm Agile/Scrum với các bước đầy đủ.',
    type: 'public',
    isTemplate: true,
    ownerIds: [],
    memberIds: [],
    columnOrderIds: [],
    customFields: [],
    background: {
      type: 'gradient',
      color1: '#8a2387',
      color2: '#e94057'
    },
    createAt: Date.now(),
    updateAt: null,
    _destroy: false
  },
  {
    _id: new ObjectId(),
    title: 'Chiến dịch Marketing Đa Kênh',
    slug: 'multi-channel-marketing',
    description: 'Quản lý các chiến dịch truyền thông đa nền tảng từ khâu ý tưởng đến khi đo lường.',
    type: 'public',
    isTemplate: true,
    ownerIds: [],
    memberIds: [],
    columnOrderIds: [],
    customFields: [],
    background: {
      type: 'gradient',
      color1: '#3a7bd5',
      color2: '#3a6073'
    },
    createAt: Date.now(),
    updateAt: null,
    _destroy: false
  }
]

const TEMPLATE_COLUMNS = [
  // --- AGILE BOARD ---
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Product Backlog', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Sprint Backlog', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'In Progress (Dev)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Code Review', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Testing (QA)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Done / Deployed', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },

  // --- MARKETING BOARD ---
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Brainstorming (Ý tưởng)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Planning (Lập kế hoạch)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Content Creation (Sản xuất)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Design & Media (Thiết kế)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Review & Approve', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Live / Running (Đang chạy)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Completed (Đã kết thúc)', cardOrderIds: [], createdAt: Date.now(), updatedAt: null, _destroy: false }
]

const TEMPLATE_LABELS = [
  // Agile
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Feature', color: '#00c2e0', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Bug', color: '#eb5a46', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Enhancement', color: '#51e898', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Urgent', color: '#ff9f1a', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Backend', color: '#344563', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, title: 'Frontend', color: '#0079bf', createdAt: Date.now() },

  // Marketing
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Social Media', color: '#0079bf', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Email', color: '#ff9f1a', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Ads', color: '#eb5a46', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'PR / Event', color: '#c377e0', createdAt: Date.now() },
  { _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, title: 'Content', color: '#51e898', createdAt: Date.now() }
]

const TEMPLATE_CARDS = [
  // --- AGILE BOARD CARDS ---
  
  // Product Backlog (col 0)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[0]._id,
    title: 'Tích hợp cổng thanh toán VNPay', description: 'Cần hỗ trợ thanh toán qua VNPay cho user tại Việt Nam.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[0]._id, TEMPLATE_LABELS[4]._id], totalComments: 2, dueDate: null, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Tasks', items: [
      { _id: new ObjectId().toString(), title: 'Đọc document VNPay API', isCompleted: false },
      { _id: new ObjectId().toString(), title: 'Tạo tài khoản Sandbox', isCompleted: false },
      { _id: new ObjectId().toString(), title: 'Thiết kế Database flow', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[0]._id,
    title: 'Dark Mode cho toàn bộ ứng dụng', description: 'Nhiều user yêu cầu có Dark Mode để làm việc buổi tối.',
    cover: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[2]._id, TEMPLATE_LABELS[5]._id], totalComments: 12, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[0]._id,
    title: 'Tích hợp đăng nhập bằng Apple ID', description: 'Bắt buộc đối với app iOS theo policy của Apple.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[0]._id, TEMPLATE_LABELS[3]._id], totalComments: 5, dueDate: new Date().getTime() + 86400000 * 20, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[0]._id,
    title: 'Nâng cấp phiên bản React lên 18', description: 'Để sử dụng concurrent features.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[2]._id, TEMPLATE_LABELS[5]._id], totalComments: 1, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Sprint Backlog (col 1)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[1]._id,
    title: 'Tính năng Quên Mật Khẩu', description: 'Gửi email chứa OTP cho user để reset password.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[0]._id], totalComments: 0, dueDate: new Date().getTime() + 86400000 * 5, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Sub-tasks', items: [
      { _id: new ObjectId().toString(), title: 'UI Form Forgot Password', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'API Gen OTP & Send Email', isCompleted: false },
      { _id: new ObjectId().toString(), title: 'API Verify OTP', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[1]._id,
    title: 'Tối ưu tốc độ load trang Dashboard', description: 'Trang load quá chậm khi có >10,000 records. Cần thêm Pagination & Redis Cache.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[2]._id, TEMPLATE_LABELS[3]._id], totalComments: 4, dueDate: new Date().getTime() + 86400000 * 3, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[1]._id,
    title: 'Cập nhật thư viện biểu đồ', description: 'Chuyển từ Chart.js sang Recharts để custom dễ hơn.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[5]._id], totalComments: 0, dueDate: new Date().getTime() + 86400000 * 7, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // In Progress (col 2)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[2]._id,
    title: 'Xây dựng API Đăng nhập/Đăng ký', description: 'Tích hợp JWT Auth và Passport.js.',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[4]._id], totalComments: 8, dueDate: new Date().getTime() + 86400000, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Tiến độ', items: [
      { _id: new ObjectId().toString(), title: 'Cài đặt JWT', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Viết API Login', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Viết API Register', isCompleted: false },
      { _id: new ObjectId().toString(), title: 'Middleware check Auth', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[2]._id,
    title: 'Viết Unit Test cho User Service', description: 'Đạt tối thiểu 80% coverage.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[2]._id, TEMPLATE_LABELS[4]._id], totalComments: 1, dueDate: new Date().getTime() + 86400000 * 2, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Code Review (col 3)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[3]._id,
    title: 'Sửa lỗi Crash khi tải file > 50MB', description: 'Client gửi file to làm sập Node server vì hết RAM.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[1]._id, TEMPLATE_LABELS[3]._id], totalComments: 5, dueDate: new Date().getTime() - 86400000, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[3]._id,
    title: 'Refactor cấu trúc Redux Store', description: 'Chuyển sang sử dụng Redux Toolkit.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[5]._id], totalComments: 3, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Testing (col 4)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[4]._id,
    title: 'Giao diện Profile User', description: 'User có thể đổi Avatar và cập nhật Bio.',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[5]._id], totalComments: 2, dueDate: new Date().getTime() - 86400000 * 2, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Test cases', items: [
      { _id: new ObjectId().toString(), title: 'Upload ảnh hợp lệ', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Upload file không phải ảnh', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Cập nhật Bio thành công', isCompleted: true }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Done (col 5)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[5]._id,
    title: 'Khởi tạo Repository & Cài đặt môi trường', description: 'Setup Github repo, install Express, React, Vite, ESLint, Prettier.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[4]._id, TEMPLATE_LABELS[5]._id], totalComments: 1, dueDate: new Date().getTime() - 86400000 * 10, dueComplete: true,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[5]._id,
    title: 'Thiết kế Database Schema (v1)', description: 'Bảng Users, Boards, Columns, Cards.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[4]._id], totalComments: 4, dueDate: new Date().getTime() - 86400000 * 8, dueComplete: true,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[0]._id, columnId: TEMPLATE_COLUMNS[5]._id,
    title: 'Đăng ký tên miền & VPS', description: 'Đã mua domain whip-app.com và VPS DigitalOcean.',
    cover: null, memberIds: [], labelIds: [], totalComments: 0, dueDate: new Date().getTime() - 86400000 * 12, dueComplete: true,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },


  // --- MARKETING BOARD CARDS ---
  
  // Brainstorming (col 6)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[6]._id,
    title: 'Chiến dịch Black Friday', description: 'Siêu sale cuối năm, giảm giá 50% toàn bộ dịch vụ.',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[8]._id, TEMPLATE_LABELS[6]._id], totalComments: 3, dueDate: new Date('2026-11-01').getTime(), dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Ideas', items: [
      { _id: new ObjectId().toString(), title: 'Tặng voucher 500k', isCompleted: false },
      { _id: new ObjectId().toString(), title: 'Mua 1 tặng 1', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[6]._id,
    title: 'Hợp tác KOLs mảng Công Nghệ', description: 'Tìm các Tiktoker review đồ công nghệ để booking PR sản phẩm.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[9]._id], totalComments: 12, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[6]._id,
    title: 'Minigame tặng quà Fanpage', description: 'Event share bài viết nhận quà để tăng tương tác.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[6]._id, TEMPLATE_LABELS[9]._id], totalComments: 0, dueDate: new Date().getTime() + 86400000 * 30, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Planning (col 7)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[7]._id,
    title: 'Lên ngân sách Ads Q4', description: 'Dự kiến 500 củ cho Facebook & Google.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[8]._id], totalComments: 5, dueDate: new Date().getTime() + 86400000 * 14, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[7]._id,
    title: 'Kế hoạch Content Tháng 11', description: 'Lên outline cho 20 bài post fanpage và 4 video Tiktok.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[10]._id, TEMPLATE_LABELS[6]._id], totalComments: 2, dueDate: new Date().getTime() + 86400000 * 5, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Content Creation (col 8)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[8]._id,
    title: 'Viết bài chuẩn SEO: Xu hướng SaaS 2026', description: 'Target keyword "SaaS platform". Dài 2000 chữ.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[10]._id], totalComments: 0, dueDate: new Date().getTime() + 86400000 * 2, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Tiến độ', items: [
      { _id: new ObjectId().toString(), title: 'Nghiên cứu Keyword', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Lên Outline', isCompleted: true },
      { _id: new ObjectId().toString(), title: 'Viết Draft', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[8]._id,
    title: 'Quay video phỏng vấn khách hàng', description: 'Series "Câu chuyện thành công" của người dùng.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[10]._id, TEMPLATE_LABELS[9]._id], totalComments: 6, dueDate: new Date().getTime() + 86400000 * 6, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Design & Media (col 9)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[9]._id,
    title: 'Thiết kế bộ Banner Facebook Ads', description: 'Concept: Năng động, màu sắc thu hút.',
    cover: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[8]._id], totalComments: 2, dueDate: new Date().getTime() + 86400000 * 3, dueComplete: false,
    checklists: [{ _id: new ObjectId().toString(), title: 'Kích thước', items: [
      { _id: new ObjectId().toString(), title: '1200x628', isCompleted: true },
      { _id: new ObjectId().toString(), title: '1080x1080', isCompleted: false },
      { _id: new ObjectId().toString(), title: '1080x1920 (Story)', isCompleted: false }
    ] }], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[9]._id,
    title: 'Dựng video Highlight sự kiện ra mắt', description: 'Cắt ghép những khoảnh khắc đẹp nhất thành clip 2 phút.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[10]._id], totalComments: 1, dueDate: new Date().getTime() + 86400000 * 1, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Review & Approve (col 10)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[10]._id,
    title: 'Email Newsletter T10', description: 'Chờ Sếp duyệt nội dung trước khi gửi 10,000 subs.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[7]._id], totalComments: 4, dueDate: new Date().getTime() - 86400000, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[10]._id,
    title: 'Brochure Sản Phẩm mới', description: 'Bản PDF in ấn, chờ duyệt bản màu.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[9]._id], totalComments: 8, dueDate: new Date().getTime() - 86400000 * 2, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Live / Running (col 11)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[11]._id,
    title: 'Chạy Ads Tiktok Mùa Tựu Trường', description: 'Đang cắn tiền, CPA khoảng 50k.',
    cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80', memberIds: [], labelIds: [TEMPLATE_LABELS[6]._id, TEMPLATE_LABELS[8]._id], totalComments: 10, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[11]._id,
    title: 'Chiến dịch Google Search Ads "Phần mềm Quản lý"', description: 'Top 3 impression share.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[8]._id], totalComments: 0, dueDate: null, dueComplete: false,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },

  // Completed (col 12)
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[12]._id,
    title: 'Ra mắt Landing Page Version 2', description: 'Conversion rate tăng 15%!',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[10]._id], totalComments: 20, dueDate: new Date().getTime() - 86400000 * 15, dueComplete: true,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  },
  {
    _id: new ObjectId(), boardId: TEMPLATE_BOARDS[1]._id, columnId: TEMPLATE_COLUMNS[12]._id,
    title: 'Tổ chức Webinar Giới thiệu tính năng mới', description: 'Có 500 người tham gia.',
    cover: null, memberIds: [], labelIds: [TEMPLATE_LABELS[9]._id], totalComments: 35, dueDate: new Date().getTime() - 86400000 * 30, dueComplete: true,
    checklists: [], attachments: [], customFieldValues: [], createdAt: Date.now(), updatedAt: null, _destroy: false
  }
]

// Assign Card Order to Columns
TEMPLATE_COLUMNS[0].cardOrderIds = [TEMPLATE_CARDS[0]._id, TEMPLATE_CARDS[1]._id, TEMPLATE_CARDS[2]._id, TEMPLATE_CARDS[3]._id]
TEMPLATE_COLUMNS[1].cardOrderIds = [TEMPLATE_CARDS[4]._id, TEMPLATE_CARDS[5]._id, TEMPLATE_CARDS[6]._id]
TEMPLATE_COLUMNS[2].cardOrderIds = [TEMPLATE_CARDS[7]._id, TEMPLATE_CARDS[8]._id]
TEMPLATE_COLUMNS[3].cardOrderIds = [TEMPLATE_CARDS[9]._id, TEMPLATE_CARDS[10]._id]
TEMPLATE_COLUMNS[4].cardOrderIds = [TEMPLATE_CARDS[11]._id]
TEMPLATE_COLUMNS[5].cardOrderIds = [TEMPLATE_CARDS[12]._id, TEMPLATE_CARDS[13]._id, TEMPLATE_CARDS[14]._id]

TEMPLATE_COLUMNS[6].cardOrderIds = [TEMPLATE_CARDS[15]._id, TEMPLATE_CARDS[16]._id, TEMPLATE_CARDS[17]._id]
TEMPLATE_COLUMNS[7].cardOrderIds = [TEMPLATE_CARDS[18]._id, TEMPLATE_CARDS[19]._id]
TEMPLATE_COLUMNS[8].cardOrderIds = [TEMPLATE_CARDS[20]._id, TEMPLATE_CARDS[21]._id]
TEMPLATE_COLUMNS[9].cardOrderIds = [TEMPLATE_CARDS[22]._id, TEMPLATE_CARDS[23]._id]
TEMPLATE_COLUMNS[10].cardOrderIds = [TEMPLATE_CARDS[24]._id, TEMPLATE_CARDS[25]._id]
TEMPLATE_COLUMNS[11].cardOrderIds = [TEMPLATE_CARDS[26]._id, TEMPLATE_CARDS[27]._id]
TEMPLATE_COLUMNS[12].cardOrderIds = [TEMPLATE_CARDS[28]._id, TEMPLATE_CARDS[29]._id]

// Assign Column Order to Boards
TEMPLATE_BOARDS[0].columnOrderIds = [
  TEMPLATE_COLUMNS[0]._id, TEMPLATE_COLUMNS[1]._id, TEMPLATE_COLUMNS[2]._id,
  TEMPLATE_COLUMNS[3]._id, TEMPLATE_COLUMNS[4]._id, TEMPLATE_COLUMNS[5]._id
]
TEMPLATE_BOARDS[1].columnOrderIds = [
  TEMPLATE_COLUMNS[6]._id, TEMPLATE_COLUMNS[7]._id, TEMPLATE_COLUMNS[8]._id,
  TEMPLATE_COLUMNS[9]._id, TEMPLATE_COLUMNS[10]._id, TEMPLATE_COLUMNS[11]._id, TEMPLATE_COLUMNS[12]._id
]


const runSeeding = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await CONNECT_DB()
    const db = GET_DB()

    console.log('Clearing old templates...')
    // 1. Lấy ra tất cả các board templates cũ để xoá column/card tương ứng
    const oldTemplates = await db.collection(boardModel.BOARD_COLLECTION_NAME).find({ isTemplate: true }).toArray()
    const oldTemplateIds = oldTemplates.map(t => t._id)

    if (oldTemplateIds.length > 0) {
      await db.collection(columnModel.COLUMN_COLLECTION_NAME).deleteMany({ boardId: { $in: oldTemplateIds } })
      await db.collection(cardModel.CARD_COLLECTION_NAME).deleteMany({ boardId: { $in: oldTemplateIds } })
      await db.collection(labelModel.LABEL_COLLECTION_NAME).deleteMany({ boardId: { $in: oldTemplateIds } })
      await db.collection(boardModel.BOARD_COLLECTION_NAME).deleteMany({ isTemplate: true })
    }

    console.log('Inserting new templates...')
    // 2. Insert boards, columns, cards, and labels
    await db.collection(boardModel.BOARD_COLLECTION_NAME).insertMany(TEMPLATE_BOARDS)
    await db.collection(columnModel.COLUMN_COLLECTION_NAME).insertMany(TEMPLATE_COLUMNS)
    await db.collection(cardModel.CARD_COLLECTION_NAME).insertMany(TEMPLATE_CARDS)
    await db.collection(labelModel.LABEL_COLLECTION_NAME).insertMany(TEMPLATE_LABELS)

    console.log('✅ Template Seeding successfully finished!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await CLOSE_DB()
  }
}

// Chạy script
runSeeding()
