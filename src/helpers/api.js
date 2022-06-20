import * as request from 'd3-request';
import { sha256 } from 'js-sha256';

import thirdPartyServices from '../services/thirdparty';

export function protectedJsonRequest(path) {
  const url = `https://api.electricitymap.org${path}`;
  const timestamp = new Date().getTime();
  const token = process.env.ELECTRICITYMAP_TOKEN;

  return new Promise((resolve, reject) => {
    request.json(url)
      .header('auth-token', token)
      .header('x-request-timestamp', timestamp)
      .header('x-signature', sha256(`${token}${path}${timestamp}`))
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
          resolve(res);
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
