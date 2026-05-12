import { env } from '~/config/environment'

// những cái domain được phép truy cập tới tài nguyên server
export const WHITELIST_DOMAINS = [
  // ko cần localhost nữa vì file cors luôn luôn cho phép mt dev
  // 'http://localhost:5173'
  // khi deploy lên domain chính thức
  'https://whip-app-ebon.vercel.app',
  'https://whip.cobweb.id.vn'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev')
 ? env.WEBSITE_DOMAIN_DEVELOPMENT
 : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12