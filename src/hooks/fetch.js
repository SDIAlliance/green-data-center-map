import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { DATA_FETCH_INTERVAL } from '../helpers/constants';

import { useCustomDatetime, useFeatureToggle } from './router';

export function useGridDataPolling() {
  const datetime = useCustomDatetime();
  const features = useFeatureToggle();
  const dispatch = useDispatch();

  // After initial request, do the polling only if the custom datetime is not specified.
  useEffect(() => {
    let pollInterval;
    dispatch({ type: 'GRID_ZONES_FETCH_REQUESTED', payload: { datetime, features } });
    if (!datetime) {
      pollInterval = setInterval(() => {
        dispatch({ type: 'GRID_ZONES_FETCH_REQUESTED', payload: { datetime, features } });
      }, DATA_FETCH_INTERVAL);
    }
    return () => clearInterval(pollInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datetime]);
}

export function useRequestDataCenterFacilities() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: 'DATA_CENTERS_FETCH_REQUESTED' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
