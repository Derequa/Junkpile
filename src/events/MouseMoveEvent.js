'use strict'

var Junkpile = require('../Junkpile');
var Event = require('./Event');

/**
 * This class wraps a raw document event for mouse-movement to the engine's
 * event management system.
 *
 * @memberof Junkpile.events
 * @extends Junkpile.events.Event
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.events.MouseMoveEvent = class MouseMoveEvent extends Junkpile.events.Event {

  /**
   * This constructs a new MouseMoveEvent with the given mouse event and
   * set its type.
   *
   * @constructor
   * @this {Junkpile.events.MouseMoveEvent}
   * @param {MouseEvent} documentEvent  The mouse event passed to us from the document.
   */
  constructor(documentEvent){
    super(documentEvent, Junkpile.events.MouseMoveEvent.MOUSEMOVEEVENT_TYPE);
  }

  /**
   * This method clone this event.
   * NOTE: Untested, use with caution.
   *
   * @this {Junkpile.events.MouseMoveEvent}
   * @override
   * @returns {Junkpile.events.MouseMoveEvent}
   *                                    The cloned event.
   */
  clone(){
    return new Junkpile.events.MouseMoveEvent(this.eventData);
  }

  /**
   * This method gets the string used to type this class of event.
   *
   * @static
   * @returns {string}                  The type string for this event class.
   */
  static getType(){
    return Junkpile.events.MouseMoveEvent.MOUSEMOVEEVENT_TYPE;
  }

}

/**
 * A constant string to use as the type field for this event.
 *
 * @member {string}
 * @readonly
 * @default 'MouseMoveEvent'
 */
Junkpile.events.MouseMoveEvent.MOUSEMOVEEVENT_TYPE = 'MouseMoveEvent';

module.exports = Junkpile.events.MouseMoveEvent;
