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
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var MONGODB_URI = _environment.env.MONGODB_URI;
var DATABASE_NAME = _environment.env.DATABASE_NAME;
var migrate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var client, db, workspacesCollection, workspaces, count, _iterator, _step, _loop;
    return _regenerator["default"].wrap(function _callee$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          console.log('🚀 Starting backfill status migration...');
          client = new _mongodb.MongoClient(MONGODB_URI, {
            serverApi: {
              version: _mongodb.ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true
            }
          });
          _context2.prev = 2;
          _context2.next = 5;
          return client.connect();
        case 5:
          db = client.db(DATABASE_NAME);
          workspacesCollection = db.collection('workspaces');
          _context2.next = 9;
          return workspacesCollection.find({}).toArray();
        case 9:
          workspaces = _context2.sent;
          count = 0;
          _iterator = _createForOfIteratorHelper(workspaces);
          _context2.prev = 12;
          _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
            var ws, changed, updatedMembers;
            return _regenerator["default"].wrap(function _loop$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  ws = _step.value;
                  if (!ws.members) {
                    _context.next = 9;
                    break;
                  }
                  changed = false;
                  updatedMembers = ws.members.map(function (m) {
                    if (!m.status) {
                      changed = true;
                      return _objectSpread(_objectSpread({}, m), {}, {
                        status: 'active'
                      });
                    }
                    return m;
                  });
                  if (!changed) {
                    _context.next = 9;
                    break;
                  }
                  _context.next = 7;
                  return workspacesCollection.updateOne({
                    _id: ws._id
                  }, {
                    $set: {
                      members: updatedMembers
                    }
                  });
                case 7:
                  count++;
                  console.log("Updated workspace ".concat(ws._id));
                case 9:
                case "end":
                  return _context.stop();
              }
            }, _loop);
          });
          _iterator.s();
        case 15:
          if ((_step = _iterator.n()).done) {
            _context2.next = 19;
            break;
          }
          return _context2.delegateYield(_loop(), "t0", 17);
        case 17:
          _context2.next = 15;
          break;
        case 19:
          _context2.next = 24;
          break;
        case 21:
          _context2.prev = 21;
          _context2.t1 = _context2["catch"](12);
          _iterator.e(_context2.t1);
        case 24:
          _context2.prev = 24;
          _iterator.f();
          return _context2.finish(24);
        case 27:
          console.log("\uD83C\uDFC1 Migration complete: Updated ".concat(count, " workspaces."));
          _context2.next = 33;
          break;
        case 30:
          _context2.prev = 30;
          _context2.t2 = _context2["catch"](2);
          console.error('❌ Migration failed:', _context2.t2);
        case 33:
          _context2.prev = 33;
          _context2.next = 36;
          return client.close();
        case 36:
          return _context2.finish(33);
        case 37:
        case "end":
          return _context2.stop();
      }
    }, _callee, null, [[2, 30, 33, 37], [12, 21, 24, 27]]);
  }));
  return function migrate() {
    return _ref.apply(this, arguments);
  };
}();
migrate();