'use strict'

var Junkpile = require('../Junkpile');
var Event = require('./Event');

/**
 * This class wraps a key event from the document to a typed event
 * to be used in the engine's event system.
 *
 * @memberof Junkpile.events
 * @extends Junkpile.events.Event
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.events.KeyEvent = class KeyEvent extends Junkpile.events.Event {

  /**
   * This contructs a KeyEvent for the engine from the document event and
   * the given key state.
   *
   * @constructs Junkpile.events.KeyEvent
   * @this {Junkpile.events.KeyEvent}
   * @param {KeyboardEvent} documentEvent
   *                                    The event recieved from the document.
   * @param {boolean} keyDown           A boolean for if the key was pressed.
   *                                    True if pressed, false if released.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
   */
  constructor(documentEvent, keyDown) {
    super(documentEvent, Junkpile.events.KeyEvent.KEYEVENT_TYPE);
    if ((keyDown !== true) && (keyDown !== false))
      throw new Error('Invalid keyDown value');

    /**
     * Whether or not the key event was for key down or key up.
     *
     * @member {boolean} Junkpile.events.KeyEvent#keyDown
     */
    this.keyDown = keyDown;
  }

  /**
   * This method clones this key event.
   * NOTE: This hasn't been tested, use with caution.
   *
   * @this {Junkpile.events.KeyEvent}
   * @override
   * @returns {Junkpile.events.KeyEvent}   The cloned event.
   */
  clone() {
    return new Junkpile.events.KeyEvent(this.eventData, this.keyDown);
  }

  /**
   * This method gets the string used to type this class of event.
   *
   * @returns {string}                  The type string for this event class.
   */
  static getType() {
    return Junkpile.events.KeyEvent.KEYEVENT_TYPE;
  }

}

/**
 * A constant string to use as the type field for this event
 *
 * @member {string}
 */
Junkpile.events.KeyEvent.KEYEVENT_TYPE = 'KeyEvent';

module.exports = Junkpile.events.KeyEvent;
