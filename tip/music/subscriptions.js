import Store from './store';

/**
 * @class
 * @name Subscriptions
 * @summary Use this class to subscribe to publications when you want a redux action triggered
 * after every update to the minimongo data that the pubsub's cusor points to
 */
class Subscriptions {
  /**
  * @function subscribeAndTrack
  * @instance
  * @memberof Subscriptions
  * @summary Subscribes to publication and runs passed in contentQuery function in an autorun
  * so that updates to that content cause redux actions to be fired.
  * @param {String} publication the publication function to subscribe to
  * @param {String} reduxActionType the redux action to fire off
  * @param {String} contentQueryFunction content querying that returns cursor to watched data
  * @param {Object} params any number of arguments passed to the publication function
  */
  subscribeAndTrack(publication, reduxActionType, contentQueryFunction, ...params) {
    // TODO: Include params in key, this affects cursor since params are passed into publication
    const key = `${publication}::${reduxActionType}`;

    let pubsub = this[key];
    if (pubsub) {
      this.unsubscribeAndUntrack(key);
    } else {
      pubsub = {};
      this[key] = pubsub;
    }

    pubsub.autorun =
      Tracker.autorun(() => {
        pubsub.subscription = Meteor.subscribe(publication, ...params);
        Store.dispatch({ type: reduxActionType, data: contentQueryFunction() });
      });

    return key;
  }

  /**
  * @function unsubscribeAndUntrack
  * @instance
  * @memberof Subscriptions
  * @summary stops the subscription and autorun associated with a pubsub key
  * @param {key} pubsub key
  */
  unsubscribeAndUntrack(key) {
    const pubsub = this[key];
    if (pubsub) {
      const { autorun, subscription } = pubsub;
      autorun.stop();
      subscription.stop();
      this[key] = null;
    }
  }
}

export default new Subscriptions();
