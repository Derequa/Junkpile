'use strict'

var Junkpile = require('./Junkpile');
var Victor = require('../libs/Victor');
//var PIXI = require('../libs/PIXI');
var EventManager = require('./events/EventManager');
var KeyBoard = require('./input/KeyBoard');
var Mouse = require('./input/Mouse');
var Time = require('./time/Time');
var SpriteObject = require('./model/SpriteObject');
var KeyEvent = require('./events/KeyEvent');
var KeyPressEvent = require('./events/KeyPressEvent');
var ClickEvent = require('./events/ClickEvent');
var MouseMoveEvent = require('./events/MouseMoveEvent');
var User = require('./model/User');
var Camera = require('./model/components/Camera');
var MessageManager = require('./model/components/MessageManager');
var Navigation = require('./model/components/Navigation');

/**
 * This class provides a framework for the engine with a game-loop and setup method. It
 * manages calls to the renderer, maintains layering, handle incrementing time, and contains
 * classes and systems for objects in the engine to use.
 *
 * @memberof Junkpile
 * @author Derek Batts <dsbatts@ncsu.edu>
 *
 */
Junkpile.Engine = class Engine{

  /**
   * This constructs a new instance of the Engine class and will set the global instance to
   * this newly created one.
   *
   * The assets object given must have the following fields: defaultRing, startSprite,
   * and stopSprite. If a background field is defined, it will be used for the background of the
   * UI. Each required field must have a value of the filename/path of the asset to be loaded.
   * This is done so the definition of the standard asset's names is independant of the engine.
   *
   * After constructing the engine, the setup method should be called once before the engine is started.
   * Then, when ready, call the start method to start the engine.
   *
   * @constructs Junkpile.Engine
   * @this {Junkpile.Engine}
   * @param {function} setupCallback    The callback function after construction and assets are
   *                                    loaded by the PIXI loader.
   * @param {object} assets             The object defining the filenames/paths for standard
   *                                    engine assets.
   * @param {string} assets.background  The background image to use (optional).
   * @param {string} assets.defaultRing The ring/circle image to use around User's profiles in a
   *                                    default/blank color.
   * @param {string} assets.stopSprite  The image to use for the stop animation.
   * @param {string} assets.startSprite The image to use for the start animation.
   */
  constructor(setupCallback, assets) {

    if (Junkpile.Engine.instance)
      throw new Error('An engine instance has already been created!');

    /**
     * The given external setup function.
     *
     * @member {function} Junkpile.Engine#setupCallback
     */
    this.setupCallback = setupCallback;

    /**
     * All the objects in the engine.
     *
     * @member {Array.<Junkpile.model.EngineObject>} Junkpile.Engine#objects
     */
    this.objects = new Array();

    /**
     * A map of all the current user objects.
     * This is used for quickly referencing users by ID.
     *
     * @member {Array.<Junkpile.User>} Junkpile.Engine#userObjects
     */
    this.userObjects = new Array();

    /**
     * The root container for all the layers in the engine.
     *
     * @member {PIXI.Container} Junkpile.Engine#root
     * @see {@link http://pixijs.github.io/docs/PIXI.Container.html}
     */
    this.root = new PIXI.Container();

    /**
     * The array of containers for the different layers in the engine.
     *
     * @member {Array.<PIXI.Container>}  Junkpile.Engine#layers
     * @see {@link http://pixijs.github.io/docs/PIXI.Container.html}
     */
    this.layers = new Array();

    /**
     * The event manager for this instance of the engine.
     *
     * @member {Junkpile.EventManager} Junkpile.Engine#eventManager
     */
    this.eventManager = new Junkpile.EventManager();

    /**
     * The KeyBoard object for this instance of the engine.
     * This represents keyboard input information for enigne systems to use.
     *
     * @member {Junkpile.input.KeyBoard} Junkpile.Engine#keyboard
     */
    this.keyboard = new Junkpile.input.KeyBoard(this);

    /**
     * The Mouse object for this instance of the engine.
     * This represents mouse input information for engine systems to use.
     *
     * @member {Junkpile.input.Mouse} Junkpile.Engine#mouse
     */
    this.mouse = new Junkpile.input.Mouse(this);

    /**
     * The PIXI renderer used to render the in this instance of the engine.
     *
     * @member {PIXI.SystemRenderer} Junkpile.Engine#renderer
     * @see {@link http://pixijs.github.io/docs/PIXI.SystemRenderer.html}
     */
    this.renderer = PIXI.autoDetectRenderer(256, 256);

    /**
     * The Time object for this engine instance. Used for measuring time for physics
     * and input pattern detection.
     *
     * @member {Junkpile.Time} Junkpile.Engine#time
     */
    this.time = new Junkpile.Time();

    /**
     * This counter acts as a simple way to uniquely mark every object in the engine.
     * Thus providing an easy way for retrieval and removal.
     *
     * @member {number} Junkpile.Engine#guidCounter
     * @default 0
     */
    this.guidCounter = 0;

    /**
     * A flag signifying if the engine has been setup.
     *
     * @private
     * @member {boolean} Junkpile.Engine#isSetup
     * @default false
     */
    this.isSetup = false;

    /**
     * The external function to call once per frame.
     *
     * @member {function} Junkpile.Engine#updateFunction
     */
    this.updateFunction;

    /**
     * The current size of the world-space.
     * Defualts to the constants defined in: Junkpile.Engine.DEFAULT_WIDTH
     * and Junkpile.Engine.DEFAULT_HEIGHT
     *
     * @member {Victor} Junkpile.Engine#worldSize
     * @see {@link http://victorjs.org/#documentation}
     */
    this.worldSize = new Victor(Junkpile.Engine.DEFAULT_WIDTH, Junkpile.Engine.DEFAULT_HEIGHT);

    /**
     * The current size of the renderable area.
     * Defaults to 256 x 256, but will dynamically resize with the window.
     *
     * @member {Victor} Junkpile.Engine#viewSize
     * @see {@link http://victorjs.org/#documentation}
     */
    this.viewSize = new Victor(256, 256);

    /**
     * The center of the renderable area in world-space coordinates.
     * Defaults to the center of the world-space.
     *
     * @member {Victor} Junkpile.Engine#viewCenter
     * @see {@link http://victorjs.org/#documentation}
     */
    this.viewCenter = new Victor(this.worldSize.x / 2, this.worldSize.y / 2);

    /**
     * The origin x and y coordinates in world-space coordinates of the renderable area.
     *
     * @member {Victor} Junkpile.Engine#viewOrig
     * @see {@link http://victorjs.org/#documentation}
     */
    this.viewOrig = new Victor(this.viewCenter.x - (this.viewSize.x / 2), this.viewCenter.y - (this.viewSize.y / 2));

    // Check for required assets
    if(!assets.defaultRing || !assets.stopSprite || !assets.startSprite)
      throw new Error('Critical assets are undefined!');

    /**
     * An object holding references to required assets for the enigne.
     *
     * @member {object} Junkpile.Engine#assets
     */
    this.assets = assets;

    Junkpile.Engine.instance = this;

    // Load assets with the PIXI loader
    PIXI.loader
        .add(this.assets.defaultRing)
        .add(this.assets.startSprite)
        .add(this.assets.stopSprite)

    // Check for the background asset and load it if present
    if(this.assets.background)
      PIXI.loader.add(this.assets.background);
    // Call external setup
    PIXI.loader.load(this.setupCallback);
  }

  /**
   * This method sets up the engine for runtime.
   * This should be called once before the game loop is started.
   * All objects currently in the engine will have thier setup methods called.
   *
   * @this {Junkpile.Engine}
   */
  setup() {
    // Check if setup has been called
    if(Junkpile.Engine.instance.isSetup)
      return;

    // Make sure the default debug channel will send messages if debug mode is turned on
    Junkpile.Engine.DebugChannelTable[Junkpile.Engine.DebugChannel.DEFAULT] = true;

    // Local refernce to the single instance
    var _this = Junkpile.Engine.instance;

    // Set up layer containers
    for(var i = 0; i < Junkpile.Engine.MAXLAYERS; i++){
      var newLayer = new PIXI.Container();
      _this.root.addChild(newLayer);
      _this.layers.push(newLayer);
    }

    // Setup the PIXI render
    _this.renderer.backgroundColor = 0xFFFFFF;
    _this.renderer.view.style.position = 'absolute';
    _this.renderer.view.style.display = 'block';
    _this.renderer.autoResize = true;
    _this.renderer.resize(window.innerWidth, window.innerHeight);

    // Check if the background asset was given
    if(_this.assets.background){
      // Create a sprite for the background
      var bgImage = new PIXI.Sprite.fromImage(_this.assets.background);
      var bgObj = new Junkpile.SpriteObject(_this, 'Background', null, bgImage, Junkpile.Engine.BG_LAYER);
      // Place it at the center of the world
      bgObj.transform.position.x = _this.worldSize.x / 2;
      bgObj.transform.position.y = _this.worldSize.y / 2;
      bgObj.transform.scale.x = _this.worldSize.x / bgImage.width;
      bgObj.transform.scale.y = _this.worldSize.y / bgImage.height;
    }

    // Add callbacks for document events
    // All callbacks should feed into the event manager

    // KeyPress call back
    _this.catchDocumentKeyPress = function(key) {
      _this.eventManager.addEvent(new Junkpile.events.KeyPressEvent(key));
      _this.keyboard.processKeyPress(key);
      Junkpile.Engine.debugMessage('Key #' + key.keyCode + ' pressed, at time: ' + _this.time.getTime(), Junkpile.Engine.DebugChannel.INPUT);
    }
    // KeyDown callback
    _this.catchDocumentKeyDown = function(key) {
      _this.eventManager.addEvent(new Junkpile.events.KeyEvent(key, true));
      _this.keyboard.processKeyDown(key);
      Junkpile.Engine.debugMessage('Key #' + key.keyCode + ' down, at time: ' + _this.time.getTime(), Junkpile.Engine.DebugChannel.INPUT);
    }
    // KeyUp callback
    _this.catchDocumentKeyUp  = function(key) {
      _this.eventManager.addEvent(new Junkpile.events.KeyEvent(key, false));
      _this.keyboard.processKeyUp(key);
      Junkpile.Engine.debugMessage('Key #' + key.keyCode + ' up, at time: ' + _this.time.getTime(), Junkpile.Engine.DebugChannel.INPUT);
    }
    // MouseDown callback
    _this.catchMouseDown = function(mouse) {
      _this.eventManager.addEvent(new Junkpile.events.ClickEvent(mouse, true));
      _this.mouse.processMouseDown(mouse);
    }
    // MouseUp callback
    _this.catchMouseUp = function(mouse) {
      _this.eventManager.addEvent(new Junkpile.events.ClickEvent(mouse, false));
       _this.mouse.processMouseUp(mouse);
    }
    // MouseMove callback
    _this.catchMouseMove = function(mouse) {
      var pos = new Victor(mouse.clientX, mouse.clientY);
      var event = new Junkpile.events.MouseMoveEvent(pos);
      _this.eventManager.addEvent(event);
      _this.mouse.processMouseMove(event, _this.mouse);
    }
    // Resize callback
    // ( AKA naughty callback that should go through the event manager but doesn't yet  >:[ )
    _this.handleResize = function(event) {
      // Get the new window height and width
      var w = window.innerWidth;
      var h = window.innerHeight;
      // Bounds check with world coordinates
      if(w > _this.worldSize.x)
        w = _this.worldSize.x;
      if(h > _this.worldSize.y)
        h = _this.worldSize.y;
      // Resize renderer
      _this.renderer.resize(w, h);
      // Change view size
      _this.viewSize.x = w;
      _this.viewSize.y = h;
      // Update the view origin
      _this.updateViewOrig();
    }

    // Add the canvas to the HTML document
    document.body.appendChild(_this.renderer.view);

    // Set the callback functions
    window.addEventListener('keypress', _this.catchDocumentKeyPress);
    window.addEventListener('keydown', _this.catchDocumentKeyDown);
    window.addEventListener('keyup', _this.catchDocumentKeyUp);
    window.addEventListener('mousedown', _this.catchMouseDown);
    window.addEventListener('mouseup', _this.catchMouseUp);
    window.addEventListener('mousemove', _this.catchMouseMove);
    window.onresize = _this.handleResize;

    // Resize on startup
    _this.handleResize();

    // Setup all objects in the enigne
    for(var i in _this.objects)
      _this.objects[i].setup();

    // Change setup flag
    _this.isSetup = true;
  }

  /**
   * This method updates the view origin for the renderer.
   * The view orgin is adjusted based on the current view size and view center values.
   *
   * @this {Junkpile.Engine}
   */
  updateViewOrig() {
    this.viewOrig.x = this.viewCenter.x - (this.viewSize.x / 2);
    this.viewOrig.y = this.viewCenter.y - (this.viewSize.y / 2);
  }

  /**
   * This method gets world-space coordinates for local screen coordinates.
   * This is used for translating screen position to world-space coordinates.
   *
   * @static
   * @param {number} x                  The X coordinate in local screen coordinates.
   * @param {number} y                  The Y coordinate in local screen coordinates.
   * @param {Junkpile.Engine} engine       The instance of Engine to translate for.
   * @returns {Victor}                  A vector representing the translated coordinates.
   * @see {@link http://victorjs.org/#documentation}
   */
  static getWorldPos(x, y, engine) {
    return new Victor(engine.viewOrig.x + x, engine.viewOrig.y + y);
  }

  /**
   * This method gets local screen coordinates for world-space coordinates.
   * This is used for translating world-space coordinates to screen position.
   *
   * @static
   * @param {number} x                  The X coordinate in world-space coordinates.
   * @param {number} y                  The Y coordinate in world-space coordinates.
   * @param {Junkpile.Engine} engine       The instance of Engine to translate for.
   * @returns {Victor}                  A vector representing the translated coordinates.
   * @see {@link http://victorjs.org/#documentation}
   */
  static getViewPos(x, y, engine) {
    return new Victor(x - engine.viewOrig.x, y - engine.viewOrig.y);
  }

  /**
   * This method starts this instance of the engine, and will call the given external function
   * once per frame.
   *
   * @this {Junkpile.Engine}
   * @param {function} updateFunction   The external function to call once per frame.
   */
  start(updateFunction) {
    // Log the engine start
    console.log('Starting Junkpile.js....\nEngine version: ' + Junkpile.version);
    // Set the update function
    this.updateFunction = updateFunction;
    // Start the game-loop
    Junkpile.Engine.gameLoop();
  }

  /**
   * This method is the game-loop that updates and manages all the objects and systems in the
   * engine, as well as calling the renderer. Frame rate-governing is handled externally.
   * Frame-rate should be capped at 60 fps by default.
   * NOTE: This method should NEVER be called directly.
   * Use the start method on your instance of Junkpile.Engine.
   *
   * @static
   */
  static gameLoop() {
    // Check if the singleton instance exists and is setup
    if(!Junkpile.Engine.instance || !Junkpile.Engine.instance.isSetup)
      return;
    // Add animation frame request
    requestAnimationFrame(Junkpile.Engine.gameLoop);
    // Update the time
    Junkpile.Engine.instance.time.update();
    // Handle all events
    Junkpile.Engine.instance.eventManager.handleEvents();

    // Update all the objects
    for(var i in Junkpile.Engine.instance.objects){
      Junkpile.Engine.instance.objects[i].update();
    }

    // Call the external update function
    Junkpile.Engine.instance.updateFunction();
    // Draw the scene
    Junkpile.Engine.instance.renderer.render(Junkpile.Engine.instance.root);
  }

  /**
   * This method logs a message to the console if the global debug flag is enabled, and if
   * the given channel is enabled. If no channel is given, the default channel will be used.
   *
   * @static
   * @param {string} message            The debug message to print.
   * @param {string} channel            The debug channel to print the message on.
   */
  static debugMessage(message, channel) {
    if(Junkpile.Engine.debugMode || (message == undefined)) {
      if (channel == undefined)
        channel = Junkpile.Engine.DebugChannel.DEFAULT;
      if (Junkpile.Engine.DebugChannelTable[channel])
        console.log('[Junkpile debug channel: ' + channel + '] ' + message);
    }
  }

  /**
   * This method enables a debug message channel. If debugMode is set to true, messages sent
   * through this channel will be printed to the console.
   *
   * @static
   * @param {string} channel            The string ID of the channel to enable.
   */
  static enableDebugChannel(channel) {
    if (Junkpile.Engine.debugMode) {
      Junkpile.Engine.DebugChannelTable[channel] = true;
    }
  }

  /**
   * This method disables a debug message channel. Even if debugMode is set to true, messages sent
   * through this channel will be NOT printed to the console.
   *
   * @static
   * @param {string} channel            The string ID of the channel to disable.
   */
  static disableDebugChannel(channel) {
    if (Junkpile.Engine.debugMode) {
      Junkpile.Engine.DebugChannelTable[channel] = false;
    }
  }

  /**
   * This method removes an object with the given GUID from the engine's list of objects.
   *
   * @this {Junkpile.Engine}
   * @param {number} guid               The GUID of the object to remove.
   * @returns {Junkpile.model.EngineObject}
   *                                    The object removed, null if not found.
   */
  remove(guid) {
    // Loop through all the objects
    for(var i in this.objects) {
      // If the object's GUID matches, remove it and return it
      if((this.objects[i].guid !== undefined) && (this.objects[i].guid === guid)){
        return this.objects.splice(i, 1);
      }
    }
    return null;
  }

  /**
   * This method removes another user's avatar from this engine instance using the user's ID.
   *
   * @this {Junkpile.Engine}
   * @param {number} id                 The ID (not GUID) of the user to remove.
   * @returns {Junkpile.User}              The user that was removed or null if the user
   *                                    was not found.
   */
  removeUserAvatar(id) {
    // Check if the user is in this engine instance
    if (this.userObjects[id] !== undefined) {
      // Get the user and remove them
      var user = this.userObjects[id];
      user.destroy();
      this.userObjects.splice(id, 1);
      return user;
    }
    else
      return null;
  }

  /**
   * This method adds another user's avatar to the engine.
   *
   * @this {Junkpile.Engine}
   * @param {PIXI.Sprite} pixisprite    The PIXI sprite object for the user's profile image.
   * @param {object} settings           The user's settings object.
   * @param {string} settings.name      The name of this user.
   * @param {number} settings.ID        The unique ID for this user in the user database.
   * @param {string} settings.color     The color of this user's ring in hex string form.
   * @param {number} settings.UP        The keycode this user uses for moving up.
   * @param {number} settings.DOWN      The keycode this user uses for moving down.
   * @param {number} settings.LEFT      The keycode this user uses for moving left.
   * @param {number} settings.RIGHT     The keycode this user uses for moving right.
   * @param {number} settings.speed     The max speed this user moves at. Must be between
   *                                    Junkpile.User.MIN_V and Junkpile.User.CLOSE_MAX_V or else it
   *                                    will be clipped.
   * @returns {Junkpile.User}              The User object created.
   * @see {@link http://pixijs.github.io/docs/PIXI.Sprite.html}
   */
  addUserAvatar(pixisprite, settings) {
    if (this.userObjects[settings.ID] !== undefined)
      return null;
    // Create the user
    var newUser = new Junkpile.User(this, null, null, pixisprite, settings);
    // Get the created sprite object
    var spr = newUser.getComponent(Junkpile.SpriteObject.getType());
    // Set the sprite layer
    spr.setLayer(Junkpile.Engine.AVATAR_LAYER);
    // Explicitly update position before next frame
    spr.transform.update();
    spr.update();
    // Create a message manager for this user avatar
    var msgmgr = new Junkpile.components.MessageManager(this, null, newUser, null);
    newUser.addChildComponent(msgmgr);
    // Store user reference in the map of user with thier ID being their key
    this.userObjects[settings.ID] = newUser;
    return newUser;
  }

  /**
   * This method creates the user for this engine instance.
   *
   * @this {Junkpile.Engine}
   * @param {PIXI.Sprite} pixisprite    The PIXI sprite object for the user's profile image.
   * @param {object} settings           The user's settings object.
   * @param {string} settings.name      The name of this user.
   * @param {number} settings.ID        The unique ID for this user in the user database.
   * @param {string} settings.color     The color of this user's ring in hex string form.
   * @param {number} settings.UP        The keycode this user uses for moving up.
   * @param {number} settings.DOWN      The keycode this user uses for moving down.
   * @param {number} settings.LEFT      The keycode this user uses for moving left.
   * @param {number} settings.RIGHT     The keycode this user uses for moving right.
   * @param {number} settings.speed     The max speed this user moves at. Must be between
   *                                    Junkpile.User.MIN_V and Junkpile.User.CLOSE_MAX_V or else it
   *                                    will be clipped.
   * @returns {Junkpile.User}              The User object created.
   * @see {@link http://pixijs.github.io/docs/PIXI.Sprite.html}
   */
  createUser(pixisprite, settings) {
    if (this.userObjects[settings.ID] !== undefined)
      return null;
    // Create the user
    var user = new Junkpile.User(this, 'user', null, pixisprite, settings);
    // Create camera and navigation components
    var nav = new Junkpile.components.Navigation(this, null, user);
    var cam = new Junkpile.components.Camera(this, 'Camera', user);
    // Attach the camera and navigation components
    user.addChildComponent(nav);
    user.addChildComponent(cam);
    // Get the user's sprite and set its layer
    var spr = user.getComponent(Junkpile.SpriteObject.getType());
    // Set layer
    spr.setLayer(Junkpile.Engine.USER_LAYER);
    // Explicitly update position before next frame
    spr.transform.update();
    spr.update();

    // Store user reference in the map of user with thier ID being their key
    this.userObjects[settings.ID] = user;
    return user;
  }

  /**
   * This method provides a way to load assets for users during the main loop.
   * A new PIXI loader will be created and used to load the given files.
   * The callback function is expected to handle destruction of the loader.
   * Please refer to the PIXI documentation for the parameters given to the callback function.
   *
   * @static
   * @param {Array.<string>} filenames  An array with all the names/paths of the files to load.
   * @param {function} callback         The function to call when the assets are done loading.
   * @see {@link https://github.com/englercj/resource-loader}
   */
  static loadAssets(filenames, callback) {
    var loader = new PIXI.loaders.Loader();
    for(var i in filenames) {
      loader.add(filenames[i]);
    }
    loader.load(callback);
  }

  /**
   * This method set the user with the given ID to a given position.
   *
   * @this {Junkpile.Engine}
   * @param {number} id                 The ID (not GUID) of the user.
   * @param {number} x                  The X coordinate in world-space coordinates to set
   *                                    the user to.
   * @param {number} y                  The Y coordinate in world-space coordinates to set
   *                                    the user to.
   */
  setUserAvatarPosition(id, x, y) {
    var user = this.userObjects[id];
    if (user == undefined)
      return;
    user.transform.position.x = x;
    user.transform.position.y = y;
    // Get the user's sprite
    var spr = user.getComponent(Junkpile.SpriteObject.getType());
    // Explicitly update position before next frame
    spr.transform.update();
    spr.update();
  }

  /**
   * This method creates a message from a user to be displayed in the engine.
   * This message will be added to and managed by the user's message manager.
   *
   * @this {Junkpile.Engine}
   * @param {number} id                 The ID for the user to create a message for.
   * @param {string} message            The message to send for the user.
   */
  createUserMessage(id, message) {
    var user = this.userObjects[id];
    var msgmgr = user.getComponent(Junkpile.components.MessageManager.getType());
    msgmgr.createNewMessage(message);
  }

  /**
   * This method gets the position of a user with the given ID.
   *
   * @this {Junkpile.Engine}
   * @param {number} id               The ID (not GUID) of the user whose position to get.
   * @returns {Victor}                A vector representing the users position.
   * @see {@link http://victorjs.org/#documentation}
   */
  getUserPosition(id) {
    var user = this.userObjects[id];
    if (user == undefined)
      return null;
    return user.transform.position;
  }
}

