import Joi from 'joi'

// Schema Joi tái sử dụng cho INPUT KHÔNG TIN CẬY khi import (board lẻ hoặc board trong workspace).
// Chỉ whitelist đúng các field cần thiết; dùng kèm { stripUnknown: true } để mọi field lạ/nhạy cảm
// (attachments, memberIds, totalComments, _destroy, isTemplate, slug, ownerIds...) bị loại tự động.
// Giới hạn kích thước mảng để chống DoS bằng file khổng lồ.

const labelSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().max(50).allow('').default(''),
  color: Joi.string().required()
})

const checklistItemSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().min(1).max(500).required(),
  isCompleted: Joi.boolean().default(false)
})

const checklistSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().min(1).max(100).required(),
  items: Joi.array().max(200).items(checklistItemSchema).default([])
})

const customFieldValueSchema = Joi.object({
  customFieldId: Joi.string().required(),
  value: Joi.any().allow(null, '')
})

const cardSchema = Joi.object({
  _id: Joi.string().required(),
  columnId: Joi.string().required(),
  // Nới min về 1 để một bản backup hợp lệ không bị chặn vì ràng buộc chặt hơn ở lần tạo gốc.
  title: Joi.string().min(1).max(50).required(),
  layout: Joi.string().valid('compact', 'standard', 'detailed').default('detailed'),
  description: Joi.string().allow('').default(''),
  cover: Joi.string().allow(null, '').default(null),
  labelIds: Joi.array().items(Joi.string()).default([]),
  dueDate: Joi.any().allow(null),
  dueComplete: Joi.boolean().default(false),
  checklists: Joi.array().max(50).items(checklistSchema).default([]),
  customFieldValues: Joi.array().items(customFieldValueSchema).default([])
})

const columnSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().min(1).max(50).required(),
  cardOrderIds: Joi.array().items(Joi.string()).default([])
})

const customFieldOptionSchema = Joi.object({
  _id: Joi.string().required(),
  text: Joi.string().required(),
  color: Joi.string().allow('').optional()
})

const customFieldSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().valid('text', 'number', 'checkbox', 'dropdown', 'date').required(),
  options: Joi.array().items(customFieldOptionSchema).default([]),
  showOnFront: Joi.boolean().default(false)
})

const backgroundSchema = Joi.object({
  type: Joi.string().valid('gradient', 'solid', 'image').required(),
  color1: Joi.string().required(),
  color2: Joi.string().optional()
})

// Schema cho MỘT board (kèm columns/cards/labels/customFields). Dùng chung cho:
//  - import board lẻ (bọc trong { kind: 'board', board })
//  - import workspace (mảng boards[])
export const boardImportSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(3).max(256).required(),
  type: Joi.string().valid('public', 'private', 'workspace_visible').default('workspace_visible'),
  background: backgroundSchema.optional(),
  columnOrderIds: Joi.array().items(Joi.string()).default([]),
  columns: Joi.array().max(100).items(columnSchema).default([]),
  cards: Joi.array().max(5000).items(cardSchema).default([]),
  labels: Joi.array().max(200).items(labelSchema).default([]),
  customFields: Joi.array().max(50).items(customFieldSchema).default([])
})
