"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/guests/route";
exports.ids = ["app/api/guests/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external?8dda":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external?3d59":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external?16bc":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fguests%2Froute&page=%2Fapi%2Fguests%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fguests%2Froute.ts&appDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fguests%2Froute&page=%2Fapi%2Fguests%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fguests%2Froute.ts&appDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Usu_rio_gemini_antigravity_playground_sidereal_void_app_api_guests_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/guests/route.ts */ \"(rsc)/./app/api/guests/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/guests/route\",\n        pathname: \"/api/guests\",\n        filename: \"route\",\n        bundlePath: \"app/api/guests/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Usuário\\\\.gemini\\\\antigravity\\\\playground\\\\sidereal-void\\\\app\\\\api\\\\guests\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Usu_rio_gemini_antigravity_playground_sidereal_void_app_api_guests_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/guests/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZndWVzdHMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmd1ZXN0cyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmd1ZXN0cyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNVc3UlQzMlQTFyaW8lNUMuZ2VtaW5pJTVDYW50aWdyYXZpdHklNUNwbGF5Z3JvdW5kJTVDc2lkZXJlYWwtdm9pZCU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDVXN1JUMzJUExcmlvJTVDLmdlbWluaSU1Q2FudGlncmF2aXR5JTVDcGxheWdyb3VuZCU1Q3NpZGVyZWFsLXZvaWQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQytDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2FzYS1vbGl2ZWlyYS8/NTI2YiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxVc3XDoXJpb1xcXFwuZ2VtaW5pXFxcXGFudGlncmF2aXR5XFxcXHBsYXlncm91bmRcXFxcc2lkZXJlYWwtdm9pZFxcXFxhcHBcXFxcYXBpXFxcXGd1ZXN0c1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvZ3Vlc3RzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZ3Vlc3RzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9ndWVzdHMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxVc3XDoXJpb1xcXFwuZ2VtaW5pXFxcXGFudGlncmF2aXR5XFxcXHBsYXlncm91bmRcXFxcc2lkZXJlYWwtdm9pZFxcXFxhcHBcXFxcYXBpXFxcXGd1ZXN0c1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvZ3Vlc3RzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fguests%2Froute&page=%2Fapi%2Fguests%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fguests%2Froute.ts&appDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/guests/route.ts":
/*!*********************************!*\
  !*** ./app/api/guests/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth_options__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth/options */ \"(rsc)/./lib/auth/options.ts\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n\n\n\n\nasync function GET() {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth_options__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || session.user.role !== \"ADMIN\") {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"N\\xe3o autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const guests = await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.guest.findMany({\n            include: {\n                _count: {\n                    select: {\n                        reservations: true\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: \"desc\"\n            }\n        });\n        // Mapeia para um formato mais amigável\n        const formattedGuests = guests.map((g)=>({\n                ...g,\n                stays: g._count.reservations\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(formattedGuests);\n    } catch (error) {\n        console.error(\"Erro ao buscar h\\xf3spedes\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro interno\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(req) {\n    try {\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth_options__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || session.user.role !== \"ADMIN\") {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"N\\xe3o autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const body = await req.json();\n        const { name, email, phone, isVip, notes } = body;\n        if (!name || !email) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Nome e e-mail s\\xe3o obrigat\\xf3rios\"\n            }, {\n                status: 400\n            });\n        }\n        const guest = await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.guest.create({\n            data: {\n                name,\n                email,\n                phone: phone || \"\",\n                isVip: !!isVip,\n                notes: notes || \"\"\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(guest);\n    } catch (error) {\n        console.error(\"Erro ao criar h\\xf3spede\", error);\n        if (error.code === \"P2002\") {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Este e-mail j\\xe1 est\\xe1 cadastrado\"\n            }, {\n                status: 400\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro interno\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2d1ZXN0cy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBMkM7QUFDTztBQUNEO0FBQ25CO0FBRXZCLGVBQWVJO0lBQ2xCLElBQUk7UUFDQSxNQUFNQyxVQUFVLE1BQU1KLGdFQUFnQkEsQ0FBQ0MsMERBQVdBO1FBRWxELElBQUksQ0FBQ0csV0FBVyxRQUFTQyxJQUFJLENBQVNDLElBQUksS0FBSyxTQUFTO1lBQ3BELE9BQU9QLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBaUIsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3hFO1FBRUEsTUFBTUMsU0FBUyxNQUFNUix1Q0FBRUEsQ0FBQ1MsS0FBSyxDQUFDQyxRQUFRLENBQUM7WUFDbkNDLFNBQVM7Z0JBQ0xDLFFBQVE7b0JBQ0pDLFFBQVE7d0JBQUVDLGNBQWM7b0JBQUs7Z0JBQ2pDO1lBQ0o7WUFDQUMsU0FBUztnQkFDTEMsV0FBVztZQUNmO1FBQ0o7UUFFQSx1Q0FBdUM7UUFDdkMsTUFBTUMsa0JBQWtCVCxPQUFPVSxHQUFHLENBQUNDLENBQUFBLElBQU07Z0JBQ3JDLEdBQUdBLENBQUM7Z0JBQ0pDLE9BQU9ELEVBQUVQLE1BQU0sQ0FBQ0UsWUFBWTtZQUNoQztRQUVBLE9BQU9qQixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDWTtJQUM3QixFQUFFLE9BQU9YLE9BQU87UUFDWmUsUUFBUWYsS0FBSyxDQUFDLDhCQUEyQkE7UUFDekMsT0FBT1QscURBQVlBLENBQUNRLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQWUsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDdEU7QUFDSjtBQUVPLGVBQWVlLEtBQUtDLEdBQVk7SUFDbkMsSUFBSTtRQUNBLE1BQU1yQixVQUFVLE1BQU1KLGdFQUFnQkEsQ0FBQ0MsMERBQVdBO1FBRWxELElBQUksQ0FBQ0csV0FBVyxRQUFTQyxJQUFJLENBQVNDLElBQUksS0FBSyxTQUFTO1lBQ3BELE9BQU9QLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBaUIsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3hFO1FBRUEsTUFBTWlCLE9BQU8sTUFBTUQsSUFBSWxCLElBQUk7UUFDM0IsTUFBTSxFQUFFb0IsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUUsR0FBR0w7UUFFN0MsSUFBSSxDQUFDQyxRQUFRLENBQUNDLE9BQU87WUFDakIsT0FBTzdCLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBaUMsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3hGO1FBRUEsTUFBTUUsUUFBUSxNQUFNVCx1Q0FBRUEsQ0FBQ1MsS0FBSyxDQUFDcUIsTUFBTSxDQUFDO1lBQ2hDQyxNQUFNO2dCQUNGTjtnQkFDQUM7Z0JBQ0FDLE9BQU9BLFNBQVM7Z0JBQ2hCQyxPQUFPLENBQUMsQ0FBQ0E7Z0JBQ1RDLE9BQU9BLFNBQVM7WUFDcEI7UUFDSjtRQUVBLE9BQU9oQyxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDSTtJQUM3QixFQUFFLE9BQU9ILE9BQVk7UUFDakJlLFFBQVFmLEtBQUssQ0FBQyw0QkFBeUJBO1FBRXZDLElBQUlBLE1BQU0wQixJQUFJLEtBQUssU0FBUztZQUN4QixPQUFPbkMscURBQVlBLENBQUNRLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFpQyxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDeEY7UUFFQSxPQUFPVixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBZSxHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN0RTtBQUNKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2FzYS1vbGl2ZWlyYS8uL2FwcC9hcGkvZ3Vlc3RzL3JvdXRlLnRzP2M5YzciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XHJcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tIFwibmV4dC1hdXRoL25leHRcIjtcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aC9vcHRpb25zXCI7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSBcIkAvbGliL2RiXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmICghc2Vzc2lvbiB8fCAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZSAhPT0gXCJBRE1JTlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIk7Do28gYXV0b3JpemFkb1wiIH0sIHsgc3RhdHVzOiA0MDEgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBndWVzdHMgPSBhd2FpdCBkYi5ndWVzdC5maW5kTWFueSh7XHJcbiAgICAgICAgICAgIGluY2x1ZGU6IHtcclxuICAgICAgICAgICAgICAgIF9jb3VudDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdDogeyByZXNlcnZhdGlvbnM6IHRydWUgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvcmRlckJ5OiB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6ICdkZXNjJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIE1hcGVpYSBwYXJhIHVtIGZvcm1hdG8gbWFpcyBhbWlnw6F2ZWxcclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRHdWVzdHMgPSBndWVzdHMubWFwKGcgPT4gKHtcclxuICAgICAgICAgICAgLi4uZyxcclxuICAgICAgICAgICAgc3RheXM6IGcuX2NvdW50LnJlc2VydmF0aW9uc1xyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGZvcm1hdHRlZEd1ZXN0cyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGJ1c2NhciBow7NzcGVkZXNcIiwgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkVycm8gaW50ZXJub1wiIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmICghc2Vzc2lvbiB8fCAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZSAhPT0gXCJBRE1JTlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIk7Do28gYXV0b3JpemFkb1wiIH0sIHsgc3RhdHVzOiA0MDEgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTtcclxuICAgICAgICBjb25zdCB7IG5hbWUsIGVtYWlsLCBwaG9uZSwgaXNWaXAsIG5vdGVzIH0gPSBib2R5O1xyXG5cclxuICAgICAgICBpZiAoIW5hbWUgfHwgIWVtYWlsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIk5vbWUgZSBlLW1haWwgc8OjbyBvYnJpZ2F0w7NyaW9zXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1ZXN0ID0gYXdhaXQgZGIuZ3Vlc3QuY3JlYXRlKHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgIGVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6IHBob25lIHx8IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpc1ZpcDogISFpc1ZpcCxcclxuICAgICAgICAgICAgICAgIG5vdGVzOiBub3RlcyB8fCBcIlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGd1ZXN0KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJybyBhbyBjcmlhciBow7NzcGVkZVwiLCBlcnJvcik7XHJcblxyXG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnUDIwMDInKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkVzdGUgZS1tYWlsIGrDoSBlc3TDoSBjYWRhc3RyYWRvXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkVycm8gaW50ZXJub1wiIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsImRiIiwiR0VUIiwic2Vzc2lvbiIsInVzZXIiLCJyb2xlIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiZ3Vlc3RzIiwiZ3Vlc3QiLCJmaW5kTWFueSIsImluY2x1ZGUiLCJfY291bnQiLCJzZWxlY3QiLCJyZXNlcnZhdGlvbnMiLCJvcmRlckJ5IiwiY3JlYXRlZEF0IiwiZm9ybWF0dGVkR3Vlc3RzIiwibWFwIiwiZyIsInN0YXlzIiwiY29uc29sZSIsIlBPU1QiLCJyZXEiLCJib2R5IiwibmFtZSIsImVtYWlsIiwicGhvbmUiLCJpc1ZpcCIsIm5vdGVzIiwiY3JlYXRlIiwiZGF0YSIsImNvZGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/guests/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth/options.ts":
/*!*****************************!*\
  !*** ./lib/auth/options.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_facebook__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/facebook */ \"(rsc)/./node_modules/next-auth/providers/facebook.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n\n\n\n\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_lib_db__WEBPACK_IMPORTED_MODULE_3__.db),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        }),\n        (0,next_auth_providers_facebook__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.FACEBOOK_CLIENT_ID,\n            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    pages: {\n        signIn: \"/auth/login\"\n    },\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n            } else if (!token.role) {\n                // Se não estiver no token mas já estiver logado, busca no banco para garantir\n                const dbUser = await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.user.findUnique({\n                    where: {\n                        id: token.id\n                    }\n                });\n                if (dbUser) {\n                    token.role = dbUser.role;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    },\n    events: {\n        async signIn ({ user }) {\n            if (user.email) {\n                // Busca o hóspede no CRM pelo e-mail\n                const guest = await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.guest.findUnique({\n                    where: {\n                        email: user.email\n                    }\n                });\n                if (guest) {\n                    // Já existe no CRM, vincula ao novo ID de usuário\n                    await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.guest.update({\n                        where: {\n                            id: guest.id\n                        },\n                        data: {\n                            userId: user.id\n                        }\n                    });\n                } else {\n                    // Não existe no CRM, cria um novo\n                    await _lib_db__WEBPACK_IMPORTED_MODULE_3__.db.guest.create({\n                        data: {\n                            name: user.name || \"H\\xf3spede\",\n                            email: user.email,\n                            phone: \"\",\n                            userId: user.id\n                        }\n                    });\n                }\n            }\n        }\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC9vcHRpb25zLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQXFEO0FBRUc7QUFDSTtBQUM5QjtBQUV2QixNQUFNSSxjQUErQjtJQUN4Q0MsU0FBU0wsbUVBQWFBLENBQUNHLHVDQUFFQTtJQUN6QkcsV0FBVztRQUNQTCxzRUFBY0EsQ0FBQztZQUNYTSxVQUFVQyxRQUFRQyxHQUFHLENBQUNDLGdCQUFnQjtZQUN0Q0MsY0FBY0gsUUFBUUMsR0FBRyxDQUFDRyxvQkFBb0I7WUFDOUNDLG1DQUFtQztRQUN2QztRQUNBWCx3RUFBZ0JBLENBQUM7WUFDYkssVUFBVUMsUUFBUUMsR0FBRyxDQUFDSyxrQkFBa0I7WUFDeENILGNBQWNILFFBQVFDLEdBQUcsQ0FBQ00sc0JBQXNCO1lBQ2hERixtQ0FBbUM7UUFDdkM7S0FDSDtJQUNERyxPQUFPO1FBQ0hDLFFBQVE7SUFDWjtJQUNBQyxTQUFTO1FBQ0xDLFVBQVU7SUFDZDtJQUNBQyxXQUFXO1FBQ1AsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRTtZQUNyQixJQUFJQSxNQUFNO2dCQUNORCxNQUFNRSxFQUFFLEdBQUdELEtBQUtDLEVBQUU7Z0JBQ2xCRixNQUFNRyxJQUFJLEdBQUcsS0FBY0EsSUFBSTtZQUNuQyxPQUFPLElBQUksQ0FBQ0gsTUFBTUcsSUFBSSxFQUFFO2dCQUNwQiw4RUFBOEU7Z0JBQzlFLE1BQU1DLFNBQVMsTUFBTXZCLHVDQUFFQSxDQUFDb0IsSUFBSSxDQUFDSSxVQUFVLENBQUM7b0JBQ3BDQyxPQUFPO3dCQUFFSixJQUFJRixNQUFNRSxFQUFFO29CQUFXO2dCQUNwQztnQkFDQSxJQUFJRSxRQUFRO29CQUNSSixNQUFNRyxJQUFJLEdBQUdDLE9BQU9ELElBQUk7Z0JBQzVCO1lBQ0o7WUFDQSxPQUFPSDtRQUNYO1FBQ0EsTUFBTUosU0FBUSxFQUFFQSxPQUFPLEVBQUVJLEtBQUssRUFBRTtZQUM1QixJQUFJSixRQUFRSyxJQUFJLEVBQUU7Z0JBQ2JMLFFBQVFLLElBQUksQ0FBU0MsRUFBRSxHQUFHRixNQUFNRSxFQUFFO2dCQUNsQ04sUUFBUUssSUFBSSxDQUFTRSxJQUFJLEdBQUdILE1BQU1HLElBQUk7WUFDM0M7WUFDQSxPQUFPUDtRQUNYO0lBQ0o7SUFDQVcsUUFBUTtRQUNKLE1BQU1aLFFBQU8sRUFBRU0sSUFBSSxFQUFFO1lBQ2pCLElBQUlBLEtBQUtPLEtBQUssRUFBRTtnQkFDWixxQ0FBcUM7Z0JBQ3JDLE1BQU1DLFFBQVEsTUFBTTVCLHVDQUFFQSxDQUFDNEIsS0FBSyxDQUFDSixVQUFVLENBQUM7b0JBQ3BDQyxPQUFPO3dCQUFFRSxPQUFPUCxLQUFLTyxLQUFLO29CQUFDO2dCQUMvQjtnQkFFQSxJQUFJQyxPQUFPO29CQUNQLGtEQUFrRDtvQkFDbEQsTUFBTTVCLHVDQUFFQSxDQUFDNEIsS0FBSyxDQUFDQyxNQUFNLENBQUM7d0JBQ2xCSixPQUFPOzRCQUFFSixJQUFJTyxNQUFNUCxFQUFFO3dCQUFDO3dCQUN0QlMsTUFBTTs0QkFBRUMsUUFBUVgsS0FBS0MsRUFBRTt3QkFBQztvQkFDNUI7Z0JBQ0osT0FBTztvQkFDSCxrQ0FBa0M7b0JBQ2xDLE1BQU1yQix1Q0FBRUEsQ0FBQzRCLEtBQUssQ0FBQ0ksTUFBTSxDQUFDO3dCQUNsQkYsTUFBTTs0QkFDRkcsTUFBTWIsS0FBS2EsSUFBSSxJQUFJOzRCQUNuQk4sT0FBT1AsS0FBS08sS0FBSzs0QkFDakJPLE9BQU87NEJBQ1BILFFBQVFYLEtBQUtDLEVBQUU7d0JBQ25CO29CQUNKO2dCQUNKO1lBQ0o7UUFDSjtJQUNKO0lBQ0FjLFFBQVE5QixRQUFRQyxHQUFHLENBQUM4QixlQUFlO0FBQ3ZDLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYXNhLW9saXZlaXJhLy4vbGliL2F1dGgvb3B0aW9ucy50cz9jNDhlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tIFwiQGF1dGgvcHJpc21hLWFkYXB0ZXJcIjtcclxuaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSBcIm5leHQtYXV0aFwiO1xyXG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XHJcbmltcG9ydCBGYWNlYm9va1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2ZhY2Vib29rXCI7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSBcIkAvbGliL2RiXCI7XHJcblxyXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcclxuICAgIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIoZGIpIGFzIGFueSxcclxuICAgIHByb3ZpZGVyczogW1xyXG4gICAgICAgIEdvb2dsZVByb3ZpZGVyKHtcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQhLFxyXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUISxcclxuICAgICAgICAgICAgYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nOiB0cnVlLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIEZhY2Vib29rUHJvdmlkZXIoe1xyXG4gICAgICAgICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuRkFDRUJPT0tfQ0xJRU5UX0lEISxcclxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5GQUNFQk9PS19DTElFTlRfU0VDUkVUISxcclxuICAgICAgICAgICAgYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nOiB0cnVlLFxyXG4gICAgICAgIH0pLFxyXG4gICAgXSxcclxuICAgIHBhZ2VzOiB7XHJcbiAgICAgICAgc2lnbkluOiAnL2F1dGgvbG9naW4nLFxyXG4gICAgfSxcclxuICAgIHNlc3Npb246IHtcclxuICAgICAgICBzdHJhdGVneTogXCJqd3RcIixcclxuICAgIH0sXHJcbiAgICBjYWxsYmFja3M6IHtcclxuICAgICAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XHJcbiAgICAgICAgICAgICAgICB0b2tlbi5yb2xlID0gKHVzZXIgYXMgYW55KS5yb2xlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0b2tlbi5yb2xlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZSBuw6NvIGVzdGl2ZXIgbm8gdG9rZW4gbWFzIGrDoSBlc3RpdmVyIGxvZ2FkbywgYnVzY2Egbm8gYmFuY28gcGFyYSBnYXJhbnRpclxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGJVc2VyID0gYXdhaXQgZGIudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICAgICAgICAgICAgICB3aGVyZTogeyBpZDogdG9rZW4uaWQgYXMgc3RyaW5nIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRiVXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLnJvbGUgPSBkYlVzZXIucm9sZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xyXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi51c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkuaWQgPSB0b2tlbi5pZDtcclxuICAgICAgICAgICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5yb2xlID0gdG9rZW4ucm9sZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2Vzc2lvbjtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIgfSkge1xyXG4gICAgICAgICAgICBpZiAodXNlci5lbWFpbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVzY2EgbyBow7NzcGVkZSBubyBDUk0gcGVsbyBlLW1haWxcclxuICAgICAgICAgICAgICAgIGNvbnN0IGd1ZXN0ID0gYXdhaXQgZGIuZ3Vlc3QuZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hlcmU6IHsgZW1haWw6IHVzZXIuZW1haWwgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGd1ZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSsOhIGV4aXN0ZSBubyBDUk0sIHZpbmN1bGEgYW8gbm92byBJRCBkZSB1c3XDoXJpb1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGRiLmd1ZXN0LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBndWVzdC5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IHVzZXJJZDogdXNlci5pZCB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE7Do28gZXhpc3RlIG5vIENSTSwgY3JpYSB1bSBub3ZvXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGIuZ3Vlc3QuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lIHx8IFwiSMOzc3BlZGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXIuaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxyXG59O1xyXG4iXSwibmFtZXMiOlsiUHJpc21hQWRhcHRlciIsIkdvb2dsZVByb3ZpZGVyIiwiRmFjZWJvb2tQcm92aWRlciIsImRiIiwiYXV0aE9wdGlvbnMiLCJhZGFwdGVyIiwicHJvdmlkZXJzIiwiY2xpZW50SWQiLCJwcm9jZXNzIiwiZW52IiwiR09PR0xFX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwiYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nIiwiRkFDRUJPT0tfQ0xJRU5UX0lEIiwiRkFDRUJPT0tfQ0xJRU5UX1NFQ1JFVCIsInBhZ2VzIiwic2lnbkluIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJ1c2VyIiwiaWQiLCJyb2xlIiwiZGJVc2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiZXZlbnRzIiwiZW1haWwiLCJndWVzdCIsInVwZGF0ZSIsImRhdGEiLCJ1c2VySWQiLCJjcmVhdGUiLCJuYW1lIiwicGhvbmUiLCJzZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth/options.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   db: () => (/* binding */ db)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prismaClientSingleton = ()=>{\n    return new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\n};\nconst db = globalThis.prismaGlobal ?? prismaClientSingleton();\nif (true) globalThis.prismaGlobal = db;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZDO0FBRTdDLE1BQU1DLHdCQUF3QjtJQUMxQixPQUFPLElBQUlELHdEQUFZQTtBQUMzQjtBQU1PLE1BQU1FLEtBQUtDLFdBQVdDLFlBQVksSUFBSUgsd0JBQXVCO0FBRXBFLElBQUlJLElBQXlCLEVBQWNGLFdBQVdDLFlBQVksR0FBR0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYXNhLW9saXZlaXJhLy4vbGliL2RiLnRzPzFkZjAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXHJcblxyXG5jb25zdCBwcmlzbWFDbGllbnRTaW5nbGV0b24gPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByaXNtYUNsaWVudCgpXHJcbn1cclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIHZhciBwcmlzbWFHbG9iYWw6IHVuZGVmaW5lZCB8IFJldHVyblR5cGU8dHlwZW9mIHByaXNtYUNsaWVudFNpbmdsZXRvbj5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRiID0gZ2xvYmFsVGhpcy5wcmlzbWFHbG9iYWwgPz8gcHJpc21hQ2xpZW50U2luZ2xldG9uKClcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxUaGlzLnByaXNtYUdsb2JhbCA9IGRiXHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWFDbGllbnRTaW5nbGV0b24iLCJkYiIsImdsb2JhbFRoaXMiLCJwcmlzbWFHbG9iYWwiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/@auth","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fguests%2Froute&page=%2Fapi%2Fguests%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fguests%2Froute.ts&appDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CUsu%C3%A1rio%5C.gemini%5Cantigravity%5Cplayground%5Csidereal-void&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();