/**
 * The refernce to the current instance of the engine.
 * This allows for easy implementation of the singleton pattern.
 * This is updated on construction of the Engine class.
 *
 * @member {Junkpile.Engine}
 */
Junkpile.Engine.instance = null;

/**
 * The maximum number of layers allowed.
 *
 * @member {number}
 * @readonly
 * @default 7
 */
Junkpile.Engine.MAXLAYERS = 7;

/**
 * The index for the layer which the background should be drawn on.
 *
 * @member {number}
 * @readonly
 * @default 0
 */
Junkpile.Engine.BG_LAYER = 0;

/**
 * The index for the layer which animations should draw on.
 *
 * @member {number}
 * @readonly
 * @default 1
 */
Junkpile.Engine.ANIM_LAYER = 1;

/**
 * The index for the layer which other users should draw on.
 *
 * @member {number}
 * @readonly
 * @default 2
 */
Junkpile.Engine.AVATAR_LAYER = 2;

/**
 * The index for the layer which this engine's user should draw on.
 * @member {number}
 * @readonly
 * @default 3
 */
Junkpile.Engine.USER_LAYER = 3;

/**
 * The index for the layer which hive sprites should draw on.
 *
 * @member {number}
 * @readonly
 * @default 4
 */
Junkpile.Engine.HIVE_LAYER = 4;

