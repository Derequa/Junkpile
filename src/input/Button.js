'use strict'

var Junkpile = require('../Junkpile');

/**
 * This class models the basic properties of a button in the Junkpile engine.
 * This class also serves as a base class for modeling a key on the keyboard and serves to directly
 * models a mouse button.
 *
 * @memberof Junkpile.input
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.input.Button = class Button {

  /**
   * This contructs a new instance of a button with the given code and parent object.
   *
   * @constructs Junkpile.input.Button
   * @this {Junkpile.input.Button}
   * @param {Junkpile.Engine} engine       The engine instance this button is part of.
   * @param {Junkpile.EngineObject} parent The parent object that manages this button.
   * @param {number} buttonCode         The button code this button represents.
   */
  constructor(engine, parent, buttonCode) {

    /**
     * The engine instance this button is part of.
     *
     * @member {Junkpile.Engine} Junkpile.input.Button#engine
     */
    this.engine = engine

    /**
     * The parent object that manages this button.
     *
     * @member {Junkpile.model.EngineObject} Junkpile.input.Button#parent
     */
    this.parent = parent;

    /**
     * A flag for whether or not this button is currently enabled.
     *
     * @member {boolean} Junkpile.input.Button#enabled
     * @default true
     */
    this.enabled = true;

    /**
     * The last document event this button recieved.
     *
     * @member {UIEvent} Junkpile.input.Button#domevent
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/UIEvent}
     */
    this.domevent = null;

    /**
     * A flag for whether or not the alt key is down when this button was last modified.
     *
     * @member {boolean} Junkpile.input.Button#altKey
     */
    this.altKey = false;

    /**
     * A flag for whether or not the ctrl key is down when this button was last modified.
     *
     * @member {boolean} Junkpile.input.Button#ctrlKey
     */
    this.ctrlKey = false;

    /**
     * A flag for whether or not the shift key is down when this button was last modified.
     *
     * @member {boolean} Junkpile.input.Button#shiftKey
     */
    this.shiftKey = false;

    /**
     * A flag for whether or not the button is currently up.
     *
     * @member {boolean} Junkpile.input.Button#isUp
     */
    this.isUp = true;

    /**
     * A flag for whether or not the button is currently down.
     *
     * @member {boolean} Junkpile.input.Button#isDown
     */
    this.isDown = false;

    /**
     * The time stamp when the button last went down.
     *
     * @member {number} Junkpile.input.Button#timeDown
     */
    this.timeDown = 0;

    /**
     * The time stamp when the button last was released.
     *
     * @member {number} Junkpile.input.Button#timeUp
     */
    this.timeUp = 0;

    /**
     * The duration this button was pressed before it was released (in miliseconds).
     *
     * @member {number} Junkpile.input.Button#duration
     */
    this.duration = 0;

    /**
     * The code this button represents. (mouse button code or keycode)
     *
     * @member {number} Junkpile.input.Button#buttonCode
     */
    this.buttonCode = buttonCode;
  }

  /**
   * This method follows the EngineObject interface in providing a way for updating button
   * information on each tick of the engine.
   *
   * @this {Junkpile.input.Button}
   */
  update() {
    if(!this.enabled)
      return;
      if(this.isDown){
        this.duration = this.engine.time.getTime() - this.timeDown;
      }
  }

  /**
   * This method resets button information as a way to forget previous input state.
   *
   * @this {Junkpile.input.Button}
   */
  reset(){
    // Reset fields
    this.enabled = true;
    this.isDown = false;
    this.isUp = true;
    this.timeUp = this.engine.time.getTime();
    this.duration = 0;
  }

  /**
   * This method handles processing a button up event for this button.
   *
   * @this {Junkpile.input.Button}
   * @param {UIEvent} domEvent          The event object from the document that describes
   *                                    this event.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/UIEvent}
   */
  processButtonUp(domEvent) {
    // Check fields for valid state
    if(!this.enabled)
      return;
    if(this.isUp)
      return;
    // Set fields according to event
    this.domEvent = domEvent;
    this.altKey = domEvent.altKey;
    this.ctrlKey = domEvent.ctrlKey;
    this.shiftKey = domEvent.shiftKey;
    this.isUp = true;
    this.isDown = false;
    this.timeUp = this.engine.time.getTime();
    this.duration = this.engine.time.getTime() - this.timeDown;;
  }

  /**
   * This method handles processing a button down event for this button.
   *
   * @this {Junkpile.input.Button}
   * @param {UIEvent} domEvent          The event object from the document that describes
   *                                    this event.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/UIEvent}
   */
  processButtonDown(domEvent) {
    // Error check
    if(!this.enabled)
      return;
    if(this.isDown)
      return;
    // Check to make sure button down isn;t double firing
    if((this.engine.time.getTime() - this.timeUp) < Junkpile.input.Button.BTN_DELAY)
      return;
    // Set fields
    this.domEvent = domEvent;
    this.altKey = domEvent.altKey;
    this.ctrlKey = domEvent.ctrlKey;
    this.shiftKey = domEvent.shiftKey;
    this.isUp = false;
    this.isDown = true;
    this.timeDown = this.engine.time.getTime();
    this.duration = 0;
  }

  /**
   * This method lets you check if this button has been down for a given duration.
   *
   * @this {Junkpile.input.Button}
   * @param {number} duration           The amount of time to check if this button has been
   *                                    down for.
   * @returns {boolean}                 True if the button has been down for the given amount
   *                                    of time
   */
  downDuration(duration) {
    if (duration === undefined)
      duration = Junkpile.input.Button.BTN_RECENT;
    return (this.isDown && this.duration < duration);
  }

  /**
   * This method lets you check if this button has been up for a given duration.
   *
   * @this {Junkpile.input.Button}
   * @param {number} duration           The amount of time to check if this button has been
   *                                    up for.
   * @returns {boolean}                 True if the button has been up for the given amount
   *                                    of time
   */
  upDuration(duration) {
    if (duration === undefined)
      duration = Junkpile.input.Button.BTN_RECENT;
    return (!this.isDown && ((this.engine.time.current - this.timeUp) < duration));
  }
}

/**
 * A constant for the amount of time that qualifies as recent for gaging how recent a button
 * has been released or pressed.
 *
 * @member {number}
 * @readonly
 * @default 12
 */
Junkpile.input.Button.BTN_RECENT = 18;

/**
 * A constant the amount of time it takes for a button to repeat.
 * This is used for repeating keys that are held down.
 *
 * @member {number}
 * @readonly
 * @default 110
 */
Junkpile.input.Button.BTN_REPEAT_TIMER = 110;

/**
 * A constant for the delay required between button presses to avoid double firing.
 *
 * @member {number}
 * @readonly
 * @default 100
 */
Junkpile.input.Button.BTN_DELAY = 100;

module.exports = Junkpile.input.Button;
