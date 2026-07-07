"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _validators = require("../utils/validators");
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _constants = require("../utils/constants");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Define Collection (name & schema)
var CARD_COLLECTION_NAME = 'cards';
var CARD_COLLECTION_SCHEMA = _joi["default"].object({
  boardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  columnId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).required().allow(null),
  isTemplate: _joi["default"]["boolean"]()["default"](false),
  title: _joi["default"].string().required().min(3).max(50).trim().strict(),
  layout: _joi["default"].string().valid('compact', 'standard', 'detailed')["default"]('detailed'),
  description: _joi["default"].string().optional(),
  cover: _joi["default"].string()["default"](null),
  memberIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  labelIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  // Tổng số lượng comment của card (denormalized)
  totalComments: _joi["default"].number()["default"](0),
  // Due date fields
  dueDate: _joi["default"].date().timestamp('javascript')["default"](null).allow(null),
  dueComplete: _joi["default"]["boolean"]()["default"](false),
  // Checklist subdocuments - mỗi card chứa mảng checklists, mỗi checklist chứa mảng items
  checklists: _joi["default"].array().items(_joi["default"].object({
    _id: _joi["default"].string().required(),
    title: _joi["default"].string().required().min(1).max(100).trim().strict(),
    items: _joi["default"].array().items(_joi["default"].object({
      _id: _joi["default"].string().required(),
      title: _joi["default"].string().required().min(1).max(500).trim().strict(),
      isCompleted: _joi["default"]["boolean"]()["default"](false)
    }))["default"]([])
  }))["default"]([]),
  // Attachments - file đính kèm nhúng vào bản ghi Card
  attachments: _joi["default"].array().items(_joi["default"].object({
    url: _joi["default"].string().required(),
    // Link file trên Cloudinary
    publicId: _joi["default"].string().required(),
    // Cloudinary public_id (để xóa file)
    filename: _joi["default"].string().required(),
    // Tên file gốc (vd: tailieu.pdf)
    format: _joi["default"].string().required(),
    // Định dạng (png, jpg, pdf...)
    createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now)
  }))["default"]([]),
  // Custom field values
  customFieldValues: _joi["default"].array().items(_joi["default"].object({
    customFieldId: _joi["default"].string().required(),
    value: _joi["default"].any().allow(null, '')
  }))["default"]([]),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
