'use strict'

var Junkpile = require('../Junkpile');
var Engine = require('../Engine');
var EngineObject = require('../model/EngineObject');
var Button = require('./Button');
var ClickEvent = require('../events/ClickEvent');
var MouseMoveEvent = require('../events/MouseMoveEvent');
var Victor = require('../../libs/Victor');

/**
 * This class models a mouse and its buttons for the Junkpile engine, and provides an interface
 * for managing mouse input. More granular control can be found though the attached mouse buttons.
 *
 * @memberof Junkpile.input
 * @extends Junkpile.model.EngineObject
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.input.Mouse = class Mouse extends Junkpile.model.EngineObject {

  /**
   * This contructs a new mouse object, and attached it to the given engine's event manager
   * and object list.
   *
   * @constructs Junkpile.input.Mouse
   * @this {Junkpile.input.Mouse}
   * @param {Junkpile.Engine} enigne       The engine instance this is apart of.
   */
  constructor(engine) {
    super(engine, Junkpile.input.Mouse.MOUSE_TYPE, Junkpile.input.Mouse.MOUSE_TYPE);

    /**
     * Whether or not this mouse is enabled.
     *
     * @member {boolean} Junkpile.input.Mouse#enabled
     * @default true
     */
    this.enabled = true;

    /**
     * Wheel data (direction) for the mouse.
     *
     * @member {number} Junkpile.input.Mouse#wheelData
     */
    this.wheelData = 0;

    /**
     * The last document even recieved.
     *
     * @member {MouseEvent} Junkpile.input.Mouse#domevent
     */
    this.domevent = null;

    /**
     * The previous position the mouse was at.
     *
     * @member {Victor} Junkpile.input.Mouse#lastPosition
     * @see {@link http://victorjs.org/#documentation}
     */
    this.lastPosition = new Victor(0, 0);

    /**
     * The current position of the mouse.
     *
     * @member {Victor} Junkpile.input.Mouse#position
     * @see {@link http://victorjs.org/#documentation}
     */
    this.position = new Victor(0, 0);

    /**
     * The time the mouse moved last.
     *
     * @member {number} Junkpile.input.Mouse#lastMoveTime
     */
    this.lastMoveTime = 0;

    /**
     * The buttons this mouse maintains.
     *
     * @member {Array.<Junkpile.input.Button>} Junkpile.input.Mouse#buttons
     */
    this.buttons = new Array();

    // Add buttons
    this.buttons[Junkpile.input.Mouse.LEFT_BUTTON] =
      new Junkpile.input.Button(engine, this, Junkpile.input.Mouse.LEFT_BUTTON);
    this.buttons[Junkpile.input.Mouse.RIGHT_BUTTON] =
      new Junkpile.input.Button(engine, this, Junkpile.input.Mouse.RIGHT_BUTTON);
    this.buttons[Junkpile.input.Mouse.MIDDLE_BUTTON] =
      new Junkpile.input.Button(engine, this, Junkpile.input.Mouse.MIDDLE_BUTTON);
    this.buttons[Junkpile.input.Mouse.BACK_BUTTON] =
      new Junkpile.input.Button(engine, this, Junkpile.input.Mouse.BACK_BUTTON);
    this.buttons[Junkpile.input.Mouse.FORWARD_BUTTON] =
      new Junkpile.input.Button(engine, this, Junkpile.input.Mouse.FORWARD_BUTTON);
  }

  /**
   * This method updates the mouse and its associated buttons.
   *
   * @this {Junkpile.input.Mouse}
   */
  update() {
    for(var i in this.buttons) {
      this.buttons[i].update();
    }
  }

  setup() {}

  /**
   * This method attaches this mouse to the engine's event manager.
   *
   * @this {Junkpile.input.Mouse}
   */
  addToEventManager() {
    // Register listeners in the engine's event manager
    this.engine.eventManager.addListenerFor(
      Junkpile.events.ClickEvent.getType(), this, this.processMouseButton);
    this.engine.eventManager.addListenerFor(
      Junkpile.events.MouseMoveEvent.getType(), this, this.processMouseMove);
  }

  /**
   * This method resets all the buttons for this mouse, and clears position and wheel data.
   *
   * @this {Junkpile.input.Mouse}
   */
  reset() {
    // Reset buttons
    for(var i in this.buttons) {
      this.buttons[i].reset();
    }
    // Reset positions
    this.lastPosition.x = 0;
    this.lastPosition.y = 0;
    this.position.x = 0;
    this.position.y = 0;
    // Reset time and wheel data
    this.lastMoveTime = 0;
    this.wheelData = 0;
  }

  /**
   * This method is the callback for handling a mouse click event.
   * NOTE: To recieve events from the event manager, you will have to add this mouse as a
   * listener using the addToEventManager method.
   *
   * @param {Junkpile.events.ClickEvent} clickevent
   *                                    The click event from the event manager.
   * @param {Junkpile.input.Mouse} obj     The Mouse object that requested the callback.
   */
  processMouseButton(clickevent, obj) {
    if(clickevent.mouseDown)
      obj.processMouseDown(clickevent.eventdata);
    else
      obj.processMouseUp(clickevent.eventdata);
  }

  /**
   * This method is the callback for handling a mouse move event.
   * NOTE: To recieve events from the event manager, you will have to add this mouse as a
   * listener using the addToEventManager method.
   *
   * @param {Junkpile.events.MouseMoveEvent} moveevent
   *                                    The mouse move event from the event manager.
   * @param {Junkpile.input.Mouse} obj     The Mouse object that requested the callback.
   */
  processMouseMove(moveevent, obj) {
    // Update the last position
    obj.lastPosition.x = obj.position.x;
    obj.lastPosition.y = obj.position.y;
    // Get the world coordinates for the new position
    var worldPos = Junkpile.Engine.getWorldPos(moveevent.eventdata.x,
                                            moveevent.eventdata.y, obj.engine);
    // Set the new position in world coordinates
    obj.position.x = worldPos.x;
    obj.position.y = worldPos.y;
    // Recrod the time
    obj.lastMoveTime = obj.engine.time.getTime();
    Junkpile.Engine.debugMessage('Mouse moved to: ' + obj.position.toString(), Junkpile.Engine.DebugChannel.INPUT);
  }

  /**
   * This method handles a mouse down event from the document and passes it of to the correct
   * button object.
   *
   * @this {Junkpile.input.Mouse}
   * @param {MouseEvent} domevent       The document mouse event to handle.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent}
   */
  processMouseDown(domevent) {
    // Check if we have the button, and pass the event to the button if we do
    if(this.buttons[domevent.button])
      this.buttons[domevent.button].processButtonDown(domevent);
    Junkpile.Engine.debugMessage('Mouse button #' + domevent.button + ' was pressed', Junkpile.Engine.DebugChannel.INPUT);
  }

  /**
   * This method handles a mouse up event from the document and passes it of to the correct
   * button object.
   *
   * @this {Junkpile.input.Mouse}
   * @param {MouseEvent} domevent       The document mouse event to handle.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent}
   */
  processMouseUp(domevent) {
    if(this.buttons[domevent.button])
      this.buttons[domevent.button].processButtonUp(domevent);
    Junkpile.Engine.debugMessage('Mouse button #' + domevent.button + ' was released', Junkpile.Engine.DebugChannel.INPUT);
  }

  /**
   * This method checks if a button with a given code is currently up.
   *
   * @this {Junkpile.input.Mouse}
   * @param {number} buttoncode         The code for the button to check.
   * @returns {boolean}                 True if the button with the given code is currently up.
   */
  isUp(buttoncode) {
    return this.buttons[buttoncode].isUp;
  }

  /**
   * This method checks if a button with a given code is currently down.
   *
   * @this {Junkpile.input.Mouse}
   * @param {number} buttoncode         The code for the button to check.
   * @returns {boolean}                 True if the button with the given code is currently down.
   */
  isDown(buttoncode) {
    return this.buttons[buttoncode].isDown;
  }

  /**
   * This method checks if the button with the given code has been down for the given duration.
   *
   * @this {Junkpile.input.Mouse}
   * @param {number} buttoncode         The code for the button we wish to check.
   * @param {number} duration           The amount of time to check if the button has been down for
   *                                    in miliseconds.
   * @returns {boolean}                 True if the button has been down for the given amount
   *                                    of time.
   */
  downDuration(buttoncode, duration) {
    return this.buttons[buttoncode].downDuration(duration);
  }

  /**
   * This method checks if the button with the given code has been up for the given duration.
   *
   * @this {Junkpile.input.Mouse}
   * @param {number} buttoncode         The code for the button we wish to check.
   * @param {number} duration           The amount of time to check if the button has been up for
   *                                    in miliseconds.
   * @returns {boolean}                 True if the button has been up for the given amount
   *                                    of time.
   */
  upDuration(buttoncode, duration) {
    return this.buttons[buttoncode].upDuration(duration);
  }

  /**
   * This method checks if the mouse has moved recently, using the Junkpile.input.Mouse.RECENCY
   * value to determine what qualifies recently.
   *
   * @this {Junkpile.input.Mouse}
   * @returns {boolean}                 True if the mouse has moved recently.
   */
  hasMovedRecently() {
    return ((this.engine.time.getTime() - this.lastMoveTime) < Junkpile.input.Mouse.RECENCY);
  }

  /**
   * This method gets the string used to type this object.
   *
   * @static
   * @returns {string}                  The string used to type this object.
   */
  static getType() {
    return Junkpile.input.Mouse.MOUSE_TYPE;
  }
}

/**
 * The amount of time in miliseconds that qualifies as recent.
 *
 * @member {number}
 * @readonly
 * @default 500
 */
Junkpile.input.Mouse.RECENCY = 500;

/**
 * The string used to type the mouse object.
 *
 * @member {string}
 * @readonly
 * @default 'Mouse'
 */
Junkpile.input.Mouse.MOUSE_TYPE = 'Mouse';

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.NO_BUTTON = -1;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.LEFT_BUTTON = 0;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.MIDDLE_BUTTON = 1;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.RIGHT_BUTTON = 2;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.BACK_BUTTON = 3;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.FORWARD_BUTTON = 4;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.WHEEL_UP = 1;

/**
 * @member {number}
 * @static
 * @readonly
 */
Junkpile.input.Mouse.WHEEL_DOWN = -1;

module.exports = Junkpile.input.Mouse;
