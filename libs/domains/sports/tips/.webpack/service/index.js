/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../adapters/tips-adapter/index.ts":
/*!***********************************************!*\
  !*** ../../../adapters/tips-adapter/index.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TipsAdapter)
/* harmony export */ });
/* harmony import */ var _clients_betapi_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../clients/betapi-client */ "../../../clients/betapi-client/index.ts");

class TipsAdapter {
    async getTips() {
        // const matchStatFile = await new S3ClientCustom().getFile('tennis-matchstat', 'matchstat.html')
        // const matchStatHtml = parse(matchStatFile)
        // const predictions = matchStatHtml.getElementsByTagName('div').filter(div => div.attributes.class === 'prediction-table-container')
        // console.log('>>>>>predictions>>>', predictions.length)
        // predictions.forEach(pred => {
        //   const pName = pred.querySelector('.player-name-pt');
        //   console.log('>>>>name>>>>', pName.text)
        //   const aOdds = pred.querySelector('a');
        //   console.log('>>>>odds>>>>', aOdds.text.replaceAll(/\s/g,''))
        //   const predPercentage = pred.querySelector('.prediction-item.item-border');
        //   console.log('>>>>odds>>>>', predPercentage.text.replaceAll(/\s/g,'').replaceAll(/\%/g,''))
        // })
        new _clients_betapi_client__WEBPACK_IMPORTED_MODULE_0__["default"]().getEvents();
        return 'success';
    }
}


/***/ }),

/***/ "../../../clients/betapi-client/index.ts":
/*!***********************************************!*\
  !*** ../../../clients/betapi-client/index.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BetapiClient)
/* harmony export */ });
/* harmony import */ var _src_parsers_pagingParser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/parsers/pagingParser */ "../../../clients/betapi-client/src/parsers/pagingParser.ts");
/* harmony import */ var _http_api_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../http-api-client */ "../../../clients/http-api-client/index.ts");


class BetapiClient {
    constructor() {
    }
    async getEvents() {
        const httpApiClient = new _http_api_client__WEBPACK_IMPORTED_MODULE_1__["default"]();
        const result = await httpApiClient.get('https://api.b365api.com', '/v1/bet365/upcoming?sport_id=13&token=196561-yXe5Z8ulO9UAvk&day=20240703');
        const paging = _src_parsers_pagingParser__WEBPACK_IMPORTED_MODULE_0__["default"].parse(result.value['pager']);
        const numberOfPageTurn = Math.floor(paging.total / paging.perPage);
        console.log('>>>>>numberOfPageTurn');
        console.log(numberOfPageTurn);
        return [];
    }
}


/***/ }),

/***/ "../../../clients/betapi-client/src/parsers/pagingParser.ts":
/*!******************************************************************!*\
  !*** ../../../clients/betapi-client/src/parsers/pagingParser.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PagingParser)
/* harmony export */ });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);

class PagingParser {
    static parse(pager) {
        return {
            page: lodash__WEBPACK_IMPORTED_MODULE_0___default().get(pager, 'page', 0),
            perPage: lodash__WEBPACK_IMPORTED_MODULE_0___default().get(pager, 'per_page', 0),
            total: lodash__WEBPACK_IMPORTED_MODULE_0___default().get(pager, 'total', 0),
        };
    }
}


/***/ }),

/***/ "../../../clients/http-api-client/index.ts":
/*!*************************************************!*\
  !*** ../../../clients/http-api-client/index.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HttpApiClient)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "axios");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

class HttpApiClient {
    constructor() { }
    async get(baseUrl, path, headers, params = {}) {
        let axiosResponse;
        let response = {
            value: null,
            status: null,
            statusText: null,
            hasValue: false,
            hasError: false,
            errorText: null,
        };
        axiosResponse = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(baseUrl + path, { headers, params });
        response.status = axiosResponse.status;
        response.value = axiosResponse.data;
        response.hasValue = axiosResponse.data !== undefined && axiosResponse.data !== null;
        return response;
    }
}


/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("lodash");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getLatestTips: () => (/* binding */ getLatestTips)
/* harmony export */ });
/* harmony import */ var _abcfinite_tips_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @abcfinite/tips-adapter */ "../../../adapters/tips-adapter/index.ts");

const getLatestTips = async (event) => {
    const result = await new _abcfinite_tips_adapter__WEBPACK_IMPORTED_MODULE_0__["default"]().getTips();
    const response = {
        statusCode: 200,
        body: JSON.stringify(result, null, 2),
    };
    return new Promise((resolve) => {
        resolve(response);
    });
};

})();

module.exports = __webpack_exports__;
/******/ })()
;