'use strict'

var Junkpile = require('../Junkpile');

/**
 * This class manages the current time in miliseconds, counts engine ticks,
 * and maintains the delta since the last tick.
 *
 * @memberof Junkpile
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.Time = class Time {

  /**
   * This constructs a new Time object for maintaining time in the engine.
   *
   * @constructs Junkpile.Time
   * @this {Junkpile.Time}
   * @param {Junkpile.Engine} engine       The reference to the engine instance this is tied to.
   */
  constructor(engine){

    /**
     * The engine instance this time object is tied to.
     *
     * @member {Junkpile.Engine} Junkpile.Time#engine
     */
    this.engine = engine;

    /**
     * The current time in miliseconds.
     *
     * @member {number} Junkpile.Time#current
     */
    this.current = Date.now();

    /**
     * The time of the previous tick in miliseconds.
     *
     * @member {number} Junkpile.Time#previous
     */
    this.previous = Date.now();

    /**
     * The amount of time that has passed since the last tick in miliseconds.
     *
     * @member {number} Junkpile.Time#delta
     */
    this.delta = 0;

    /**
     * The amount of time that has passed since the last tick in seconds.
     *
     * @member {number} Junkpile.Time#deltaSec
     */
    this.deltaSec = 0;

    /**
     * The number of ticks that have passed since startup.
     *
     * @member {number} Junkpile.Time#ticks
     */
    this.ticks = 0;
  }

  /**
   * This method updates the time object. A new current time will be logged and all the fields
   * will be updated to treflect the new tick.
   *
   * @this {Junkpile.Time}
   */
  update(){
    this.ticks++;
    this.previous = this.current;
    this.current = Date.now();
    this.delta = this.current - this.previous;
    this.deltaSec = this.delta / 1000;
  }

  /**
   * This method gets the current time (in miliseconds) and returns it.
   *
   * @this {Junkpile.Time}
   * @returns {number}                  The current timestamp in miliseconds.
   */
  getTime(){
    return this.current;
  }

}

module.exports = Junkpile.Time;
