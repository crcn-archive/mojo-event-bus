var eventBusPlugin = require("../lib"),
expect             = require("expect.js"),
bindable           = require("bindable"),
views              = require("mojo-views"),
models             = require("mojo-models"),
Application        = require("mojo-application");


describe(__filename + "#", function () {

  var app, testModel, testCollection, eventBus;

  beforeEach(function () {

    app = new Application();
    app.use(views);
    app.use(models);
    app.use(eventBusPlugin);
    eventBus = app.eventBus;

    app.models.register({
      model: models.Base.extend({
        persist: {
          load: function (complete) { complete(); },
          remove: function (complete) { complete(); },
          save: function (complete) { complete(null, {}); }
        }
      }),
      collection: models.Collection.extend({
        createModel: function (properties) {
          return app.models.create("model", properties);
        },
        persist: {
          load: function (complete) { complete(); },
          remove: function (complete) { complete(); },
          save: function (complete) { complete(); }
        }
      })
    });

    testModel = app.models.create("model");
    testCollection = app.models.create("collection");
  });


  describe("collection", function () {

    it("emits willUpdate immediately after the an item is inserted", function () {
      var i = 0;
      var listener = eventBus.subscribe({
        "/collection/collection/willUpdate": {
          execute: function (data) {
            expect(data.insert[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" });
      expect(i).to.be(1);
    });

    it("emits willUpdate immediately after the an item is removed", function () {
      var i = 0;

      // will emit stuff
      testCollection.create({ name: "a" });

      var listener = eventBus.subscribe({
        "/collection/collection/willUpdate": {
          execute: function (data) {
            expect(data.remove[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      testCollection.splice(0, 1);

      expect(i).to.be(1);
    });

     it("emits willInsert immediately after the an item is removed", function () {
      var i = 0;


      var listener = eventBus.subscribe({
        "/collection/collection/willInsert": {
          execute: function (data) {
            expect(data.insert[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" });

      expect(i).to.be(1);
    });

    it("emits willRemove immediately after the an item is removed", function () {
      var i = 0;

      // will emit stuff
      testCollection.create({ name: "a" });

      var listener = eventBus.subscribe({
        "/collection/collection/willRemove": {
          execute: function (data) {
            expect(data.remove[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      testCollection.splice(0, 1);

      expect(i).to.be(1);
    });

    it("emits a didUpdate after successfuly saving", function (next) {
      var i = 0;
      var listener = eventBus.subscribe({
        "/collection/collection/didUpdate": {
          execute: function (data) {
            expect(data.insert[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" }).save(function () {
        expect(i).to.be(1);
        next();
      });
    });

    it("emits a didUpdate after successfuly removing", function (next) {
      var i = 0;
      var listener = eventBus.subscribe({
        "/collection/collection/didUpdate": {
          execute: function (data) {
            if (data.remove) expect(data.remove[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" }).save(function (err, model) {
        model.remove(function () {
          expect(i).to.be(2);
          next();
        });
      });
    });

    it("emits a didInsert after successfuly inserting", function (next) {
      var i = 0;
      var listener = eventBus.subscribe({
        "/collection/collection/didInsert": {
          execute: function (data) {
            if (data.remove) expect(data.remove[0].name).to.be("a");
            i++;
          }
        }
      });
      
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" }).save(function () {
        expect(i).to.be(1);
        next();
      });
    });

    it("emits a didRemove after successfuly removing", function (next) {
      var i = 0;
      var listener = eventBus.subscribe({
        "/collection/collection/didRemove": {
          execute: function (data) {
            expect(data.remove[0].name).to.be("a");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      // will emit stuff
      testCollection.create({ name: "a" }).save(function (err, model) {
        model.remove(function () {
          expect(i).to.be(1);
          next();
        });
      })
    });


    describe("subscriptions", function () {

    });
  });

  describe("models", function () {

    it("successfuly emits change when the model changes", function () {
      var i = 0;
      var listener = eventBus.subscribe({
        "/model/model/change": {
          execute: function (data) {
            expect(data.key).to.be("name");
            expect(data.oldValue).to.be("a");
            expect(data.newValue).to.be("b");
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      var model = testCollection.create({ name: "a" });
      model.set("name", "b");
      expect(i).to.be(1);
    });

    it("successfuly emits dispose when the model changes", function () {
      var i = 0;
      var listener = eventBus.subscribe({
        "/model/model/dispose": {
          execute: function (data) {
            i++;
          }
        }
      });
      listener.addContext(new bindable.Object());

      var model = testCollection.create({ name: "a" });
      model.set("name", "b");
      model.dispose();
      expect(i).to.be(1);
    });

    it("attaches a b")
  });
});