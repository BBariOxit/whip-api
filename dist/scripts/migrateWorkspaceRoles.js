"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _mongodb = require("mongodb");
var _environment = require("../config/environment");
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
    var client, db, workspacesCollection, oldWorkspaces, successCount, errorCount, _iterator, _step, ws, members, processedUserIds, ownerIdStr, _iterator2, _step2, memberId, memberIdStr;
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
          workspacesCollection = db.collection('workspaces'); // Lấy tất cả workspace có schema cũ (có field ownerId)
          _context.next = 9;
          return workspacesCollection.find({
            ownerId: {
              $exists: true
            }
          }).toArray();
        case 9:
          oldWorkspaces = _context.sent;
          console.log("\uD83D\uDCCB Found ".concat(oldWorkspaces.length, " workspace(s) to migrate."));
          if (!(oldWorkspaces.length === 0)) {
            _context.next = 14;
            break;
          }
          console.log('✅ No workspaces need migration. All good!');
          return _context.abrupt("return");
        case 14:
          successCount = 0;
          errorCount = 0;
          _iterator = _createForOfIteratorHelper(oldWorkspaces);
          _context.prev = 17;
          _iterator.s();
        case 19:
          if ((_step = _iterator.n()).done) {
            _context.next = 38;
            break;
          }
          ws = _step.value;
          _context.prev = 21;
          members = [];
          processedUserIds = new Set(); // 1. Owner → role: 'owner'
          if (ws.ownerId) {
            ownerIdStr = ws.ownerId.toString();
            members.push({
              userId: ws.ownerId,
              role: 'owner',
              joinedAt: ws.createdAt || Date.now()
            });
            processedUserIds.add(ownerIdStr);
          }

          // 2. memberIds (trừ owner) → role: 'member'
          if (ws.memberIds && Array.isArray(ws.memberIds)) {
            _iterator2 = _createForOfIteratorHelper(ws.memberIds);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                memberId = _step2.value;
                memberIdStr = memberId.toString();
                if (!processedUserIds.has(memberIdStr)) {
                  members.push({
                    userId: memberId,
                    role: 'member',
                    joinedAt: ws.createdAt || Date.now()
                  });
                  processedUserIds.add(memberIdStr);
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }

          // 3. Update document: set members, unset ownerId + memberIds
          _context.next = 28;
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
        case 28:
          successCount++;
          console.log("  \u2705 Migrated workspace \"".concat(ws.title, "\" (").concat(ws._id, ") \u2014 ").concat(members.length, " member(s)"));
          _context.next = 36;
          break;
        case 32:
          _context.prev = 32;
          _context.t0 = _context["catch"](21);
          errorCount++;
          console.error("  \u274C Failed to migrate workspace \"".concat(ws.title, "\" (").concat(ws._id, "):"), _context.t0.message);
        case 36:
          _context.next = 19;
          break;
        case 38:
          _context.next = 43;
          break;
        case 40:
          _context.prev = 40;
          _context.t1 = _context["catch"](17);
          _iterator.e(_context.t1);
        case 43:
          _context.prev = 43;
          _iterator.f();
          return _context.finish(43);
        case 46:
          console.log("\n\uD83C\uDFC1 Migration complete: ".concat(successCount, " success, ").concat(errorCount, " failed."));
          _context.next = 52;
          break;
        case 49:
          _context.prev = 49;
          _context.t2 = _context["catch"](2);
          console.error('❌ Migration failed:', _context.t2);
        case 52:
          _context.prev = 52;
          _context.next = 55;
          return client.close();
        case 55:
          console.log('🔌 Database connection closed.');
          return _context.finish(52);
        case 57:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[2, 49, 52, 57], [17, 40, 43, 46], [21, 32]]);
  }));
  return function migrate() {
    return _ref.apply(this, arguments);
  };
}();
migrate();