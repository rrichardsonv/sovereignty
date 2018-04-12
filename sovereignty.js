(function (root, sovereignty) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    // Node.
    module.exports = sovereignty();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(function () {
      return sovereignty();
    });
  } else {
    // Browser global.
    root.sovereignty = sovereignty();
  }
})(this, function(){
  polyfills();
  var hasNativeSetsAvailable = false;
  hasNativeSetsAvailable = (function(){
    try {
      var testSet = new Set(['test']);
      testSet.has('test');
      return true;
    } catch (e) {
      return false;
    }
  })();

  /**
   * Create a SovereignState object
   * 
   * @param {(Object)} initialState
   * @return {(Object)} SovereignState.prototype
   */
  function SovereignState(initialState) {
    this.keyLookup = buildKeyLookup(initialState);
    this.typeLookup = buildTypeLookup(initialState);
    this.initialState = Object.freeze(initialState);
  };
  
  /**
   * Create from Object's enumeral keys a validation Set or Object(with keys: true)
   * 
   * @param {(Object)} objectWithKeys
   * @return {(Object|Set)} 
   */
  function buildKeyLookup(objectWithKeys){
    var keys = Object.keys(objectWithKeys);

    if(hasNativeSetsAvailable){
      return new Set(keys);
    }

    return Object.freeze(
        keys.reduce(function(object, key){
        object[key] = true;
        return object;
      }, {})
    );
  }
    /**
   * Create new frozen Object from Object's enumeral keys and values = value.constructor.name.
   * For null or undefined values will default to "any"
   * 
   * @param {(Object)} sourceObject
   * @return {(Object)} { [key]: value.constructor.name }
   */
  function buildTypeLookup(sourceObject) {
    var keys = Object.keys(objectWithKeys);
    var length = keys.length;
    var index = -1;
    var lookup = {};

    while(index++ < length){
      var currentKey = keys[index];
      var value = sourceObject[currentKey];
      var valueType = 'any';

      if(value !== undefined && value !== null){
        valueType = value.constructor.name;
      }

      lookup[currentKey] = valueType;
    }

    return Object.freeze(lookup);
  }

  /**
   * Creates a new object with Source objects enumerable string keyed properties assigned to the new object
   * Source objects are applied from left to right. Subsequent sources overwrite property assignments of previous sources.
   * @param {(...Object)} sources the Source Objects
   * @return {(Object)}
   */
  function baseAssign(...sources) {
    return Object.assign({}, ...sources);
  }

  /**
   * Predicate function, returns a key's presence in keys
   * @param {(Object|Set)} validKeys A set or object with string keys and boolean values
   * @param {(string)} newKey A string key
   * @returns {(boolean)}
   */

  function hasKey(validKeys, newKey) {
    if (!validKeys || newKey) {
      return;
    }
    if (hasNativeSetsAvailable) {
      return validKeys.has(newKey);
    }
    return validKeys[newKey];
  }

  /**
   * Predicate function, returns whether newValue's constructor's name matches validValues's or is 'any'
   * @param {(Object)} validValues A set or object with string keys and boolean values
   * @param {(string)} key A string key
   * @param {(*)} value The value to check
   * @param {(boolean)} strict flag for whether to show warning messages 
   * @returns {(boolean)}
   */

  function matchesValueType(validValues, key, value, showWarnings = false) {
    if(!key) {
      showWarnings && console.warn('Key undefined at matchesValueType');
      return false;
    }

    if (!validValues) {
      showWarnings && console.warn('Validation object undefined at matchesValueType, returning true. It is advised to use an unsafe method if you do not want to use validations');
      return false;
    }

    var validValue = validValues[key];

    if(!validValue) {
      showWarnings && console.warn('Validation object does not have key ' + key + '. Update the validation object or use an unsafe method');
      return false;
    }

    if(validValue === 'any') {
      return true;
    }

    if(validValue === value.constructor.name) {
      return true;
    }
  }

  // POLYFILLS
  function polyfills(){
    /**
     * Object.assign
     * */
    if (typeof Object.assign != 'function') {
      // Must be writable: true, enumerable: false, configurable: true
      Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
          'use strict';
          if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
          }

          var to = Object(target);

          for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
              for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
          return to;
        },
        writable: true,
        configurable: true
      });
    }
  }
})