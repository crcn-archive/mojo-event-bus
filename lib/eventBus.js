var protoclass = require("protoclass"),
Listener       = require("./listener"),
bindable       = require("bindable");

function EventBus () {
  this._listeners = [];
}
protoclass(EventBus, {
  publish: function (channel, payload, context) {

    var path = channel.split("/");

    var message = new bindable.Object();
    message.context(message);
    message.setProperties({
      path: path,
      channel: channel,
      context: context,
      payload: payload
    });

    for (var i = this._listeners.length; i--;) {
      this._listeners[i].execute(message);
    }
  },
  subscribe: function (options) {
    var listener;
    this._listeners.push(listener = new Listener(options));
    return listener;
  }
});

module.exports = EventBus;
