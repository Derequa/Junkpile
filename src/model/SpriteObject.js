"use strict";

var Junkpile = require('../Junkpile');
var GameObject = require('./GameObject');
var Engine = require('../Engine');

/**
 * This class wraps up a PIXI Sprite as an object in the game-object model.
 *
 * @memberof Junkpile
 * @extends Junkpile.model.GameObject
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.SpriteObject = class SpriteObject extends Junkpile.model.GameObject {

  /**
   * This contructs the component attached to the given parent and sprite.
   *
   * @constructs Junkpile.SpriteObject
   * @this {Junkpile.SpriteObject}
   * @param {Junkpile.Engine} engine       The engine instance this sprite is apart of.
   * @param {string} name               A unique name string to mark this object. (optional)
   * @param {Junkpile.model.EngineComponent} parent
   *                                    The parent component for this component.
   * @param {PIXI.Sprite} sprite        The PIXI sprite object to wrap in this component.
   * @param {number} layer              The layer in the engine this sprite is drawn on.
   * @see {@link http://pixijs.github.io/docs/PIXI.Sprite.html}
   */
  constructor(engine, name, parent, sprite, layer){

    super(engine, Junkpile.SpriteObject.SPRITEOBJECT_TYPE, name, parent);

    /**
     * The PIXI sprite for this sprite.
     *
     * @member {PIXI.Sprite} Junkpile.SpriteObject#sprite
     */
    this.sprite = sprite;

    /**
     * The layer this sprite is drawn on.
     * To change this use the setLayer() method.
     *
     * @member {number} Junkpile.SpriteObject#layer
     * @default 0
     */
    this.layer = 0;

    /**
     * A flag for remembering if this object is visible.
     * To change visiblity, use the setVisible() method.
     *
     * @member {boolean} Junkpile.SpriteObject#visible
     * @default true
     */
    this.visible = true;

    // Bounds check layer
    if(layer && (layer >= 0) && (layer < Junkpile.Engine.MAXLAYERS))
      this.layer = layer;

    // Add the sprite to the engine on its layer
    this.engine.layers[this.layer].addChild(this.sprite);

    // Attach to parent if there is one given
    if(this.parent){
      this.attachedToParent = true;
    }
  }

  /**
   * This method simply gets a reference to the PIXI sprite wrapped in this class.
   *
   * @this {Junkpile.SpriteObject}
   * @returns {PIXI.Sprite}             The sprite wrapped in this component.
   */
  get(){
    return this.sprite;
  }

  setSprite(newSprite) {
    this.engine.layers[this.layer].removeChild(this.sprite);
    this.sprite = newSprite;
    this.engine.layers[this.layer].addChild(this.sprite);
  }

  /**
   * This set the position of the sprite to the given position in world-space coordinates.
   *
   * @this {Junkpile.SpriteObject}
   * @param {number} x                  The X coordinate in world-space coordinates.
   * @param {number} y                  The Y coordinate in world-space coordinates.
   */
  setPosition(x, y) {
    this.sprite.position.set(
        (x - this.engine.viewOrig.x) - (this.sprite.width / 2),
        (y - this.engine.viewOrig.y) - (this.sprite.height / 2));
  }

  /**
   * This method gets the string used to type this class.
   *
   * @this {Junkpile.SpriteObject}
   * @returns {string}                  The type string for this components class.
   */
  static getType(){
    return Junkpile.SpriteObject.SPRITEOBJECT_TYPE;
  }

  /**
   * This method updates this sprite object. This will check if the sprite is currently in view of
   * the engine's renderer and will remove it from the renderer if it is not. It will also update
   * the position and scale of the PIXI sprite based on the transform component.
   *
   * @this {Junkpile.SpriteObject}
   */
  update() {
    // Check if this sprite can be drawn to the current renderer
    var maxX = (this.transform.position.x + (this.sprite.width / 2));
    var minX = (this.transform.position.x - (this.sprite.width / 2));
    var maxY = (this.transform.position.y + (this.sprite.height / 2));
    var minY = (this.transform.position.y - (this.sprite.height / 2));
    // Check if its outside the view area
     if(this.visible &&
       ((maxX < this.engine.viewOrig.x) || (minX > (this.engine.viewOrig.x + this.engine.viewSize.x))) ||
       ((maxY < this.engine.viewOrig.y) || (minY > (this.engine.viewOrig.y + this.engine.viewSize.y))))
       this.hide();
    // Check if its in the view area
    else if(!this.visible &&
       ((maxX >= this.engine.viewOrig.x) && (minX <= (this.engine.viewOrig.x + this.engine.viewSize.x))) &&
       ((maxY >= this.engine.viewOrig.y) && (minY <= (this.engine.viewOrig.y + this.engine.viewSize.y))))
       this.show();

    // Update the scale and position
    this.sprite.scale.set(this.transform.scale.x, this.transform.scale.y);
    this.setPosition(this.transform.position.x, this.transform.position.y);
  }

  /**
   * This sets the layer for the sprite to the given layer.
   *
   * @this {Junkpile.SpriteObject}
   * @param {number} newLayer           The new layer for this sprite to be on.
   */
  setLayer(newLayer) {
    if((newLayer < 0) || (newLayer > Junkpile.Engine.MAXLAYERS))
      return;
    this.engine.layers[this.layer].removeChild(this.sprite);
    this.engine.layers[newLayer].addChild(this.sprite);
    this.layer = newLayer;
  }

  /**
   * This method changes whether the sprite is visible or not.
   *
   * @this {Junkpile.SpriteObject}
   * @param {boolean} bool              A flag for whether or not this sprite should be visible.
   */
  setVisible(bool) {
    if(bool && !this.visible)
      this.show();
    else if(!bool && this.visible)
      this.hide();
  }

  /**
   * A helper method for hiding the sprite from the renderer.
   *
   * @this {Junkpile.SpriteObject}
   */
  hide() {
    if(!this.visible)
      return;
    this.visible = false;
    this.engine.layers[this.layer].removeChild(this.sprite);
    Junkpile.Engine.debugMessage("Sprite with GUID #" + this.guid + " is now hidden", Junkpile.Engine.DebugChannel.OBJECTS);
  }

  /**
   * A helper method for showing the sprite in the renderer.
   *
   * @this {Junkpile.SpriteObject}
   */
  show() {
    if(this.visible)
      return;
    this.visible = true;
    this.engine.layers[this.layer].addChild(this.sprite);
    Junkpile.Engine.debugMessage("Sprite with GUID #" + this.guid + " is now visible", Junkpile.Engine.DebugChannel.OBJECTS);
  }

  /**
   * This method destroys the sprite object and remvoes all it components as well as removing it
   * from the renderer.
   *
   * @this {Junkpile.SpriteObject}
   */
  destroy() {
    this.destroyComponent();
    this.engine.layers[this.layer].removeChild(this.sprite);
  }

}

/**
 * A constant string to use as the type field for this component.
 *
 * @member {string}
 * @readonly
 * @default "SpriteObject"
 */
Junkpile.SpriteObject.SPRITEOBJECT_TYPE = "SpriteObject";

module.exports = Junkpile.SpriteObject;
