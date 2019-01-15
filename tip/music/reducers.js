import measureModeActions from './measureModeActions';
import designModeActions from './designModeActions';
import runTableActions from './runTableActions';
import entityActions from './entityActions';
import ruleActions from './ruleActions';
import contextMenuActions from './contextMenuActions';
import libraryModeActions from './libraryModeActions';
import userProfileActions from './userProfileActions';
import appLayoutActions from './appLayoutActions';

export default (state, action) => {
  const reducers = [
    measureModeActions,
    designModeActions,
    runTableActions,
    entityActions,
    ruleActions,
    contextMenuActions,
    libraryModeActions,
    userProfileActions,
    appLayoutActions,
  ];

  let reducedState;
  for (const reducer of reducers) {
    reducedState = reducer(state, action);
    if (reducedState) {
      return { ...reducedState };
    }
  }

  return { ...state };
};
