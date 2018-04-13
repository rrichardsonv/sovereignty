var SovereignState = require('./sovereignty');
var failed = 0;

function test(description, fn){
  if(!fn()){
    failed++;
    console.error(description + ' x ');
    return;
  };
  console.log(description + ' ✓ ')
}

function throwsError(fn){
  var result = false;
  try {
    fn();
  } catch (e) {
    result = true;
  }

  return result;
}

const initialState = {
  foo: 0,
  bar: '',
  baz: [],
  quux: {},
  quuz: null,
  corge: undefined
}

test('SovereignState in scope', function(){
  return SovereignState !== undefined;
});

console.log('SovereignStateUtils.constructor')
test(' - initialState', function(){
  var stateUtils = new SovereignState(initialState);

  return stateUtils.initialState === initialState;
});

test(' - typeLookup', function () {
  var stateUtils = new SovereignState(initialState);

  var number = stateUtils.typeLookup['foo'] === initialState['foo'].constructor.name;
  var string = stateUtils.typeLookup['bar'] === initialState['bar'].constructor.name;
  var array = stateUtils.typeLookup['baz'] === initialState['baz'].constructor.name;
  var object = stateUtils.typeLookup['quux'] === initialState['quux'].constructor.name;
  var nullAny = stateUtils.typeLookup['quuz'] === 'any';
  var undefinedAny = stateUtils.typeLookup['corge'] === 'any';
  return number &&
        string &&
        array &&
        object &&
        nullAny &&
        undefinedAny;
});

// prototype

console.log('SovereignStateUtils.prototype');
console.log(' - validateKeys()')
test('  -  it returns true for keys present in initialState', function() {
  var stateUtils = new SovereignState(initialState);

  return stateUtils.validateKeys({ foo: 1 });
});

test('  -  it throws for keys not-present in initialState', function () {
  var stateUtils = new SovereignState(initialState);
  return throwsError(function () { return stateUtils.validateKeys({ banana: 1 }) });
});

test('  -  it throws with mixed present and not', function () {
  var stateUtils = new SovereignState(initialState);
  return throwsError(function () { return stateUtils.validateKeys({ banana: 1, foo: 1 }) });
});


console.log(' - validateValueTypes()')
test('  -  it returns true for values that match the value types of initialState', function () {
  var stateUtils = new SovereignState(initialState);

  return stateUtils.validateValueTypes({ foo: 1 });
});

test('  -  it returns true for keys with value \'any\' (those which had null/undefined values in initialState)', function () {
  var stateUtils = new SovereignState(initialState);

  return stateUtils.validateValueTypes({ quuz: SovereignState });
});

test('  -  it throws for value types that do not match', function () {
  var stateUtils = new SovereignState(initialState);
  return throwsError(function () {
    return stateUtils.validateValueTypes({ foo: 'foo' });
  });
});

test('  -  it throws for value types that both do and do not match', function () {
  var stateUtils = new SovereignState(initialState);
  return throwsError(function () {
    return stateUtils.validateValueTypes({ foo: 1, bar: SovereignState });
  });
});

console.log(' - update()');
var newState = {
  foo: 4,
  bar: 'dude'
};
test('  -  it returns an updated store with a valid object', function(){
  var stateUtils = new SovereignState(initialState);
  var updatedState = stateUtils.update(initialState, newState);

  return updatedState['foo'] === 4 && updatedState['bar'] === 'dude';
});

test('  -  it does not mutate its arguments', function () {
  var stateUtils = new SovereignState(initialState);
  var updatedState = stateUtils.update(initialState, newState);

  return initialState['foo'] !== updatedState['foo'];
});

test('  -  it is deterministic', function () {
  var stateUtils = new SovereignState(initialState);
  var firstUpdate = stateUtils.update(initialState, newState);
  var secondUpdate = stateUtils.update(firstUpdate, initialState);

  return initialState['foo'] === secondUpdate['foo'];
});

test('  -  falsey values for type \'any\' (or 0) do not throw', function(){
  var stateUtils = new SovereignState(initialState);
  return !throwsError(function () {
    return stateUtils.validateValueTypes({ foo: 0, bar: '', quuz: undefined });
  });
});

test('  -  falsey values for all other situations do throw', function () {
  var stateUtils = new SovereignState(initialState);
  return throwsError(function () {
    return stateUtils.validateValueTypes({ foo: undefined });
  });
});

if(failed !== 0) {
  process.exit(1);
}
