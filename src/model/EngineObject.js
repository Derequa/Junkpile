"use strict"

var Junkpile = require('../Junkpile');

/**
 * This class models generic properties for an object in the Junkpile engine.
 * This lays the foundation for th component object model that Junkpile uses.
 *
 * @memberof Junkpile.model
 * @abstract
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.model.EngineObject = class EngineObject {

  /**
   * This defines the generic constructor for an object in the Junkpile engine.
   *
   * @constructs Junkpile.model.EngineObject
   * @abstract
   * @this {Junkpile.model.EngineObject}
   * @param {Junkpile.Engine} engine       The engine instance this object is a part of.
   * @param {string} typeID             The type identifier for this object.
   * @param {string} name               The name string identifier for this object.
   */
  constructor(engine, typeID, name) {
    if (this.constructor === EngineObject) {
      throw new Error("Can't instantiate abstract class!");
    }

    /**
     * The engine instance this object exists in.
     *
     * @member {Junkpile.Engine} Junkpile.model.EngineObject#engine
     */
    this.engine = engine;

    /**
     * The type string for typing this object.
     *
     * @member {string} Junkpile.model.EngineObject#type
     */
    this.type = typeID;

    /**
     * The GUID (globally unique identifier) for this object.
     * This will be set using the engine instance's GUID counter.
     *
     * @member {number} Junkpile.model.EngineObject#guid
     */
    this.guid = engine.guidCounter++;

    /**
     * A unique name string for this object, for easy finding.
     *
     * @member {string} Junkpile.model.EngineObject#name
     */
    this.name = name;

    // Add this to this engine instance's list of objects
    this.engine.objects.push(this);
  }

  /**
   * This is an abstract method for updating an object each frame.
   *
   * @this {Junkpile.model.EngineObject}
   * @abstract
   */
  update() {}

  /**
   * This is an abstract method for setting up objects at engine startup.
   *
   * @this {Junkpile.model.EngineObject}
   * @abstract
   */
  setup() {}

  /**
   * This method provides an interface for destroying all objects, and can be overriden for
   * specialized implemtations.
   *
   * @this {Junkpile.model.EngineObject}
   * @abstract
   */
  destroy() {}
}

module.exports = Junkpile.model.EngineObject;
