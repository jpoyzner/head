import React from 'react';
import ReactDOM from 'react-dom';
import Store from '../../store/store';
import Subscriptions from '../../store/subscriptions';

export default class SmartComponent extends React.Component {
  /**
  * @function attachToBlaze
  * @instance
  * @memberof SmartComponent
  * @summary call this method when you want the blaze template to handle mounting and unmounting
  * @param {Object} blazeTemplate the template we are attaching the new component to
  * @param {Object} component the React component class being mounted
  * @param {String} selector used to specify where to mount component
  * @param {Object} props props that are passed into the component instance
  */
  static attachToBlaze(blazeTemplate, component, selector, props = {}) {
    blazeTemplate.onCreated(() => SmartComponent.mount(component, selector, props));
    blazeTemplate.onDestroyed(() => SmartComponent.unmount());
  }

  /**
  * @function mount
  * @instance
  * @memberof SmartComponent
  * @summary call this method directly when you explicitly want to mount
  * NOTE: mounting on a Blaze element that has Blaze conditional statements inside of it will not
  * work; however, you can create another element inside of that element and use it as the root
  * @param {Object} component the React component class being mounted
  * @param {String} selector used to specify where to mount component
  * @param {Object} props props that are passed into the component instance
  */
  static mount(Component, selector, props = {}) {
    // setTimeout is used here to allow any parent DOM nodes required for mounting to render
    setTimeout(() => {
      const $root = $(selector);
      if (!$root.length) {
        return;
      }

      ReactDOM.render(<Component {...props} />, $root[0]);
    });
  }

  // make sure to call super.componentWillMount() if you are overriding this method!
  componentDidMount() {
    this.connectToRedux();
  }

  /**
  * @function connectToRedux
  * @instance
  * @memberof SmartComponent
  * @summary Connects this component to redux updates.
  * The state property 'reduxUpdate' below is used to filter this component from being updated
  * by all Redux actions in shouldComponentUpdate(). If the update is indeed caused by redux,
  * you can then compare application state to cached values to decide whether it is ok to update,
  * (see onlyUpdateOnChangeIn() below), otherwise abort the update by returning false.
  */
  connectToRedux() {
    this.unsubscribeFromRedux = Store.subscribe(() =>
      this.setState({ reduxUpdate: true }, () => { this.state.reduxUpdate = false; }));
  }

  /**
  * @function onlyUpdateOnReduxChangeIn
  * @instance
  * @memberof SmartComponent
  * @summary wrapper for onlyUpdateOnChangeIn() that calls it only on redux update
  * @param {Object} fields properties that are checked for changes to see if update is needed
  * @param {Object} state the state object of the component
  * @param {Object} deepFields like fields but for using deep copies in comparisons
  */
  onlyUpdateOnReduxChangeIn(fields, state, deepFields) {
    if (state && state.reduxUpdate) {
      this.onlyUpdateOnChangeIn(fields, deepFields);
    }
  }

  /**
  * @function onlyUpdateOnChangeIn
  * @instance
  * @memberof SmartComponent
  * @summary Use this method in your component's shouldComponentUpdate() method to decide whether
  * it is ok to update. It will cache old values used in last comparison.
  *
  * Note: if you don't wrap invocations of this method in:
  *
  * if (state && state.reduxUpdate) { ... }
  *
  * ...it could block local component state updates!
  *
  * @param {Object} fields properties that are checked for changes to see if update is needed
  * @param {Object} deepFields like fields but for using deep copies in comparisons
  */
  onlyUpdateOnChangeIn(fields, deepFields = {}) {
    if (!this.cachedData) {
      this.cachedData = {};
    }

    this.abortUpdate = true;
    const allFields = { ...fields, ...deepFields };
    for (const fieldName of Object.keys(allFields)) {
      const oldValue = this.cachedData[fieldName];
      const newValue = allFields[fieldName];
      if (newValue instanceof Set) {
        const setsUnequal =
          oldValue === undefined
          || oldValue.size !== newValue.size
          || ![...oldValue].every((value) => newValue.has(value));

        if (setsUnequal) {
          this.abortUpdate = false;
          break;
        }
      } else if (!lodash.isEqual(oldValue, newValue)) {
        this.abortUpdate = false;
        break;
      }
    }

    if (!this.abortUpdate || _.isEmpty(this.cachedData)) {
      Object.keys(fields).forEach((fieldName) => {
        const newValue = fields[fieldName];
        if (newValue instanceof Map) {
          const map = new Map();
          newValue.forEach((value, key) => {
            map.set(key, value instanceof Set ? new Set([...value]) : value);
          });
          this.cachedData[fieldName] = map;
        } else if (newValue instanceof Set) {
          this.cachedData[fieldName] = new Set([...newValue]);
        } else if (newValue instanceof Array) {
          this.cachedData[fieldName] = [...newValue];
        } else if (newValue instanceof Object) {
          this.cachedData[fieldName] = { ...newValue };
        } else {
          this.cachedData[fieldName] = newValue;
        }
      });

      // NOTE: deep cloning is not meant to be used on JS Maps or Sets!!!
      Object.keys(deepFields).forEach((fieldName) => {
        this.cachedData[fieldName] = lodash.cloneDeep(deepFields[fieldName]);
      });
    }
  }

  /**
  * @function subscribeAndTrack
  * @instance
  * @memberof SmartComponent
  * @summary subscribes this component to publication and redux actions
  * see Subscriptions.subscribeAndTrack for more documentation
  */
  subscribeAndTrack(publication, reduxActionType, contentQueryFunction, ...params) {
    if (!this.pubsubs) {
      this.pubsubs = new Set();
    }

    this.pubsubs.add(
      Subscriptions.subscribeAndTrack(
        publication,
        reduxActionType,
        contentQueryFunction,
        ...params,
      ));
  }

  /**
  * @function unmount
  * @instance
  * @memberof SmartComponent
  * @summary call this method directly when explicitly want to unmount and unsubscribe
  * @param {String} selector used to specify where to unmount component from
  */
  static unmount(selector) {
    const $root = $(selector);
    if ($root.length) {
      ReactDOM.unmountComponentAtNode($root[0]);
    }
  }

  // make sure to call super.componentWillUnmount() if you are overriding this method!
  componentWillUnmount() {
    if (this.unsubscribeFromRedux) {
      this.unsubscribeFromRedux();
    }

    if (this.pubsubs) {
      this.pubsubs.forEach((key) => Subscriptions.unsubscribeAndUntrack(key));
    }
  }

  // TODO: need to upgrade lodash to v4 so that we can use _.isEqual instead on sets
  static setsEqual(a, b) {
    return a === b || (a && b && a.size === b.size && [...a].every((value) => b.has(value)));
  }
}
