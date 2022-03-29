import * as request from 'd3-request';

import thirdPartyServices from '../../services/thirdparty';

const apiEndpoint = 'https://stoplight.io/mocks/sdia/odh-api-spec/33382459';

export function fetchDataCenterFacilitiesApiRequest(path) {
  const url = `${apiEndpoint}${path}`;

  return new Promise((resolve, reject) => {
    request.json(url)
      .header('Prefer', 'code=200, dynamic=true')
      .get(null, (err, res) => {
        if (err) {
          reject(err);
        } else if (!res) {
          const errorToReturn = new Error(`Empty response received for ${url}`);
          // Treat as a 404
          errorToReturn.target = {
            status: 404,
            statusText: errorToReturn.message,
          };
          reject(errorToReturn);
        } else {
          resolve(Array.isArray(res) ? res : [res]);
        }
      });
  });
}

export function handleRequestError(err) {
  if (err) {
    if (err.target) {
      const {
        responseText,
        responseURL,
        status,
        statusText,
      } = err.target;

      // Avoid catching HTTPError 0
      // The error will be empty, and we can't catch any more info for security purposes.
      // See http://stackoverflow.com/questions/4844643/is-it-possible-to-trap-cors-errors
      if (!status) return;

      // Also ignore 5xx errors as they are usually caused by server downtime and are not useful to track.
      if ((status >= 500 && status <= 599) || status === 404) return;

      thirdPartyServices.trackError(new Error(`HTTPError ${status} ${statusText} at ${responseURL}: ${responseText}`));
    } else {
      thirdPartyServices.trackError(err);
    }
  }
}
