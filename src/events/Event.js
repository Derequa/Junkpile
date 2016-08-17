"use strict";

var Junkpile = require('../Junkpile');

/**
 * This class provides a base event representation for events to extend and implement
 * in the engine's event system.
 *
 * @memberof Junkpile.events
 * @abstract
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.events.Event = class Event {

  /**
   * This defines the constructor for a generic event object.
   *
   * @constructs Junkpile.events.Event
   * @abstract
   * @this {Junkpile.events.Event}
   * @param {object} eventdata          The obejct representing specific data for the implementing
   *                                    event. This can be a recieced event object or position
   *                                    data etc..
   * @param {string} typeID             A string representing the type of implementing event.
   *                                    This should also be defined as a constant for reference in
   *                                    the implementing class file.
   */
  constructor(eventdata, typeID) {
    if (this.constructor === Event) {
      throw new Error("Can't instantiate abstract class!");
    }

    /**
     * The object or information relavent to this event.
     *
     * @member {object} Junkpile.events.Event#eventdata
     */
    this.eventdata = eventdata;

    /**
     * The type string for this event.
     *
     * @member {string} Junkpile.events.Event#type
     */
    this.type = typeID;
  }

  /**
   * This method clones an event object.
   *
   * @this {Junkpile.events.Event}
   * @abstract
   * @returns {Junkpile.events.Event}      The cloned event.
   */
  clone(){
    throw new Error('This method has not been implemented in this subclass');
  }

}

module.exports = Junkpile.events.Event;
