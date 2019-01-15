// see appstate.txt for documentation of redux application state properties

import { createStore, applyMiddleware } from 'redux';
import reducers from '../reducers/reducers';

const initialState = {
  appLayout: { template: 'ProcessBrowseScreen', mode: 'organize', data: {} },
  measureMode: {
    data: {},
    runTable: {
      editMode: 'none',
      hiddenColumns: new Set(),
      hiddenPropertyColumns: {},
      lastBlockSelected: new Map(),
      lastCellClicked: new Map(),
      processPreferences: {},
      selectedCells: new Map(),
      selectedColumns: new Set(),
    },
  },
  contextMenu: { context: {} },
  userProfile: { visible: false, firstNameError: false, lastNameError: false, emailError: false },
};

const middleware = applyMiddleware(/* add middleware services here */);

export default (typeof Meteor !== 'undefined' && Meteor.isDevelopment) ?
  createStore(
    reducers,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    // TODO: to add middleware here, follow these instructions (needs compose function):
    // https://github.com/zalmoxisus/redux-devtools-extension#usage
    // middleware,
  )
  : createStore(reducers, initialState, middleware);