// (memberIds/attachments/totalComments/isTemplate/_destroy đều có method riêng — chặn mass-assignment)
var INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', '_destroy', 'isTemplate', 'totalComments', 'attachments', 'memberIds'];
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return CARD_COLLECTION_SCHEMA.validateAsync(data, {
            abortEarly: false
          });
        case 2:
          return _context.abrupt("return", _context.sent);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function validateBeforeCreate(_x) {
    return _ref.apply(this, arguments);
  };
}();
var createNew = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    var validData, newCardToAdd, createdCard;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newCardToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            boardId: new _mongodb2.ObjectId(validData.boardId),
            columnId: validData.columnId ? new _mongodb2.ObjectId(validData.columnId) : null
          });
          _context2.next = 7;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd);
        case 7:
          createdCard = _context2.sent;
          return _context2.abrupt("return", createdCard);
        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 11]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var findOneById = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(cardId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(cardId)
          });
        case 3:
          result = _context3.sent;
          return _context3.abrupt("return", result);
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 7]]);
  }));
  return function findOneById(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(cardId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
          Object.keys(updateData).forEach(function (fieldName) {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
              delete updateData[fieldName];
            }
          });

          // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
          if (updateData.columnId) {
            updateData.columnId = new _mongodb2.ObjectId(updateData.columnId);
          }
          if (updateData.labelIds) {
            updateData.labelIds = updateData.labelIds.map(function (_id) {
              return new _mongodb2.ObjectId(_id);
            });
          }
          _context4.next = 6;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          } // trả về kq mới sau khi cập nhật
          );
        case 6:
          result = _context4.sent;
          return _context4.abrupt("return", result);
        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          throw new Error(_context4.t0);
        case 13:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 10]]);
  }));
  return function update(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteManyByColumnId = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).deleteMany({
            columnId: new _mongodb2.ObjectId(columnId),
            _destroy: false
          });
        case 3:
          result = _context5.sent;
          return _context5.abrupt("return", result);
        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          throw new Error(_context5.t0);
        case 10:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 7]]);
  }));
  return function deleteManyByColumnId(_x6) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteOneById = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(cardId) {
    var result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(cardId)
          });
        case 3:
          result = _context6.sent;
          return _context6.abrupt("return", result);
        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          throw new Error(_context6.t0);
        case 10:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 7]]);
  }));
  return function deleteOneById(_x7) {
    return _ref6.apply(this, arguments);
  };
}();
var updateManyCardsLayoutByColumnId = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(columnId, newLayout) {
    var result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).updateMany({
            columnId: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              layout: newLayout
            }
          });
        case 3:
          result = _context7.sent;
          return _context7.abrupt("return", result);
        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          throw new Error(_context7.t0);
        case 10:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 7]]);
  }));
  return function updateManyCardsLayoutByColumnId(_x8, _x9) {
    return _ref7.apply(this, arguments);
  };
}();
var incrementTotalComments = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(cardId) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $inc: {
              totalComments: 1
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context8.sent;
          return _context8.abrupt("return", result);
        case 7:
          _context8.prev = 7;
          _context8.t0 = _context8["catch"](0);
          throw new Error(_context8.t0);
        case 10:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 7]]);
  }));
  return function incrementTotalComments(_x0) {
    return _ref8.apply(this, arguments);
  };
}();
var decrementTotalComments = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(cardId, amount) {
    var result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $inc: {
              totalComments: -amount
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context9.sent;
          return _context9.abrupt("return", result);
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          throw new Error(_context9.t0);
        case 10:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 7]]);
  }));
  return function decrementTotalComments(_x1, _x10) {
    return _ref9.apply(this, arguments);
  };
}();

/**
 * Hàm này sẽ có nhiệm vụ xử lý cập nhật thêm hoặc xóa member khỏi card dựa theo
Action
 * sẽ dùng $push để thêm hoặc $pull để loại bỏ ($pull trong mongodb để lấy một phần
tử ra khỏi mảng rồi xóa nó đi)
 */
var updateMembers = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(cardId, incomingMemberInfo) {
    var updateCondition, result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          // Tạo ra một biến updateCondition ban đầu là rỗng
          updateCondition = {};
          if (incomingMemberInfo.action === _constants.CARD_MEMBER_ACTIONS.ADD) {
            // console.log('Trường hợp Add, dùng $push: ', incomingMemberInfo)
            updateCondition = {
              $push: {
                memberIds: new _mongodb2.ObjectId(incomingMemberInfo.userId)
              }
            };
          }
          if (incomingMemberInfo.action === _constants.CARD_MEMBER_ACTIONS.REMOVE) {
            // console.log('Trường hợp Remove, dùng $pull: ', incomingMemberInfo)
            updateCondition = {
              $pull: {
                memberIds: new _mongodb2.ObjectId(incomingMemberInfo.userId)
              }
            };
          }
          _context0.next = 6;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, updateCondition,
          // truyền cái updateCondition ở đây
          {
            returnDocument: 'after'
          });
        case 6:
          result = _context0.sent;
          return _context0.abrupt("return", result);
        case 10:
          _context0.prev = 10;
          _context0.t0 = _context0["catch"](0);
          throw new Error(_context0.t0);
        case 13:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 10]]);
  }));
  return function updateMembers(_x11, _x12) {
    return _ref0.apply(this, arguments);
  };
}();
var pullLabelFromCards = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(boardId, labelId) {
    var result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).updateMany({
            boardId: new _mongodb2.ObjectId(boardId)
          }, {
            $pull: {
              labelIds: new _mongodb2.ObjectId(labelId)
            }
          });
        case 3:
          result = _context1.sent;
          return _context1.abrupt("return", result);
        case 7:
          _context1.prev = 7;
          _context1.t0 = _context1["catch"](0);
          throw new Error(_context1.t0);
        case 10:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 7]]);
  }));
  return function pullLabelFromCards(_x13, _x14) {
    return _ref1.apply(this, arguments);
  };
}();

