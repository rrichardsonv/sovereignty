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
  hasNativeSetsAvailable = (function () {
    try {
      var testSet = new Set(['test']);
      testSet.has('test');
      return true;
    } catch (e) {
      return false;
    }
  })();

  /**
   * SovereignState.constructor
   * 
   * @param {(Object)} initialState
   * @return {(Object)} SovereignState.prototype
   */

  function SovereignState(initialState, unsafe = false) {
    this.keyLookup = buildKeyLookup(initialState);
    this.typeLookup = buildTypeLookup(initialState);
    this.initialState = Object.freeze(initialState);
    this.validateOnUpdate = !unsafe;
  }

  SovereignState.prototype.unsafe

  /**
   * Create from Object's enumeral keys a validation Set or Object(with keys: true)
   * 
   * @param {(Object)} objectWithKeys
   * @return {(Object|Set)} 
   */
  function buildKeyLookup(objectWithKeys) {
    var keys = Object.keys(objectWithKeys);

    if (hasNativeSetsAvailable) {
      return new Set(keys);
    }
    return Object.freeze(
      objectMap(objectWithKeys, function (key) {
        return { [key]: true };
      })
    );
  }
  /**
 * Create new frozen Object from Object's enumeral keys and values constructor names.
 * For null or undefined values will default to "any"
 * 
 * @param {(Object)} sourceObject
 * @return {(Object)} { [key]: value.constructor.name }
 */
  function buildTypeLookup(sourceObject) {
    return Object.freeze(
      objectMap(
        sourceObject,
        function (key, initialObject) {
          var value = initialObject[key];
          var updateObj = {};
          var valueType = 'any';

          if (value !== undefined && value !== null) {
            valueType = value.constructor.name;
          }
          updateObj[key] = valueType;
          return updateObj;
        }
      )
    );
  }

  /**
   * Object map/filter
   * @param {(Object)} obj the object over which to map
   * @param {(Function)} iterateeFn (key, obj) =>
   * @return {void}
   */
  function objectForEach(obj, iterateeFn) {
    var keys = Object.keys(obj);
    var length = keys.length - 1;
    var index = -1;

    while (index++ < length) {
      var key = keys[index];
      iterateeFn(key, obj);
    }
  }

  /**
   * Object map/filter
   * @param {(Object)} obj the object over which to map
   * @param {(Function)} transformFn (key, obj) => { Object - to merge | false - to skip }
   * @return {(Object)}
   */
  function objectMap(obj, transformFn) {
    var result = {};
    var iterateeFn = function (key, obj) {
      Object.assign(result, transformFn(key, obj));
    };
    objectForEach(obj, iterateeFn);
    return result;
  }

  function validateForEach(objectToVerify, validationFn, msgFn) {
    return objectForEach(
      objectToVerify,
      function (key, obj) {
        if (!validationFn(key, obj)) {
          throw new TypeError(msgFn(key, obj));
        }
      }
    ) || true;
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
    if (!validKeys || !newKey) {
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
   * @returns {(boolean)}
   */

  function matchesValueType(validValues, key, object) {
    if (!key || !validValues || !object) {
      return false;
    }
    var validValue = validValues[key];
    var valueToVerify = object[key];

    if (!validValue) {
      return false;
    }

    if (validValue === 'any') {
      return true;
    }

    if (!valueToVerify) {
      return false;
    }

    if (validValue === valueToVerify.constructor.name) {
      return true;
    }
  }

  SovereignState.prototype.hasKey = function (key) {
    return hasKey.call(null, this.keyLookup, key);
  };

  SovereignState.prototype.matchesValueType = function (key, object) {
    return matchesValueType.call(null, this.typeLookup, key, object);
  };

  SovereignState.prototype.validateKeys = function (newState) {
    return validateForEach(newState, this.hasKey.bind(this), function (key) {
      return 'Key ' + key + ' is not present in state. Check the initial state object.';
    });
  };

  SovereignState.prototype.validateValueTypes = function (newState) {
    return validateForEach(newState, this.matchesValueType.bind(this), function (key, object) {
      var displayText = !object[key] ? object[key] : object[key] + ' of type ' + object[key].constructor.name;
      return 'Value ' + displayText + ' does not match validation type for key ' + key + '. Check the initial state object.';
    });
  };

  SovereignState.prototype.update = function (currentState, ...newStates) {

    if (!currentState) {
      throw new TypeError('value ' + currentState + ' is not a valid arguement for SovereignState.prototype.update().');
    }

    if (this.validateOnUpdate) {
      newStates
        .forEach(function (updateObj) {
          this.validateValueTypes(updateObj);
          this.validateKeys(updateObj);
        }.bind(this));
    }

    return baseAssign(currentState, ...newStates);
  };

  SovereignState.prototype.mixedUpdate = function (currenState, ...newStates) {
    return this.update(
      newStates.filter(function (updateObj) {
        return updateObject ? true : false;
      })
    );
  };

  Object.defineProperty(SovereignState.prototype, 'UNSAFE', {
    get() { return new SovereignState(this.initialState, true) }
  });


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

  //-------------------------------------------------/

  return SovereignState;
})