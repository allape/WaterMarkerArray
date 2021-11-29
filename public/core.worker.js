!function(e){var t={};function n(r){if(t[r])return t[r].exports;var a=t[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(a,o){function i(e){try{u(r.next(e))}catch(e){o(e)}}function l(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,l)}u((r=r.apply(e,t||[])).next())}))},a=this&&this.__generator||function(e,t){var n,r,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function l(o){return function(l){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,r&&(a=2&o[0]?r.return:o[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,o[1])).done)return a;switch(r=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return i.label++,{value:o[1],done:!1};case 5:i.label++,r=o[1],o=[0];continue;case 7:o=i.ops.pop(),i.trys.pop();continue;default:if(!(a=i.trys,(a=a.length>0&&a[a.length-1])||6!==o[0]&&2!==o[0])){i=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){i.label=o[1];break}if(6===o[0]&&i.label<a[1]){i.label=a[1],a=o;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(o);break}a[2]&&i.ops.pop(),i.trys.pop();continue}o=t.call(e,i)}catch(e){o=[6,e],r=0}finally{n=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,l])}}};Object.defineProperty(t,"__esModule",{value:!0});var o=n(1);onmessage=function(e){return r(void 0,void 0,void 0,(function(){var t,n,r,i,l,u,c,s;return a(this,(function(a){switch(a.label){case 0:if(a.trys.push([0,5,6,7]),!("OffscreenCanvas"in o.global))return postMessage({type:"catch",data:"OffscreenCanvas is not available"}),[2];switch(null===(u=e.data)||void 0===u?void 0:u.type){case"draw":return[3,1]}return[3,4];case 1:return t=(0,o.draw)(null,e.data.data),n=postMessage,l={type:"then"},r=o.blob2dataURL,[4,t.convertToBlob({type:(null===(c=e.data.data)||void 0===c?void 0:c.type)||"image/png",quality:(null===(s=e.data.data)||void 0===s?void 0:s.quality)||1})];case 2:return[4,r.apply(void 0,[a.sent()])];case 3:return n.apply(void 0,[(l.data=a.sent(),l)]),[3,4];case 4:return[3,7];case 5:return i=a.sent(),postMessage({type:"catch",data:i}),[3,7];case 6:return postMessage({type:"finally"}),[7];case 7:return[2]}}))}))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.draw=t.blob2dataURL=t.global=t.INCH2MM=t.PRINTING_QUALITIES=t.PAPER_TYPES=t.PAPER_TYPE_MAP=void 0,t.PAPER_TYPE_MAP={A3:{width:297,height:420},A4:{width:210,height:297},A5:{width:148,height:210},B4:{width:250,height:353},B5:{width:176,height:250}},t.PAPER_TYPES=Object.keys(t.PAPER_TYPE_MAP).map((function(e){return{value:e,label:e}})),t.PRINTING_QUALITIES=[{value:200,label:"200ppi"},{value:300,label:"300ppi"},{value:600,label:"600ppi"},{value:1200,label:"1200ppi"}],t.INCH2MM=25.4,t.global=self||window,t.blob2dataURL=function(e){var t=new FileReader;return new Promise((function(n,r){t.onload=function(e){var t,a=null===(t=e.target)||void 0===t?void 0:t.result;a?n(a):r("null value")},t.onerror=function(e){return r(e)},t.onabort=function(e){return r(e)},t.readAsDataURL(e)}))},t.draw=function(e,n){var r=t.PAPER_TYPE_MAP[n.paperSize],a=n.precision,o=r.width/t.INCH2MM*a,i=r.height/t.INCH2MM*a;if(null==e){if(!("OffscreenCanvas"in t.global))throw new Error("Current browser does NOT support OffscreenCanvas, you have to provide a Canvas Object to render.");e=new OffscreenCanvas(o,i)}else e.width=r.width/t.INCH2MM*a,e.height=r.height/t.INCH2MM*a;var l=e.getContext("2d"),u=n.fontSize/t.INCH2MM*a,c=n.rowSpace/t.INCH2MM*a,s=n.colSpace/t.INCH2MM*a,f=n.rowShift/t.INCH2MM*a,d=2*Math.max(o,i),p=o/2,v=i/2,h=-d/2,b=-d/2;l.fillStyle="#ffffff",l.clearRect(h+p,b+v,d,d),n.image&&l.drawImage(n.image.bitmap,0,0,o,i),l.translate(p,v),l.rotate(n.rotate*Math.PI/180),l.translate(h,b);var y=n.text;l.font=(n.fontWeight||"normal")+" "+u+"px "+(n.fontFamily||"serif"),l.textBaseline="middle";var w=l.measureText(y),g=w.width,M=w.fontBoundingBoxAscent+w.fontBoundingBoxDescent;l.fillStyle=n.color;for(var P=0,_=0,m=0;_<=d;){if(P>d+f*m){var I=M+s;l.translate(-f,I),P=-f*m,_+=I,m++}l.fillText(y,P,0),P+=g+c}return e}}]);