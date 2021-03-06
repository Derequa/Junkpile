'use strict'

var Junkpile = require('../Junkpile');
var Event = require('./Event');

/**
 * This class wraps a click event from the document to a typed event
 * that is compatible with the engine's event management system.
 *
 * @memberof Junkpile.events
 * @extends Junkpile.events.Event
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.events.ClickEvent = class ClickEvent extends Junkpile.events.Event {

  /**
   * This constructs a ClickEvent with the given document event and mouse button state.
   *
   * @constructs Junkpile.events.ClickEvent
   * @this {Junkpile.events.ClickEvent}
   * @param {MouseEvent} documentEvent  The event generated by the document.
   * @param {boolean} mouseDown         A boolean for determining whether the mouse was
   *                                    pressed or released.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent}
   */
  constructor(documentEvent, mouseDown){
    super(documentEvent, Junkpile.events.ClickEvent.CLICKEVENT_TYPE);

    /**
     * This signals whether the mouse click was pressed or released.
     *
     * @member {boolean} Junkpile.events.ClickEvent#mouseDown
     */
    this.mouseDown = mouseDown;
  }

  /**
   * This method clones this click event and returns it.
   * NOTE: This hasn't been tested, use with caution.
   *
   * @this {Junkpile.events.ClickEvent}
   * @override
   * @returns {Junkpile.events.ClickEvent} The cloned event.
   */
  clone(){
    return new Junkpile.events.ClickEvent(this.eventData, this.mouseDown);
  }

  /**
   * This method gets the string used to type this class of event.
   *
   * @static
   * @returns {string}                  The type string for this event class.
   */
  static getType(){
    return Junkpile.events.ClickEvent.CLICKEVENT_TYPE;
  }

}

/**
 * The string used to type this event.
 *
 * @member {string}
 * @readonly
 * @default 'ClickEvent'
 */
Junkpile.events.ClickEvent.CLICKEVENT_TYPE = 'ClickEvent';

module.exports = Junkpile.events.ClickEvent;
