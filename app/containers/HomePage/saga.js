/**
 * Gets the repositories of the user from Github
 */

import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  LOAD_REPOS,
  EXCHANGE_RATES_LOADED_SUCCESS,
  LOAD_EXCHANGE_RATES,
} from 'containers/App/constants';
import { reposLoaded, repoLoadingError } from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectUsername } from 'containers/HomePage/selectors';

// function* watchRequests() {
//   // 1- Create a channel for request actions
//   const requestChan = yield actionChannel('REQUEST');
//   while (true) {
//     // 2- take from the channel
//     const { payload } = yield take(requestChan);
//     // 3- Note that we're using a blocking call
//     yield call(handleRequest, payload);
//   }
// }

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

export function* getExchangeRatesFromAPI() {
  const requestURL = `https://blockchain.info/ticker`;
  console.log(requestURL);
  try {
    const results = yield call(request, requestURL);
    yield put(exchangeRatesLoaded(results));
  } catch (err) {
    console.log(err);
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
