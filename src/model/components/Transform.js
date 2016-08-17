"use strict";

var Junkpile = require('../../Junkpile');
var EngineComponent = require('../EngineComponent');
var Victor = require('../../../libs/Victor');

/**
 * This class models transform information and methods for 2D game objects.
 * This also handles movement of an object according to its properties.
 * This object makes heavy usage of Victor.js for vector objects.
 *
 * @memberof Junkpile.components
 * @extends Junkpile.model.EngineComponent
 * @author Derek Batts <dsbatts@ncsu.edu>
 * @see {@link http://victorjs.org/#documentation}
 */
Junkpile.components.Transform = class Transform extends Junkpile.model.EngineComponent {

  /**
   * This constructs a default transform component. Physical property vectors are initialized
   * at 0, 0 and the scale vector is initialized to 1, 1.
   *
   * @constructs Junkpile.components.Transform
   * @this {Junkpile.components.Transform}
   * @param {Junkpile.Engine}              The engine instance this is part of.
   * @param {Junkpile.model.EngineComponent} parent
   *                                    The parent component for this component.
   * @param {string} name               The unique name for this component.
   */
  constructor(engine, name, parent){

    super(engine, Junkpile.components.Transform.TRANSFORM_TYPE, name, parent);

    /**
     * The 2D position vector for this transform.
     * This defaults to (0, 0)
     *
     * @member {Victor} Junkpile.components.Transform#position
     * @see {@link http://victorjs.org/#documentation}
     */
    this.position = new Victor(0, 0);

    /**
     * The 2D velocity vector for this transform.
     * This defaults to (0, 0)
     *
     * @member {Victor} Junkpile.components.Transform#velocity
     * @see {@link http://victorjs.org/#documentation}
     */
    this.velocity = new Victor(0, 0);

    /**
     * The 2D acceleration vector for this transform.
     * This defaults to (0, 0)
     *
     * @member {Victor} Junkpile.components.Transform#acceleration
     * @see {@link http://victorjs.org/#documentation}
     */
    this.acceleration = new Victor(0, 0);

    /**
     * The 2D scale vector for this transform.
     * This defaults to (1, 1)
     *
     * @member {Victor} Junkpile.components.Transform#scale
     * @see {@link http://victorjs.org/#documentation}
     */
    this.scale = new Victor(1, 1);

    /**
     * The transform of the parent of the owner for this transform.
     * This defaults to null if there is no parent transform.
     *
     * @member {Junkpile.components.Transform} Junkpile.components.Transform#parentTransform
     * @see {@link http://victorjs.org/#documentation}
     */
    this.parentTransform = null;

    this.superParent = null;

    /**
     * The previous position vector for the parent transform.
     * This defaults to null if there is no parent transform.
     *
     * @member {Junkpile.components.Transform} Junkpile.components.Transform#parentLastPosition
     * @see {@link http://victorjs.org/#documentation}
     */
    this.parentLastPosition = null;

    /**
     * The previous scale vector for the parent transform.
     * This defaults to null if there is no parent transform.
     *
     * @member {Junkpile.components.Transform} Junkpile.components.Transform#parentLastScale
     * @see {@link http://victorjs.org/#documentation}
     */
    this.parentLastScale = null;

    if(this.parent && this.parent.parent){
      this.superParent = this.parent.parent;
      this.parentTransform = this.parent.parent.getComponent(Transform.getType());
      if(this.parentTransform){
        this.parentLastPosition = this.parentTransform.position.clone();
        this.parentLastScale = this.parentTransform.scale.clone();
      }
    }
  }

  /**
   * This creates a copy of this transform component.
   *
   * @this {Junkpile.components.Transform}
   * @return {Junkpile.components.Transform}
   *                                    The newly created transform clone.
   */
  clone(){
    var newT = new Junkpile.components.Transform(this.engine, null, this.parent);
    newT.position = this.position.clone();
    newT.velocity = this.velocity.clone();
    newT.acceleration = this.acceleration.clone();
    newT.scale = this.scale.clone();
  }

  /**
   * This method creates a string representation of this transform component.
   *
   * @this {Junkpile.components.Transform}
   * @return {string}                   A string representation of this transform component.
   */
  toString(){
    var retString = "Position: " + this.position.toString() + "\n"
                  + "Velocity: " + this.velocity.toString() + "\n"
                  + "Acceleration: " + this.acceleration.toString() + "\n"
                  + "Scale: " + this.scale.toString() + "\n";
    return retString;
  }

  /**
   * This method gets the string used to type this object.
   *
   * @static
   * @returns {string}                  The type string for this object.
   */
  static getType(){
    return Junkpile.components.Transform.TRANSFORM_TYPE;
  }

  /**
   * This method clips a given vector to a given length/magnitude.
   *
   * @param {Victor} vector             The vector to clip.
   * @param {number} newLength          The new length/magnitude to set for the vector.
   * @see {@link http://victorjs.org/#documentation}
   */
  static clipVector(vector, newLength) {
    vector.normalize();
    vector.multiply(new Victor(newLength, newLength));
  }

  /**
   * This updates the transform object. This will add the velocity vector to the position vector,
   * then the acceleration vector to the velocity vector. All motion is calculated with deltaSec
   * from the Time instance given in the associated engine, and will result in framrate
   * independant movement.
   * If this transform's owner has a parent with a transform, this will move and scale
   * with the parent transform.
   *
   * @this {Junkpile.components.Transform}
   */
  update() {
    // Check if the parent has changed
    if(this.parent && this.parent.parent && (this.superParent != this.parent.parent)){
      // Update parent references
      this.superParent = this.parent.parent;
      this.parentTransform = this.parent.parent.getComponent(Transform.getType());
      if(this.parentTransform){
        this.parentLastPosition = this.parentTransform.position.clone();
        this.parentLastScale = this.parentTransform.scale.clone();
      }
    }
    if(this.parent.attachedToParent) {
      // Check if we are recording previous parent positions
      if (this.parentLastPosition && this.parentTransform && this.parentLastScale){
        // Move with parent if parent position has changed
        if(this.parentLastPosition !== this.parentTransform.position) {
          this.position.x += this.parentTransform.position.x - this.parentLastPosition.x;
          this.position.y += this.parentTransform.position.y - this.parentLastPosition.y;
          this.parentLastPosition.x = this.parentTransform.position.x;
          this.parentLastPosition.y = this.parentTransform.position.y;
        }
        // Scale with parent if parent scale has changed
        if(this.parentLastScale !== this.parentTransform.scale) {
          this.scale.x += this.parentTransform.scale.x - this.parentLastScale.x;
          this.scale.y += this.parentTransform.scale.y - this.parentLastScale.y;
          this.parentLastScale.x = this.parentTransform.scale.x;
          this.parentLastScale.y = this.parentTransform.scale.y;
        }
      }
      // Check if we should be recording previous parent positions
      else if(this.parent && this.parent.parent){
        this.parentTransform = this.parent.parent.getComponent(Transform.getType());
        if(this.parentTransform){
          this.parentLastPosition = this.parentTransform.position.clone();
          this.parentLastScale = this.parentTransform.scale.clone();
        }
      }
    }
    // Update position and velocity
    this.position.x += this.velocity.x * this.engine.time.deltaSec;
    this.position.y += this.velocity.y * this.engine.time.deltaSec;
    this.velocity.x += this.acceleration.x * this.engine.time.deltaSec;
    this.velocity.y += this.acceleration.y * this.engine.time.deltaSec;
  }

}

/**
 * A constant string to use as the type field for this component
 *
 * @member {string}
 * @readonly
 * @default "Transform"
 */
Junkpile.components.Transform.TRANSFORM_TYPE = "Transform";

module.exports = Junkpile.components.Transform;
