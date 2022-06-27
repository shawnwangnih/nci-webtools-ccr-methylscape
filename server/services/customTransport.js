const { noop } = require("lodash");
const Transport = require("winston-transport");

class CustomTransport extends Transport {
  constructor(opts = {}) {
    super(opts);
    this.handler = opts.handler || noop;
  }

  setHandler(handler) {
    this.handler = handler;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    this.handler(info);
    callback();
  }
}

module.exports = CustomTransport;
