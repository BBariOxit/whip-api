"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _mongodb = require("mongodb");
var _environment = require("../config/environment");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; } /**
 * Migration Script: Chuyển workspace từ schema cũ (ownerId + memberIds) sang schema mới (members array)
 * 
 * Chạy 1 lần duy nhất bằng: node -r @babel/register src/scripts/migrateWorkspaceRoles.js
 * 
 * Schema cũ:
 *   { ownerId: ObjectId, memberIds: [ObjectId, ...] }
 * 
 * Schema mới:
 *   { members: [{ userId: ObjectId, role: 'owner'|'admin'|'member', joinedAt: Number }, ...] }
 */
var MONGODB_URI = _environment.env.MONGODB_URI;
var DATABASE_NAME = _environment.env.DATABASE_NAME;
var migrate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var client, db, usersCollection, workspacesCollection, workspacesToMigrate, successCount, errorCount, _iterator, _step, ws, members, processedUserIds, ownerIdStr, user, _iterator2, _step2, memberId, memberIdStr, _user, _iterator3, _step3, member, _user2;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          console.log('🚀 Starting workspace RBAC migration...');
          client = new _mongodb.MongoClient(MONGODB_URI, {
            serverApi: {
              version: _mongodb.ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true
            }
          });
          _context.prev = 2;
          _context.next = 5;
          return client.connect();
        case 5:
          db = client.db(DATABASE_NAME);
          usersCollection = db.collection('users');
          workspacesCollection = db.collection('workspaces'); // Lấy tất cả workspace chưa migrate (có field ownerId)
          // HOẶC workspace đã migrate nhưng members thiếu email (để backfill email cho data cũ)
          _context.next = 10;
          return workspacesCollection.find({
            $or: [{
              ownerId: {
                $exists: true
              }
            }, {
              'members.email': {
                $exists: false
              }
            }]
          }).toArray();
        case 10:
          workspacesToMigrate = _context.sent;
          console.log("\uD83D\uDCCB Found ".concat(workspacesToMigrate.length, " workspace(s) to migrate or backfill."));
          if (!(workspacesToMigrate.length === 0)) {
            _context.next = 15;
            break;
          }
          console.log('✅ No workspaces need migration. All good!');
          return _context.abrupt("return");
        case 15:
          successCount = 0;
          errorCount = 0;
          _iterator = _createForOfIteratorHelper(workspacesToMigrate);
          _context.prev = 18;
          _iterator.s();
        case 20:
          if ((_step = _iterator.n()).done) {
            _context.next = 94;
            break;
          }
          ws = _step.value;
          _context.prev = 22;
          members = []; // Nếu workspace cũ (chưa migrate lần nào) thì lấy ownerId/memberIds
          // Nếu workspace đã migrate rồi nhưng thiếu email thì duyệt mảng members cũ
          if (!(ws.ownerId || ws.memberIds)) {
            _context.next = 58;
            break;
          }
          // TRƯỜNG HỢP 1: TỪ FLAT SCHEMA CŨ
          processedUserIds = new Set();
          if (!ws.ownerId) {
            _context.next = 33;
            break;
          }
          ownerIdStr = ws.ownerId.toString();
          _context.next = 30;
          return usersCollection.findOne({
            _id: ws.ownerId
          });
        case 30:
          user = _context.sent;
          members.push({
            userId: ws.ownerId,
            email: user ? user.email : 'unknown@example.com',
            role: 'owner',
            status: 'active',
            inviteToken: null,
            joinedAt: ws.createdAt || Date.now()
          });
          processedUserIds.add(ownerIdStr);
        case 33:
          if (!(ws.memberIds && Array.isArray(ws.memberIds))) {
            _context.next = 56;
            break;
          }
          _iterator2 = _createForOfIteratorHelper(ws.memberIds);
          _context.prev = 35;
          _iterator2.s();
        case 37:
          if ((_step2 = _iterator2.n()).done) {
            _context.next = 48;
            break;
          }
          memberId = _step2.value;
          memberIdStr = memberId.toString();
          if (processedUserIds.has(memberIdStr)) {
            _context.next = 46;
            break;
          }
          _context.next = 43;
          return usersCollection.findOne({
            _id: memberId
          });
        case 43:
          _user = _context.sent;
          members.push({
            userId: memberId,
            email: _user ? _user.email : 'unknown@example.com',
            role: 'member',
            status: 'active',
            inviteToken: null,
            joinedAt: ws.createdAt || Date.now()
          });
          processedUserIds.add(memberIdStr);
        case 46:
          _context.next = 37;
          break;
        case 48:
          _context.next = 53;
          break;
        case 50:
          _context.prev = 50;
          _context.t0 = _context["catch"](35);
          _iterator2.e(_context.t0);
        case 53:
          _context.prev = 53;
          _iterator2.f();
          return _context.finish(53);
        case 56:
          _context.next = 82;
          break;
        case 58:
          if (!(ws.members && Array.isArray(ws.members))) {
            _context.next = 82;
            break;
          }
          // TRƯỜNG HỢP 2: ĐÃ MIGRATE NHƯNG THIẾU EMAIL
          _iterator3 = _createForOfIteratorHelper(ws.members);
          _context.prev = 60;
          _iterator3.s();
        case 62:
          if ((_step3 = _iterator3.n()).done) {
            _context.next = 74;
            break;
          }
          member = _step3.value;
          if (!(member.userId && !member.email)) {
            _context.next = 71;
            break;
          }
          _context.next = 67;
          return usersCollection.findOne({
            _id: member.userId
          });
        case 67:
          _user2 = _context.sent;
          members.push(_objectSpread(_objectSpread({}, member), {}, {
            email: _user2 ? _user2.email : 'unknown@example.com',
            status: member.status || 'active',
            inviteToken: member.inviteToken || null
          }));
          _context.next = 72;
          break;
        case 71:
          members.push(_objectSpread(_objectSpread({}, member), {}, {
            status: member.status || 'active',
            inviteToken: member.inviteToken || null
          }));
        case 72:
          _context.next = 62;
          break;
        case 74:
          _context.next = 79;
          break;
        case 76:
          _context.prev = 76;
          _context.t1 = _context["catch"](60);
          _iterator3.e(_context.t1);
        case 79:
          _context.prev = 79;
          _iterator3.f();
          return _context.finish(79);
        case 82:
          _context.next = 84;
          return workspacesCollection.updateOne({
            _id: ws._id
          }, {
            $set: {
              members: members,
              updatedAt: Date.now()
            },
            $unset: {
              ownerId: '',
              memberIds: ''
            }
          });
        case 84:
          successCount++;
          console.log("  \u2705 Migrated workspace \"".concat(ws.title, "\" (").concat(ws._id, ") \u2014 ").concat(members.length, " member(s)"));
          _context.next = 92;
          break;
        case 88:
          _context.prev = 88;
          _context.t2 = _context["catch"](22);
          errorCount++;
          console.error("  \u274C Failed to migrate workspace \"".concat(ws.title, "\" (").concat(ws._id, "):"), _context.t2.message);
        case 92:
          _context.next = 20;
          break;
        case 94:
          _context.next = 99;
          break;
        case 96:
          _context.prev = 96;
          _context.t3 = _context["catch"](18);
          _iterator.e(_context.t3);
        case 99:
          _context.prev = 99;
          _iterator.f();
          return _context.finish(99);
        case 102:
          console.log("\n\uD83C\uDFC1 Migration complete: ".concat(successCount, " success, ").concat(errorCount, " failed."));
          _context.next = 108;
          break;
        case 105:
          _context.prev = 105;
          _context.t4 = _context["catch"](2);
          console.error('❌ Migration failed:', _context.t4);
        case 108:
          _context.prev = 108;
          _context.next = 111;
          return client.close();
        case 111:
          console.log('🔌 Database connection closed.');
          return _context.finish(108);
        case 113:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[2, 105, 108, 113], [18, 96, 99, 102], [22, 88], [35, 50, 53, 56], [60, 76, 79, 82]]);
  }));
  return function migrate() {
    return _ref.apply(this, arguments);
  };
}();
migrate();