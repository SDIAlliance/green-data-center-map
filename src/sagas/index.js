import {
  all,
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import { fetchDataCenterFacilitiesApiRequest } from '../helpers/open-data-hub-api/data-center-facilities';
import { handleRequestError, protectedJsonRequest } from '../helpers/api';

function* fetchZoneCarbonIntensity(endpoint) {
  try {
    const payload = yield call(protectedJsonRequest, endpoint);
    yield put({ type: 'CARBON_INTENSITY_FETCH_SUCCEEDED', payload });
  } catch (err) {
    yield put({ type: 'CARBON_INTENSITY_FETCH_FAILED' });
    handleRequestError(err);
  }
}

function* fetchGridZones() {
  const endpoint = '/v3/zones';

  try {
    const payload = yield call(protectedJsonRequest, endpoint);
    yield put({ type: 'TRACK_EVENT', payload: { eventName: 'pageview' } });
    yield put({ type: 'APPLICATION_STATE_UPDATE', key: 'callerLocation', value: payload.callerLocation });
    yield put({ type: 'APPLICATION_STATE_UPDATE', key: 'callerZone', value: payload.callerZone });

    const zoneEndpoints = Object.keys(payload).map(zoneId => `/v3/carbon-intensity/latest?zone=${zoneId}`);

    if (zoneEndpoints.length) {
      yield all(zoneEndpoints.map(zoneEndpoint => call(fetchZoneCarbonIntensity, zoneEndpoint)))
    }
    yield put({ type: 'GRID_ZONES_FETCH_SUCCEEDED', payload });
  } catch (err) {
    yield put({ type: 'GRID_ZONES_FETCH_FAILED' });
    handleRequestError(err);
  }
}

function* fetchDataCenterFacilities() {
  const endpoint = `/data-center-facilities`;

  try {
    const payload = yield call(fetchDataCenterFacilitiesApiRequest, endpoint);
    yield put({ type: 'DATA_CENTERS_FETCH_SUCCEEDED', payload });
  } catch (err) {
    yield put({ type: 'DATA_CENTERS_FETCH_FAILED' });
    handleRequestError(err);
  }
}

export default function* () {
  // Data fetching
  yield takeLatest('CARBON_INTENSITY_FETCH_REQUESTED', fetchZoneCarbonIntensity);
  yield takeLatest('DATA_CENTERS_FETCH_REQUESTED', fetchDataCenterFacilities)
  yield takeLatest('GRID_ZONES_FETCH_REQUESTED', fetchGridZones);
}
