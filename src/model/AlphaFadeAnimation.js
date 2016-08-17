'use strict';

var Junkpile = require('../Junkpile');
var GameObject = require('./GameObject');

/**
 * This class provides a base for animations that will fade alpha.
 *
 * @memberof Junkpile
 * @abstract
 * @extends Junkpile.model.GameObject
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.AlphaFadeAnimation = class AlphaFadeAnimation extends Junkpile.model.GameObject {

  /**
   * This provides a base constructor for alpha fading animation objects.
   *
   * @constructs Junkpile.AlphaFadeAnimation
   * @abstract
   * @this {Junkpile.AlphaFadeAnimation}
   * @param {Junkpile.Engine} engine       The engine instance this is part of.
   * @param {string} typeID             The type string for this animation.
   * @param {string} name               The name string for this animation instance.
   * @param {Junkpile.EngineComponent} parent
   *                                    The parent object.
   * @param {object} style              An object defining style properties for this animation.
   * @param {number} style.fadeInTime   The amount of time it takes to fade in (in miliseconds).
   * @param {number} style.fadeOutTime  The amount of time it takes to fade out (in miliseconds).
   * @param {number} style.lifeTime     The duration this animation is show in-between fading in
   *                                    and fading out (in miliseconds).
   * @param {boolean} style.repeats     A flag for whether or not the animation should repeat.
   *                                    (NOT IMPLEMENTED).
   * @param {number} style.targetAlpha  The alpha to fade in to.
   */
  constructor(engine, typeID, name, parent, style) {
    super(engine, typeID, name, parent);

    // Attach this animation to the parent object
    if(this.parent)
      this.attachedToParent = true;

    /**
     * The amount of time it takes to fade in (in miliseconds).
     *
     * @member {number} Junkpile.AlphaFadeAnimation#fadeInTime
     * @default 0
     */
    this.fadeInTime = 0;

    /**
     * The amount of time it takes to fade out (in miliseconds).
     *
     * @member {number} Junkpile.AlphaFadeAnimation#fadeOutTime
     * @default 0
     */
    this.fadeOutTime = 0;

    /**
     * The duration this animation is show in-between fading in
     * and fading out (in miliseconds).
     *
     * @member {number} Junkpile.AlphaFadeAnimation#lifeTime
     * @default 0
     */
    this.lifeTime = 0;

    /**
     * A flag for whether or not the animation should repeat.
     * (NOT IMPLEMENTED).
     *
     * @member {boolean} Junkpile.AlphaFadeAnimation#repeats
     * @default false
     */
    this.repeats = false;

    /**
     * The alpha to fade in to and out from.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#targetAlpha
     * @default 1.0
     */
    this.targetAlpha = 1.0;

    // Import style if available
    if(style.fadeInTime !== undefined)
      this.fadeInTime = style.fadeInTime;
    if(style.fadeOutTime !== undefined)
      this.fadeOutTime = style.fadeOutTime;
    if(style.lifeTime !== undefined)
      this.lifeTime = style.lifeTime;
    if(style.repeats !== undefined)
      this.repeats = style.repeats;
    if(style.targetAlpha !== undefined)
      this.targetAlpha = style.targetAlpha;

    // Bounds check style
    if((this.fadeInTime < 0) || (this.fadeOutTime < 0) || (this.lifeTime < -1))
      throw new Error('Invalid animation style!');
    if((this.targetAlpha < 0) || (this.targetAlpha > 100))
      throw new Error('Invalid animation style!');

    /**
     * The amount of alpha to add per milisecond while fading in.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#fadeInDelta
     */
    this.fadeInDelta = 0;

    /**
     * The amount of alpha to subtract per milisecond while fading out.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#fadeOutDelta
     */
    this.fadeOutDelta = 0;

    /**
     * The number of times this animation has repeated.
     * NOT IMPLEMENTED!
     *
     * @member {number} Junkpile.AlphaFadeAnimation#numRepeats
     */
    this.numRepeats = 0;

    /**
     * The time stamp when the animation started.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#startTime
     */
    this.startTime = 0;

    /**
     * The current time stamp.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#currentTime
     */
    this.currentTime = 0;

    /**
     * The current alpha for the animation.
     *
     * @member {number} Junkpile.AlphaFadeAnimation#currentAlpha
     */
    this.currentAlpha = 1.0;

    /**
     * A flag for when the animation is done.
     *
     * @member {boolean} Junkpile.AlphaFadeAnimation#isDone
     */
    this.isDone = false;

    /**
     * A flag for when the animation has started.
     *
     * @member {boolean} Junkpile.AlphaFadeAnimation#isStarted
     */
    this.isStarted = false;

    // Calculate fade in delta
    if(this.fadeInTime > 0){
      this.currentAlpha = 0;
      this.fadeInDelta = this.targetAlpha / this.fadeInTime;
    }
    // Calculate fade out delta
    if(this.fadeOutTime > 0)
      this.fadeOutDelta = this.targetAlpha / this.fadeOutTime;
  }

  /**
   * This method steps the fade animation and should be called once per update of this object.
   *
   * @this {Junkpile.AlphaFadeAnimation}
   */
  stepAnimation() {
    // Do nothing if the animation is already done
    if(this.isDone)
      return;
    // Record starting information
    if(!this.isStarted) {
      this.startTime = this.engine.time.getTime();
      this.currentTime = this.startTime;
      this.isStarted = true;
    }
    else
      // Get current time
      this.currentTime = this.engine.time.getTime();
    // Fade in if still fading in
    if(this.currentTime < this.fadeInTime)
      this.currentAlpha += this.fadeInDelta * this.engine.time.delta;
    // Fade out if life-time is past
    else if(((this.currentTime - this.startTime) > (this.lifeTime + this.fadeInTime)) &&
            ((this.currentTime - this.startTime) < (this.lifeTime + this.fadeInTime + this.fadeOutTime)))
      this.currentAlpha -= this.fadeOutDelta * this.engine.time.delta;
    // Check if finished
    else if((this.currentTime - this.startTime) > (this.lifeTime + this.fadeInTime + this.fadeOutTime))
      this.isDone = true;
  }

}

module.exports = Junkpile.AlphaFadeAnimation;