/**
 * Đẩy một attachment mới vào cuối mảng attachments của card
 */
var pushNewAttachment = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(cardId, attachment) {
    var result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $push: {
              attachments: attachment
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context10.sent;
          return _context10.abrupt("return", result);
        case 7:
          _context10.prev = 7;
          _context10.t0 = _context10["catch"](0);
          throw new Error(_context10.t0);
        case 10:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 7]]);
  }));
  return function pushNewAttachment(_x15, _x16) {
    return _ref10.apply(this, arguments);
  };
}();

/**
 * Xóa một attachment khỏi mảng attachments dựa theo publicId
 */
var pullAttachment = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(cardId, publicId) {
    var result;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $pull: {
              attachments: {
                publicId: publicId
              }
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context11.sent;
          return _context11.abrupt("return", result);
        case 7:
          _context11.prev = 7;
          _context11.t0 = _context11["catch"](0);
          throw new Error(_context11.t0);
        case 10:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 7]]);
  }));
  return function pullAttachment(_x17, _x18) {
    return _ref11.apply(this, arguments);
  };
}();
var pullCustomFieldValues = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(boardId, fieldId) {
    var result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).updateMany({
            boardId: new _mongodb2.ObjectId(boardId)
          }, {
            $pull: {
              customFieldValues: {
                customFieldId: fieldId
              }
            }
          });
        case 3:
          result = _context12.sent;
          return _context12.abrupt("return", result);
        case 7:
          _context12.prev = 7;
          _context12.t0 = _context12["catch"](0);
          throw new Error(_context12.t0);
        case 10:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 7]]);
  }));
  return function pullCustomFieldValues(_x19, _x20) {
    return _ref12.apply(this, arguments);
  };
}();
var archiveCard = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(cardId) {
    var result;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          _context13.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $set: {
              _destroy: true,
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context13.sent;
          return _context13.abrupt("return", result);
        case 7:
          _context13.prev = 7;
          _context13.t0 = _context13["catch"](0);
          throw new Error(_context13.t0);
        case 10:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 7]]);
  }));
  return function archiveCard(_x21) {
    return _ref13.apply(this, arguments);
  };
}();
var archiveManyByColumnId = /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee14(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          _context14.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).updateMany({
            columnId: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              _destroy: true,
              updatedAt: Date.now()
            }
          });
        case 3:
          result = _context14.sent;
          return _context14.abrupt("return", result);
        case 7:
          _context14.prev = 7;
          _context14.t0 = _context14["catch"](0);
          throw new Error(_context14.t0);
        case 10:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[0, 7]]);
  }));
  return function archiveManyByColumnId(_x22) {
    return _ref14.apply(this, arguments);
  };
}();
var deleteManyByBoardId = /*#__PURE__*/function () {
  var _ref15 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee15(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          _context15.prev = 0;
          _context15.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).deleteMany({
            boardId: new _mongodb2.ObjectId(boardId)
          });
        case 3:
          result = _context15.sent;
          return _context15.abrupt("return", result);
        case 7:
          _context15.prev = 7;
          _context15.t0 = _context15["catch"](0);
          throw new Error(_context15.t0);
        case 10:
        case "end":
          return _context15.stop();
      }
    }, _callee15, null, [[0, 7]]);
  }));
  return function deleteManyByBoardId(_x23) {
    return _ref15.apply(this, arguments);
  };
}();
var getArchivedByBoardId = /*#__PURE__*/function () {
  var _ref16 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee16(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee16$(_context16) {
      while (1) switch (_context16.prev = _context16.next) {
        case 0:
          _context16.prev = 0;
          _context16.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).find({
            boardId: new _mongodb2.ObjectId(boardId),
            _destroy: true
          }).toArray();
        case 3:
          result = _context16.sent;
          return _context16.abrupt("return", result);
        case 7:
          _context16.prev = 7;
          _context16.t0 = _context16["catch"](0);
          throw new Error(_context16.t0);
        case 10:
        case "end":
          return _context16.stop();
      }
    }, _callee16, null, [[0, 7]]);
  }));
  return function getArchivedByBoardId(_x24) {
    return _ref16.apply(this, arguments);
  };
}();
var restoreCard = /*#__PURE__*/function () {
  var _ref17 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee17(cardId) {
    var newColumnId,
      updateData,
      result,
      _args17 = arguments;
    return _regenerator["default"].wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          newColumnId = _args17.length > 1 && _args17[1] !== undefined ? _args17[1] : null;
          _context17.prev = 1;
          updateData = {
            _destroy: false,
            updatedAt: Date.now()
          };
          if (newColumnId) {
            updateData.columnId = new _mongodb2.ObjectId(newColumnId);
          }
          _context17.next = 6;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(cardId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          });
        case 6:
          result = _context17.sent;
          return _context17.abrupt("return", result);
        case 10:
          _context17.prev = 10;
          _context17.t0 = _context17["catch"](1);
          throw new Error(_context17.t0);
        case 13:
        case "end":
          return _context17.stop();
      }
    }, _callee17, null, [[1, 10]]);
  }));
  return function restoreCard(_x25) {
    return _ref17.apply(this, arguments);
  };
}();
var restoreManyByColumnId = /*#__PURE__*/function () {
  var _ref18 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee18(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee18$(_context18) {
      while (1) switch (_context18.prev = _context18.next) {
        case 0:
          _context18.prev = 0;
          _context18.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).updateMany({
            columnId: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              _destroy: false,
              updatedAt: Date.now()
            }
          });
        case 3:
          result = _context18.sent;
          return _context18.abrupt("return", result);
        case 7:
          _context18.prev = 7;
          _context18.t0 = _context18["catch"](0);
          throw new Error(_context18.t0);
        case 10:
        case "end":
          return _context18.stop();
      }
    }, _callee18, null, [[0, 7]]);
  }));
  return function restoreManyByColumnId(_x26) {
    return _ref18.apply(this, arguments);
  };
}();

