 var EventBus = require("./eventBus");


module.exports = function (app) {

  var eventBus = app.eventBus = new EventBus();

  var listeners = {};

  var modelCollectionDecorator = {
    getOptions: function (model) {
      if (!model.constructor.prototype.subscribe) return void 0;

      if (model.__name) {
        return listeners[model.__name] || (listeners[model.__name] = eventBus.subscribe(model.constructor.prototype.subscribe))
      } else {
        return eventBus.subscribe(model.constructor.prototype.subscribe);
      }
      
    },
    decorate: function (model, listener) {
      listener.addContext(model);

      model.publish = function (channel, payload) {
        eventBus.publish(channel, payload, model);
      };
    }
  };

  var modelDecorator = {
    inherit: false,
    getOptions: function (model) {
      if (model.__isBindableCollection) {
        return void 0;
      }

      return model.__isBindable && !model.__isBindableCollection;
    },
    decorate: function (model) {


      model.on("change", function (key, newValue, oldValue) {
        var data = model.serialize();
        model.publish("/" + model.__name + "/change", { key: key, newValue: newValue, oldValue: oldValue });
      });

      model.on("dispose", function () {
        var data = model.serialize();
        model.publish("/" + model.__name + "/dispose");
      });
    }
  };

  var collectionDecorator = {
    getOptions: function (model) {
      return model.__isBindableCollection;
    },
    decorate: function (collection) {

      // happens when the collection persists to some sort of API
      collection.on("didUpdate", function (data) {

        eventBus.publish("/" + collection.__name + "/didUpdate", data, collection);

        if (data.insert && data.insert.length) { 
          eventBus.publish("/" + collection.__name + "/didInsert", data, collection);
        }

        if (data.remove && data.remove.length) { 
          eventBus.publish("/" + collection.__name + "/didRemove", data, collection);
        }
      });

      collection.on("update", function (data) {

        // this wording isn't so true, but avoids some confusion by describing
        // that the collection has updated immediately, and WILL update later on (but it might not).
        // this wording however is a bit more descriptive than "update", "create", and "remove"
        eventBus.publish("/" + collection.__name + "/willUpdate", data, collection);


        if (data.insert && data.insert.length) { 
          eventBus.publish("/" + collection.__name + "/willInsert", data, collection);
        }

        if (data.remove && data.remove.length) { 
          eventBus.publish("/" + collection.__name + "/willRemove", data, collection);
        }
      });
    }
  }

  if (app.models) {
    app.models.decorator(modelCollectionDecorator);
    app.models.decorator(modelDecorator);
    app.models.decorator(collectionDecorator);
  }

  if (app.views) {
    app.views.decorator(modelCollectionDecorator);
  }
}