/**
 * The index for the layer which the bubbles for text sprites should draw on.
 *
 * @member {number}
 * @readonly
 * @default 5
 */
Junkpile.Engine.BUBBLE_LAYER = 5;

/**
 * The index for the layer which text sprites should draw on.
 *
 * @member {number}
 * @readonly
 * @default 6
 */
Junkpile.Engine.TEXT_LAYER = 6;

/**
 * A global flag for signaling whether the engine is in debug mode.
 *
 * @member {boolean}
 * @default false
 */
Junkpile.Engine.debugMode = false;

/**
 * A table of debug channel ID strings for easy channel identification.
 *
 * @property {object} Junkpile.Engine.DebugChannel
 * @property {string} Junkpile.Engine.DebugChannel.DEFAULT
 *    The default channel for debug messages. This is the only channel enabled by default.
 * @property {string} Junkpile.Engine.DebugChannel.STATE
 *    The channel for logging state information (for users).
 * @property {string} Junkpile.Engine.DebugChannel.INPUT
 *    The channel for logging input events and information.
 * @property {string} Junkpile.Engine.DebugChannel.OBJECTS
 *    The channel for logging general debug information for game objects.
 * @readonly
 */
Junkpile.Engine.DebugChannel = {
  DEFAULT: 'DEFAULT',
  STATE: 'STATE',
  INPUT: 'INPUT',
  OBJECTS: 'OBJECTS'
}

/**
 * A table mapping debug channel IDs to boolean values.
 * This allows us to statically maintain debug channel states.
 *
 * @member {object} Junkpile.Engine.DebugChannelTable
 * @readonly
 */
Junkpile.Engine.DebugChannelTable = {};

/**
 * The default width for the world.
 *
 * @member {number}
 * @readonly
 * @default 4096
 */
Junkpile.Engine.DEFAULT_WIDTH = 4096;

/**
 * The default height for the world.
 *
 * @member {number}
 * @readonly
 * @default 3112
 */
Junkpile.Engine.DEFAULT_HEIGHT = 3112;

module.exports = Junkpile.Engine;
