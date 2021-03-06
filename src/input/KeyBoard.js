'use strict'

var Junkpile = require('../Junkpile');
var EngineObject = require('../model/EngineObject');
var Button = require('./Button');
var KeyEvent = require('../events/KeyEvent');
var KeyPressEvent = require('../events/KeyPressEvent');

/**
 * This class models a keyboard for use in input management.
 * Finer level of control is exposed through methods and fields for individual keys.
 * This class also defines a table for symbolically refering to keycodes.
 *
 * @memberof Junkpile.input
 * @extends Junkpile.model.EngineObject
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.input.KeyBoard = class KeyBoard extends Junkpile.model.EngineObject {

  /**
   * This contructs a new keyboard object representation for the given engine.
   * NOTE: The keyboard object must be setup before use.
   *
   * @constructs Junkpile.input.KeyBoard
   * @this {Junkpile.input.KeyBoard}
   * @param {Junkpile.Engine} engine       The engine instance this is part of.
   */
  constructor(engine) {
    // Call super constructor, always give the keyboard a unique name (same string as its's type).
    // This gives a way to find it easier.
    super(engine, Junkpile.input.KeyBoard.KEYBOARD_TYPE, Junkpile.input.KeyBoard.KEYBOARD_TYPE);

    /**
     * An array of all the keys the keyboard will maintian.
     *
     * @member {Array.<Junkpile.input.Button>} Junkpile.input.KeyBoard#keys
     */
    this.keys = new Array();

    /**
     * An array of boolean flags, indexed by keycode, that determines whether or not to capture
     * key events for the given keycode.
     *
     * @member {Array.<boolean>} Junkpile.input.KeyBoard#captureKeys
     */
    this.captureKeys = new Array();

    /**
     * The last document given to this keyboard from the event manager.
     *
     * @member {KeyboardEvent} Junkpile.input.KeyBoard#event
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
     */
    this.event = null;

    /**
     * A flag for whether or not this keyboard should record a string from the input collected.
     * NOTE: To start recording input, use the startRecordingStrings() method instead of
     * setitng fields. To stop recording input use the stopRecordingStrings() method.
     *
     * @member {boolean} Junkpile.input.KeyBoard#isCreatingString
     * @default false
     */
    this.isCreatingString = false;

    /**
     * A string built from the input collected, built when the keyboard is told to collect input.
     *
     * @member {string} Junkpile.input.KeyBoard#inputString
     * @default ''
     */
    this.inputString = '';

    /**
     * A flag for when this keyboard object has been set up.
     *
     * @member {boolean} Junkpile,input.KeyBoard#isSetup
     * @default false
     */
    this.isSetup = false;
  }

  /**
   * This method sets up the keyboard after critical engine components are in place.
   * This will populate the keys array.
   *
   * @this {Junkpile.input.KeyBoard}
   */
  setup() {
    // Check if already setup
    if(this.isSetup)
      return;
    // Create a Key object for each known keycode
    for(var key in Junkpile.input.KeyCode){
      var i = Junkpile.input.KeyCode[key];
      this.keys[i] = new Junkpile.input.Button(this.engine, this, i);
    }

    this.addCaptureKey(Junkpile.input.KeyCode.BACKSPACE);
    //this.addCaptureKey(Junkpile.input.KeyCode.SPACEBAR);
  }

  /**
   * This updates the keyboard and all the keys it manages.
   *
   * @this {Junkpile.input.KeyBoard}
   */
  update() {
    for(var key in this.keys)
      this.keys[key].update();
  }

  /**
   * This method resets all the keys attached to this keyboard.
   *
   * @this {Junkpile.input.KeyBoard}
   * @see Junkpile.input.Button#reset
   */
  reset() {
    for(var key in this.keys){
      this.keys[key].reset();
    }
  }

  /**
   * This method attaches this keyboard to the engine's event manager.
   *
   * @this {Junkpile.input.KeyBoard}
   */
  addToEventManager() {
    // Add listeners for key events
    this.engine.eventManager.addListenerFor(Junkpile.events.KeyEvent.getType(), this, this.processKeyEvent);
    this.engine.eventManager.addListenerFor(Junkpile.events.KeyPressEvent.getType(), this, this.processKeyPressEvent);
  }

  /**
   * This method acts as a handler for a KeyPressEvent from the engine's event manager.
   * NOTE: To recieve events from the event manager, you will have to add this keyboard as a
   * listener using the addToEventManager method.
   *
   * @param {Junkpile.events.KeyPressEvent} keyevent
   *                                    The KeyPressEvent event given to us by the engine's event manager.
   * @param {Junkpile.input.KeyBoard} obj  The instance of KeyBoard that registered the call-back.
   */
  processKeyPressEvent(keyevent, obj) {
    obj.processKeyPress(keyevent.eventdata);
  }

  /**
   * This method acts as a handler for a KeyEvent from the engine's event manager.
   * NOTE: To recieve events from the event manager, you will have to add this keyboard as a
   * listener using the addToEventManager method.
   *
   * @param {Junkpile.events.KeyEvent} keyevent
   *                                    The KeyEvent event given to us by the engine's event manager.
   * @param {Junkpile.input.KeyBoard} obj  The instance of KeyBoard that registered the call-back.
   */
  processKeyEvent(keyevent, obj){
    this.event = keyevent;
    var domevent = keyevent.eventdata;
    if(obj.keys[domevent.keyCode] == undefined)
      obj.keys[domevent.keyCode] = new Junkpile.input.Button(obj.engine, this, domevent.keyCode);
    if(keyevent.keyDown)
      obj.processKeyDown(domevent);
    else
      obj.processKeyUp(domevent);
  }

  /**
   * This method handles passing a key press event to its respective key.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {KeyboardEvent} domevent    The event from the document for the keypress.
   */
  processKeyPress(domevent) {
    if (this.isCreatingString)
      this.addToString(domevent);
  }

  /**
   * This method handles passing a key down event to its respective key.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {KeyboardEvent} domevent    The key-down event from the document.
   */
  processKeyDown(domevent){
    // Get the keycode
    var key = domevent.keyCode;

    if (!this.keys[key])
      this.keys[key] = new Junkpile.input.Button(this.engine, this, key);
    // Check if we should capture this event
    if(this.captureKeys[key]){
      domevent.preventDefault();
    }
    // Hand off to Key object
    this.keys[key].processButtonDown(domevent);

    // Check if backspace was pressed and remove characters from the input string
    //if the keyboard is recording
    if(this.isCreatingString && (key == Junkpile.input.KeyCode.BACKSPACE)){
      this.inputString = this.inputString.substring(0, this.inputString.length - 1);
    }
  }

  /**
   * This method handles passing a key up event to its respective key.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {KeyboardEvent} domevent    The key-up event from the document.
   */
  processKeyUp(domevent){
    // Get the keycode
    var key = domevent.keyCode;

    if (!this.keys[key])
      this.keys[key] = new Junkpile.input.Button(this.engine, this, key);
    // Check if we should capture the event
    if(this.captureKeys[key]){
      domevent.preventDefault();
    }
    // Hand off to Key object
    this.keys[key].processButtonUp(domevent);
  }

  /**
   * This method checks if a key with the given code is currently down.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keyCode            The keycode value of the key to check.
   * @returns {boolean}                 True if the given key is down.
   */
  isDown(keyCode) {
    if(this.keys[keyCode])
      return this.keys[keyCode].isDown;
    else
      return null;
  }

  /**
   * This method checks if a key with the given code is currently up.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keyCode            The keycode value of the key to check.
   * @returns {boolean}                 True if the given key is up.
   */
  isUp(keyCode) {
    if(this.keys[keyCode])
      return this.keys[keyCode].isUp;
    else
      return null;
  }

  /**
   * This method checks if there is at least one key down on the keyboard.
   *
   * @this {Junkpile.input.KeyBoard}
   * @returns {boolean}                 True if there is a key down on this keyboard.
   */
  hasKeyDown() {
    for (var i in this.keys) {
      if (this.keys[i].isDown)
        return true;
    }
    return false;
  }

  /**
   * This method checks if the given key has been down for a given duration.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keyCode            The keycode of the key to check.
   * @param {number} duration           The amount of time to check if the key has been down for.
   * @returns {boolean}                 True if the given key has been down for the given duration.
   */
  downDuration(keyCode, duration) {
    if (this.keys[keyCode])
      return this.keys[keyCode].downDuration(duration);
  }

  /**
   * This method checks if the given key has been up for a given duration.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keyCode            The keycode of the key to check.
   * @param {number} duration           The amount of time to check if the key has been up for.
   * @returns {boolean}                 True if the given key has been up for the given duration.
   */
  upDuration(keyCode, duration) {
    if (this.keys[keyCode])
      return this.keys[keyCode].upDuration(duration);
  }

  /**
   * This method enables keyboard events to be consumed and not propagate to the browser.
   * NOTE: This functionality is not fully tested and should be used cautiously as things
   * may not work.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keycode            The key code for the key to capture events for.
   */
  addCaptureKey(keycode) {
    if (typeof keycode === 'object') {
      for (var key in keycode) {
        this.captureKeys[key] = true;
      }
    }
    else {
      this.captureKeys[keycode] = true;
    }
  }

  /**
   * This method disables keyboard events from being consumed and enables propagation.
   * NOTE: This functionality is not fully tested and should be used cautiously as things
   * may not work.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {number} keycode            The key code for the key to enable propagation for.
   */
  removeCaptureKey(keycode) {
    if (typeof keycode === 'object') {
      for (var key in keycode) {
        this.captureKeys[key] = false;
      }
    }
    else {
      this.captureKeys[keycode] = false;
    }
  }

  /**
   * This method signals this keyboard to start recording strings from user input.
   * This will clear the current input string before signaling recording.
   *
   * @this {Junkpile.input.KeyBoard}
   */
  startRecordingStrings() {
    if (this.isCreatingString)
      throw new Error('This keyboard is already recording!');
    this.inputString = '';
    this.isCreatingString = true;
  }

  /**
   * This method signals this keyboard to stop recording strings from user input.
   * The recorded input will still be available in this keyboard's inputString field.
   *
   * @this {Junkpile.input.KeyBoard}
   */
  stopRecordingStrings() {
    if (!this.isCreatingString)
      throw new Error('This keyboard is not currently recording!');
    this.isCreatingString = false;
  }

  /**
   * This method appends a character to the string being built if the
   * keyboard is recording strings.
   *
   * @this {Junkpile.input.KeyBoard}
   * @param {KeyboardEvent} event       The document event given on keypress.
   */
  addToString(event) {
    // Check if the parent is recording
    if(this.isCreatingString) {
      // Check for a clean enter press to signal stop
      if((event.keyCode == Junkpile.input.KeyCode.ENTER) && !event.shiftKey)
        this.stopRecordingStrings();
      // Check against max length
      else if (this.inputString.length >= Junkpile.input.KeyBoard.INPUTSTRING_LEN)
        return;
      // Otherwise add the character to the one being built
      else {
        var str = "";
        if(event.keyCode == Junkpile.input.KeyCode.ENTER)
          str += "\n";
        else
          str += String.fromCharCode(event.charCode);
        this.inputString += str;
      }
    }
  }

  /**
   * This method gets the type string used for the KeyBoard class.
   *
   * @static
   * @returns {string}                  The type string for KeyBoard.
   */
  static getType() {
    return Junkpile.input.KeyBoard.KEYBOARD_TYPE;
  }

}

