var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_DEFINES;
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0]);
  }
  for (var part;parts.length && (part = parts.shift());) {
    if (!parts.length && opt_object !== undefined) {
      cur[part] = opt_object;
    } else {
      if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
  }
};
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};
goog.DEBUG = true;
goog.define("goog.LOCALE", "en");
goog.define("goog.TRUSTED_SITE", true);
goog.provide = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while (namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }
  goog.exportPath_(name);
};
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
goog.forwardDeclare = function(name) {
};
if (!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && goog.isDefAndNotNull(goog.getObjectByName(name));
  };
  goog.implicitNamespaces_ = {};
}
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for (var part;part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for (var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0;require = requires[j];j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};
goog.define("goog.ENABLE_DEBUG_LOADER", true);
goog.require = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if (goog.global.console) {
      goog.global.console["error"](errorMessage);
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
if (goog.DEPENDENCIES_ENABLED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc;
  };
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else {
      if (!goog.inHtmlDocument_()) {
        return;
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for (var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if (doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true;
    } else {
      return false;
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }
      deps.visited[path] = true;
      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }
    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }
    for (var i = 0;i < scripts.length;i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };
  goog.findBasePath_();
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js");
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == "object") {
    if (value) {
      if (value instanceof Array) {
        return "array";
      } else {
        if (value instanceof Object) {
          return s;
        }
      }
      var className = Object.prototype.toString.call((value));
      if (className == "[object Window]") {
        return "object";
      }
      if (className == "[object Array]" || typeof value.length == "number" && (typeof value.splice != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")))) {
        return "array";
      }
      if (className == "[object Function]" || typeof value.call != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call"))) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if (s == "function" && typeof value.call == "undefined") {
      return "object";
    }
  }
  return s;
};
goog.isDef = function(val) {
  return val !== undefined;
};
goog.isNull = function(val) {
  return val === null;
};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array";
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number";
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function";
};
goog.isString = function(val) {
  return typeof val == "string";
};
goog.isBoolean = function(val) {
  return typeof val == "boolean";
};
goog.isNumber = function(val) {
  return typeof val == "number";
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function";
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function";
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(obj) {
  return!!obj[goog.UID_PROPERTY_];
};
goog.removeUid = function(obj) {
  if ("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments));
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error;
  }
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if (typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true;
        } else {
          goog.evalWorksForGlobals_ = false;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for (var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  };
  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }
  if (opt_modifier) {
    return className + "-" + rename(opt_modifier);
  } else {
    return rename(className);
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value);
  }
  return str;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args);
  };
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (goog.DEBUG) {
    if (!caller) {
      throw Error("arguments.caller not defined.  goog.base() expects not " + "to be running in strict mode. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
  }
  if (caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1));
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global);
};
goog.provide("fb.simplelogin.Vars");
goog.provide("fb.simplelogin.Vars_");
fb.simplelogin.Vars_ = function() {
  this.apiHost = "https://auth.firebase.com";
};
fb.simplelogin.Vars_.prototype.setApiHost = function(apiHost) {
  this.apiHost = apiHost;
};
fb.simplelogin.Vars_.prototype.getApiHost = function() {
  return this.apiHost;
};
fb.simplelogin.Vars = new fb.simplelogin.Vars_;
goog.provide("goog.json");
goog.provide("goog.json.Replacer");
goog.provide("goog.json.Reviver");
goog.provide("goog.json.Serializer");
goog.define("goog.json.USE_NATIVE_JSON", false);
goog.json.isValid_ = function(s) {
  if (/^\s*$/.test(s)) {
    return false;
  }
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe = /"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;
  return remainderRe.test(s.replace(backslashesRe, "@").replace(simpleValuesRe, "]").replace(openBracketsRe, ""));
};
goog.json.parse = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["parse"]) : function(s) {
  var o = String(s);
  if (goog.json.isValid_(o)) {
    try {
      return(eval("(" + o + ")"));
    } catch (ex) {
    }
  }
  throw Error("Invalid JSON string: " + o);
};
goog.json.unsafeParse = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["parse"]) : function(s) {
  return(eval("(" + s + ")"));
};
goog.json.Replacer;
goog.json.Reviver;
goog.json.serialize = goog.json.USE_NATIVE_JSON ? (goog.global["JSON"]["stringify"]) : function(object, opt_replacer) {
  return(new goog.json.Serializer(opt_replacer)).serialize(object);
};
goog.json.Serializer = function(opt_replacer) {
  this.replacer_ = opt_replacer;
};
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join("");
};
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch(typeof object) {
    case "string":
      this.serializeString_((object), sb);
      break;
    case "number":
      this.serializeNumber_((object), sb);
      break;
    case "boolean":
      sb.push(object);
      break;
    case "undefined":
      sb.push("null");
      break;
    case "object":
      if (object == null) {
        sb.push("null");
        break;
      }
      if (goog.isArray(object)) {
        this.serializeArray((object), sb);
        break;
      }
      this.serializeObject_((object), sb);
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof object);;
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    if (c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c];
    }
    var cc = c.charCodeAt(0);
    var rv = "\\u";
    if (cc < 16) {
      rv += "000";
    } else {
      if (cc < 256) {
        rv += "00";
      } else {
        if (cc < 4096) {
          rv += "0";
        }
      }
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16);
  }), '"');
};
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : "null");
};
goog.json.Serializer.prototype.serializeArray = function(arr, sb) {
  var l = arr.length;
  sb.push("[");
  var sep = "";
  for (var i = 0;i < l;i++) {
    sb.push(sep);
    var value = arr[i];
    this.serialize_(this.replacer_ ? this.replacer_.call(arr, String(i), value) : value, sb);
    sep = ",";
  }
  sb.push("]");
};
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push("{");
  var sep = "";
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if (typeof value != "function") {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(":");
        this.serialize_(this.replacer_ ? this.replacer_.call(obj, key, value) : value, sb);
        sep = ",";
      }
    }
  }
  sb.push("}");
};
goog.provide("fb.simplelogin.util.json");
goog.require("goog.json");
fb.simplelogin.util.json.parse = function(str) {
  if (typeof JSON !== "undefined" && goog.isDef(JSON.parse)) {
    return JSON.parse(str);
  } else {
    return goog.json.parse(str);
  }
};
fb.simplelogin.util.json.stringify = function(data) {
  if (typeof JSON !== "undefined" && goog.isDef(JSON.stringify)) {
    return JSON.stringify(data);
  } else {
    return goog.json.serialize(data);
  }
};
goog.provide("fb.simplelogin.transports.Transport");
fb.simplelogin.Transport = function() {
};
fb.simplelogin.Transport.prototype.open = function(url, options, onComplete) {
};
goog.provide("fb.simplelogin.transports.Popup");
goog.require("fb.simplelogin.transports.Transport");
fb.simplelogin.Popup = function() {
};
fb.simplelogin.Popup.prototype.open = function(url, options, onComplete) {
};
goog.provide("fb.simplelogin.util.misc");
goog.require("goog.json");
fb.simplelogin.util.misc.parseUrl = function(url) {
  var a = document.createElement("a");
  a.href = url;
  return{protocol:a.protocol.replace(":", ""), host:a.hostname, port:a.port, query:a.search, params:fb.simplelogin.util.misc.parseQuerystring(a.search), hash:a.hash.replace("#", ""), path:a.pathname.replace(/^([^\/])/, "/$1")};
};
fb.simplelogin.util.misc.parseQuerystring = function(str) {
  var obj = {};
  var tokens = str.replace(/^\?/, "").split("&");
  for (var i = 0;i < tokens.length;i++) {
    if (tokens[i]) {
      var key = tokens[i].split("=");
      obj[key[0]] = key[1];
    }
  }
  return obj;
};
fb.simplelogin.util.misc.parseSubdomain = function(url) {
  var subdomain = "";
  try {
    var obj = fb.simplelogin.util.misc.parseUrl(url);
    var tokens = obj.host.split(".");
    if (tokens.length > 2) {
      subdomain = tokens.slice(0, -2).join(".");
    }
  } catch (e) {
  }
  return subdomain;
};
fb.simplelogin.util.misc.warn = function(message) {
  if (typeof console !== "undefined") {
    if (typeof console.warn !== "undefined") {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
};
goog.provide("fb.simplelogin.transports.CordovaInAppBrowser");
goog.provide("fb.simplelogin.transports.CordovaInAppBrowser_");
goog.require("fb.simplelogin.transports.Popup");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.misc");
var popupTimeout = 12E4;
fb.simplelogin.transports.CordovaInAppBrowser_ = function() {
};
fb.simplelogin.transports.CordovaInAppBrowser_.prototype.open = function(url, options, onComplete) {
  callbackInvoked = false;
  var callbackHandler = function() {
    var args = Array.prototype.slice.apply(arguments);
    if (!callbackInvoked) {
      callbackInvoked = true;
      onComplete.apply(null, args);
    }
  };
  var windowRef = window["open"](url + "&transport=internal-redirect-hash", "blank", "location=no");
  windowRef.addEventListener("loadstop", function(event) {
    var result;
    if (event && event["url"]) {
      var urlObj = fb.simplelogin.util.misc.parseUrl(event["url"]);
      if (urlObj["path"] !== "/blank/page.html") {
        return;
      }
      windowRef.close();
      try {
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(urlObj["hash"]);
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(decodeURIComponent(urlHashEncoded[key]));
        }
        result = temporaryResult;
      } catch (e) {
      }
      if (result && (result["token"] && result["user"])) {
        callbackHandler(null, result);
      } else {
        if (result && result["error"]) {
          callbackHandler(result["error"]);
        } else {
          callbackHandler({code:"RESPONSE_PAYLOAD_ERROR", message:"Unable to parse response payload for PhoneGap."});
        }
      }
    }
  });
  windowRef.addEventListener("exit", function(event) {
    callbackHandler({code:"USER_DENIED", message:"User cancelled the authentication request."});
  });
  setTimeout(function() {
    if (windowRef && windowRef["close"]) {
      windowRef["close"]();
    }
  }, popupTimeout);
};
fb.simplelogin.transports.CordovaInAppBrowser = new fb.simplelogin.transports.CordovaInAppBrowser_;
goog.provide("fb.simplelogin.Errors");
var messagePrefix = "FirebaseSimpleLogin: ";
var errors = {"UNKNOWN_ERROR":"An unknown error occurred.", "INVALID_EMAIL":"Invalid email specified.", "INVALID_PASSWORD":"Invalid password specified.", "USER_DENIED":"User cancelled the authentication request.", "RESPONSE_PAYLOAD_ERROR":"Unable to parse response payload.", "TRIGGER_IO_TABS":'The "forge.tabs" module required when using Firebase Simple Login and                               Trigger.io. Without this module included and enabled, login attempts to                               OAuth authentication providers will not be able to complete.'};
fb.simplelogin.Errors.format = function(errorCode, errorMessage) {
  var code, message, data = {}, args = arguments;
  if (args.length === 2) {
    code = args[0];
    message = args[1];
  } else {
    if (args.length === 1) {
      if (typeof args[0] === "object" && (args[0].code && args[0].message)) {
        if (args[0].message.indexOf(messagePrefix) === 0) {
          return args[0];
        }
        code = args[0].code;
        message = args[0].message;
        data = args[0].data;
      } else {
        if (typeof args[0] === "string") {
          code = args[0];
          message = errors[code];
        }
      }
    } else {
      code = "UNKNOWN_ERROR";
      message = errors[code];
    }
  }
  var error = new Error(messagePrefix + message);
  error.code = code;
  if (data) {
    error.data = data;
  }
  return error;
};
goog.provide("fb.simplelogin.transports.WinChan");
goog.require("fb.simplelogin.transports.Transport");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
var RELAY_FRAME_NAME = "__winchan_relay_frame";
var CLOSE_CMD = "die";
function addListener(w, event, cb) {
  if (w["attachEvent"]) {
    w["attachEvent"]("on" + event, cb);
  } else {
    if (w["addEventListener"]) {
      w["addEventListener"](event, cb, false);
    }
  }
}
function removeListener(w, event, cb) {
  if (w["detachEvent"]) {
    w["detachEvent"]("on" + event, cb);
  } else {
    if (w["removeEventListener"]) {
      w["removeEventListener"](event, cb, false);
    }
  }
}
function extractOrigin(url) {
  if (!/^https?:\/\//.test(url)) {
    url = window.location.href;
  }
  var m = /^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(url);
  if (m) {
    return m[1];
  }
  return url;
}
function findRelay() {
  var loc = window.location;
  var frames = window.opener.frames;
  var origin = loc.protocol + "//" + loc.host;
  for (var i = frames.length - 1;i >= 0;i--) {
    try {
      if (frames[i].location.href.indexOf(origin) === 0 && frames[i].name === RELAY_FRAME_NAME) {
        return frames[i];
      }
    } catch (e) {
    }
  }
  return;
}
var isInternetExplorer = function() {
  var re, match, rv = -1;
  var ua = navigator["userAgent"];
  if (navigator["appName"] === "Microsoft Internet Explorer") {
    re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
    match = ua.match(re);
    if (match && match.length > 1) {
      rv = parseFloat(match[1]);
    }
  } else {
    if (ua.indexOf("Trident") > -1) {
      re = /rv:([0-9]{2,2}[\.0-9]{0,})/;
      match = ua.match(re);
      if (match && match.length > 1) {
        rv = parseFloat(match[1]);
      }
    }
  }
  return rv >= 8;
}();
fb.simplelogin.transports.WinChan_ = function() {
};
fb.simplelogin.transports.WinChan_.prototype.open = function(url, opts, cb) {
  if (!cb) {
    throw "missing required callback argument";
  }
  opts.url = url;
  var err;
  if (!opts.url) {
    err = "missing required 'url' parameter";
  }
  if (!opts.relay_url) {
    err = "missing required 'relay_url' parameter";
  }
  if (err) {
    setTimeout(function() {
      cb(err);
    }, 0);
  }
  if (!opts.window_name) {
    opts.window_name = null;
  }
  if (!opts.window_features || fb.simplelogin.util.env.isFennec()) {
    opts.window_features = undefined;
  }
  var iframe;
  var origin = extractOrigin(opts.url);
  if (origin !== extractOrigin(opts.relay_url)) {
    return setTimeout(function() {
      cb("invalid arguments: origin of url and relay_url must match");
    }, 0);
  }
  var messageTarget;
  if (isInternetExplorer) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", opts.relay_url);
    iframe.style.display = "none";
    iframe.setAttribute("name", RELAY_FRAME_NAME);
    document.body.appendChild(iframe);
    messageTarget = iframe.contentWindow;
  }
  var w = window.open(opts.url, opts.window_name, opts.window_features);
  if (!messageTarget) {
    messageTarget = w;
  }
  var closeInterval = setInterval(function() {
    if (w && w.closed) {
      cleanup();
      if (cb) {
        cb("unknown closed window");
        cb = null;
      }
    }
  }, 500);
  var req = fb.simplelogin.util.json.stringify({a:"request", d:opts.params});
  function cleanup(forceKeepWindowOpen) {
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = undefined;
    if (closeInterval) {
      closeInterval = clearInterval(closeInterval);
    }
    removeListener(window, "message", onMessage);
    removeListener(window, "unload", cleanup);
    if (w && !forceKeepWindowOpen) {
      try {
        w.close();
      } catch (securityViolation) {
        messageTarget.postMessage(CLOSE_CMD, origin);
      }
    }
    w = messageTarget = undefined;
  }
  addListener(window, "unload", cleanup);
  function onMessage(e) {
    if (e.origin !== origin) {
      return;
    }
    try {
      var d = fb.simplelogin.util.json.parse(e.data);
      if (d.a === "ready") {
        messageTarget.postMessage(req, origin);
      } else {
        if (d.a === "error") {
          cleanup();
          if (cb) {
            cb(d.d);
            cb = null;
          }
        } else {
          if (d.a === "response") {
            cleanup(d.forceKeepWindowOpen);
            if (cb) {
              cb(null, d.d);
              cb = null;
            }
          }
        }
      }
    } catch (err) {
    }
  }
  addListener(window, "message", onMessage);
  return{close:cleanup, focus:function() {
    if (w) {
      try {
        w.focus();
      } catch (e) {
      }
    }
  }};
};
fb.simplelogin.transports.WinChan_.prototype.onOpen = function(cb) {
  var o = "*";
  var msgTarget = isInternetExplorer ? findRelay() : window.opener;
  var autoClose = true;
  if (!msgTarget) {
    throw "can't find relay frame";
  }
  function doPost(msg) {
    msg = fb.simplelogin.util.json.stringify(msg);
    if (isInternetExplorer) {
      msgTarget.doPost(msg, o);
    } else {
      msgTarget.postMessage(msg, o);
    }
  }
  function onMessage(e) {
    var d;
    try {
      d = fb.simplelogin.util.json.parse(e.data);
    } catch (err) {
    }
    if (!d || d.a !== "request") {
      return;
    }
    removeListener(window, "message", onMessage);
    o = e.origin;
    if (cb) {
      setTimeout(function() {
        cb(o, d.d, function(r, forceKeepWindowOpen) {
          autoClose = !forceKeepWindowOpen;
          cb = undefined;
          doPost({a:"response", d:r, forceKeepWindowOpen:forceKeepWindowOpen});
        });
      }, 0);
    }
  }
  function onDie(e) {
    if (autoClose && e.data === CLOSE_CMD) {
      try {
        window.close();
      } catch (o_O) {
      }
    }
  }
  addListener(isInternetExplorer ? msgTarget : window, "message", onMessage);
  addListener(isInternetExplorer ? msgTarget : window, "message", onDie);
  try {
    doPost({a:"ready"});
  } catch (e) {
    addListener(msgTarget, "load", function(e) {
      doPost({a:"ready"});
    });
  }
  var onUnload = function() {
    try {
      removeListener(isInternetExplorer ? msgTarget : window, "message", onDie);
    } catch (ohWell) {
    }
    if (cb) {
      doPost({a:"error", d:"client closed window"});
    }
    cb = undefined;
    try {
      window.close();
    } catch (e) {
    }
  };
  addListener(window, "unload", onUnload);
  return{detach:function() {
    removeListener(window, "unload", onUnload);
  }};
};
fb.simplelogin.transports.WinChan_.prototype.isAvailable = function() {
  return fb.simplelogin.util.json && (fb.simplelogin.util.json.parse && (fb.simplelogin.util.json.stringify && window.postMessage));
};
fb.simplelogin.transports.WinChan = new fb.simplelogin.transports.WinChan_;
goog.provide("fb.simplelogin.transports.TriggerIoTab");
goog.provide("fb.simplelogin.transports.TriggerIoTab_");
goog.require("fb.simplelogin.transports.Popup");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.misc");
fb.simplelogin.transports.TriggerIoTab_ = function() {
};
fb.simplelogin.transports.TriggerIoTab_.prototype.open = function(url, options, onComplete) {
  var Forge, Tabs;
  try {
    Forge = window["forge"];
    Tabs = Forge["tabs"];
  } catch (err) {
    return onComplete({code:"TRIGGER_IO_TABS", message:'"forge.tabs" module required when using Firebase Simple Login and Trigger.io'});
  }
  callbackInvoked = false;
  var callbackHandler = function() {
    var args = Array.prototype.slice.apply(arguments);
    if (!callbackInvoked) {
      callbackInvoked = true;
      onComplete.apply(null, args);
    }
  };
  forge.tabs.openWithOptions({url:url + "&transport=internal-redirect-hash", pattern:fb.simplelogin.Vars.getApiHost() + "/blank/page*"}, function(data) {
    var result;
    if (data && data["url"]) {
      try {
        var urlObj = fb.simplelogin.util.misc.parseUrl(data["url"]);
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(urlObj["hash"]);
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(decodeURIComponent(urlHashEncoded[key]));
        }
        result = temporaryResult;
      } catch (e) {
      }
    }
    if (result && (result["token"] && result["user"])) {
      callbackHandler(null, result);
    } else {
      if (result && result["error"]) {
        callbackHandler(result["error"]);
      } else {
        callbackHandler({code:"RESPONSE_PAYLOAD_ERROR", message:"Unable to parse response payload for Trigger.io."});
      }
    }
  }, function(err) {
    callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred for Trigger.io."});
  });
};
fb.simplelogin.transports.TriggerIoTab = new fb.simplelogin.transports.TriggerIoTab_;
goog.provide("fb.simplelogin.util.RSVP");
var b, c;
!function() {
  var a = {}, d = {};
  b = function(b, c, d) {
    a[b] = {deps:c, callback:d};
  }, c = function(b) {
    function e(a) {
      if ("." !== a.charAt(0)) {
        return a;
      }
      for (var c = a.split("/"), d = b.split("/").slice(0, -1), e = 0, f = c.length;f > e;e++) {
        var g = c[e];
        if (".." === g) {
          d.pop();
        } else {
          if ("." === g) {
            continue;
          }
          d.push(g);
        }
      }
      return d.join("/");
    }
    if (d[b]) {
      return d[b];
    }
    if (d[b] = {}, !a[b]) {
      throw new Error("Could not find module " + b);
    }
    for (var f, g = a[b], h = g.deps, i = g.callback, j = [], k = 0, l = h.length;l > k;k++) {
      j.push("exports" === h[k] ? f = {} : c(e(h[k])));
    }
    var m = i.apply(this, j);
    return d[b] = f || m;
  }, c.entries = a;
}(), b("rsvp/all-settled", ["./promise", "./utils", "exports"], function(a, b, c) {
  function d(a) {
    return{state:"fulfilled", value:a};
  }
  function e(a) {
    return{state:"rejected", reason:a};
  }
  var f = a["default"], g = b.isArray, h = b.isNonThenable;
  c["default"] = function(a, b) {
    return new f(function(b) {
      function c(a) {
        return function(b) {
          j(a, d(b));
        };
      }
      function i(a) {
        return function(b) {
          j(a, e(b));
        };
      }
      function j(a, c) {
        m[a] = c, 0 === --l && b(m);
      }
      if (!g(a)) {
        throw new TypeError("You must pass an array to allSettled.");
      }
      var k, l = a.length;
      if (0 === l) {
        return void b([]);
      }
      for (var m = new Array(l), n = 0;n < a.length;n++) {
        k = a[n], h(k) ? j(n, d(k)) : f.resolve(k).then(c(n), i(n));
      }
    }, b);
  };
}), b("rsvp/all", ["./promise", "exports"], function(a, b) {
  var c = a["default"];
  b["default"] = function(a, b) {
    return c.all(a, b);
  };
}), b("rsvp/asap", ["exports"], function(a) {
  function b() {
    return function() {
      process.nextTick(e);
    };
  }
  function c() {
    var a = 0, b = new h(e), c = document.createTextNode("");
    return b.observe(c, {characterData:!0}), function() {
      c.data = a = ++a % 2;
    };
  }
  function d() {
    return function() {
      setTimeout(e, 1);
    };
  }
  function e() {
    for (var a = 0;a < i.length;a++) {
      var b = i[a], c = b[0], d = b[1];
      c(d);
    }
    i.length = 0;
  }
  a["default"] = function(a, b) {
    var c = i.push([a, b]);
    1 === c && f();
  };
  var f, g = "undefined" != typeof window ? window : {}, h = g.MutationObserver || g.WebKitMutationObserver, i = [];
  f = "undefined" != typeof process && "[object process]" === {}.toString.call(process) ? b() : h ? c() : d();
}), b("rsvp/config", ["./events", "exports"], function(a, b) {
  function c(a, b) {
    return "onerror" === a ? void e.on("error", b) : 2 !== arguments.length ? e[a] : void(e[a] = b);
  }
  var d = a["default"], e = {instrument:!1};
  d.mixin(e), b.config = e, b.configure = c;
}), b("rsvp/defer", ["./promise", "exports"], function(a, b) {
  var c = a["default"];
  b["default"] = function(a) {
    var b = {};
    return b.promise = new c(function(a, c) {
      b.resolve = a, b.reject = c;
    }, a), b;
  };
}), b("rsvp/events", ["exports"], function(a) {
  function b(a, b) {
    for (var c = 0, d = a.length;d > c;c++) {
      if (a[c] === b) {
        return c;
      }
    }
    return-1;
  }
  function c(a) {
    var b = a._promiseCallbacks;
    return b || (b = a._promiseCallbacks = {}), b;
  }
  a["default"] = {mixin:function(a) {
    return a.on = this.on, a.off = this.off, a.trigger = this.trigger, a._promiseCallbacks = void 0, a;
  }, on:function(a, d) {
    var e, f = c(this);
    e = f[a], e || (e = f[a] = []), -1 === b(e, d) && e.push(d);
  }, off:function(a, d) {
    var e, f, g = c(this);
    return d ? (e = g[a], f = b(e, d), void(-1 !== f && e.splice(f, 1))) : void(g[a] = []);
  }, trigger:function(a, b) {
    var d, e, f = c(this);
    if (d = f[a]) {
      for (var g = 0;g < d.length;g++) {
        (e = d[g])(b);
      }
    }
  }};
}), b("rsvp/filter", ["./promise", "./utils", "exports"], function(a, b, c) {
  var d = a["default"], e = b.isFunction;
  c["default"] = function(a, b, c) {
    return d.all(a, c).then(function(a) {
      if (!e(b)) {
        throw new TypeError("You must pass a function as filter's second argument.");
      }
      for (var f = a.length, g = new Array(f), h = 0;f > h;h++) {
        g[h] = b(a[h]);
      }
      return d.all(g, c).then(function(b) {
        for (var c = new Array(f), d = 0, e = 0;f > e;e++) {
          b[e] === !0 && (c[d] = a[e], d++);
        }
        return c.length = d, c;
      });
    });
  };
}), b("rsvp/hash-settled", ["./promise", "./utils", "exports"], function(a, b, c) {
  function d(a) {
    return{state:"fulfilled", value:a};
  }
  function e(a) {
    return{state:"rejected", reason:a};
  }
  var f = a["default"], g = b.isNonThenable, h = b.keysOf;
  c["default"] = function(a) {
    return new f(function(b) {
      function c(a) {
        return function(b) {
          j(a, d(b));
        };
      }
      function i(a) {
        return function(b) {
          j(a, e(b));
        };
      }
      function j(a, c) {
        m[a] = c, 0 === --o && b(m);
      }
      var k, l, m = {}, n = h(a), o = n.length;
      if (0 === o) {
        return void b(m);
      }
      for (var p = 0;p < n.length;p++) {
        l = n[p], k = a[l], g(k) ? j(l, d(k)) : f.resolve(k).then(c(l), i(l));
      }
    });
  };
}), b("rsvp/hash", ["./promise", "./utils", "exports"], function(a, b, c) {
  var d = a["default"], e = b.isNonThenable, f = b.keysOf;
  c["default"] = function(a) {
    return new d(function(b, c) {
      function g(a) {
        return function(c) {
          k[a] = c, 0 === --m && b(k);
        };
      }
      function h(a) {
        m = 0, c(a);
      }
      var i, j, k = {}, l = f(a), m = l.length;
      if (0 === m) {
        return void b(k);
      }
      for (var n = 0;n < l.length;n++) {
        j = l[n], i = a[j], e(i) ? (k[j] = i, 0 === --m && b(k)) : d.resolve(i).then(g(j), h);
      }
    });
  };
}), b("rsvp/instrument", ["./config", "./utils", "exports"], function(a, b, c) {
  var d = a.config, e = b.now;
  c["default"] = function(a, b, c) {
    try {
      d.trigger(a, {guid:b._guidKey + b._id, eventName:a, detail:b._detail, childGuid:c && b._guidKey + c._id, label:b._label, timeStamp:e(), stack:(new Error(b._label)).stack});
    } catch (f) {
      setTimeout(function() {
        throw f;
      }, 0);
    }
  };
}), b("rsvp/map", ["./promise", "./utils", "exports"], function(a, b, c) {
  var d = a["default"], e = (b.isArray, b.isFunction);
  c["default"] = function(a, b, c) {
    return d.all(a, c).then(function(a) {
      if (!e(b)) {
        throw new TypeError("You must pass a function as map's second argument.");
      }
      for (var f = a.length, g = new Array(f), h = 0;f > h;h++) {
        g[h] = b(a[h]);
      }
      return d.all(g, c);
    });
  };
}), b("rsvp/node", ["./promise", "./utils", "exports"], function(a, b, c) {
  var d = a["default"], e = b.isArray;
  c["default"] = function(a, b) {
    function c() {
      for (var c = arguments.length, e = new Array(c), h = 0;c > h;h++) {
        e[h] = arguments[h];
      }
      var i;
      return f || (g || !b) ? i = this : (console.warn('Deprecation: RSVP.denodeify() doesn\'t allow setting the "this" binding anymore. Use yourFunction.bind(yourThis) instead.'), i = b), d.all(e).then(function(c) {
        function e(d, e) {
          function h() {
            for (var a = arguments.length, c = new Array(a), h = 0;a > h;h++) {
              c[h] = arguments[h];
            }
            var i = c[0], j = c[1];
            if (i) {
              e(i);
            } else {
              if (f) {
                d(c.slice(1));
              } else {
                if (g) {
                  var k, l, m = {}, n = c.slice(1);
                  for (l = 0;l < b.length;l++) {
                    k = b[l], m[k] = n[l];
                  }
                  d(m);
                } else {
                  d(j);
                }
              }
            }
          }
          c.push(h), a.apply(i, c);
        }
        return new d(e);
      });
    }
    var f = b === !0, g = e(b);
    return c.__proto__ = a, c;
  };
}), b("rsvp/promise", ["./config", "./events", "./instrument", "./utils", "./promise/cast", "./promise/all", "./promise/race", "./promise/resolve", "./promise/reject", "exports"], function(a, b, c, d, e, f, g, h, i, j) {
  function k() {
  }
  function l(a, b) {
    if (!z(a)) {
      throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
    }
    if (!(this instanceof l)) {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }
    this._id = H++, this._label = b, this._subscribers = [], w.instrument && x("created", this), k !== a && m(a, this);
  }
  function m(a, b) {
    function c(a) {
      r(b, a);
    }
    function d(a) {
      t(b, a);
    }
    try {
      a(c, d);
    } catch (e) {
      d(e);
    }
  }
  function n(a, b, c, d) {
    var e = a._subscribers, f = e.length;
    e[f] = b, e[f + K] = c, e[f + L] = d;
  }
  function o(a, b) {
    var c, d, e = a._subscribers, f = a._detail;
    w.instrument && x(b === K ? "fulfilled" : "rejected", a);
    for (var g = 0;g < e.length;g += 3) {
      c = e[g], d = e[g + b], p(b, c, d, f);
    }
    a._subscribers = null;
  }
  function p(a, b, c, d) {
    var e, f, g, h, i = z(c);
    if (i) {
      try {
        e = c(d), g = !0;
      } catch (j) {
        h = !0, f = j;
      }
    } else {
      e = d, g = !0;
    }
    q(b, e) || (i && g ? r(b, e) : h ? t(b, f) : a === K ? r(b, e) : a === L && t(b, e));
  }
  function q(a, b) {
    var c, d = null;
    try {
      if (a === b) {
        throw new TypeError("A promises callback cannot return that same promise.");
      }
      if (y(b) && (d = b.then, z(d))) {
        return d.call(b, function(d) {
          return c ? !0 : (c = !0, void(b !== d ? r(a, d) : s(a, d)));
        }, function(b) {
          return c ? !0 : (c = !0, void t(a, b));
        }, "Settle: " + (a._label || " unknown promise")), !0;
      }
    } catch (e) {
      return c ? !0 : (t(a, e), !0);
    }
    return!1;
  }
  function r(a, b) {
    a === b ? s(a, b) : q(a, b) || s(a, b);
  }
  function s(a, b) {
    a._state === I && (a._state = J, a._detail = b, w.async(u, a));
  }
  function t(a, b) {
    a._state === I && (a._state = J, a._detail = b, w.async(v, a));
  }
  function u(a) {
    o(a, a._state = K);
  }
  function v(a) {
    a._onerror && a._onerror(a._detail), o(a, a._state = L);
  }
  var w = a.config, x = (b["default"], c["default"]), y = d.objectOrFunction, z = d.isFunction, A = d.now, B = e["default"], C = f["default"], D = g["default"], E = h["default"], F = i["default"], G = "rsvp_" + A() + "-", H = 0;
  j["default"] = l, l.cast = B, l.all = C, l.race = D, l.resolve = E, l.reject = F;
  var I = void 0, J = 0, K = 1, L = 2;
  l.prototype = {constructor:l, _id:void 0, _guidKey:G, _label:void 0, _state:void 0, _detail:void 0, _subscribers:void 0, _onerror:function(a) {
    w.trigger("error", a);
  }, then:function(a, b, c) {
    var d = this;
    this._onerror = null;
    var e = new this.constructor(k, c);
    if (this._state) {
      var f = arguments;
      w.async(function() {
        p(d._state, e, f[d._state - 1], d._detail);
      });
    } else {
      n(this, e, a, b);
    }
    return w.instrument && x("chained", d, e), e;
  }, "catch":function(a, b) {
    return this.then(null, a, b);
  }, "finally":function(a, b) {
    var c = this.constructor;
    return this.then(function(b) {
      return c.resolve(a()).then(function() {
        return b;
      });
    }, function(b) {
      return c.resolve(a()).then(function() {
        throw b;
      });
    }, b);
  }};
}), b("rsvp/promise/all", ["../utils", "exports"], function(a, b) {
  var c = a.isArray, d = a.isNonThenable;
  b["default"] = function(a, b) {
    var e = this;
    return new e(function(b, f) {
      function g(a) {
        return function(c) {
          k[a] = c, 0 === --j && b(k);
        };
      }
      function h(a) {
        j = 0, f(a);
      }
      if (!c(a)) {
        throw new TypeError("You must pass an array to all.");
      }
      var i, j = a.length, k = new Array(j);
      if (0 === j) {
        return void b(k);
      }
      for (var l = 0;l < a.length;l++) {
        i = a[l], d(i) ? (k[l] = i, 0 === --j && b(k)) : e.resolve(i).then(g(l), h);
      }
    }, b);
  };
}), b("rsvp/promise/cast", ["exports"], function(a) {
  a["default"] = function(a, b) {
    var c = this;
    return a && ("object" == typeof a && a.constructor === c) ? a : new c(function(b) {
      b(a);
    }, b);
  };
}), b("rsvp/promise/race", ["../utils", "exports"], function(a, b) {
  var c = a.isArray, d = (a.isFunction, a.isNonThenable);
  b["default"] = function(a, b) {
    var e, f = this;
    return new f(function(b, g) {
      function h(a) {
        j && (j = !1, b(a));
      }
      function i(a) {
        j && (j = !1, g(a));
      }
      if (!c(a)) {
        throw new TypeError("You must pass an array to race.");
      }
      for (var j = !0, k = 0;k < a.length;k++) {
        if (e = a[k], d(e)) {
          return j = !1, void b(e);
        }
        f.resolve(e).then(h, i);
      }
    }, b);
  };
}), b("rsvp/promise/reject", ["exports"], function(a) {
  a["default"] = function(a, b) {
    var c = this;
    return new c(function(b, c) {
      c(a);
    }, b);
  };
}), b("rsvp/promise/resolve", ["exports"], function(a) {
  a["default"] = function(a, b) {
    var c = this;
    return a && ("object" == typeof a && a.constructor === c) ? a : new c(function(b) {
      b(a);
    }, b);
  };
}), b("rsvp/race", ["./promise", "exports"], function(a, b) {
  var c = a["default"];
  b["default"] = function(a, b) {
    return c.race(a, b);
  };
}), b("rsvp/reject", ["./promise", "exports"], function(a, b) {
  var c = a["default"];
  b["default"] = function(a, b) {
    return c.reject(a, b);
  };
}), b("rsvp/resolve", ["./promise", "exports"], function(a, b) {
  var c = a["default"];
  b["default"] = function(a, b) {
    return c.resolve(a, b);
  };
}), b("rsvp/rethrow", ["exports"], function(a) {
  a["default"] = function(a) {
    throw setTimeout(function() {
      throw a;
    }), a;
  };
}), b("rsvp/utils", ["exports"], function(a) {
  function b(a) {
    return "function" == typeof a || "object" == typeof a && null !== a;
  }
  function c(a) {
    return "function" == typeof a;
  }
  function d(a) {
    return!b(a);
  }
  a.objectOrFunction = b, a.isFunction = c, a.isNonThenable = d;
  var e;
  e = Array.isArray ? Array.isArray : function(a) {
    return "[object Array]" === Object.prototype.toString.call(a);
  };
  var f = e;
  a.isArray = f;
  var g = Date.now || function() {
    return(new Date).getTime();
  };
  a.now = g;
  var h = Object.keys || function(a) {
    var b = [];
    for (var c in a) {
      b.push(c);
    }
    return b;
  };
  a.keysOf = h;
}), b("rsvp", ["./rsvp/promise", "./rsvp/events", "./rsvp/node", "./rsvp/all", "./rsvp/all-settled", "./rsvp/race", "./rsvp/hash", "./rsvp/hash-settled", "./rsvp/rethrow", "./rsvp/defer", "./rsvp/config", "./rsvp/map", "./rsvp/resolve", "./rsvp/reject", "./rsvp/filter", "./rsvp/asap", "exports"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
  function r(a, b) {
    E.async(a, b);
  }
  function s() {
    E.on.apply(E, arguments);
  }
  function t() {
    E.off.apply(E, arguments);
  }
  var u = a["default"], v = b["default"], w = c["default"], x = d["default"], y = e["default"], z = f["default"], A = g["default"], B = h["default"], C = i["default"], D = j["default"], E = k.config, F = k.configure, G = l["default"], H = m["default"], I = n["default"], J = o["default"], K = p["default"];
  if (E.async = K, "undefined" != typeof window && "object" == typeof window.__PROMISE_INSTRUMENTATION__) {
    var L = window.__PROMISE_INSTRUMENTATION__;
    F("instrument", !0);
    for (var M in L) {
      L.hasOwnProperty(M) && s(M, L[M]);
    }
  }
  q.Promise = u, q.EventTarget = v, q.all = x, q.allSettled = y, q.race = z, q.hash = A, q.hashSettled = B, q.rethrow = C, q.defer = D, q.denodeify = w, q.configure = F, q.on = s, q.off = t, q.resolve = H, q.reject = I, q.async = r, q.map = G, q.filter = J;
});
fb.simplelogin.util.RSVP = c("rsvp");
goog.provide("fb.simplelogin.util.env");
fb.simplelogin.util.env.hasLocalStorage = function(str) {
  try {
    if (localStorage) {
      localStorage.setItem("firebase-sentinel", "test");
      var result = localStorage.getItem("firebase-sentinel");
      localStorage.removeItem("firebase-sentinel");
      return result === "test";
    }
  } catch (e) {
  }
  return false;
};
fb.simplelogin.util.env.hasSessionStorage = function(str) {
  try {
    if (sessionStorage) {
      sessionStorage.setItem("firebase-sentinel", "test");
      var result = sessionStorage.getItem("firebase-sentinel");
      sessionStorage.removeItem("firebase-sentinel");
      return result === "test";
    }
  } catch (e) {
  }
  return false;
};
fb.simplelogin.util.env.isMobileCordovaInAppBrowser = function() {
  return(window["cordova"] || (window["CordovaInAppBrowser"] || window["phonegap"])) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
};
fb.simplelogin.util.env.isMobileTriggerIoTab = function() {
  return window["forge"] && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
};
fb.simplelogin.util.env.isWindowsMetro = function() {
  return!!window["Windows"] && /^ms-appx:/.test(location.href);
};
fb.simplelogin.util.env.isChromeiOS = function() {
  return!!navigator.userAgent.match(/CriOS/);
};
fb.simplelogin.util.env.isTwitteriOS = function() {
  return!!navigator.userAgent.match(/Twitter for iPhone/);
};
fb.simplelogin.util.env.isFacebookiOS = function() {
  return!!navigator.userAgent.match(/FBAN\/FBIOS/);
};
fb.simplelogin.util.env.isWindowsPhone = function() {
  return!!navigator.userAgent.match(/Windows Phone/);
};
fb.simplelogin.util.env.isStandaloneiOS = function() {
  return!!window.navigator.standalone;
};
fb.simplelogin.util.env.isPhantomJS = function() {
  return!!navigator.userAgent.match(/PhantomJS/);
};
fb.simplelogin.util.env.isIeLT10 = function() {
  var re, match, rv = -1;
  var ua = navigator["userAgent"];
  if (navigator["appName"] === "Microsoft Internet Explorer") {
    re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
    match = ua.match(re);
    if (match && match.length > 1) {
      rv = parseFloat(match[1]);
    }
    if (rv < 10) {
      return true;
    }
  }
  return false;
};
fb.simplelogin.util.env.isFennec = function() {
  try {
    var userAgent = navigator["userAgent"];
    return userAgent.indexOf("Fennec/") != -1 || userAgent.indexOf("Firefox/") != -1 && userAgent.indexOf("Android") != -1;
  } catch (e) {
  }
  return false;
};
goog.provide("fb.simplelogin.transports.XHR");
goog.provide("fb.simplelogin.transports.XHR_");
goog.require("fb.simplelogin.transports.Transport");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
fb.simplelogin.transports.XHR_ = function() {
};
fb.simplelogin.transports.XHR_.prototype.open = function(url, data, onComplete) {
  var self = this;
  var options = {contentType:"application/json"};
  var xhr = new XMLHttpRequest, method = (options.method || "GET").toUpperCase(), contentType = options.contentType || "application/x-www-form-urlencoded", callbackInvoked = false, key;
  var callbackHandler = function() {
    if (!callbackInvoked && xhr.readyState === 4) {
      var data, error;
      callbackInvoked = true;
      if (xhr.status >= 200 && xhr.status < 300 || (xhr.status == 304 || xhr.status == 1223)) {
        try {
          data = fb.simplelogin.util.json.parse(xhr.responseText);
          error = data["error"] || null;
          delete data["error"];
        } catch (e) {
          error = "UNKNOWN_ERROR";
        }
      } else {
        error = "RESPONSE_PAYLOAD_ERROR";
      }
      return onComplete && onComplete(error, data);
    }
  };
  xhr.onreadystatechange = callbackHandler;
  if (data) {
    if (method === "GET") {
      if (url.indexOf("?") === -1) {
        url += "?";
      }
      url += this.formatQueryString(data);
      data = null;
    } else {
      if (contentType === "application/json") {
        data = fb.simplelogin.util.json.stringify(data);
      }
      if (contentType === "application/x-www-form-urlencoded") {
        data = this.formatQueryString(data);
      }
    }
  }
  xhr.open(method, url, true);
  var headers = {"X-Requested-With":"XMLHttpRequest", "Accept":"application/json;text/plain", "Content-Type":contentType};
  options.headers = options.headers || {};
  for (key in options.headers) {
    headers[key] = options.headers[key];
  }
  for (key in headers) {
    xhr.setRequestHeader(key, headers[key]);
  }
  xhr.send(data);
};
fb.simplelogin.transports.XHR_.prototype.isAvailable = function() {
  return window["XMLHttpRequest"] && (typeof window["XMLHttpRequest"] === "function" && !fb.simplelogin.util.env.isIeLT10());
};
fb.simplelogin.transports.XHR_.prototype.formatQueryString = function(data) {
  if (!data) {
    return "";
  }
  var tokens = [];
  for (var key in data) {
    tokens.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
  }
  return tokens.join("&");
};
fb.simplelogin.transports.XHR = new fb.simplelogin.transports.XHR_;
goog.provide("fb.simplelogin.util.validation");
var VALID_EMAIL_REGEX_ = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;
fb.simplelogin.util.validation.validateArgCount = function(fnName, minCount, maxCount, argCount) {
  var argError;
  if (argCount < minCount) {
    argError = "at least " + minCount;
  } else {
    if (argCount > maxCount) {
      argError = maxCount === 0 ? "none" : "no more than " + maxCount;
    }
  }
  if (argError) {
    var error = fnName + " failed: Was called with " + argCount + (argCount === 1 ? " argument." : " arguments.") + " Expects " + argError + ".";
    throw new Error(error);
  }
};
fb.simplelogin.util.validation.isValidEmail = function(email) {
  return goog.isString(email) && VALID_EMAIL_REGEX_.test(email);
};
fb.simplelogin.util.validation.isValidPassword = function(password) {
  return goog.isString(password);
};
fb.simplelogin.util.validation.isValidNamespace = function(namespace) {
  return goog.isString(namespace);
};
fb.simplelogin.util.validation.errorPrefix_ = function(fnName, argumentNumber, optional) {
  var argName = "";
  switch(argumentNumber) {
    case 1:
      argName = optional ? "first" : "First";
      break;
    case 2:
      argName = optional ? "second" : "Second";
      break;
    case 3:
      argName = optional ? "third" : "Third";
      break;
    case 4:
      argName = optional ? "fourth" : "Fourth";
      break;
    default:
      fb.core.util.validation.assert(false, "errorPrefix_ called with argumentNumber > 4.  Need to update it?");
  }
  var error = fnName + " failed: ";
  error += argName + " argument ";
  return error;
};
fb.simplelogin.util.validation.validateNamespace = function(fnName, argumentNumber, namespace, optional) {
  if (optional && !goog.isDef(namespace)) {
    return;
  }
  if (!goog.isString(namespace)) {
    throw new Error(fb.simplelogin.util.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a valid firebase namespace.");
  }
};
fb.simplelogin.util.validation.validateCallback = function(fnName, argumentNumber, callback, optional) {
  if (optional && !goog.isDef(callback)) {
    return;
  }
  if (!goog.isFunction(callback)) {
    throw new Error(fb.simplelogin.util.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a valid function.");
  }
};
fb.simplelogin.util.validation.validateString = function(fnName, argumentNumber, string, optional) {
  if (optional && !goog.isDef(string)) {
    return;
  }
  if (!goog.isString(string)) {
    throw new Error(fb.simplelogin.util.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a valid string.");
  }
};
fb.simplelogin.util.validation.validateContextObject = function(fnName, argumentNumber, context, optional) {
  if (optional && !goog.isDef(context)) {
    return;
  }
  if (!goog.isObject(context) || context === null) {
    throw new Error(fb.simplelogin.util.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a valid context object.");
  }
};
goog.provide("fb.simplelogin.transports.JSONP");
goog.provide("fb.simplelogin.transports.JSONP_");
goog.require("fb.simplelogin.transports.Transport");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
var CALLBACK_NAMESPACE = "_FirebaseSimpleLoginJSONP";
fb.simplelogin.transports.JSONP_ = function() {
  window[CALLBACK_NAMESPACE] = window[CALLBACK_NAMESPACE] || {};
};
fb.simplelogin.transports.JSONP_.prototype.open = function(url, options, onComplete) {
  url += /\?/.test(url) ? "" : "?";
  url += "&transport=jsonp";
  for (var param in options) {
    url += "&" + encodeURIComponent(param) + "=" + encodeURIComponent(options[param]);
  }
  var callbackId = this.generateRequestId_();
  url += "&callback=" + encodeURIComponent(CALLBACK_NAMESPACE + "." + callbackId);
  this.registerCallback_(callbackId, onComplete);
  this.writeScriptTag_(callbackId, url, onComplete);
};
fb.simplelogin.transports.JSONP_.prototype.generateRequestId_ = function() {
  return "_FirebaseJSONP" + (new Date).getTime() + Math.floor(Math.random() * 100);
};
fb.simplelogin.transports.JSONP_.prototype.registerCallback_ = function(id, callback) {
  var self = this;
  window[CALLBACK_NAMESPACE][id] = function(result) {
    var error = result["error"] || null;
    delete result["error"];
    callback(error, result);
    self.removeCallback_(id);
  };
};
fb.simplelogin.transports.JSONP_.prototype.removeCallback_ = function(id) {
  setTimeout(function() {
    delete window[CALLBACK_NAMESPACE][id];
    var el = document.getElementById(id);
    if (el) {
      el.parentNode.removeChild(el);
    }
  }, 0);
};
fb.simplelogin.transports.JSONP_.prototype.writeScriptTag_ = function(id, url, cb) {
  var self = this;
  setTimeout(function() {
    try {
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.id = id;
      js.async = true;
      js.src = url;
      js.onerror = function() {
        var el = document.getElementById(id);
        if (el !== null) {
          el.parentNode.removeChild(el);
        }
        cb && cb(self.formatError_({code:"SERVER_ERROR", message:"An unknown server error occurred."}));
      };
      document.getElementsByTagName("head")[0].appendChild(js);
    } catch (e) {
      cb && cb(self.formatError_({code:"SERVER_ERROR", message:"An unknown server error occurred."}));
    }
  }, 0);
};
fb.simplelogin.transports.JSONP_.prototype.formatError_ = function(error) {
  var errorObj;
  if (!error) {
    errorObj = new Error;
    errorObj.code = "UNKNOWN_ERROR";
  } else {
    errorObj = new Error(error.message);
    errorObj.code = error.code || "UNKNOWN_ERROR";
  }
  return errorObj;
};
fb.simplelogin.transports.JSONP = new fb.simplelogin.transports.JSONP_;
goog.provide("fb.simplelogin.providers.Password");
goog.provide("fb.simplelogin.providers.Password_");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.validation");
goog.require("fb.simplelogin.Errors");
goog.require("fb.simplelogin.transports.JSONP");
goog.require("fb.simplelogin.transports.XHR");
fb.simplelogin.providers.Password_ = function() {
};
fb.simplelogin.providers.Password_.prototype.getTransport_ = function() {
  if (fb.simplelogin.transports.XHR.isAvailable()) {
    return fb.simplelogin.transports.XHR;
  } else {
    return fb.simplelogin.transports.JSONP;
  }
};
fb.simplelogin.providers.Password_.prototype.login = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete("INVALID_FIREBASE");
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.createUser = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/create";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete("INVALID_FIREBASE");
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete("INVALID_EMAIL");
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["password"])) {
    return onComplete && onComplete("INVALID_PASSWORD");
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.changePassword = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/update";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete("INVALID_FIREBASE");
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete("INVALID_EMAIL");
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["newPassword"])) {
    return onComplete && onComplete("INVALID_PASSWORD");
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.removeUser = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/remove";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete("INVALID_FIREBASE");
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete("INVALID_EMAIL");
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["password"])) {
    return onComplete && onComplete("INVALID_PASSWORD");
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.sendPasswordResetEmail = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/reset_password";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete("INVALID_FIREBASE");
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete("INVALID_EMAIL");
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password = new fb.simplelogin.providers.Password_;
goog.provide("fb.simplelogin.transports.WindowsMetroAuthBroker");
goog.provide("fb.simplelogin.transports.WindowsMetroAuthBroker_");
goog.require("fb.simplelogin.transports.Popup");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.misc");
fb.simplelogin.transports.WindowsMetroAuthBroker_ = function() {
};
fb.simplelogin.transports.WindowsMetroAuthBroker_.prototype.open = function(url, options, onComplete) {
  var Uri, WebAuthenticationOptions, WebAuthenticationBroker, authenticateAsync, callbackInvoked, callbackHandler;
  try {
    Uri = window["Windows"]["Foundation"]["Uri"];
    WebAuthenticationOptions = window["Windows"]["Security"]["Authentication"]["Web"]["WebAuthenticationOptions"];
    WebAuthenticationBroker = window["Windows"]["Security"]["Authentication"]["Web"]["WebAuthenticationBroker"];
    authenticateAsync = WebAuthenticationBroker["authenticateAsync"];
  } catch (err) {
    return onComplete({code:"WINDOWS_METRO", message:'"Windows.Security.Authentication.Web.WebAuthenticationBroker" required when using Firebase Simple Login in Windows Metro context'});
  }
  callbackInvoked = false;
  var callbackHandler = function() {
    var args = Array.prototype.slice.apply(arguments);
    if (!callbackInvoked) {
      callbackInvoked = true;
      onComplete.apply(null, args);
    }
  };
  var startUri = new Uri(url + "&transport=internal-redirect-hash");
  var endUri = new Uri(fb.simplelogin.Vars.getApiHost() + "/blank/page.html");
  authenticateAsync(WebAuthenticationOptions["none"], startUri, endUri).done(function(data) {
    var result;
    if (data && data["responseData"]) {
      try {
        var urlObj = fb.simplelogin.util.misc.parseUrl(data["responseData"]);
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(urlObj["hash"]);
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(decodeURIComponent(urlHashEncoded[key]));
        }
        result = temporaryResult;
      } catch (e) {
      }
    }
    if (result && (result["token"] && result["user"])) {
      callbackHandler(null, result);
    } else {
      if (result && result["error"]) {
        callbackHandler(result["error"]);
      } else {
        callbackHandler({code:"RESPONSE_PAYLOAD_ERROR", message:"Unable to parse response payload for Windows."});
      }
    }
  }, function(err) {
    callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred for Windows."});
  });
};
fb.simplelogin.transports.WindowsMetroAuthBroker = new fb.simplelogin.transports.WindowsMetroAuthBroker_;
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0;
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};
goog.string.subs = function(str, var_args) {
  var splitParts = str.split("%s");
  var returnString = "";
  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length && splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }
  return returnString + splitParts.join("%s");
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str);
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str);
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str);
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str);
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str);
};
goog.string.isSpace = function(ch) {
  return ch == " ";
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && (ch >= " " && ch <= "~") || ch >= "\u0080" && ch <= "\ufffd";
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ");
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n");
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ");
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ");
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "");
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "");
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if (test1 < test2) {
    return-1;
  } else {
    if (test1 == test2) {
      return 0;
    } else {
      return 1;
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return-1;
  }
  if (!str2) {
    return 1;
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for (var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if (a != b) {
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }
  return str1 < str2 ? -1 : 1;
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "));
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>");
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;").replace(goog.string.singleQuoteRe_, "&#39;");
  } else {
    if (!goog.string.allRe_.test(str)) {
      return str;
    }
    if (str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;");
    }
    if (str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;");
    }
    if (str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;");
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;");
    }
    if (str.indexOf("'") != -1) {
      str = str.replace(goog.string.singleQuoteRe_, "&#39;");
    }
    return str;
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /"/g;
goog.string.singleQuoteRe_ = /'/g;
goog.string.allRe_ = /[&<>"']/;
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, "&")) {
    if ("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, "&")) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement("div");
  } else {
    div = document.createElement("div");
  }
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if (value) {
      return value;
    }
    if (entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    if (!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    return seen[s] = value;
  });
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return'"';
      default:
        if (entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        return s;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (str.length > chars) {
    str = str.substring(0, chars - 3) + "...";
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint);
  } else {
    if (str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos);
    }
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join("");
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join("");
};
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    if (cc < 256) {
      rv = "\\x";
      if (cc < 16 || cc > 256) {
        rv += "0";
      }
    } else {
      rv = "\\u";
      if (cc < 4096) {
        rv += "0";
      }
    }
    rv += cc.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[c] = rv;
};
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if (index >= 0 && (index < s.length && stringLength > 0)) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "");
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "");
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string);
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s;
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj);
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "");
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for (var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || (goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]));
    } while (order == 0);
  }
  return order;
};
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return-1;
  } else {
    if (left > right) {
      return 1;
    }
  }
  return 0;
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return "goog_" + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};
goog.string.isLowerCamelCase = function(str) {
  return/^[a-z]+([A-Z][a-z]*)*$/.test(str);
};
goog.string.isUpperCamelCase = function(str) {
  return/^([A-Z][a-z]*)+$/.test(str);
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase();
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
goog.string.parseInt = function(value) {
  if (isFinite(value)) {
    value = String(value);
  }
  if (goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
  }
  return NaN;
};
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }
  return returnVal;
};
goog.provide("fb.simplelogin.SessionStore");
goog.provide("fb.simplelogin.SessionStore_");
goog.require("fb.simplelogin.util.env");
var sessionPersistentStorageKey = "firebaseSession";
var hasLocalStorage = fb.simplelogin.util.env.hasLocalStorage();
fb.simplelogin.SessionStore_ = function() {
};
fb.simplelogin.SessionStore_.prototype.set = function(session, opt_sessionLengthDays) {
  if (!hasLocalStorage) {
    return;
  }
  try {
    localStorage.setItem(sessionPersistentStorageKey, fb.simplelogin.util.json.stringify(session));
  } catch (e) {
  }
};
fb.simplelogin.SessionStore_.prototype.get = function() {
  if (!hasLocalStorage) {
    return;
  }
  try {
    var payload = localStorage.getItem(sessionPersistentStorageKey);
    if (payload) {
      var session = fb.simplelogin.util.json.parse(payload);
      return session;
    }
  } catch (e) {
  }
  return null;
};
fb.simplelogin.SessionStore_.prototype.clear = function() {
  if (!hasLocalStorage) {
    return;
  }
  localStorage.removeItem(sessionPersistentStorageKey);
};
fb.simplelogin.SessionStore = new fb.simplelogin.SessionStore_;
goog.provide("fb.simplelogin.client");
goog.require("fb.simplelogin.util.env");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.RSVP");
goog.require("fb.simplelogin.util.validation");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.Errors");
goog.require("fb.simplelogin.SessionStore");
goog.require("fb.simplelogin.providers.Password");
goog.require("fb.simplelogin.transports.JSONP");
goog.require("fb.simplelogin.transports.CordovaInAppBrowser");
goog.require("fb.simplelogin.transports.TriggerIoTab");
goog.require("fb.simplelogin.transports.WinChan");
goog.require("fb.simplelogin.transports.WindowsMetroAuthBroker");
goog.require("goog.string");
var CLIENT_VERSION = "1.6.4";
fb.simplelogin.client = function(ref, callback, context, apiHost) {
  var self = this;
  this.mRef = ref;
  this.mNamespace = fb.simplelogin.util.misc.parseSubdomain(ref.toString());
  this.sessionLengthDays = null;
  var globalNamespace = "_FirebaseSimpleLogin";
  window[globalNamespace] = window[globalNamespace] || {};
  window[globalNamespace]["callbacks"] = window[globalNamespace]["callbacks"] || [];
  window[globalNamespace]["callbacks"].push({"cb":callback, "ctx":context});
  var warnTestingLocally = window.location.protocol === "file:" && (!fb.simplelogin.util.env.isPhantomJS() && !fb.simplelogin.util.env.isMobileCordovaInAppBrowser());
  if (warnTestingLocally) {
    var message = "FirebaseSimpleLogin(): Due to browser security restrictions, " + "loading applications via `file://*` URLs will prevent popup-based authentication " + "providers from working properly. When testing locally, you'll need to run a " + "barebones webserver on your machine rather than loading your test files via " + "`file://*`. The easiest way to run a barebones server on your local machine is to " + "`cd` to the root directory of your code and run `python -m SimpleHTTPServer`, " + 
    "which will allow you to access your content via `http://127.0.0.1:8000/*`.";
    fb.simplelogin.util.misc.warn(message);
  }
  if (apiHost) {
    fb.simplelogin.Vars.setApiHost(apiHost);
  }
  function asyncInvokeCallback(func, error, user) {
    setTimeout(function() {
      func(error, user);
    }, 0);
  }
  this.mLoginStateChange = function(error, user) {
    var callbacks = window[globalNamespace]["callbacks"] || [];
    var args = Array.prototype.slice.apply(arguments);
    for (var ix = 0;ix < callbacks.length;ix++) {
      var cb = callbacks[ix];
      var invokeCallback = !!error || typeof cb.user === "undefined";
      if (!invokeCallback) {
        var oldAuthToken, newAuthToken;
        if (cb.user && cb.user.firebaseAuthToken) {
          oldAuthToken = cb.user.firebaseAuthToken;
        }
        if (user && user.firebaseAuthToken) {
          newAuthToken = user.firebaseAuthToken;
        }
        invokeCallback = (oldAuthToken || newAuthToken) && oldAuthToken !== newAuthToken;
      }
      window[globalNamespace]["callbacks"][ix]["user"] = user || null;
      if (invokeCallback) {
        asyncInvokeCallback(goog.bind(cb.cb, cb.ctx), error, user);
      }
    }
  };
  this.resumeSession();
};
fb.simplelogin.client.prototype.setApiHost = function(apiHost) {
  fb.simplelogin.Vars.setApiHost(apiHost);
};
fb.simplelogin.client.prototype.resumeSession = function() {
  var self = this;
  var session, requestId, error;
  try {
    requestId = sessionStorage.getItem("firebaseRequestId");
    sessionStorage.removeItem("firebaseRequestId");
  } catch (e) {
  }
  if (requestId) {
    var transport = fb.simplelogin.transports.JSONP;
    if (fb.simplelogin.transports.XHR.isAvailable()) {
      transport = fb.simplelogin.transports.XHR;
    }
    transport.open(fb.simplelogin.Vars.getApiHost() + "/auth/session", {"requestId":requestId, "firebase":self.mNamespace}, function(error, response) {
      if (response && (response.token && response.user)) {
        self.attemptAuth(response.token, response.user, true);
      } else {
        if (error) {
          fb.simplelogin.SessionStore.clear();
          self.mLoginStateChange(error);
        } else {
          fb.simplelogin.SessionStore.clear();
          self.mLoginStateChange(null, null);
        }
      }
    });
  } else {
    session = fb.simplelogin.SessionStore.get();
    if (session && (session.token && session.user)) {
      self.attemptAuth(session.token, session.user, false);
    } else {
      self.mLoginStateChange(null, null);
    }
  }
};
fb.simplelogin.client.prototype.attemptAuth = function(token, user, saveSession, resolveCb, rejectCb) {
  var self = this;
  this.mRef["auth"](token, function(error, dummy) {
    if (!error) {
      if (saveSession) {
        fb.simplelogin.SessionStore.set({token:token, user:user, sessionKey:user["sessionKey"]}, self.sessionLengthDays);
      }
      if (typeof dummy == "function") {
        dummy();
      }
      delete user["sessionKey"];
      user["firebaseAuthToken"] = token;
      self.mLoginStateChange(null, user);
      if (resolveCb) {
        resolveCb(user);
      }
    } else {
      fb.simplelogin.SessionStore.clear();
      self.mLoginStateChange(null, null);
      if (rejectCb) {
        rejectCb();
      }
    }
  }, function(error) {
    fb.simplelogin.SessionStore.clear();
    self.mLoginStateChange(null, null);
    if (rejectCb) {
      rejectCb();
    }
  });
};
fb.simplelogin.client.prototype.login = function() {
  var methodId = "FirebaseSimpleLogin.login()";
  fb.simplelogin.util.validation.validateString(methodId, 1, arguments[0], false);
  fb.simplelogin.util.validation.validateArgCount(methodId, 1, 2, arguments.length);
  var provider = arguments[0].toLowerCase(), options = arguments[1] || {};
  this.sessionLengthDays = options.rememberMe ? 30 : null;
  switch(provider) {
    case "anonymous":
      return this.loginAnonymously(options);
    case "facebook-token":
      return this.loginWithFacebookToken(options);
    case "github":
      return this.loginWithGithub(options);
    case "google-token":
      return this.loginWithGoogleToken(options);
    case "password":
      return this.loginWithPassword(options);
    case "twitter-token":
      return this.loginWithTwitterToken(options);
    case "facebook":
      if (options["access_token"]) {
        return this.loginWithFacebookToken(options);
      }
      return this.loginWithFacebook(options);
    case "google":
      if (options["access_token"]) {
        return this.loginWithGoogleToken(options);
      }
      return this.loginWithGoogle(options);
    case "twitter":
      if (options["oauth_token"] && options["oauth_token_secret"]) {
        return this.loginWithTwitterToken(options);
      }
      return this.loginWithTwitter(options);
    default:
      throw new Error("FirebaseSimpleLogin.login(" + provider + ") failed: unrecognized authentication provider");;
  }
};
fb.simplelogin.client.prototype.loginAnonymously = function(options) {
  var self = this, provider = "anonymous";
  var promise = new fb.simplelogin.util.RSVP.Promise(function(resolve, reject) {
    options.firebase = self.mNamespace;
    options.v = CLIENT_VERSION;
    fb.simplelogin.transports.JSONP.open(fb.simplelogin.Vars.getApiHost() + "/auth/anonymous", options, function(error, response) {
      if (error || !response["token"]) {
        var errorObj = fb.simplelogin.Errors.format(error);
        self.mLoginStateChange(errorObj, null);
        reject(errorObj);
      } else {
        var token = response["token"];
        var user = response["user"];
        self.attemptAuth(token, user, true, resolve, reject);
      }
    });
  });
  return promise;
};
fb.simplelogin.client.prototype.loginWithPassword = function(options) {
  var self = this;
  var promise = new fb.simplelogin.util.RSVP.Promise(function(resolve, reject) {
    options.firebase = self.mNamespace;
    options.v = CLIENT_VERSION;
    fb.simplelogin.providers.Password.login(options, function(error, response) {
      if (error || !response["token"]) {
        var errorObj = fb.simplelogin.Errors.format(error);
        self.mLoginStateChange(errorObj, null);
        reject(errorObj);
      } else {
        var token = response["token"];
        var user = response["user"];
        self.attemptAuth(token, user, true, resolve, reject);
      }
    });
  });
  return promise;
};
fb.simplelogin.client.prototype.loginWithGithub = function(options) {
  options["height"] = 850;
  options["width"] = 950;
  return this.loginViaOAuth("github", options);
};
fb.simplelogin.client.prototype.loginWithGoogle = function(options) {
  options["height"] = 650;
  options["width"] = 575;
  return this.loginViaOAuth("google", options);
};
fb.simplelogin.client.prototype.loginWithFacebook = function(options) {
  options["height"] = 400;
  options["width"] = 535;
  return this.loginViaOAuth("facebook", options);
};
fb.simplelogin.client.prototype.loginWithTwitter = function(options) {
  return this.loginViaOAuth("twitter", options);
};
fb.simplelogin.client.prototype.loginWithFacebookToken = function(options) {
  return this.loginViaToken("facebook", options);
};
fb.simplelogin.client.prototype.loginWithGoogleToken = function(options) {
  return this.loginViaToken("google", options);
};
fb.simplelogin.client.prototype.loginWithTwitterToken = function(options) {
  return this.loginViaToken("twitter", options);
};
fb.simplelogin.client.prototype.logout = function() {
  fb.simplelogin.SessionStore.clear();
  this.mRef["unauth"]();
  this.mLoginStateChange(null, null);
};
fb.simplelogin.client.prototype.loginViaToken = function(provider, options, cb) {
  options = options || {};
  options.v = CLIENT_VERSION;
  var self = this, url = fb.simplelogin.Vars.getApiHost() + "/auth/" + provider + "/token?firebase=" + self.mNamespace;
  var promise = new fb.simplelogin.util.RSVP.Promise(function(resolve, reject) {
    fb.simplelogin.transports.JSONP.open(url, options, function(error, res) {
      if (error || (!res["token"] || !res["user"])) {
        var errorObj = fb.simplelogin.Errors.format(error);
        self.mLoginStateChange(errorObj);
        reject(errorObj);
      } else {
        var token = res["token"];
        var user = res["user"];
        self.attemptAuth(token, user, true, resolve, reject);
      }
    });
  });
  return promise;
};
fb.simplelogin.client.prototype.loginViaOAuth = function(provider, options, cb) {
  options = options || {};
  var self = this;
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/" + provider + "?firebase=" + self.mNamespace;
  if (options["scope"]) {
    url += "&scope=" + options["scope"];
  }
  url += "&v=" + encodeURIComponent(CLIENT_VERSION);
  var window_features = {"menubar":0, "location":0, "resizable":0, "scrollbars":1, "status":0, "dialog":1, "width":700, "height":375};
  if (options["height"]) {
    window_features["height"] = options["height"];
    delete options["height"];
  }
  if (options["width"]) {
    window_features["width"] = options["width"];
    delete options["width"];
  }
  var environment = function() {
    if (fb.simplelogin.util.env.isMobileCordovaInAppBrowser()) {
      return "mobile-phonegap";
    } else {
      if (fb.simplelogin.util.env.isMobileTriggerIoTab()) {
        return "mobile-triggerio";
      } else {
        if (fb.simplelogin.util.env.isWindowsMetro()) {
          return "windows-metro";
        } else {
          return "desktop";
        }
      }
    }
  }();
  var transport;
  if (environment === "desktop") {
    transport = fb.simplelogin.transports.WinChan;
    var window_features_arr = [];
    for (var key in window_features) {
      window_features_arr.push(key + "=" + window_features[key]);
    }
    options.url += "&transport=winchan";
    options.relay_url = fb.simplelogin.Vars.getApiHost() + "/auth/channel";
    options.window_features = window_features_arr.join(",");
  } else {
    if (environment === "mobile-phonegap") {
      transport = fb.simplelogin.transports.CordovaInAppBrowser;
    } else {
      if (environment === "mobile-triggerio") {
        transport = fb.simplelogin.transports.TriggerIoTab;
      } else {
        if (environment === "windows-metro") {
          transport = fb.simplelogin.transports.WindowsMetroAuthBroker;
        }
      }
    }
  }
  if (options.preferRedirect || (fb.simplelogin.util.env.isChromeiOS() || (fb.simplelogin.util.env.isWindowsPhone() || (fb.simplelogin.util.env.isStandaloneiOS() || (fb.simplelogin.util.env.isTwitteriOS() || fb.simplelogin.util.env.isFacebookiOS()))))) {
    var requestId = goog.string.getRandomString() + goog.string.getRandomString();
    try {
      sessionStorage.setItem("firebaseRequestId", requestId);
    } catch (e) {
    }
    url += "&requestId=" + requestId + "&fb_redirect_uri=" + encodeURIComponent(window.location.href);
    window.location = url;
    return;
  }
  var promise = new fb.simplelogin.util.RSVP.Promise(function(resolve, reject) {
    transport.open(url, options, function(error, res) {
      if (res && (res.token && res.user)) {
        self.attemptAuth(res.token, res.user, true, resolve, reject);
      } else {
        var errorObj = error || {code:"UNKNOWN_ERROR", message:"An unknown error occurred."};
        if (error === "unknown closed window") {
          errorObj = {code:"USER_DENIED", message:"User cancelled the authentication request."};
        } else {
          if (res && res.error) {
            errorObj = res.error;
          }
        }
        errorObj = fb.simplelogin.Errors.format(errorObj);
        self.mLoginStateChange(errorObj);
        reject(errorObj);
      }
    });
  });
  return promise;
};
fb.simplelogin.client.prototype.manageFirebaseUsers = function(method, data, cb) {
  data["firebase"] = this.mNamespace;
  var promise = new fb.simplelogin.util.RSVP.Promise(function(resolve, reject) {
    fb.simplelogin.providers.Password[method](data, function(error, result) {
      if (error) {
        var errorObj = fb.simplelogin.Errors.format(error);
        reject(errorObj);
        return cb && cb(errorObj, null);
      } else {
        resolve(result);
        return cb && cb(null, result);
      }
    });
  });
  return promise;
};
fb.simplelogin.client.prototype.createUser = function(email, password, cb) {
  return this.manageFirebaseUsers("createUser", {"email":email, "password":password}, cb);
};
fb.simplelogin.client.prototype.changePassword = function(email, oldPassword, newPassword, cb) {
  return this.manageFirebaseUsers("changePassword", {"email":email, "oldPassword":oldPassword, "newPassword":newPassword}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.prototype.removeUser = function(email, password, cb) {
  return this.manageFirebaseUsers("removeUser", {"email":email, "password":password}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.prototype.sendPasswordResetEmail = function(email, cb) {
  return this.manageFirebaseUsers("sendPasswordResetEmail", {"email":email}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.onOpen = function(cb) {
  fb.simplelogin.transports.WinChan.onOpen(cb);
};
fb.simplelogin.client.VERSION = function() {
  return CLIENT_VERSION;
};
goog.provide("FirebaseSimpleLogin");
goog.require("fb.simplelogin.client");
goog.require("fb.simplelogin.util.validation");
FirebaseSimpleLogin = function(ref, cb, context, apiHost) {
  var method = "new FirebaseSimpleLogin";
  fb.simplelogin.util.validation.validateArgCount(method, 1, 4, arguments.length);
  fb.simplelogin.util.validation.validateCallback(method, 2, cb, false);
  if (goog.isString(ref)) {
    throw new Error("new FirebaseSimpleLogin(): Oops, it looks like you passed a string " + "instead of a Firebase reference (i.e. new Firebase(<firebaseURL>)).");
  }
  var firebase = fb.simplelogin.util.misc.parseSubdomain(ref.toString());
  if (!goog.isString(firebase)) {
    throw new Error("new FirebaseSimpleLogin(): First argument must be a valid Firebase " + "reference (i.e. new Firebase(<firebaseURL>)).");
  }
  var client_ = new fb.simplelogin.client(ref, cb, context, apiHost);
  return{"setApiHost":function(apiHost) {
    var method = "FirebaseSimpleLogin.setApiHost";
    fb.simplelogin.util.validation.validateArgCount(method, 1, 1, arguments.length);
    return client_.setApiHost(apiHost);
  }, "login":function() {
    return client_.login.apply(client_, arguments);
  }, "logout":function() {
    var methodId = "FirebaseSimpleLogin.logout";
    fb.simplelogin.util.validation.validateArgCount(methodId, 0, 0, arguments.length);
    return client_.logout();
  }, "createUser":function(email, password, cb) {
    var method = "FirebaseSimpleLogin.createUser";
    fb.simplelogin.util.validation.validateArgCount(method, 2, 3, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 3, cb, true);
    return client_.createUser(email, password, cb);
  }, "changePassword":function(email, oldPassword, newPassword, cb) {
    var method = "FirebaseSimpleLogin.changePassword";
    fb.simplelogin.util.validation.validateArgCount(method, 3, 4, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 4, cb, true);
    return client_.changePassword(email, oldPassword, newPassword, cb);
  }, "removeUser":function(email, password, cb) {
    var method = "FirebaseSimpleLogin.removeUser";
    fb.simplelogin.util.validation.validateArgCount(method, 2, 3, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 3, cb, true);
    return client_.removeUser(email, password, cb);
  }, "sendPasswordResetEmail":function(email, cb) {
    var method = "FirebaseSimpleLogin.sendPasswordResetEmail";
    fb.simplelogin.util.validation.validateArgCount(method, 1, 2, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 2, cb, true);
    return client_.sendPasswordResetEmail(email, cb);
  }};
};
FirebaseSimpleLogin.onOpen = function(cb) {
  fb.simplelogin.client.onOpen(cb);
};
FirebaseSimpleLogin.VERSION = fb.simplelogin.client.VERSION();

