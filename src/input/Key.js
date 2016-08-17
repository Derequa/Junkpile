'use strict'

var Junkpile = require('../Junkpile');
var Button = require('./Button');

/**
 * This class models the properties of a Key on a keyboard and can be used for very
 * fine control over input and gathering information from the keyboard.
 *
 * @deprecated Now using The button class.
 * @memberof Junkpile.input
 * @extends Junkpile.input.Button
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.input.Key = class Key extends Junkpile.input.Button {

  /**
   * This constructs a new key object with the given keycode value.
   *
   * @deprecated Now using The button class.
   * @constructs Junkpile.input.Key
   * @this {Junkpile.input.Key}
   * @param {Junkpile.Engine} engine       The engine instance this key belongs to.
   * @param {Junkpile.model.EngineObject} parent
   *                                    The parent object that manages this key.
   * @param {number} keyCode            The keyCode value for this key.
   */
  constructor(engine, parent, keyCode){
    super(engine, parent, keyCode);

    /**
     * The time that this key repeated last.
     *
     * @deprecated Now using The button class.
     * @member {number} Junkpile.input.Key#lastRepeat
     */
    this.lastRepeat = 0;

    /**
     * The keycode value of this key.
     * This is an alias for the buttonCode property in the superclass.
     *
     * @deprecated Now using The button class.
     * @member {number} Junkpile.input.Key#keyCode
     */
    this.keyCode = keyCode;
  }

  /**
   * This method updates this key's properties on each engine tick.
   * This overrides Button and provides more granular update control.
   *
   * @deprecated Now using The button class.
   * @this {Junkpile.input.Key}
   * @override
   */
  update() {
    // Check if the button is enabled
    if(!this.enabled)
      return;
      // Check if this is down
      if(this.isDown){
        // Check if we should repeat the press
        if((this.lastRepeat - this.timeDown) > Junkpile.input.Button.BTN_REPEAT_TIMER){
          this.lastRepeat = this.engine.time.getTime();
        }
        // Update duration and increment last repeat
        this.duration = this.engine.time.getTime() - this.timeDown;
      }
  }

  /**
   * This method handles processing a key-up event from the document.
   *
   * @deprecated Now using The button class.
   * @this {Junkpile.input.Key}
   * @param {KeyboardEvent} domEvent    The document event given by the parent document.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
   */
  processKeyUp(domEvent) {
    // Call super class mehtod
    this.processButtonUp(domEvent);
    this.lastRepeat = this.timeDown;
  }

  /**
   * This method handles processing a key-down event from the document.
   *
   * @deprecated Now using The button class.
   * @this {Junkpile.input.Key}
   * @param {KeyboardEvent} domEvent    The document event given by the parent document.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
   */
  processKeyDown(domEvent) {
    // Call superclass method
    this.processButtonDown(domEvent);
    this.lastRepeat = this.timeDown;
  }

}

module.exports = Junkpile.input.Key;
