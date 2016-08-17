"use strict";

var Junkpile = require('../Junkpile');

/**
 * This class implements a dynamic typed event management system.
 * This allows for any type of event to be sent to the system,
 * classes and components to listen for any given type of events,
 * and provide any fuction to be notified when that event occurs.
 *
 * @memberof Junkpile
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.EventManager = class EventManager {

  /**
   * This constructs a new event manager instance.
   *
   * @constructs Junkpile.EventManager
   * @this {Junkpile.EventManager}
   */
  constructor() {
    /**
     * The table of current events.
     *
     * @member {Array.<Junkpile.events.Event>} Junkpile.EventManager#events
     */
    this.events = new Array();
    /**
     * A table mapping type-keys to a list of listener instances and functions.
     *
     * @member {Array.<Array.<object>>} Junkpile.EventManager#listeners
     */
    this.listeners = new Array();
  }

  /**
   * This method will add an event to the current list of events.
   *
   * @this {Junkpile.EventManager}
   * @param {Junkpile.events.Event} event  The event to add to the manager.
   */
  addEvent(event){
    this.events.push(event);
  }

  /**
   * This adds a listener for a given type of event.
   *
   * @this {Junkpile.EventManager}
   * @param {string} typeID             The event type to listen for.
   *                                    Each event class maintains a constant string that will
   *                                    be set for the type field on construction.
   *                                    These can be used to register as a listener.
   * @param {object} handlerObj         The instance of the object to call the handler function on.
   * @param {function} handlerFunc      The call-back function to handle the given type of event.
   *                                    This function will be called using the form:
   *
   *                                    function(event, handlerObj)
   *
   *                                    Where the event field is the event object and the handler
   *                                    object is the same handler object given here. Design your
   *                                    functions to match and accept this standard.
   */
  addListenerFor(typeID, handlerObj, handlerFunc){
    if(this.listeners[typeID] === undefined)
      this.listeners[typeID] = new Array();
    this.listeners[typeID].push({obj: handlerObj, func: handlerFunc});
  }

  /**
   * This method will walk the list of current events check for listeners for events
   * of their type in the listener table. Upon finding a match, the handler function will
   * be called with the appropriate parameters.
   *
   * @this {Junkpile.EventManager}
   */
  handleEvents() {
    while(this.events.length > 0){
      var event = this.events.pop();
      var currentListeners = this.listeners[event.type];
      if(!currentListeners)
        continue;
      for(var i = 0; i < currentListeners.length; i++){
        currentListeners[i].func(event, currentListeners[i].obj);
      }
    }
  }

}

module.exports = Junkpile.EventManager;
