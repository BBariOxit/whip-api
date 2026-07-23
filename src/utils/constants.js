import { env } from '~/config/environment'

// những cái domain được phép truy cập tới tài nguyên server
export const WHITELIST_DOMAINS = [
  // ko cần localhost nữa vì file cors luôn luôn cho phép mt dev
  // 'http://localhost:5173'
  // khi deploy lên domain chính thức
  'https://whip-app-ebon.vercel.app',
  'https://whip.cobweb.id.vn',
  'https://whip.id.vn'
]


export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  WORKSPACE_VISIBLE: 'workspace_visible'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev')
 ? env.WEBSITE_DOMAIN_DEVELOPMENT
 : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 10

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION',
  WORKSPACE_INVITATION: 'WORKSPACE_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
}

export const INVITATION_TTL_DAYS = 7

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

// Các loại notification (thông báo chung, khác với invitations)
export const NOTIFICATION_TYPES = {
  MEMBER_JOINED: 'MEMBER_JOINED',
  BOARD_CREATED: 'BOARD_CREATED',
  BOARD_DELETED: 'BOARD_DELETED',
  BOARD_ACTIVITY: 'BOARD_ACTIVITY',
  MENTION: 'MENTION'
}

// Cấu hình cho từng loại: gắn với toggle nào trong workspace member.notificationPrefs,
// và gửi qua kênh nào ('email' | 'inApp'). Đây là "bảng đấu dây" trung tâm.
export const NOTIFICATION_CONFIG = {
  MEMBER_JOINED: { toggleKey: 'memberJoins', channel: 'email' },
  BOARD_CREATED: { toggleKey: 'boardChanges', channel: 'inApp' },
  BOARD_DELETED: { toggleKey: 'boardChanges', channel: 'inApp' },
  BOARD_ACTIVITY: { toggleKey: 'boardActivity', channel: 'inApp' },
  MENTION: { toggleKey: 'mentions', channel: 'inApp' }
}

// Tên socket event realtime cho notification chung
export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: 'BE_NEW_NOTIFICATION'
}

// Số ngày giữ notification in-app trước khi TTL index của Mongo tự xoá
export const NOTIFICATION_TTL_DAYS = 60

export const ACTIVITY_ACTION_TYPES = {
  UPDATE_DATE: 'UPDATE_DATE',
  SET_DATE: 'SET_DATE',
  ADD_LABEL: 'ADD_LABEL',
  REMOVE_LABEL: 'REMOVE_LABEL',
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  UPDATE_COVER: 'UPDATE_COVER',
  ADD_ATTACHMENT: 'ADD_ATTACHMENT',
  REMOVE_ATTACHMENT: 'REMOVE_ATTACHMENT',
  ARCHIVE_CARD: 'ARCHIVE_CARD'
}

// Các loại hoạt động ở PHẠM VI WORKSPACE (khác với ACTIVITY_ACTION_TYPES vốn gắn với 1 card).
// Được ghi bởi server khi các sự kiện tương ứng xảy ra và hiển thị ở "Activity Log" trong Settings.
export const WORKSPACE_ACTIVITY_TYPES = {
  BOARD_CREATED: 'BOARD_CREATED',
  BOARD_DELETED: 'BOARD_DELETED',
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_LEFT: 'MEMBER_LEFT',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  OWNERSHIP_TRANSFERRED: 'OWNERSHIP_TRANSFERRED'
}

// Số ngày giữ activity của workspace trước khi TTL index của Mongo tự xoá.
// Muốn giữ lịch sử lâu hơn (VD audit dài hạn) chỉ cần tăng số này.
export const WORKSPACE_ACTIVITY_TTL_DAYS = 30
