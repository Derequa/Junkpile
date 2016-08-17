'use strict';

var Junkpile = require('../Junkpile');
var EngineObject = require('./EngineObject');

/**
 * This class provides a base for the component model.
 * It provides a parent and child relationship and methods for finding
 * components in a given components list of attached children, and parent hierarchy.
 *
 * @memberof Junkpile.model
 * @abstract
 * @extends Junkpile.model.EngineObject
 * @author Derek Batts <dsbatts@ncsu.edu>
 */
Junkpile.model.EngineComponent = class EngineComponent extends Junkpile.model.EngineObject {

  /**
   * This implements base work for creating a new component.
   *
   * @constructs Junkpile.model.EngineComponent
   * @abstract
   * @this {Junkpile.model.EngineComponent}
   * @param {Junkpile.Engine} engine       The engine instance for this component.
   * @param {string} typeID             The string type for this component.
   * @param {string} name               A unnique name string for this component for easy location.
   * @param {Junkpile.model.EngineComponent} parent
   *                                    The parent component for this component.
   */
  constructor(engine, typeID, name, parent){
    super(engine, typeID, name);

    // Enforce abstract class
    if (this.constructor === Junkpile.model.EngineComponent) {
      throw new Error('Can\'t instantiate abstract class!');
    }

    /**
     * The parent component for this component.
     *
     * @member {Junkpile.model.EngineComponent} Junkpile.model.EngineComponent#parent
     */
    this.parent = parent;

    /**
     * The child components for this component.
     *
     * @member {Array.<Junkpile.model.EngineComponent>} Junkpile.model.EngineComponent#childComponents
     */
    this.childComponents = [];
  }

  /**
   * A setter method for setting the unique name for a component.
   *
   * @this {Junkpile.model.Junkpile.EngineComponent}
   * @param {string} name               The unique name string for this component.
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Gets first child component (that is directly attached to this) of the given type.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The first component in the child components of this
   *                                    component of the given type.
   */
  getComponent(typeID) {
    for(var i = 0; i < this.childComponents.length; i++) {
      if(this.childComponents[i].type === typeID)
        return this.childComponents[i];
    }
  }

  /**
   * Gets all child components (that are directly attached to this) of the given type.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of components to look for.
   * @returns {Array.<Junkpile.model.EngineComponent>}
   *                                    An array of all the child components of the given type.
   */
  getComponents(typeID) {
    var componentList = [];
    for(var i = 0; i < this.childComponents.length; i++){
      if(this.childComponents[i].type === type)
        componentList.push(this.childComponents[i]);
    }
    return componentList;
  }

  /**
   * Gets first child component (that is directly attached to this) with the given name.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} name               The name of the component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The named EngineComponent found in the child components of
   *                                    this component (if there is one).
   */
  getNamedComponent(name) {
    for(var i = 0; i < this.childComponents.length; i++){
      if(this.childComponents[i].name === name)
        return this.childComponents[i];
    }
  }

  /**
   * This will recursively search through this object's children get the first component of the
   * given type, using depth first search.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The first component found in searching through the children
   *                                    of this component in a depth-first search.
   */
  getComponentInChildren(typeID) {
    for(var i = 0; i < this.childComponents.length; i++){
      var searchRes = this.childComponents[i].getComponentsInChildren(typeID);
      if((searchRes !== undefined) && (searchRes.type === typeID))
        return searchRes;
    }
    if(this.type === typeID)
      return this;
  }

  /**
   * This method recursively searches through its children and gets all the components
   * of the given type.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of components to look for.
   * @returns {Array.<Junkpile.model.EngineComponent>}
   *                                    An array of all the components found.
   */
  getComponentsInChildren(typeID) {
    var myResults = getComponents(typeID);
    for(var i = 0; i < this.childComponents.length; i++){
      var childResults = this.childComponents[i].getComponentsInChildren(typeID);
      myResults.concat(childResults);
    }
    return myResults;
  }

  /**
   * This looks for a component with a given name in the children of this component and recursively
   * searches through the child components of children.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} name               The name of the component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The first component with the given name found.
   */
  getNamedComponentInChildren(name) {
    var check = getNamedComponent(name);
    if(check !== undefined)
      return check;
    else{
      for(var i = 0; i < this.childComponents.length; i++){
        var searchRes = this.childComponents[i].getNamedComponentInChildren(name);
        if(searchRes !== undefined)
          return searchRes;
      }
    }
  }

  /**
   * This recursively searches up the parent lineage and find the first
   * component of the given type. The search will start by looking at this component.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The first component found with the given type.
   */
  getComponentInParent(typeID) {
    var check = this.getComponent(typeID);
    if(check !== undefined)
      return check;
    else if(this.parent !== undefined)
      return this.parent.getComponentInParent(typeID);
  }

  /**
   * This will get all the components in this component and the parent
   * heirarchy that have the given type.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} typeID             The type of component to look for.
   * @returns {Array.<Junkpile.model.EngineComponent>}
   *                                    An array of all the components found.
   */
  getComponentsInParent(typeID) {
    var myResults = this.getComponents(typeID);
    if(this.parent !== undefined){
      var parentResults = this.parent.getComponentsInParent(typeID);
      myResults.concat(parentResults);
    }
    return myResults;
  }

  /**
   * This will look for a component with the given name in this component and its parental
   * lineage.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {string} name               The name of the component to look for.
   * @returns {Junkpile.model.EngineComponent}
   *                                    The first component found with the given name.
   */
  getNamedComponentInParent(name) {
    var check = this.getNamedComponent(name);
    if(check !== undefined)
      return check;
    else if(this.parent !== undefined)
      return this.parent.getNamedComponent(name);
  }

  /**
   * This gets an array of all the child components for this component.
   *
   * @this {Junkpile.model.EngineComponent}
   * @returns {Array.<Junkpile.model.EngineComponent>}
   *                                    An array of all the child components of this component.
   */
  getAllChildComponents() {
    return this.childComponents.slice();
  }

  /**
   * This adds a child component to this component.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {Junkpile.model.EngineComponent} component
   *                                    The component to add as a child to this component.
   */
  addChildComponent(component) {
    this.childComponents.push(component);
    if(component && component.parent)
      component.parent.removeComponent(this);
    component.parent = this;
  }

  /**
   * This removes a given component from this components list of children.
   *
   * @this {Junkpile.model.EngineComponent}
   * @param {Junkpile.model.EngineComponent} component
   *                                    The component to look for and remove.
   */
  removeComponent(component) {
    var i = this.childComponents.indexOf(component);
    if(i > -1){
      this.childComponents.splice(i, 1);
      component.parent = undefined;
      return component;
    }
    else
      return undefined;
  }

  /**
   * This method updates this component and recursively updates all teh children attached.
   * NOTE: This method is outdated and should not be used.
   * Instead make sure you override the update method, it will be called automatically
   * by the attached engine instance.
   *
   * @this {Junkpile.model.EngineComponent}
   */
  updateAllChildren(){
    this.update();
    for(var child in this.childComponents){
      child.updateAllChildren();
    }
  }

  /**
   * @this {Junkpile.model.EngineComponent}
   * @see Junkpile.model.EngineObject#destroy
   */
  destroy() {
    this.destroyComponent();
  }

  /**
   * This is a generic method for removing this component from the engine and removing all its
   * children and references to it.
   *
   * @this {Junkpile.model.EngineComponent}
   */
  destroyComponent() {
    this.engine.remove(this.guid);
    if (this.parent)
      this.parent.removeComponent(this);
    var arrayCopy = this.childComponents.slice(0);
    for(var i in arrayCopy) {
      arrayCopy[i].destroy();
    }
  }

}

module.exports = Junkpile.model.EngineComponent;
