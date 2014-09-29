var protoclass = require("protoclass");

function Listener (options, parent, segment) {

  this.parent    = parent;
  this.segment   = segment;
  this._isParam  = (segment || "").substr(0, 1) === ":";
  this._segmentRegexTest = segment && segment.substr(0, 1) === "(" ? new RegExp(segment) : void 0;
  this._children = {};
  this.channel   = this._getChannel();
  this._contexts = (parent ? parent._contexts : void 0) || [];
  this.depth     = this._getDepth();

  this.reset(options);
}

protoclass(Listener, {

  /**
   */

  _getChannel: function () {
    var path = [], p = this;
    while (p) {
      path.unshift(p.segment);
      p = p.parent;
    }
    return path.join("/");
  },

  /**
   */

  reset: function (options) {
    this._children = {};
    if (!options) options = {};
    this._test     = this._getTester(options.test);
    this._execute  = options.execute || function() {};
    this._addChildren(options);
  },

  /**
   */

  _getTester: function (test) {

    if (!test) return function () { return true };

    if (typeof test === "object") {
      return function (message) {
        for (var testProperty in test) {
          if (message.get(testProperty) !== this.get(test[testProperty])) return false;
        }
        return true;
      }
    }

    return test;
  },

  /**
   */

  _getDepth: function () {
    var i = 0;
    var p = this;
    while (p = p.parent) i++;
    return i;
  },

  /**
   */

  test: function (message) {
    return this._test(message);
  },

  /**
   */

  _testPath: function (context, message) {

    if (!this.segment) return true;

    var apath = message.path[this.depth], bpath = this.segment;

    if (!apath) return false;

    if (this._isParam) {
      bpath = context.get(bpath.substr(1));
    }


    if (apath.substr(0, 1) === ":") {
      apath = message.context.get(apath.substr(1));
    }

    if (this._segmentRegexTest) {
      return this._segmentRegexTest.test(apath);
    }


    return apath === bpath;
  },

  /**
   */

  _addChildren: function (options) {
    for (var key in options) {
      if (key.substr(0, 1) === "/") this.addChild(options[key], key.substr(1).split("/"));
    }
  },

  /**
   */

  addContext: function (context) {
    this._contexts.push(context);
    var self = this;
    context.once("dispose", function () {
      self._contexts.splice(self._contexts.indexOf(context), 1);
    });
  },

  /**
   */

  addChild: function (options, path) {
    this._findListener(path || [], 0).reset(options);
  },

  /**
   */

  _findListener: function (path, index) {

    if (index >= path.length) return this;

    var segment = path[index];

    var child = this._children[segment] || (this._children[segment] = this._createChild(void 0, segment));

    return child._findListener(path, index + 1);
  },

  /**
   */

  _createChild: function (options, segment) {
    return new Listener(options, this, segment);
  },

  /**
   */

  execute: function (message) {

    var execs = 0;


    for (var i = this._contexts.length; i--;) {

      var context = this._contexts[i];

      if (!this._testPath(context, message)) continue;

      if (!this._test.call(context, message)) continue;

      this._execute.call(context, message.payload, message.context);
      execs++;
    }


    if (execs)
    for (var key in this._children) {
      var child = this._children[key];
      child.execute(message);
    }
  }
});

module.exports = Listener;
