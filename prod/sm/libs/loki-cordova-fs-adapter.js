"use strict";var _createClass=function(){function e(e,o){for(var r in o){var t=o[r];t.configurable=!0,t.value&&(t.writable=!0)}Object.defineProperties(e,o)}return function(o,r,t){return r&&e(o.prototype,r),t&&e(o,t),o}}(),_inherits=function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Super expression must either be null or a function, not "+typeof o);e.prototype=Object.create(o&&o.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),o&&(e.__proto__=o)},_classCallCheck=function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")},LokiCordovaFSAdapterError=function(e){function o(){_classCallCheck(this,o),null!=e&&e.apply(this,arguments)}return _inherits(o,e),o}(Error),TAG="[LokiCordovaFSAdapter]",LokiCordovaFSAdapter=function(){function e(o){_classCallCheck(this,e),this.options=o}return _createClass(e,{saveDatabase:{value:function(e,o,r){var t=this;this._getFile(e,function(e){e.createWriter(function(e){e.onwriteend=function(){if(0===e.length){var n=t._createBlob(o,"text/plain");e.write(n),r()}},e.truncate(0)},function(e){throw new LokiCordovaFSAdapterError("Unable to write file"+JSON.stringify(e))})},function(e){throw new LokiCordovaFSAdapterError("Unable to get file"+JSON.stringify(e))})}},loadDatabase:{value:function(e,o){this._getFile(e,function(e){e.file(function(e){var r=new FileReader;r.onloadend=function(e){var r=e.target.result;o(0===r.length?null:r)},r.readAsText(e)},function(e){o(new LokiCordovaFSAdapterError("Unable to read file"+e.message))})},function(e){o(new LokiCordovaFSAdapterError("Unable to get file: "+e.message))})}},deleteDatabase:{value:function(e,o){var r=this;window.resolveLocalFileSystemURL(cordova.file.dataDirectory,function(t){var n=r.options.prefix+"__"+e;t.getFile(n,{create:!0},function(e){e.remove(function(){o()},function(e){throw new LokiCordovaFSAdapterError("Unable delete file"+JSON.stringify(e))})},function(e){throw new LokiCordovaFSAdapterError("Unable delete database"+JSON.stringify(e))})},function(e){throw new LokiCordovaFSAdapterError("Unable to resolve local file system URL"+JSON.stringify(e))})}},_getFile:{value:function(e,o,r){var t=this;window.resolveLocalFileSystemURL(cordova.file.dataDirectory,function(n){var i=t.options.prefix+"__"+e;n.getFile(i,{create:!0},o,r)},function(e){throw new LokiCordovaFSAdapterError("Unable to resolve local file system URL"+JSON.stringify(e))})}},_createBlob:{value:function(e,o){var r=void 0;try{r=new Blob([e],{type:o})}catch(t){if(window.BlobBuilder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,"TypeError"===t.name&&window.BlobBuilder){var n=new window.BlobBuilder;n.append(e),r=n.getBlob(o)}else{if("InvalidStateError"!==t.name)throw new LokiCordovaFSAdapterError("Unable to create blob"+JSON.stringify(t));r=new Blob([e],{type:o})}}return r}}}),e}();