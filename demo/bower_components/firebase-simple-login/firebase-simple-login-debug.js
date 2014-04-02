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
goog.provide("fb.simplelogin.transports.CordovaInAppBrowser");
goog.provide("fb.simplelogin.transports.CordovaInAppBrowser_");
goog.require("fb.simplelogin.transports.Popup");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.misc");
var popupTimeout = 4E4;
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
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(decodeURIComponent(urlObj["hash"]));
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(urlHashEncoded[key]);
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
          callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred."});
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
var errors = {"UNKNOWN_ERROR":"An unknown error occurred.", "INVALID_EMAIL":"Invalid email specified.", "INVALID_PASSWORD":"Invalid password specified.", "USER_DENIED":"User cancelled the authentication request.", "TRIGGER_IO_TABS":'The "forge.tabs" module required when using Firebase Simple Login and                         Trigger.io. Without this module included and enabled, login attempts to                         OAuth authentication providers will not be able to complete.'};
fb.simplelogin.Errors.format = function(errorCode, errorMessage) {
  var code = errorCode || "UNKNOWN_ERROR", message = errorMessage || errors[code], data = {}, args = arguments;
  if (args.length === 2) {
    code = args[0];
    message = args[1];
  } else {
    if (args.length === 1) {
      if (typeof args[0] === "object" && (args[0].code && args[0].message)) {
        code = args[0].code;
        message = args[0].message;
        data = args[0].data;
      } else {
        if (typeof args[0] === "string") {
          code = args[0];
          message = "";
        }
      }
    }
  }
  var error = new Error(messagePrefix + message);
  error.code = code;
  if (data) {
    error.data = data;
  }
  return error;
};
fb.simplelogin.Errors.get = function(code) {
  if (!errors[code]) {
    code = "UNKNOWN_ERROR";
  }
  return fb.simplelogin.Errors.format(code, errors[code]);
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
  function cleanup() {
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = undefined;
    if (closeInterval) {
      closeInterval = clearInterval(closeInterval);
    }
    removeListener(window, "message", onMessage);
    removeListener(window, "unload", cleanup);
    if (w) {
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
            cleanup();
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
        cb(o, d.d, function(r) {
          cb = undefined;
          doPost({a:"response", d:r});
        });
      }, 0);
    }
  }
  function onDie(e) {
    if (e.data === CLOSE_CMD) {
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
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(decodeURIComponent(urlObj["hash"]));
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(urlHashEncoded[key]);
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
        callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred."});
      }
    }
  }, function(err) {
    callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred."});
  });
};
fb.simplelogin.transports.TriggerIoTab = new fb.simplelogin.transports.TriggerIoTab_;
goog.provide("fb.simplelogin.util.sjcl");
var sjcl = {cipher:{}, hash:{}, keyexchange:{}, mode:{}, misc:{}, codec:{}, exception:{corrupt:function(a) {
  this.toString = function() {
    return "CORRUPT: " + this.message;
  };
  this.message = a;
}, invalid:function(a) {
  this.toString = function() {
    return "INVALID: " + this.message;
  };
  this.message = a;
}, bug:function(a) {
  this.toString = function() {
    return "BUG: " + this.message;
  };
  this.message = a;
}, notReady:function(a) {
  this.toString = function() {
    return "NOT READY: " + this.message;
  };
  this.message = a;
}}};
if (typeof module != "undefined" && module.exports) {
  module.exports = sjcl;
}
sjcl.cipher.aes = function(a) {
  this.h[0][0][0] || this.w();
  var b, c, d, e, f = this.h[0][4], g = this.h[1];
  b = a.length;
  var h = 1;
  if (b !== 4 && (b !== 6 && b !== 8)) {
    throw new sjcl.exception.invalid("invalid aes key size");
  }
  this.a = [d = a.slice(0), e = []];
  for (a = b;a < 4 * b + 28;a++) {
    c = d[a - 1];
    if (a % b === 0 || b === 8 && a % b === 4) {
      c = f[c >>> 24] << 24 ^ f[c >> 16 & 255] << 16 ^ f[c >> 8 & 255] << 8 ^ f[c & 255];
      if (a % b === 0) {
        c = c << 8 ^ c >>> 24 ^ h << 24;
        h = h << 1 ^ (h >> 7) * 283;
      }
    }
    d[a] = d[a - b] ^ c;
  }
  for (b = 0;a;b++, a--) {
    c = d[b & 3 ? a : a - 4];
    e[b] = a <= 4 || b < 4 ? c : g[0][f[c >>> 24]] ^ g[1][f[c >> 16 & 255]] ^ g[2][f[c >> 8 & 255]] ^ g[3][f[c & 255]];
  }
};
sjcl.cipher.aes.prototype = {encrypt:function(a) {
  return this.G(a, 0);
}, decrypt:function(a) {
  return this.G(a, 1);
}, h:[[[], [], [], [], []], [[], [], [], [], []]], w:function() {
  var a = this.h[0], b = this.h[1], c = a[4], d = b[4], e, f, g, h = [], i = [], k, j, l, m;
  for (e = 0;e < 256;e++) {
    i[(h[e] = e << 1 ^ (e >> 7) * 283) ^ e] = e;
  }
  for (f = g = 0;!c[f];f ^= k || 1, g = i[g] || 1) {
    l = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4;
    l = l >> 8 ^ l & 255 ^ 99;
    c[f] = l;
    d[l] = f;
    j = h[e = h[k = h[f]]];
    m = j * 16843009 ^ e * 65537 ^ k * 257 ^ f * 16843008;
    j = h[l] * 257 ^ l * 16843008;
    for (e = 0;e < 4;e++) {
      a[e][f] = j = j << 24 ^ j >>> 8;
      b[e][l] = m = m << 24 ^ m >>> 8;
    }
  }
  for (e = 0;e < 5;e++) {
    a[e] = a[e].slice(0);
    b[e] = b[e].slice(0);
  }
}, G:function(a, b) {
  if (a.length !== 4) {
    throw new sjcl.exception.invalid("invalid aes block size");
  }
  var c = this.a[b], d = a[0] ^ c[0], e = a[b ? 3 : 1] ^ c[1], f = a[2] ^ c[2];
  a = a[b ? 1 : 3] ^ c[3];
  var g, h, i, k = c.length / 4 - 2, j, l = 4, m = [0, 0, 0, 0];
  g = this.h[b];
  var n = g[0], o = g[1], p = g[2], q = g[3], r = g[4];
  for (j = 0;j < k;j++) {
    g = n[d >>> 24] ^ o[e >> 16 & 255] ^ p[f >> 8 & 255] ^ q[a & 255] ^ c[l];
    h = n[e >>> 24] ^ o[f >> 16 & 255] ^ p[a >> 8 & 255] ^ q[d & 255] ^ c[l + 1];
    i = n[f >>> 24] ^ o[a >> 16 & 255] ^ p[d >> 8 & 255] ^ q[e & 255] ^ c[l + 2];
    a = n[a >>> 24] ^ o[d >> 16 & 255] ^ p[e >> 8 & 255] ^ q[f & 255] ^ c[l + 3];
    l += 4;
    d = g;
    e = h;
    f = i;
  }
  for (j = 0;j < 4;j++) {
    m[b ? 3 & -j : j] = r[d >>> 24] << 24 ^ r[e >> 16 & 255] << 16 ^ r[f >> 8 & 255] << 8 ^ r[a & 255] ^ c[l++];
    g = d;
    d = e;
    e = f;
    f = a;
    a = g;
  }
  return m;
}};
sjcl.bitArray = {bitSlice:function(a, b, c) {
  a = sjcl.bitArray.N(a.slice(b / 32), 32 - (b & 31)).slice(1);
  return c === undefined ? a : sjcl.bitArray.clamp(a, c - b);
}, extract:function(a, b, c) {
  var d = Math.floor(-b - c & 31);
  return((b + c - 1 ^ b) & -32 ? a[b / 32 | 0] << 32 - d ^ a[b / 32 + 1 | 0] >>> d : a[b / 32 | 0] >>> d) & (1 << c) - 1;
}, concat:function(a, b) {
  if (a.length === 0 || b.length === 0) {
    return a.concat(b);
  }
  var c = a[a.length - 1], d = sjcl.bitArray.getPartial(c);
  return d === 32 ? a.concat(b) : sjcl.bitArray.N(b, d, c | 0, a.slice(0, a.length - 1));
}, bitLength:function(a) {
  var b = a.length;
  if (b === 0) {
    return 0;
  }
  return(b - 1) * 32 + sjcl.bitArray.getPartial(a[b - 1]);
}, clamp:function(a, b) {
  if (a.length * 32 < b) {
    return a;
  }
  a = a.slice(0, Math.ceil(b / 32));
  var c = a.length;
  b &= 31;
  if (c > 0 && b) {
    a[c - 1] = sjcl.bitArray.partial(b, a[c - 1] & 2147483648 >> b - 1, 1);
  }
  return a;
}, partial:function(a, b, c) {
  if (a === 32) {
    return b;
  }
  return(c ? b | 0 : b << 32 - a) + a * 1099511627776;
}, getPartial:function(a) {
  return Math.round(a / 1099511627776) || 32;
}, equal:function(a, b) {
  if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
    return false;
  }
  var c = 0, d;
  for (d = 0;d < a.length;d++) {
    c |= a[d] ^ b[d];
  }
  return c === 0;
}, N:function(a, b, c, d) {
  var e;
  e = 0;
  if (d === undefined) {
    d = [];
  }
  for (;b >= 32;b -= 32) {
    d.push(c);
    c = 0;
  }
  if (b === 0) {
    return d.concat(a);
  }
  for (e = 0;e < a.length;e++) {
    d.push(c | a[e] >>> b);
    c = a[e] << 32 - b;
  }
  e = a.length ? a[a.length - 1] : 0;
  a = sjcl.bitArray.getPartial(e);
  d.push(sjcl.bitArray.partial(b + a & 31, b + a > 32 ? c : d.pop(), 1));
  return d;
}, O:function(a, b) {
  return[a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
}};
sjcl.codec.utf8String = {fromBits:function(a) {
  var b = "", c = sjcl.bitArray.bitLength(a), d, e;
  for (d = 0;d < c / 8;d++) {
    if ((d & 3) === 0) {
      e = a[d / 4];
    }
    b += String.fromCharCode(e >>> 24);
    e <<= 8;
  }
  return decodeURIComponent(escape(b));
}, toBits:function(a) {
  a = unescape(encodeURIComponent(a));
  var b = [], c, d = 0;
  for (c = 0;c < a.length;c++) {
    d = d << 8 | a.charCodeAt(c);
    if ((c & 3) === 3) {
      b.push(d);
      d = 0;
    }
  }
  c & 3 && b.push(sjcl.bitArray.partial(8 * (c & 3), d));
  return b;
}};
sjcl.codec.base64 = {C:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", fromBits:function(a, b, c) {
  var d = "", e = 0, f = sjcl.codec.base64.C, g = 0, h = sjcl.bitArray.bitLength(a);
  if (c) {
    f = f.substr(0, 62) + "-_";
  }
  for (c = 0;d.length * 6 < h;) {
    d += f.charAt((g ^ a[c] >>> e) >>> 26);
    if (e < 6) {
      g = a[c] << 6 - e;
      e += 26;
      c++;
    } else {
      g <<= 6;
      e -= 6;
    }
  }
  for (;d.length & 3 && !b;) {
    d += "=";
  }
  return d;
}, toBits:function(a, b) {
  a = a.replace(/\s|=/g, "");
  var c = [], d = 0, e = sjcl.codec.base64.C, f = 0, g;
  if (b) {
    e = e.substr(0, 62) + "-_";
  }
  for (b = 0;b < a.length;b++) {
    g = e.indexOf(a.charAt(b));
    if (g < 0) {
      throw new sjcl.exception.invalid("this isn't base64!");
    }
    if (d > 26) {
      d -= 26;
      c.push(f ^ g >>> d);
      f = g << 32 - d;
    } else {
      d += 6;
      f ^= g << 32 - d;
    }
  }
  d & 56 && c.push(sjcl.bitArray.partial(d & 56, f, 1));
  return c;
}};
sjcl.codec.base64url = {fromBits:function(a) {
  return sjcl.codec.base64.fromBits(a, 1, 1);
}, toBits:function(a) {
  return sjcl.codec.base64.toBits(a, 1);
}};
sjcl.hash.sha256 = function(a) {
  this.a[0] || this.w();
  if (a) {
    this.m = a.m.slice(0);
    this.i = a.i.slice(0);
    this.e = a.e;
  } else {
    this.reset();
  }
};
sjcl.hash.sha256.hash = function(a) {
  return(new sjcl.hash.sha256).update(a).finalize();
};
sjcl.hash.sha256.prototype = {blockSize:512, reset:function() {
  this.m = this.L.slice(0);
  this.i = [];
  this.e = 0;
  return this;
}, update:function(a) {
  if (typeof a === "string") {
    a = sjcl.codec.utf8String.toBits(a);
  }
  var b, c = this.i = sjcl.bitArray.concat(this.i, a);
  b = this.e;
  a = this.e = b + sjcl.bitArray.bitLength(a);
  for (b = 512 + b & -512;b <= a;b += 512) {
    this.B(c.splice(0, 16));
  }
  return this;
}, finalize:function() {
  var a, b = this.i, c = this.m;
  b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
  for (a = b.length + 2;a & 15;a++) {
    b.push(0);
  }
  b.push(Math.floor(this.e / 4294967296));
  for (b.push(this.e | 0);b.length;) {
    this.B(b.splice(0, 16));
  }
  this.reset();
  return c;
}, L:[], a:[], w:function() {
  function a(e) {
    return(e - Math.floor(e)) * 4294967296 | 0;
  }
  var b = 0, c = 2, d;
  a: for (;b < 64;c++) {
    for (d = 2;d * d <= c;d++) {
      if (c % d === 0) {
        continue a;
      }
    }
    if (b < 8) {
      this.L[b] = a(Math.pow(c, 0.5));
    }
    this.a[b] = a(Math.pow(c, 1 / 3));
    b++;
  }
}, B:function(a) {
  var b, c, d = a.slice(0), e = this.m, f = this.a, g = e[0], h = e[1], i = e[2], k = e[3], j = e[4], l = e[5], m = e[6], n = e[7];
  for (a = 0;a < 64;a++) {
    if (a < 16) {
      b = d[a];
    } else {
      b = d[a + 1 & 15];
      c = d[a + 14 & 15];
      b = d[a & 15] = (b >>> 7 ^ b >>> 18 ^ b >>> 3 ^ b << 25 ^ b << 14) + (c >>> 17 ^ c >>> 19 ^ c >>> 10 ^ c << 15 ^ c << 13) + d[a & 15] + d[a + 9 & 15] | 0;
    }
    b = b + n + (j >>> 6 ^ j >>> 11 ^ j >>> 25 ^ j << 26 ^ j << 21 ^ j << 7) + (m ^ j & (l ^ m)) + f[a];
    n = m;
    m = l;
    l = j;
    j = k + b | 0;
    k = i;
    i = h;
    h = g;
    g = b + (h & i ^ k & (h ^ i)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
  }
  e[0] = e[0] + g | 0;
  e[1] = e[1] + h | 0;
  e[2] = e[2] + i | 0;
  e[3] = e[3] + k | 0;
  e[4] = e[4] + j | 0;
  e[5] = e[5] + l | 0;
  e[6] = e[6] + m | 0;
  e[7] = e[7] + n | 0;
}};
sjcl.mode.ccm = {name:"ccm", encrypt:function(a, b, c, d, e) {
  var f, g = b.slice(0), h = sjcl.bitArray, i = h.bitLength(c) / 8, k = h.bitLength(g) / 8;
  e = e || 64;
  d = d || [];
  if (i < 7) {
    throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
  }
  for (f = 2;f < 4 && k >>> 8 * f;f++) {
  }
  if (f < 15 - i) {
    f = 15 - i;
  }
  c = h.clamp(c, 8 * (15 - f));
  b = sjcl.mode.ccm.F(a, b, c, d, e, f);
  g = sjcl.mode.ccm.H(a, g, c, b, e, f);
  return h.concat(g.data, g.tag);
}, decrypt:function(a, b, c, d, e) {
  e = e || 64;
  d = d || [];
  var f = sjcl.bitArray, g = f.bitLength(c) / 8, h = f.bitLength(b), i = f.clamp(b, h - e), k = f.bitSlice(b, h - e);
  h = (h - e) / 8;
  if (g < 7) {
    throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
  }
  for (b = 2;b < 4 && h >>> 8 * b;b++) {
  }
  if (b < 15 - g) {
    b = 15 - g;
  }
  c = f.clamp(c, 8 * (15 - b));
  i = sjcl.mode.ccm.H(a, i, c, k, e, b);
  a = sjcl.mode.ccm.F(a, i.data, c, d, e, b);
  if (!f.equal(i.tag, a)) {
    throw new sjcl.exception.corrupt("ccm: tag doesn't match");
  }
  return i.data;
}, F:function(a, b, c, d, e, f) {
  var g = [], h = sjcl.bitArray, i = h.O;
  e /= 8;
  if (e % 2 || (e < 4 || e > 16)) {
    throw new sjcl.exception.invalid("ccm: invalid tag length");
  }
  if (d.length > 4294967295 || b.length > 4294967295) {
    throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
  }
  f = [h.partial(8, (d.length ? 64 : 0) | e - 2 << 2 | f - 1)];
  f = h.concat(f, c);
  f[3] |= h.bitLength(b) / 8;
  f = a.encrypt(f);
  if (d.length) {
    c = h.bitLength(d) / 8;
    if (c <= 65279) {
      g = [h.partial(16, c)];
    } else {
      if (c <= 4294967295) {
        g = h.concat([h.partial(16, 65534)], [c]);
      }
    }
    g = h.concat(g, d);
    for (d = 0;d < g.length;d += 4) {
      f = a.encrypt(i(f, g.slice(d, d + 4).concat([0, 0, 0])));
    }
  }
  for (d = 0;d < b.length;d += 4) {
    f = a.encrypt(i(f, b.slice(d, d + 4).concat([0, 0, 0])));
  }
  return h.clamp(f, e * 8);
}, H:function(a, b, c, d, e, f) {
  var g, h = sjcl.bitArray;
  g = h.O;
  var i = b.length, k = h.bitLength(b);
  c = h.concat([h.partial(8, f - 1)], c).concat([0, 0, 0]).slice(0, 4);
  d = h.bitSlice(g(d, a.encrypt(c)), 0, e);
  if (!i) {
    return{tag:d, data:[]};
  }
  for (g = 0;g < i;g += 4) {
    c[3]++;
    e = a.encrypt(c);
    b[g] ^= e[0];
    b[g + 1] ^= e[1];
    b[g + 2] ^= e[2];
    b[g + 3] ^= e[3];
  }
  return{tag:d, data:h.clamp(b, k)};
}};
sjcl.misc.hmac = function(a, b) {
  this.K = b = b || sjcl.hash.sha256;
  var c = [[], []], d = b.prototype.blockSize / 32;
  this.k = [new b, new b];
  if (a.length > d) {
    a = b.hash(a);
  }
  for (b = 0;b < d;b++) {
    c[0][b] = a[b] ^ 909522486;
    c[1][b] = a[b] ^ 1549556828;
  }
  this.k[0].update(c[0]);
  this.k[1].update(c[1]);
};
sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(a) {
  a = (new this.K(this.k[0])).update(a).finalize();
  return(new this.K(this.k[1])).update(a).finalize();
};
sjcl.misc.pbkdf2 = function(a, b, c, d, e) {
  c = c || 1E3;
  if (d < 0 || c < 0) {
    throw sjcl.exception.invalid("invalid params to pbkdf2");
  }
  if (typeof a === "string") {
    a = sjcl.codec.utf8String.toBits(a);
  }
  e = e || sjcl.misc.hmac;
  a = new e(a);
  var f, g, h, i, k = [], j = sjcl.bitArray;
  for (i = 1;32 * k.length < (d || 1);i++) {
    e = f = a.encrypt(j.concat(b, [i]));
    for (g = 1;g < c;g++) {
      f = a.encrypt(f);
      for (h = 0;h < f.length;h++) {
        e[h] ^= f[h];
      }
    }
    k = k.concat(e);
  }
  if (d) {
    k = j.clamp(k, d);
  }
  return k;
};
sjcl.random = {randomWords:function(a, b) {
  var c = [];
  b = this.isReady(b);
  var d;
  if (b === 0) {
    throw new sjcl.exception.notReady("generator isn't seeded");
  } else {
    b & 2 && this.T(!(b & 1));
  }
  for (b = 0;b < a;b += 4) {
    (b + 1) % 65536 === 0 && this.J();
    d = this.u();
    c.push(d[0], d[1], d[2], d[3]);
  }
  this.J();
  return c.slice(0, a);
}, setDefaultParanoia:function(a) {
  this.s = a;
}, addEntropy:function(a, b, c) {
  c = c || "user";
  var d, e, f = (new Date).valueOf(), g = this.p[c], h = this.isReady(), i = 0;
  d = this.D[c];
  if (d === undefined) {
    d = this.D[c] = this.Q++;
  }
  if (g === undefined) {
    g = this.p[c] = 0;
  }
  this.p[c] = (this.p[c] + 1) % this.b.length;
  switch(typeof a) {
    case "number":
      if (b === undefined) {
        b = 1;
      }
      this.b[g].update([d, this.t++, 1, b, f, 1, a | 0]);
      break;
    case "object":
      c = Object.prototype.toString.call(a);
      if (c === "[object Uint32Array]") {
        e = [];
        for (c = 0;c < a.length;c++) {
          e.push(a[c]);
        }
        a = e;
      } else {
        if (c !== "[object Array]") {
          i = 1;
        }
        for (c = 0;c < a.length && !i;c++) {
          if (typeof a[c] != "number") {
            i = 1;
          }
        }
      }
      if (!i) {
        if (b === undefined) {
          for (c = b = 0;c < a.length;c++) {
            for (e = a[c];e > 0;) {
              b++;
              e >>>= 1;
            }
          }
        }
        this.b[g].update([d, this.t++, 2, b, f, a.length].concat(a));
      }
      break;
    case "string":
      if (b === undefined) {
        b = a.length;
      }
      this.b[g].update([d, this.t++, 3, b, f, a.length]);
      this.b[g].update(a);
      break;
    default:
      i = 1;
  }
  if (i) {
    throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
  }
  this.j[g] += b;
  this.f += b;
  if (h === 0) {
    this.isReady() !== 0 && this.I("seeded", Math.max(this.g, this.f));
    this.I("progress", this.getProgress());
  }
}, isReady:function(a) {
  a = this.A[a !== undefined ? a : this.s];
  return this.g && this.g >= a ? this.j[0] > 80 && (new Date).valueOf() > this.M ? 3 : 1 : this.f >= a ? 2 : 0;
}, getProgress:function(a) {
  a = this.A[a ? a : this.s];
  return this.g >= a ? 1 : this.f > a ? 1 : this.f / a;
}, startCollectors:function() {
  if (!this.l) {
    if (window.addEventListener) {
      window.addEventListener("load", this.n, false);
      window.addEventListener("mousemove", this.o, false);
    } else {
      if (document.attachEvent) {
        document.attachEvent("onload", this.n);
        document.attachEvent("onmousemove", this.o);
      } else {
        throw new sjcl.exception.bug("can't attach event");
      }
    }
    this.l = true;
  }
}, stopCollectors:function() {
  if (this.l) {
    if (window.removeEventListener) {
      window.removeEventListener("load", this.n, false);
      window.removeEventListener("mousemove", this.o, false);
    } else {
      if (window.detachEvent) {
        window.detachEvent("onload", this.n);
        window.detachEvent("onmousemove", this.o);
      }
    }
    this.l = false;
  }
}, addEventListener:function(a, b) {
  this.q[a][this.P++] = b;
}, removeEventListener:function(a, b) {
  var c;
  a = this.q[a];
  var d = [];
  for (c in a) {
    a.hasOwnProperty(c) && (a[c] === b && d.push(c));
  }
  for (b = 0;b < d.length;b++) {
    c = d[b];
    delete a[c];
  }
}, b:[new sjcl.hash.sha256], j:[0], z:0, p:{}, t:0, D:{}, Q:0, g:0, f:0, M:0, a:[0, 0, 0, 0, 0, 0, 0, 0], d:[0, 0, 0, 0], r:undefined, s:6, l:false, q:{progress:{}, seeded:{}}, P:0, A:[0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024], u:function() {
  for (var a = 0;a < 4;a++) {
    this.d[a] = this.d[a] + 1 | 0;
    if (this.d[a]) {
      break;
    }
  }
  return this.r.encrypt(this.d);
}, J:function() {
  this.a = this.u().concat(this.u());
  this.r = new sjcl.cipher.aes(this.a);
}, S:function(a) {
  this.a = sjcl.hash.sha256.hash(this.a.concat(a));
  this.r = new sjcl.cipher.aes(this.a);
  for (a = 0;a < 4;a++) {
    this.d[a] = this.d[a] + 1 | 0;
    if (this.d[a]) {
      break;
    }
  }
}, T:function(a) {
  var b = [], c = 0, d;
  this.M = b[0] = (new Date).valueOf() + 3E4;
  for (d = 0;d < 16;d++) {
    b.push(Math.random() * 4294967296 | 0);
  }
  for (d = 0;d < this.b.length;d++) {
    b = b.concat(this.b[d].finalize());
    c += this.j[d];
    this.j[d] = 0;
    if (!a && this.z & 1 << d) {
      break;
    }
  }
  if (this.z >= 1 << this.b.length) {
    this.b.push(new sjcl.hash.sha256);
    this.j.push(0);
  }
  this.f -= c;
  if (c > this.g) {
    this.g = c;
  }
  this.z++;
  this.S(b);
}, o:function(a) {
  sjcl.random.addEntropy([a.x || (a.clientX || (a.offsetX || 0)), a.y || (a.clientY || (a.offsetY || 0))], 2, "mouse");
}, n:function() {
  sjcl.random.addEntropy((new Date).valueOf(), 2, "loadtime");
}, I:function(a, b) {
  var c;
  a = sjcl.random.q[a];
  var d = [];
  for (c in a) {
    a.hasOwnProperty(c) && d.push(a[c]);
  }
  for (c = 0;c < d.length;c++) {
    d[c](b);
  }
}};
try {
  var s = new Uint32Array(32);
  crypto.getRandomValues(s);
  sjcl.random.addEntropy(s, 1024, "crypto['getRandomValues']");
} catch (t) {
}
sjcl.json = {defaults:{v:1, iter:1E3, ks:128, ts:64, mode:"ccm", adata:"", cipher:"aes"}, encrypt:function(a, b, c, d) {
  c = c || {};
  d = d || {};
  var e = sjcl.json, f = e.c({iv:sjcl.random.randomWords(4, 0)}, e.defaults), g;
  e.c(f, c);
  c = f.adata;
  if (typeof f.salt === "string") {
    f.salt = sjcl.codec.base64.toBits(f.salt);
  }
  if (typeof f.iv === "string") {
    f.iv = sjcl.codec.base64.toBits(f.iv);
  }
  if (!sjcl.mode[f.mode] || (!sjcl.cipher[f.cipher] || (typeof a === "string" && f.iter <= 100 || (f.ts !== 64 && (f.ts !== 96 && f.ts !== 128) || (f.ks !== 128 && (f.ks !== 192 && f.ks !== 256) || (f.iv.length < 2 || f.iv.length > 4)))))) {
    throw new sjcl.exception.invalid("json encrypt: invalid parameters");
  }
  if (typeof a === "string") {
    g = sjcl.misc.cachedPbkdf2(a, f);
    a = g.key.slice(0, f.ks / 32);
    f.salt = g.salt;
  }
  if (typeof b === "string") {
    b = sjcl.codec.utf8String.toBits(b);
  }
  if (typeof c === "string") {
    c = sjcl.codec.utf8String.toBits(c);
  }
  g = new sjcl.cipher[f.cipher](a);
  e.c(d, f);
  d.key = a;
  f.ct = sjcl.mode[f.mode].encrypt(g, b, f.iv, c, f.ts);
  return e.encode(f);
}, decrypt:function(a, b, c, d) {
  c = c || {};
  d = d || {};
  var e = sjcl.json;
  b = e.c(e.c(e.c({}, e.defaults), e.decode(b)), c, true);
  var f;
  c = b.adata;
  if (typeof b.salt === "string") {
    b.salt = sjcl.codec.base64.toBits(b.salt);
  }
  if (typeof b.iv === "string") {
    b.iv = sjcl.codec.base64.toBits(b.iv);
  }
  if (!sjcl.mode[b.mode] || (!sjcl.cipher[b.cipher] || (typeof a === "string" && b.iter <= 100 || (b.ts !== 64 && (b.ts !== 96 && b.ts !== 128) || (b.ks !== 128 && (b.ks !== 192 && b.ks !== 256) || (!b.iv || (b.iv.length < 2 || b.iv.length > 4))))))) {
    throw new sjcl.exception.invalid("json decrypt: invalid parameters");
  }
  if (typeof a === "string") {
    f = sjcl.misc.cachedPbkdf2(a, b);
    a = f.key.slice(0, b.ks / 32);
    b.salt = f.salt;
  }
  if (typeof c === "string") {
    c = sjcl.codec.utf8String.toBits(c);
  }
  f = new sjcl.cipher[b.cipher](a);
  c = sjcl.mode[b.mode].decrypt(f, b.ct, b.iv, c, b.ts);
  e.c(d, b);
  d.key = a;
  return sjcl.codec.utf8String.fromBits(c);
}, encode:function(a) {
  var b, c = "{", d = "";
  for (b in a) {
    if (a.hasOwnProperty(b)) {
      if (!b.match(/^[a-z0-9]+$/i)) {
        throw new sjcl.exception.invalid("json encode: invalid property name");
      }
      c += d + '"' + b + '":';
      d = ",";
      switch(typeof a[b]) {
        case "number":
        ;
        case "boolean":
          c += a[b];
          break;
        case "string":
          c += '"' + escape(a[b]) + '"';
          break;
        case "object":
          c += '"' + sjcl.codec.base64.fromBits(a[b], 0) + '"';
          break;
        default:
          throw new sjcl.exception.bug("json encode: unsupported type");;
      }
    }
  }
  return c + "}";
}, decode:function(a) {
  a = a.replace(/\s/g, "");
  if (!a.match(/^\{.*\}$/)) {
    throw new sjcl.exception.invalid("json decode: this isn't json!");
  }
  a = a.replace(/^\{|\}$/g, "").split(/,/);
  var b = {}, c, d;
  for (c = 0;c < a.length;c++) {
    if (!(d = a[c].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))) {
      throw new sjcl.exception.invalid("json decode: this isn't json!");
    }
    b[d[2]] = d[3] ? parseInt(d[3], 10) : d[2].match(/^(ct|salt|iv)$/) ? sjcl.codec.base64.toBits(d[4]) : unescape(d[4]);
  }
  return b;
}, c:function(a, b, c) {
  if (a === undefined) {
    a = {};
  }
  if (b === undefined) {
    return a;
  }
  var d;
  for (d in b) {
    if (b.hasOwnProperty(d)) {
      if (c && (a[d] !== undefined && a[d] !== b[d])) {
        throw new sjcl.exception.invalid("required parameter overridden");
      }
      a[d] = b[d];
    }
  }
  return a;
}, V:function(a, b) {
  var c = {}, d;
  for (d in a) {
    if (a.hasOwnProperty(d) && a[d] !== b[d]) {
      c[d] = a[d];
    }
  }
  return c;
}, U:function(a, b) {
  var c = {}, d;
  for (d = 0;d < b.length;d++) {
    if (a[b[d]] !== undefined) {
      c[b[d]] = a[b[d]];
    }
  }
  return c;
}};
sjcl.encrypt = sjcl.json.encrypt;
sjcl.decrypt = sjcl.json.decrypt;
sjcl.misc.R = {};
sjcl.misc.cachedPbkdf2 = function(a, b) {
  var c = sjcl.misc.R, d;
  b = b || {};
  d = b.iter || 1E3;
  c = c[a] = c[a] || {};
  d = c[d] = c[d] || {firstSalt:b.salt && b.salt.length ? b.salt.slice(0) : sjcl.random.randomWords(2, 0)};
  c = b.salt === undefined ? d.firstSalt : b.salt;
  d[c] = d[c] || sjcl.misc.pbkdf2(a, c, b.iter);
  return{key:d[c].slice(0), salt:c.slice(0)};
};
goog.provide("goog.net.Cookies");
goog.provide("goog.net.cookies");
goog.net.Cookies = function(context) {
  this.document_ = context;
};
goog.net.Cookies.MAX_COOKIE_LENGTH = 3950;
goog.net.Cookies.SPLIT_RE_ = /\s*;\s*/;
goog.net.Cookies.prototype.isEnabled = function() {
  return navigator.cookieEnabled;
};
goog.net.Cookies.prototype.isValidName = function(name) {
  return!/[;=\s]/.test(name);
};
goog.net.Cookies.prototype.isValidValue = function(value) {
  return!/[;\r\n]/.test(value);
};
goog.net.Cookies.prototype.set = function(name, value, opt_maxAge, opt_path, opt_domain, opt_secure) {
  if (!this.isValidName(name)) {
    throw Error('Invalid cookie name "' + name + '"');
  }
  if (!this.isValidValue(value)) {
    throw Error('Invalid cookie value "' + value + '"');
  }
  if (!goog.isDef(opt_maxAge)) {
    opt_maxAge = -1;
  }
  var domainStr = opt_domain ? ";domain=" + opt_domain : "";
  var pathStr = opt_path ? ";path=" + opt_path : "";
  var secureStr = opt_secure ? ";secure" : "";
  var expiresStr;
  if (opt_maxAge < 0) {
    expiresStr = "";
  } else {
    if (opt_maxAge == 0) {
      var pastDate = new Date(1970, 1, 1);
      expiresStr = ";expires=" + pastDate.toUTCString();
    } else {
      var futureDate = new Date(goog.now() + opt_maxAge * 1E3);
      expiresStr = ";expires=" + futureDate.toUTCString();
    }
  }
  this.setCookie_(name + "=" + value + domainStr + pathStr + expiresStr + secureStr);
};
goog.net.Cookies.prototype.get = function(name, opt_default) {
  var nameEq = name + "=";
  var parts = this.getParts_();
  for (var i = 0, part;part = parts[i];i++) {
    if (part.lastIndexOf(nameEq, 0) == 0) {
      return part.substr(nameEq.length);
    }
    if (part == name) {
      return "";
    }
  }
  return opt_default;
};
goog.net.Cookies.prototype.remove = function(name, opt_path, opt_domain) {
  var rv = this.containsKey(name);
  this.set(name, "", 0, opt_path, opt_domain);
  return rv;
};
goog.net.Cookies.prototype.getKeys = function() {
  return this.getKeyValues_().keys;
};
goog.net.Cookies.prototype.getValues = function() {
  return this.getKeyValues_().values;
};
goog.net.Cookies.prototype.isEmpty = function() {
  return!this.getCookie_();
};
goog.net.Cookies.prototype.getCount = function() {
  var cookie = this.getCookie_();
  if (!cookie) {
    return 0;
  }
  return this.getParts_().length;
};
goog.net.Cookies.prototype.containsKey = function(key) {
  return goog.isDef(this.get(key));
};
goog.net.Cookies.prototype.containsValue = function(value) {
  var values = this.getKeyValues_().values;
  for (var i = 0;i < values.length;i++) {
    if (values[i] == value) {
      return true;
    }
  }
  return false;
};
goog.net.Cookies.prototype.clear = function() {
  var keys = this.getKeyValues_().keys;
  for (var i = keys.length - 1;i >= 0;i--) {
    this.remove(keys[i]);
  }
};
goog.net.Cookies.prototype.setCookie_ = function(s) {
  this.document_.cookie = s;
};
goog.net.Cookies.prototype.getCookie_ = function() {
  return this.document_.cookie;
};
goog.net.Cookies.prototype.getParts_ = function() {
  return(this.getCookie_() || "").split(goog.net.Cookies.SPLIT_RE_);
};
goog.net.Cookies.prototype.getKeyValues_ = function() {
  var parts = this.getParts_();
  var keys = [], values = [], index, part;
  for (var i = 0;part = parts[i];i++) {
    index = part.indexOf("=");
    if (index == -1) {
      keys.push("");
      values.push(part);
    } else {
      keys.push(part.substring(0, index));
      values.push(part.substring(index + 1));
    }
  }
  return{keys:keys, values:values};
};
goog.net.cookies = new goog.net.Cookies(document);
goog.net.cookies.MAX_COOKIE_LENGTH = goog.net.Cookies.MAX_COOKIE_LENGTH;
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
fb.simplelogin.util.env.isFennec = function() {
  try {
    var userAgent = navigator["userAgent"];
    return userAgent.indexOf("Fennec/") != -1 || userAgent.indexOf("Firefox/") != -1 && userAgent.indexOf("Android") != -1;
  } catch (e) {
  }
  return false;
};
goog.provide("fb.simplelogin.SessionStore");
goog.provide("fb.simplelogin.SessionStore_");
goog.require("fb.simplelogin.util.env");
goog.require("fb.simplelogin.util.sjcl");
goog.require("goog.net.cookies");
var cookieStoragePath = "/";
var encryptionStorageKey = "firebaseSessionKey";
var sessionPersistentStorageKey = "firebaseSession";
var hasLocalStorage = fb.simplelogin.util.env.hasLocalStorage();
fb.simplelogin.SessionStore_ = function() {
};
fb.simplelogin.SessionStore_.prototype.set = function(session, opt_sessionLengthDays) {
  if (!hasLocalStorage) {
    return;
  }
  try {
    var sessionEncryptionKey = session["sessionKey"];
    var payload = sjcl.encrypt(sessionEncryptionKey, fb.simplelogin.util.json.stringify(session));
    localStorage.setItem(sessionPersistentStorageKey, fb.simplelogin.util.json.stringify(payload));
    var maxAgeSeconds = opt_sessionLengthDays ? opt_sessionLengthDays * 86400 : -1;
    goog.net.cookies.set(encryptionStorageKey, sessionEncryptionKey, maxAgeSeconds, cookieStoragePath, null, false);
  } catch (e) {
  }
};
fb.simplelogin.SessionStore_.prototype.get = function() {
  if (!hasLocalStorage) {
    return;
  }
  try {
    var sessionEncryptionKey = goog.net.cookies.get(encryptionStorageKey);
    var payload = localStorage.getItem(sessionPersistentStorageKey);
    if (sessionEncryptionKey && payload) {
      var session = fb.simplelogin.util.json.parse(sjcl.decrypt(sessionEncryptionKey, fb.simplelogin.util.json.parse(payload)));
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
  goog.net.cookies.remove(encryptionStorageKey, cookieStoragePath, null);
};
fb.simplelogin.SessionStore = new fb.simplelogin.SessionStore_;
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
      callbackInvoked = true;
      var data, error;
      try {
        data = fb.simplelogin.util.json.parse(xhr.responseText);
        error = data["error"] || null;
        delete data["error"];
      } catch (e) {
      }
      if (!data || error) {
        return onComplete && onComplete(self.formatError_(error));
      } else {
        return onComplete && onComplete(error, data);
      }
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
  return window["XMLHttpRequest"] && typeof window["XMLHttpRequest"] === "function";
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
fb.simplelogin.transports.XHR_.prototype.formatError_ = function(error) {
  if (error) {
    return fb.simplelogin.Errors.format(error);
  } else {
    return fb.simplelogin.Errors.get("UNKNOWN_ERROR");
  }
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
      var ref = document.getElementsByTagName("script")[0];
      ref.parentNode.insertBefore(js, ref);
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
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_FIREBASE"));
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.createUser = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/create";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_FIREBASE"));
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_EMAIL"));
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["password"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_PASSWORD"));
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.changePassword = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/update";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_FIREBASE"));
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_EMAIL"));
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["newPassword"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_PASSWORD"));
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.removeUser = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/remove";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_FIREBASE"));
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_EMAIL"));
  }
  if (!fb.simplelogin.util.validation.isValidPassword(data["password"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_PASSWORD"));
  }
  this.getTransport_().open(url, data, onComplete);
};
fb.simplelogin.providers.Password_.prototype.sendPasswordResetEmail = function(data, onComplete) {
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/firebase/reset_password";
  if (!fb.simplelogin.util.validation.isValidNamespace(data["firebase"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_FIREBASE"));
  }
  if (!fb.simplelogin.util.validation.isValidEmail(data["email"])) {
    return onComplete && onComplete(fb.simplelogin.Errors.get("INVALID_EMAIL"));
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
        var urlHashEncoded = fb.simplelogin.util.misc.parseQuerystring(decodeURIComponent(urlObj["hash"]));
        var temporaryResult = {};
        for (var key in urlHashEncoded) {
          temporaryResult[key] = fb.simplelogin.util.json.parse(urlHashEncoded[key]);
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
        callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred."});
      }
    }
  }, function(err) {
    callbackHandler({code:"UNKNOWN_ERROR", message:"An unknown error occurred."});
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
goog.provide("fb.simplelogin.providers.Persona");
goog.provide("fb.simplelogin.providers.Persona_");
goog.require("fb.simplelogin.util.validation");
fb.simplelogin.providers.Persona_ = function() {
};
fb.simplelogin.providers.Persona_.prototype.login = function(options, onComplete) {
  navigator["id"]["watch"]({"onlogin":function(assertion) {
    onComplete(assertion);
  }, "onlogout":function() {
  }});
  options = options || {};
  options["oncancel"] = function() {
    onComplete(null);
  };
  navigator["id"]["request"](options);
};
fb.simplelogin.providers.Persona = new fb.simplelogin.providers.Persona_;
goog.provide("fb.simplelogin.client");
goog.require("fb.simplelogin.util.env");
goog.require("fb.simplelogin.util.json");
goog.require("fb.simplelogin.util.validation");
goog.require("fb.simplelogin.Vars");
goog.require("fb.simplelogin.Errors");
goog.require("fb.simplelogin.SessionStore");
goog.require("fb.simplelogin.providers.Persona");
goog.require("fb.simplelogin.providers.Password");
goog.require("fb.simplelogin.transports.JSONP");
goog.require("fb.simplelogin.transports.CordovaInAppBrowser");
goog.require("fb.simplelogin.transports.TriggerIoTab");
goog.require("fb.simplelogin.transports.WinChan");
goog.require("fb.simplelogin.transports.WindowsMetroAuthBroker");
goog.require("goog.string");
var CLIENT_VERSION = "1.3.1";
fb.simplelogin.client = function(ref, callback, context, apiHost) {
  var self = this;
  this.mRef = ref;
  this.mNamespace = fb.simplelogin.util.misc.parseSubdomain(ref.toString());
  this.sessionLengthDays = null;
  var globalNamespace = "_FirebaseSimpleLogin";
  window[globalNamespace] = window[globalNamespace] || {};
  window[globalNamespace]["callbacks"] = window[globalNamespace]["callbacks"] || [];
  window[globalNamespace]["callbacks"].push({"cb":callback, "ctx":context});
  var warnTestingLocally = window.location.protocol === "file:" && (!fb.simplelogin.util.env.isPhantomJS() && (!fb.simplelogin.util.env.isMobileCordovaInAppBrowser() && (console && console.log)));
  if (warnTestingLocally) {
    var message = "FirebaseSimpleLogin(): Due to browser security restrictions, " + "loading applications via `file://*` URLs will prevent popup-based authentication " + "providers from working properly. When testing locally, you'll need to run a " + "barebones webserver on your machine rather than loading your test files via " + "`file://*`. The easiest way to run a barebones server on your local machine is to " + "`cd` to the root directory of your code and run `python -m SimpleHTTPServer`, " + 
    "which will allow you to access your content via `http://127.0.0.1:8000/*`.";
    console.log(message);
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
fb.simplelogin.client.prototype.attemptAuth = function(token, user, saveSession) {
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
    } else {
      fb.simplelogin.SessionStore.clear();
      self.mLoginStateChange(null, null);
    }
  }, function(error) {
    fb.simplelogin.SessionStore.clear();
    self.mLoginStateChange(null, null);
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
    case "persona":
      return this.loginWithPersona(options);
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
  var self = this;
  var provider = "anonymous";
  options.firebase = this.mNamespace;
  options.v = CLIENT_VERSION;
  fb.simplelogin.transports.JSONP.open(fb.simplelogin.Vars.getApiHost() + "/auth/anonymous", options, function(error, response) {
    if (error || !response["token"]) {
      self.mLoginStateChange(fb.simplelogin.Errors.format(error), null);
    } else {
      var token = response["token"];
      var user = response["user"];
      self.attemptAuth(token, user, true);
    }
  });
};
fb.simplelogin.client.prototype.loginWithPassword = function(options) {
  var self = this;
  options.firebase = this.mNamespace;
  options.v = CLIENT_VERSION;
  fb.simplelogin.providers.Password.login(options, function(error, response) {
    if (error || !response["token"]) {
      self.mLoginStateChange(fb.simplelogin.Errors.format(error));
    } else {
      var token = response["token"];
      var user = response["user"];
      self.attemptAuth(token, user, true);
    }
  });
};
fb.simplelogin.client.prototype.loginWithGithub = function(options) {
  options["height"] = 850;
  options["width"] = 950;
  this.loginViaOAuth("github", options);
};
fb.simplelogin.client.prototype.loginWithGoogle = function(options) {
  options["height"] = 650;
  options["width"] = 575;
  this.loginViaOAuth("google", options);
};
fb.simplelogin.client.prototype.loginWithFacebook = function(options) {
  options["height"] = 400;
  options["width"] = 535;
  this.loginViaOAuth("facebook", options);
};
fb.simplelogin.client.prototype.loginWithTwitter = function(options) {
  this.loginViaOAuth("twitter", options);
};
fb.simplelogin.client.prototype.loginWithFacebookToken = function(options) {
  this.loginViaToken("facebook", options);
};
fb.simplelogin.client.prototype.loginWithGoogleToken = function(options) {
  this.loginViaToken("google", options);
};
fb.simplelogin.client.prototype.loginWithTwitterToken = function(options) {
  this.loginViaToken("twitter", options);
};
fb.simplelogin.client.prototype.loginWithPersona = function(options) {
  var self = this;
  if (!navigator["id"]) {
    throw new Error("FirebaseSimpleLogin.login(persona): Unable to find Persona include.js");
  }
  fb.simplelogin.providers.Persona.login(options, function(assertion) {
    if (assertion === null) {
      callback(fb.simplelogin.Errors.get("UNKNOWN_ERROR"));
    } else {
      fb.simplelogin.transports.JSONP.open(fb.simplelogin.Vars.getApiHost() + "/auth/persona/token", {"firebase":self.mNamespace, "assertion":assertion, "v":CLIENT_VERSION}, function(err, res) {
        if (err || (!res["token"] || !res["user"])) {
          self.mLoginStateChange(fb.simplelogin.Errors.format(err), null);
        } else {
          var token = res["token"];
          var user = res["user"];
          self.attemptAuth(token, user, true);
        }
      });
    }
  });
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
  fb.simplelogin.transports.JSONP.open(url, options, function(err, res) {
    if (err || (!res["token"] || !res["user"])) {
      self.mLoginStateChange(fb.simplelogin.Errors.format(err), null);
    } else {
      var token = res["token"];
      var user = res["user"];
      self.attemptAuth(token, user, true);
    }
  });
};
fb.simplelogin.client.prototype.loginViaOAuth = function(provider, options, cb) {
  options = options || {};
  var self = this;
  var url = fb.simplelogin.Vars.getApiHost() + "/auth/" + provider + "?firebase=" + this.mNamespace;
  if (options["scope"]) {
    url += "&scope=" + options["scope"];
  }
  if (options["debug"]) {
    url += "&debug=" + options["debug"];
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
  transport.open(url, options, function(error, res) {
    if (res && (res.token && res.user)) {
      self.attemptAuth(res.token, res.user, true);
    } else {
      var errObj = error || {code:"UNKNOWN_ERROR", message:"An unknown error occurred."};
      if (error === "unknown closed window") {
        errObj = {code:"USER_DENIED", message:"User cancelled the authentication request."};
      } else {
        if (res && res.error) {
          errObj = res.error;
        }
      }
      self.mLoginStateChange(fb.simplelogin.Errors.format(errObj), null);
    }
  });
};
fb.simplelogin.client.prototype.manageFirebaseUsers = function(method, data, cb) {
  data["firebase"] = this.mNamespace;
  fb.simplelogin.providers.Password[method](data, function(error, result) {
    if (error) {
      return cb && cb(fb.simplelogin.Errors.format(error), null);
    } else {
      return cb && cb(null, result);
    }
  });
};
fb.simplelogin.client.prototype.createUser = function(email, password, cb) {
  this.manageFirebaseUsers("createUser", {"email":email, "password":password}, cb);
};
fb.simplelogin.client.prototype.changePassword = function(email, oldPassword, newPassword, cb) {
  this.manageFirebaseUsers("changePassword", {"email":email, "oldPassword":oldPassword, "newPassword":newPassword}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.prototype.removeUser = function(email, password, cb) {
  this.manageFirebaseUsers("removeUser", {"email":email, "password":password}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.prototype.sendPasswordResetEmail = function(email, cb) {
  this.manageFirebaseUsers("sendPasswordResetEmail", {"email":email}, function(error) {
    return cb && cb(error);
  });
};
fb.simplelogin.client.onOpen = function(cb) {
  fb.simplelogin.transports.WinChan.onOpen(cb);
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
    client_.setApiHost(apiHost);
  }, "login":function() {
    client_.login.apply(client_, arguments);
  }, "logout":function() {
    var methodId = "FirebaseSimpleLogin.logout";
    fb.simplelogin.util.validation.validateArgCount(methodId, 0, 0, arguments.length);
    client_.logout();
  }, "createUser":function(email, password, cb) {
    var method = "FirebaseSimpleLogin.createUser";
    fb.simplelogin.util.validation.validateArgCount(method, 3, 3, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 3, cb, false);
    client_.createUser(email, password, cb);
  }, "changePassword":function(email, oldPassword, newPassword, cb) {
    var method = "FirebaseSimpleLogin.changePassword";
    fb.simplelogin.util.validation.validateArgCount(method, 4, 4, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 4, cb, false);
    client_.changePassword(email, oldPassword, newPassword, cb);
  }, "removeUser":function(email, password, cb) {
    var method = "FirebaseSimpleLogin.removeUser";
    fb.simplelogin.util.validation.validateArgCount(method, 3, 3, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 3, cb, false);
    client_.removeUser(email, password, cb);
  }, "sendPasswordResetEmail":function(email, cb) {
    var method = "FirebaseSimpleLogin.sendPasswordResetEmail";
    fb.simplelogin.util.validation.validateArgCount(method, 2, 2, arguments.length);
    fb.simplelogin.util.validation.validateCallback(method, 2, cb, false);
    client_.sendPasswordResetEmail(email, cb);
  }};
};
FirebaseSimpleLogin.onOpen = function(cb) {
  fb.simplelogin.client.onOpen(cb);
};