/**
 * The maximum length the input string will record.
 *
 * @member {string}
 * @static
 * @readonly
 * @default 250
 */
Junkpile.input.KeyBoard.INPUTSTRING_LEN = 250;

/**
 * The type string for the KeyBoard class.
 *
 * @member {string}
 * @static
 * @readonly
 * @defualt 'KeyBoard'
 */
Junkpile.input.KeyBoard.KEYBOARD_TYPE = 'KeyBoard';

/**
 * The keycode map for keys in the keyboard.
 *
 * @namespace
 * @property Junkpile.input.KeyCode
 * @property {number} Junkpile.input.KeyCode.A
 * @property {number} Junkpile.input.KeyCode.B
 * @property {number} Junkpile.input.KeyCode.C
 * @property {number} Junkpile.input.KeyCode.D
 * @property {number} Junkpile.input.KeyCode.E
 * @property {number} Junkpile.input.KeyCode.F
 * @property {number} Junkpile.input.KeyCode.G
 * @property {number} Junkpile.input.KeyCode.H
 * @property {number} Junkpile.input.KeyCode.I
 * @property {number} Junkpile.input.KeyCode.J
 * @property {number} Junkpile.input.KeyCode.K
 * @property {number} Junkpile.input.KeyCode.L
 * @property {number} Junkpile.input.KeyCode.M
 * @property {number} Junkpile.input.KeyCode.N
 * @property {number} Junkpile.input.KeyCode.O
 * @property {number} Junkpile.input.KeyCode.P
 * @property {number} Junkpile.input.KeyCode.Q
 * @property {number} Junkpile.input.KeyCode.R
 * @property {number} Junkpile.input.KeyCode.S
 * @property {number} Junkpile.input.KeyCode.T
 * @property {number} Junkpile.input.KeyCode.U
 * @property {number} Junkpile.input.KeyCode.V
 * @property {number} Junkpile.input.KeyCode.W
 * @property {number} Junkpile.input.KeyCode.X
 * @property {number} Junkpile.input.KeyCode.Y
 * @property {number} Junkpile.input.KeyCode.Z
 * @property {number} Junkpile.input.KeyCode.ZERO
 * @property {number} Junkpile.input.KeyCode.ONE
 * @property {number} Junkpile.input.KeyCode.TWO
 * @property {number} Junkpile.input.KeyCode.THREE
 * @property {number} Junkpile.input.KeyCode.FOUR
 * @property {number} Junkpile.input.KeyCode.FIVE
 * @property {number} Junkpile.input.KeyCode.SIX
 * @property {number} Junkpile.input.KeyCode.SEVEN
 * @property {number} Junkpile.input.KeyCode.EIGHT
 * @property {number} Junkpile.input.KeyCode.NINE
 * @property {number} Junkpile.input.KeyCode.AT
 * @property {number} Junkpile.input.KeyCode.UPCARET
 * @property {number} Junkpile.input.KeyCode.STAR
 * @property {number} Junkpile.input.KeyCode.CLOSED_PAREN
 * @property {number} Junkpile.input.KeyCode.FORWARD_SLASH
 * @property {number} Junkpile.input.KeyCode.OPEN_BRACES
 * @property {number} Junkpile.input.KeyCode.CLOSED_BRACES
 * @property {number} Junkpile.input.KeyCode.SEMI_COLON
 * @property {number} Junkpile.input.KeyCode.LESS_THAN
 * @property {number} Junkpile.input.KeyCode.GREATER_THAN
 * @property {number} Junkpile.input.KeyCode.NUMPAD_0
 * @property {number} Junkpile.input.KeyCode.NUMPAD_1
 * @property {number} Junkpile.input.KeyCode.NUMPAD_2
 * @property {number} Junkpile.input.KeyCode.NUMPAD_3
 * @property {number} Junkpile.input.KeyCode.NUMPAD_4
 * @property {number} Junkpile.input.KeyCode.NUMPAD_5
 * @property {number} Junkpile.input.KeyCode.NUMPAD_6
 * @property {number} Junkpile.input.KeyCode.NUMPAD_7
 * @property {number} Junkpile.input.KeyCode.NUMPAD_8
 * @property {number} Junkpile.input.KeyCode.NUMPAD_9
 * @property {number} Junkpile.input.KeyCode.NUMPAD_MULTIPLY
 * @property {number} Junkpile.input.KeyCode.NUMPAD_ADD
 * @property {number} Junkpile.input.KeyCode.NUMPAD_ENTER
 * @property {number} Junkpile.input.KeyCode.NUMPAD_SUBTRACT
 * @property {number} Junkpile.input.KeyCode.NUMPAD_DECIMAL
 * @property {number} Junkpile.input.KeyCode.NUMPAD_DIVIDE
 * @property {number} Junkpile.input.KeyCode.F1
 * @property {number} Junkpile.input.KeyCode.F2
 * @property {number} Junkpile.input.KeyCode.F3
 * @property {number} Junkpile.input.KeyCode.F4
 * @property {number} Junkpile.input.KeyCode.F5
 * @property {number} Junkpile.input.KeyCode.F6
 * @property {number} Junkpile.input.KeyCode.F7
 * @property {number} Junkpile.input.KeyCode.F8
 * @property {number} Junkpile.input.KeyCode.F9
 * @property {number} Junkpile.input.KeyCode.F10
 * @property {number} Junkpile.input.KeyCode.F11
 * @property {number} Junkpile.input.KeyCode.F12
 * @property {number} Junkpile.input.KeyCode.F13
 * @property {number} Junkpile.input.KeyCode.F14
 * @property {number} Junkpile.input.KeyCode.F15
 * @property {number} Junkpile.input.KeyCode.COLON
 * @property {number} Junkpile.input.KeyCode.EQUALS
 * @property {number} Junkpile.input.KeyCode.COMMA
 * @property {number} Junkpile.input.KeyCode.UNDERSCORE
 * @property {number} Junkpile.input.KeyCode.PERIOD
 * @property {number} Junkpile.input.KeyCode.QUESTION_MARK
 * @property {number} Junkpile.input.KeyCode.TILDE
 * @property {number} Junkpile.input.KeyCode.OPEN_BRACKET
 * @property {number} Junkpile.input.KeyCode.BACKWARD_SLASH
 * @property {number} Junkpile.input.KeyCode.CLOSED_BRACKET
 * @property {number} Junkpile.input.KeyCode.QUOTES
 * @property {number} Junkpile.input.KeyCode.BACKSPACE
 * @property {number} Junkpile.input.KeyCode.TAB
 * @property {number} Junkpile.input.KeyCode.CLEAR
 * @property {number} Junkpile.input.KeyCode.ENTER
 * @property {number} Junkpile.input.KeyCode.SHIFT
 * @property {number} Junkpile.input.KeyCode.CONTROL
 * @property {number} Junkpile.input.KeyCode.ALT
 * @property {number} Junkpile.input.KeyCode.CAPS_LOCK
 * @property {number} Junkpile.input.KeyCode.ESC
 * @property {number} Junkpile.input.KeyCode.SPACEBAR
 * @property {number} Junkpile.input.KeyCode.PAGE_UP
 * @property {number} Junkpile.input.KeyCode.PAGE_DOWN
 * @property {number} Junkpile.input.KeyCode.END
 * @property {number} Junkpile.input.KeyCode.HOME
 * @property {number} Junkpile.input.KeyCode.LEFT
 * @property {number} Junkpile.input.KeyCode.UP
 * @property {number} Junkpile.input.KeyCode.RIGHT
 * @property {number} Junkpile.input.KeyCode.DOWN:
 * @property {number} Junkpile.input.KeyCode.PLUS
 * @property {number} Junkpile.input.KeyCode.MINUS
 * @property {number} Junkpile.input.KeyCode.INSERT
 * @property {number} Junkpile.input.KeyCode.DELETE
 * @property {number} Junkpile.input.KeyCode.HELP
 * @property {number} Junkpile.input.KeyCode.NUM_LOCK
 */
