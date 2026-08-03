'use strict';

// Intentional simplification: captures raw API calls but does not expand Roll20
// macros, render templates, calculate inline rolls, or enforce permissions.
class ChatCapture {
  constructor() {
    this.messages = [];
  }

  sendChat(who, content, callback, options) {
    const entry = { who, content, callback, options };
    this.messages.push(entry);
    if (typeof callback === 'function') {
      callback([{ content, inlinerolls: [] }]);
    }
    return entry;
  }
}

module.exports = { ChatCapture };
