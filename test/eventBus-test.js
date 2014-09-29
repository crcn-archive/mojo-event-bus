var EventBus = require("../lib/eventBus"),
expect       = require("expect.js"),
bindable     = require("bindable");


describe(__filename + "#", function () {

  var events;

  beforeEach(function () {
    events = new EventBus();
  });

  it("can add a listener & publish to it", function () {
    var i = 0;
    var listener = events.subscribe({
      execute: function () {
        i++;
      },
      "/hello": {
        execute: function () {
          i++;
        },
        "/world": {
          execute: function () {
            i++;
          }
        },
        "/blarg": {
          execute: function () {
            i++;
          }
        }
      }
    });

    listener.addContext(new bindable.Object());

    events.publish("/hello");
    expect(i).to.be(2);
    events.publish("/hello/world/blarg");
    expect(i).to.be(5);
  });

  it("can execute a route if the published command is fetching properties from the published context", function () {
    var i = 0;
    var listener = events.subscribe({
      "/nstudents/update": {
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object());
    events.publish("/nstudents/update", {}, new bindable.Object());
    events.publish("/channels/update", {}, new bindable.Object());
    expect(i).to.be(1);
  });

  it("can add multiple contexts", function () {

    var i = 0, c, c2;

    var listener = events.subscribe({
      "/hello": {
        execute: function () {
          if (i++ == 0) {
            expect(this).to.be(c2);
          } else if (i == 1) {
            expect(this).to.be(c);
          }
        }
      }
    });
    listener.addContext(c = new bindable.Object());
    listener.addContext(c2 = new bindable.Object());
    events.publish("/hello");
  });

  it("can publish an event with parameters, and only execute against a matched context", function () {

    var i = 0;

    var listener = events.subscribe({
      "/hello/:name": {
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "baab" }));
    expect(i).to.be(1);
  });

  it("can fill in a parameter when executing a command", function () {
    var i = 0;

    var listener = events.subscribe({
      "/hello/:name": {
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "abba" }));
    events.publish("/hello/abba", {}, new bindable.Object({ name: "abba" }));
    events.publish("/hello/baab", {}, new bindable.Object({ name: "baab" }));
    expect(i).to.be(1);
  });

  it("can execute a route if the published command is fetching properties from the published context", function () {
    var i = 0;
    var listener = events.subscribe({
      "/hello/abba": {
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "baab" }));
    expect(i).to.be(1);
  });

  

  it("can execute a route multiple times if the contexts have the same property", function () {
    var j = 0;
    var listener = events.subscribe({
      "/hello/:name": {
        execute: function () {
          j++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "abba" }));
    listener.addContext(new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "abba" }));
    expect(j).to.be(2);
  });

  it("can set a param to a regex pattern", function () {
    var i = 0;
    var listener = events.subscribe({
      "/hello/(abba|baab)": {
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "aaaa" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "abba" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "baab" }));
    events.publish("/hello/:name", {}, new bindable.Object({ name: "bbbb" }));
    expect(i).to.be(2);
  });

  it("can test properties against", function () {
    var i = 0;
    var listener = events.subscribe({
      "/hello": {
        test: { "context.name": "name" },
        execute: function () {
          i++;
        }
      }
    });

    listener.addContext(new bindable.Object({ name: "aaaa" }));
    events.publish("/hello", {}, new bindable.Object({ name: "aaaa" }));
    events.publish("/hello", {}, new bindable.Object({ name: "bbbb" }));
    expect(i).to.be(1);
  });

  xit("emits the channel when executed on the context", function () {
    var c, i = 0;
    var listener = events.subscribe({
      "/hello": {
        execute: function () {
        }
      }
    });

    listener.addContext(c = new bindable.Object({ name: "aaaa" }));

    c.on("/hello", function () {
      i++;
    });

    events.publish("/hello");

    expect(i).to.be(1);

  })
});
