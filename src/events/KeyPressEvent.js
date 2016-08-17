'use strict'

var Junkpile = require('../Junkpile');
var Event = require('./Event');

/**
 * This class symbolizes a KeyPress event from the document.
 * It wraps a keypress event in a form that is compatible with Junkpile's event manager.
 *
 * @memberof Junkpile.events
 * @extends Junkpile.events.Event
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.events.KeyPressEvent = class KeyPressEvent extends Junkpile.events.Event {

  /**
   * This constructs a new KeyPress event to be used in the Junkpile event manager.
   *
   * @constructs Junkpile.events.KeyPressEvent
   * @this {Junkpile.events.KeyPressEvent}
   * @param {KeyboardEvent} domevent    The keypress event from the document.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
   */
  constructor(domevent) {
    super(domevent, Junkpile.events.KeyPressEvent.KEYPRESSEVENT_TYPE);
  }

  /**
   * This method gets the string used to type this event.
   *
   * @static
   * @returns {string}                  The string used to type this event.
   */
  static getType() {
    return Junkpile.events.KeyPressEvent.KEYPRESSEVENT_TYPE;
  }

  /**
   * This method is not implemented for this object and will return null.
   *
   * @this {Junkpile.events.KeyPressEvent}
   * @override
   * @returns {Junkpile.events.KeyPressEvent}
   *                                    Always returns null for now.
   */
  clone() {
    return null;
  }

}

/**
 * This is the string used to type this event.
 *
 * @member {string}
 * @readonly
 * @default 'KeyPressEvent'
 */
Junkpile.events.KeyPressEvent.KEYPRESSEVENT_TYPE = 'KeyPressEvent';

module.exports = Junkpile.events.KeyPressEvent;