// ===== TEMPLATE FUNCTIONS =====
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref19 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee19(cardId) {
    var originalCard, templateData, result;
    return _regenerator["default"].wrap(function _callee19$(_context19) {
      while (1) switch (_context19.prev = _context19.next) {
        case 0:
          _context19.prev = 0;
          _context19.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(cardId)
          });
        case 3:
          originalCard = _context19.sent;
          if (originalCard) {
            _context19.next = 6;
            break;
          }
          throw new Error('Card not found!');
        case 6:
          // Clone card data, lọc bỏ những thứ không cần copy
          templateData = {
            boardId: originalCard.boardId,
            columnId: null,
            // Template không thuộc column nào
            title: originalCard.title,
            layout: originalCard.layout || 'detailed',
            cover: originalCard.cover || null,
            memberIds: originalCard.memberIds || [],
            // NÊN COPY members (vd: task test gán sẵn cho QA)
            labelIds: originalCard.labelIds || [],
            totalComments: 0,
            // Reset comments
            dueDate: null,
            // Không copy due date
            dueComplete: false,
            // Clone checklists nhưng reset tất cả items về isCompleted: false
            checklists: (originalCard.checklists || []).map(function (cl) {
              return _objectSpread(_objectSpread({}, cl), {}, {
                _id: new _mongodb2.ObjectId().toString(),
                items: (cl.items || []).map(function (item) {
                  return _objectSpread(_objectSpread({}, item), {}, {
                    _id: new _mongodb2.ObjectId().toString(),
                    isCompleted: false
                  });
                })
              });
            }),
            attachments: originalCard.attachments || [],
            // PHẢI COPY attachments (vd: mẫu form excel)
            customFieldValues: originalCard.customFieldValues || [],
            isTemplate: true,
            _destroy: false,
            createdAt: Date.now(),
            updatedAt: null
          };
          _context19.next = 9;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).insertOne(templateData);
        case 9:
          result = _context19.sent;
          _context19.next = 12;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: result.insertedId
          });
        case 12:
          return _context19.abrupt("return", _context19.sent);
        case 15:
          _context19.prev = 15;
          _context19.t0 = _context19["catch"](0);
          throw new Error(_context19.t0);
        case 18:
        case "end":
          return _context19.stop();
      }
    }, _callee19, null, [[0, 15]]);
  }));
  return function saveAsTemplate(_x27) {
    return _ref19.apply(this, arguments);
  };
}();
var getTemplatesByBoardId = /*#__PURE__*/function () {
  var _ref20 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee20(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee20$(_context20) {
      while (1) switch (_context20.prev = _context20.next) {
        case 0:
          _context20.prev = 0;
          _context20.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).find({
            boardId: new _mongodb2.ObjectId(boardId),
            columnId: null,
            // Chỉ lấy standalone Card Templates, bỏ qua các thẻ nằm trong Column Template
            isTemplate: true,
            _destroy: false
          }).toArray();
        case 3:
          result = _context20.sent;
          return _context20.abrupt("return", result);
        case 7:
          _context20.prev = 7;
          _context20.t0 = _context20["catch"](0);
          throw new Error(_context20.t0);
        case 10:
        case "end":
          return _context20.stop();
      }
    }, _callee20, null, [[0, 7]]);
  }));
  return function getTemplatesByBoardId(_x28) {
    return _ref20.apply(this, arguments);
  };
}();
var useTemplate = /*#__PURE__*/function () {
  var _ref21 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee21(templateId, targetColumnId) {
    var templateCard, newCardData, result;
    return _regenerator["default"].wrap(function _callee21$(_context21) {
      while (1) switch (_context21.prev = _context21.next) {
        case 0:
          _context21.prev = 0;
          _context21.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(templateId),
            isTemplate: true
          });
        case 3:
          templateCard = _context21.sent;
          if (templateCard) {
            _context21.next = 6;
            break;
          }
          throw new Error('Template not found!');
        case 6:
          newCardData = {
            boardId: templateCard.boardId,
            columnId: new _mongodb2.ObjectId(targetColumnId),
            title: templateCard.title,
            layout: templateCard.layout || 'detailed',
            cover: templateCard.cover || null,
            memberIds: templateCard.memberIds || [],
            labelIds: templateCard.labelIds || [],
            totalComments: 0,
            dueDate: null,
            dueComplete: false,
            // Clone checklists với ID mới
            checklists: (templateCard.checklists || []).map(function (cl) {
              return _objectSpread(_objectSpread({}, cl), {}, {
                _id: new _mongodb2.ObjectId().toString(),
                items: (cl.items || []).map(function (item) {
                  return _objectSpread(_objectSpread({}, item), {}, {
                    _id: new _mongodb2.ObjectId().toString(),
                    isCompleted: false
                  });
                })
              });
            }),
            attachments: (templateCard.attachments || []).map(function (att) {
              return _objectSpread(_objectSpread({}, att), {}, {
                createdAt: Date.now()
              });
            }),
            customFieldValues: templateCard.customFieldValues || [],
            isTemplate: false,
            _destroy: false,
            createdAt: Date.now(),
            updatedAt: null
          };
          _context21.next = 9;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).insertOne(newCardData);
        case 9:
          result = _context21.sent;
          _context21.next = 12;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: result.insertedId
          });
        case 12:
          return _context21.abrupt("return", _context21.sent);
        case 15:
          _context21.prev = 15;
          _context21.t0 = _context21["catch"](0);
          throw new Error(_context21.t0);
        case 18:
        case "end":
          return _context21.stop();
      }
    }, _callee21, null, [[0, 15]]);
  }));
  return function useTemplate(_x29, _x30) {
    return _ref21.apply(this, arguments);
  };
}();
var deleteTemplate = /*#__PURE__*/function () {
  var _ref22 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee22(templateId) {
    var result;
    return _regenerator["default"].wrap(function _callee22$(_context22) {
      while (1) switch (_context22.prev = _context22.next) {
        case 0:
          _context22.prev = 0;
          _context22.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(templateId),
            isTemplate: true
          });
        case 3:
          result = _context22.sent;
          return _context22.abrupt("return", result);
        case 7:
          _context22.prev = 7;
          _context22.t0 = _context22["catch"](0);
          throw new Error(_context22.t0);
        case 10:
        case "end":
          return _context22.stop();
      }
    }, _callee22, null, [[0, 7]]);
  }));
  return function deleteTemplate(_x31) {
    return _ref22.apply(this, arguments);
  };
}();
var duplicateCard = /*#__PURE__*/function () {
  var _ref23 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee23(cardId, targetColumnId) {
    var originalCard, newCardData, result;
    return _regenerator["default"].wrap(function _callee23$(_context23) {
      while (1) switch (_context23.prev = _context23.next) {
        case 0:
          _context23.prev = 0;
          _context23.next = 3;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(cardId)
          });
        case 3:
          originalCard = _context23.sent;
          if (originalCard) {
            _context23.next = 6;
            break;
          }
          throw new Error('Card not found!');
        case 6:
          newCardData = _objectSpread(_objectSpread({}, originalCard), {}, {
            _id: new _mongodb2.ObjectId(),
            columnId: new _mongodb2.ObjectId(targetColumnId),
            title: originalCard.title,
            createdAt: Date.now(),
            updatedAt: null,
            totalComments: 0,
            // Clone checklists với ID mới và reset về false
            checklists: (originalCard.checklists || []).map(function (cl) {
              return _objectSpread(_objectSpread({}, cl), {}, {
                _id: new _mongodb2.ObjectId().toString(),
                items: (cl.items || []).map(function (item) {
                  return _objectSpread(_objectSpread({}, item), {}, {
                    _id: new _mongodb2.ObjectId().toString(),
                    isCompleted: false
                  });
                })
              });
            }),
            // Clone attachments
            attachments: (originalCard.attachments || []).map(function (att) {
              return _objectSpread(_objectSpread({}, att), {}, {
                createdAt: Date.now()
              });
            })
          });
          _context23.next = 9;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).insertOne(newCardData);
        case 9:
          result = _context23.sent;
          _context23.next = 12;
          return (0, _mongodb.GET_DB)().collection(CARD_COLLECTION_NAME).findOne({
            _id: result.insertedId
          });
        case 12:
          return _context23.abrupt("return", _context23.sent);
        case 15:
          _context23.prev = 15;
          _context23.t0 = _context23["catch"](0);
          throw new Error(_context23.t0);
        case 18:
        case "end":
          return _context23.stop();
      }
    }, _callee23, null, [[0, 15]]);
  }));
  return function duplicateCard(_x32, _x33) {
    return _ref23.apply(this, arguments);
  };
}();
var cardModel = {
  CARD_COLLECTION_NAME: CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA: CARD_COLLECTION_SCHEMA,
  createNew: createNew,
  findOneById: findOneById,
  update: update,
  deleteManyByColumnId: deleteManyByColumnId,
  deleteManyByBoardId: deleteManyByBoardId,
  updateMembers: updateMembers,
  incrementTotalComments: incrementTotalComments,
  decrementTotalComments: decrementTotalComments,
  pullLabelFromCards: pullLabelFromCards,
  pushNewAttachment: pushNewAttachment,
  pullAttachment: pullAttachment,
  pullCustomFieldValues: pullCustomFieldValues,
  deleteOneById: deleteOneById,
  updateManyCardsLayoutByColumnId: updateManyCardsLayoutByColumnId,
  archiveCard: archiveCard,
  archiveManyByColumnId: archiveManyByColumnId,
  getArchivedByBoardId: getArchivedByBoardId,
  restoreCard: restoreCard,
  restoreManyByColumnId: restoreManyByColumnId,
  saveAsTemplate: saveAsTemplate,
  getTemplatesByBoardId: getTemplatesByBoardId,
  useTemplate: useTemplate,
  deleteTemplate: deleteTemplate,
  duplicateCard: duplicateCard
};
exports.cardModel = cardModel;