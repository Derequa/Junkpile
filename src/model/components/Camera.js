'use strict'

var Junkpile = require('../../Junkpile');
var EngineComponent = require('../EngineComponent');
var Victor = require('../../../libs/Victor');
var MouseMoveEvent = require('../../events/MouseMoveEvent');

/**
 * This class implements a camera that will move the engine's view box with a user.
 *
 * @memberof Junkpile.components
 * @extends Junkpile.model.EngineComponent
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.components.Camera = class Camera extends Junkpile.model.EngineComponent {

  /**
   * This contructs a new Camera for a given user, using a givne engine instance.
   *
   * @constructs Junkpile.components.Camera
   * @this {Junkpile.components.Camera}
   * @param {Junkpile.Engine} engine       The engine this is in. The renderer, view, and world will
   *                                    be used from this instance.
   * @param {string} name               The unique name for this component, for easy finding.
   * @param {Junkpile.User} parent         The user object this camera will follow.
   */
  constructor(engine, name, parent) {
    super(engine, Junkpile.components.Camera.CAMERACOMPONENT_TYPE, name, parent);
    // Make sure we were given a user
    if(!parent.type == Junkpile.User.getType())
      throw new Error('Camera component must have a user parent class!');

    /**
     * The amount of buffered space on the left and right sides of the screen that the user must
     * cross for the camera to start moving.
     * This defaults to: Junkpile.components.Camera.HORIZONTALBUFFER
     *
     * @member {number} Junkpile.components.Camera#hBuffer
     */
    this.hBuffer = Junkpile.components.Camera.HORIZONTALBUFFER;

    /**
     * The amount of buffered space on the top and bottom of the screen that the user must
     * cross for the camera to start moving.
     * This defaults to: Junkpile.components.Camera.VERTICALBUFFER
     *
     * @member {number} Junkpile.components.Camera#vBuffer
     */
    this.vBuffer = Junkpile.components.Camera.VERTICALBUFFER;

    /**
     * The navigation component in the user.
     *
     * @member {Junkpile.components.Navigation} Junkpile.components.Camera#parentnav
     */
    this.parentnav = this.parent.getComponent(Junkpile.components.Navigation.getType());
  }

  /**
   * This method updates the camera based on the user's position.
   *
   * @this {Junkpile.components.Camera}
   */
  update() {
    // Do nothing if there is no parent user
    if (!this.parent)
      return;
    // If there is no parent navigation component look for one
    if (!this.parentnav)
      this.parentnav = this.parent.getComponent(Junkpile.components.Navigation.getType());
    // Get the user's position in the engine's renderer
    var userViewPos = Junkpile.Engine.getViewPos(this.parent.transform.position.x,
                                              this.parent.transform.position.y,
                                              this.engine);
    // Set a flag for finding when the view moved
    var viewMoved = false;
    // Check if we crossed into the right side buffer zone
    if (userViewPos.x > (this.engine.viewSize.x - this.hBuffer)) {
      // Check if we can shift the view
      if (!((this.engine.viewSize.x + this.engine.viewOrig.x) >= this.engine.worldSize.x)) {
        // Shift the view with the user
        this.engine.viewOrig.x += userViewPos.x - (this.engine.viewSize.x - this.hBuffer);
        viewMoved = true;
      }
    }
    // Check if we crossed into the left side buffer zone
    else if (userViewPos.x < this.hBuffer) {
      // Check if we can shift the view
      if(this.engine.viewOrig.x >= 0){
        // Shift the view with the user
        this.engine.viewOrig.x -= this.hBuffer -  userViewPos.x;
        viewMoved = true;
      }
    }
    // Check if we crossed into the upper buffer zone
    if (userViewPos.y > (this.engine.viewSize.y - this.vBuffer)) {
      // Check if we can shift the view
      if (!((this.engine.viewSize.y + this.engine.viewOrig.y) >= this.engine.worldSize.y)) {
        // Shift the view with the user
        this.engine.viewOrig.y += userViewPos.y - (this.engine.viewSize.y - this.vBuffer);
        viewMoved = true;
      }
    }
    // Check if we crossed into the lower buffer zone
    else if (userViewPos.y < this.vBuffer) {
      // Check if we can shift the view
      if (this.engine.viewOrig.y >= 0) {
        // Shift the view with the user
        this.engine.viewOrig.y -= this.vBuffer -  userViewPos.y;
        viewMoved = true;
      }
    }
    // If the view has moved and the navigation component was seeking the mouse,
    // send a new MouseMoveEvent to allow the user to continue following the mouse
    if (viewMoved &&  this.parentnav.currentEvent &&
       (this.parentnav.currentEvent.type == Junkpile.events.SeekEvent.getType())) {
      var mousePos = new Victor(this.engine.renderer.plugins.interaction.mouse.global.x,
                                this.engine.renderer.plugins.interaction.mouse.global.y);
      var event = new Junkpile.events.MouseMoveEvent(mousePos);
      this.engine.eventManager.addEvent(event);
      this.engine.mouse.processMouseMove(event, this.engine.mouse);
    }
  }

  /**
   * This method gets the string used to type this object.
   *
   * @static
   * @returns {string}                  The type string for this object.
   */
  static getType() {
    return Junkpile.components.Camera.CAMERA_TYPE;
  }
}

/**
 * The string used to type this object.
 *
 * @member {string}
 * @readonly
 * @default 'CameraComponent'
 */
Junkpile.components.Camera.CAMERA_TYPE = 'CameraComponent';

/**
 * The default amount of buffered space on the top and bottom of the screen that the user must
 * cross for the camera to start moving.
 *
 * @member {number}
 * @readonly
 * @default 200
 */
Junkpile.components.Camera.VERTICALBUFFER = 200;

/**
 * The default amount of buffered space on the left and right sides of the screen that the user
 * must cross for the camera to start moving.
 *
 * @member {number}
 * @readonly
 * @default 200
 */
Junkpile.components.Camera.HORIZONTALBUFFER = 200;

module.exports = Junkpile.components.Camera;
