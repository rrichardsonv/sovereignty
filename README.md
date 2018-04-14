[![Build Status](https://travis-ci.org/rrichardsonv/sovereignty.svg?branch=master)](https://travis-ci.org/rrichardsonv/sovereignty)

# Sovereignty
Utility library for managing state changes in frameworks such as redux

## Setup

`$npm i sovereignty`

**To run the test file**

`$npm run test`

## Examples

At the top of your reducer (Note: `SovereignState` is for object primitive states it will not work for other data structures and this library is not for you)

```js
import SovereignState from 'sovereignty';

const initialState = {
  data: [],
  currentContactId: '',
  isFetching: false,
}

const storeUtils = new SovereignState(initialState);

```

Note: The keys in your initial state and the name of the constructor for the values in your initial state will be used for validations. If you need a field without type validations your initial state should have the initial value be `null`;



`SovereignState.prototype.update` and `SovereignState.prototype.mixedUpdate` function similarly to `Object.assign` ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)).

When you simply want to update state use `update()`:

```js
handleActions({
  GET_CONTACTS: (state, action) => {
    const newData = action.payload.data;
    
    return storeUtils.update(state, { data: newData });
  },

```

When you're concerned about falsey values use `mixedUpdate()`:

```js
handleActions({
  GET_ACCOUNT: (state, action) => {
    const { contacts, currentContact } = action.payload.data.contacts;

    return storeUtils.mixedUpdate(
      state,
      { data: contacts },
      currentContact && { currendContactId: currentContact.id },
    );
  },

```
