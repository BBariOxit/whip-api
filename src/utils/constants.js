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


export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev')
 ? env.WEBSITE_DOMAIN_DEVELOPMENT
 : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 10

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const ACTIVITY_ACTION_TYPES = {
  UPDATE_DATE: 'UPDATE_DATE',
  SET_DATE: 'SET_DATE',
  ADD_LABEL: 'ADD_LABEL',
  REMOVE_LABEL: 'REMOVE_LABEL',
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  UPDATE_COVER: 'UPDATE_COVER',
  ADD_ATTACHMENT: 'ADD_ATTACHMENT',
  REMOVE_ATTACHMENT: 'REMOVE_ATTACHMENT'
}