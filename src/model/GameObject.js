"use strict";

var Junkpile = require('../Junkpile');
var EngineComponent = require('./EngineComponent');
var Transform = require('./components/Transform');

/**
 * This class provides the basis for a component game object model for the UI engine.
 *
 * @memberof Junkpile.model
 * @abstract
 * @extends Junkpile.model.EngineComponent
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.model.GameObject = class GameObject extends Junkpile.model.EngineComponent {

  /**
   * This implements a bas constructor for all GameObjects.
   *
   * @constructs Junkpile.model.GameObject
   * @abstract
   * @this {Junkpile.model.GameObject}
   * @param {Junkpile.Engine} engine       The engine instance this object is apart of.
   * @param {string} typeID             The type of component / game object this is.
   * @param {string} name               The unique name for thi sgame object.
   * @param {Junkpile.model.EngineComponent} parent
   *                                    The parent component object for this game object.
   *
   */
  constructor(engine, typeID, name, parent){
    super(engine, typeID, name, parent);

    // Do not allow for instantion of the base GameObject class
    if (this.constructor === GameObject) {
      throw new Error("Can't instantiate abstract class!");
    }

    /**
     * The transform component for this game object.
     * Every game object is constructed with a transform component and a field for easy access.
     *
     * @member {Junkpile.components.Transform} Junkpile.model.GameObject#transform
     */
    this.transform = new Junkpile.components.Transform(engine, null, this);

    /**
     * A flag that signals whether or not this object will scale and move with it's parent object.
     *
     * @member {boolean} Junkpile.model.GameObject#attachedToParent
     * @default false
     */
    this.attachedToParent = false;

    super.addChildComponent(this.transform);
  }

}

module.exports = Junkpile.model.GameObject;