Junkpile.input.KeyCode = {
    A: 'A'.charCodeAt(0),
    B: 'B'.charCodeAt(0),
    C: 'C'.charCodeAt(0),
    D: 'D'.charCodeAt(0),
    E: 'E'.charCodeAt(0),
    F: 'F'.charCodeAt(0),
    G: 'G'.charCodeAt(0),
    H: 'H'.charCodeAt(0),
    I: 'I'.charCodeAt(0),
    J: 'J'.charCodeAt(0),
    K: 'K'.charCodeAt(0),
    L: 'L'.charCodeAt(0),
    M: 'M'.charCodeAt(0),
    N: 'N'.charCodeAt(0),
    O: 'O'.charCodeAt(0),
    P: 'P'.charCodeAt(0),
    Q: 'Q'.charCodeAt(0),
    R: 'R'.charCodeAt(0),
    S: 'S'.charCodeAt(0),
    T: 'T'.charCodeAt(0),
    U: 'U'.charCodeAt(0),
    V: 'V'.charCodeAt(0),
    W: 'W'.charCodeAt(0),
    X: 'X'.charCodeAt(0),
    Y: 'Y'.charCodeAt(0),
    Z: 'Z'.charCodeAt(0),
    ZERO: '0'.charCodeAt(0),
    ONE: '1'.charCodeAt(0),
    TWO: '2'.charCodeAt(0),
    THREE: '3'.charCodeAt(0),
    FOUR: '4'.charCodeAt(0),
    FIVE: '5'.charCodeAt(0),
    SIX: '6'.charCodeAt(0),
    SEVEN: '7'.charCodeAt(0),
    EIGHT: '8'.charCodeAt(0),
    NINE: '9'.charCodeAt(0),
    AT: '@'.charCodeAt(0),
    UPCARET: '^'.charCodeAt(0),
    STAR: '*'.charCodeAt(0),
    CLOSED_PAREN: ')'.charCodeAt(0),
    FORWARD_SLASH: '\\'.charCodeAt(0),
    OPEN_BRACES: '['.charCodeAt(0),
    CLOSED_BRACES: ']'.charCodeAt(0),
    SEMI_COLON: ';'.charCodeAt(0),
    LESS_THAN: '<'.charCodeAt(0),
    GREATER_THAN: '>'.charCodeAt(0),
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_ADD: 107,
    NUMPAD_ENTER: 108,
    NUMPAD_SUBTRACT: 109,
    NUMPAD_DECIMAL: 110,
    NUMPAD_DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    COLON: ':'.charCodeAt(0),
    EQUALS: '='.charCodeAt(0),
    COMMA: 188,
    UNDERSCORE: '_'.charCodeAt(0),
    PERIOD: 190,
    QUESTION_MARK: '?'.charCodeAt(0),
    TILDE: 192,
    OPEN_BRACKET: 219,
    BACKWARD_SLASH: 220,
    CLOSED_BRACKET: 221,
    QUOTES: 222,
    BACKSPACE: 8,
    TAB: 9,
    CLEAR: 12,
    ENTER: 13,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACEBAR: ' '.charCodeAt(0),
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PLUS: 43,
    MINUS: 44,
    INSERT: 45,
    DELETE: 46,
    HELP: 47,
    NUM_LOCK: 144
};

module.exports = Junkpile.input.KeyBoard;
