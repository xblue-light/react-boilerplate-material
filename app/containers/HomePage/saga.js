/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest, take, delay } from 'redux-saga/effects';
import { LOAD_REPOS, LOAD_EXCHANGE_RATES } from 'containers/App/constants';
import { eventChannel, END } from 'redux-saga';
import {
  reposLoaded,
  repoLoadingError,
  exchangeRatesLoadingError,
  exchangeRatesLoaded,
} from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectUsername } from 'containers/HomePage/selectors';

/**
 * Github repos request/response handler
 */
export function* getRepos() {
  // Select username from store
  const username = yield select(makeSelectUsername());
  const requestURL = `https://api.github.com/users/${username}/repos?type=all&sort=updated`;
  try {
    // Call our request helper (see 'utils/request')
    const repos = yield call(request, requestURL);
    yield put(reposLoaded(repos, username));
  } catch (err) {
    yield put(repoLoadingError(err));
  }
}

/**
 * Request latest exchange rates from Blockchain
 */
export function* getExchangeRatesFromAPI() {
  try {
    yield call(saga);
  } catch (err) {
    yield put(exchangeRatesLoadingError(err));
  } finally {
    console.log('Finally!');
  }
}

// creates an event Channel from an interval of seconds
function countdown(secs) {
  return eventChannel(emitter => {
    const iv = setInterval(() => {
      secs -= 1;
      if (secs > 0) {
        emitter(secs);
      } else {
        // this causes the channel to close
        emitter(END);
      }
    }, 4500);
    // The subscriber must return an unsubscribe function
    return () => {
      clearInterval(iv);
    };
  });
}

export function* saga() {
  // try to have a variable for countdown then somehow flushing that variable so that it always keeps calling countdown
  const requestURL = `https://blockchain.info/ticker`;

  // define our eventchannel
  const chan = yield call(countdown, 5);
  try {
    while (true) {
      // take(END) will cause the saga to terminate by jumping to the finally block
      let seconds = yield take(chan);
      console.log(`countdown: ${seconds}`);
      const results = yield call(request, requestURL);
      yield put(exchangeRatesLoaded(results));
    }
  } catch (err) {
    yield take(END);
  } finally {
    console.log('countdown terminated');
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* githubData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(LOAD_REPOS, getRepos);
  yield takeLatest(LOAD_EXCHANGE_RATES, getExchangeRatesFromAPI);
}
