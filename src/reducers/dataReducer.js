const constructTopos = require('../helpers/topos');
const translation = require('../helpers/translation');

const zonesConfig = require('../../electricitymap-contrib_config/zones.json');

// ** Prepare initial zone data
const zones = constructTopos();
Object.entries(zonesConfig).forEach((d) => {
  const [key, zoneConfig] = d;
  const zone = zones[key];
  if (!zone) {
    console.warn(`Zone ${key} from configuration is not found. Ignoring..`);
    return;
  }
  // copy attributes ("capacity", "contributors"...)
  zone.capacity = zoneConfig.capacity;
  zone.contributors = zoneConfig.contributors;
  zone.timezone = zoneConfig.timezone;
  zone.shortname = translation.getFullZoneName(key);
  zone.hasParser = (zoneConfig.parsers || {}).production !== undefined;
  zone.hasData = zone.hasParser;
  zone.delays = zoneConfig.delays;
  zone.disclaimer = zoneConfig.disclaimer;
});
// Add id to each zone
Object.keys(zones).forEach((k) => { zones[k].countryCode = k; });

const initialDataState = {
  // Here we will store data items
  dataCenterFacilities: [],
  grid: { zones },
  hasConnectionWarning: false,
  hasGridZonesError: false,
  hasInitializedGrid: false,
  isLoadingDataCenterFacilities: false,
  isLoadingGrid: false
};

module.exports = (state = initialDataState, action) => {
  switch (action.type) {
    case 'CARBON_INTENSITY_FETCH_REQUESTED': {
      return { ...state, hasConnectionWarning: false, isLoadingGrid: true };
    }

    case 'CARBON_INTENSITY_FETCH_SUCCEEDED': {
      return {
        ...state,
        isLoadingGrid: false,
        grid: {
          ...state.grid,
          zones: {
            ...state.grid.zones,
            [action.payload.zone]: {
              ...state.grid.zones[action.payload.zone],
              co2intensity: action.payload.carbonIntensity,
              datetime: action.payload.datetime
            }
          }
        }
      }
    }

    case 'CARBON_INTENSITY_FETCH_FAILED': {
      // If a zone doesn't have data, it will have a greyed out color on the map and a message on hover saying "Live data temporarily unavailable"
      return { ...state, isLoadingGrid: false };
    }

    case 'DATA_CENTERS_FETCH_REQUESTED': {
      return { ...state, isLoadingDataCenterFacilities: true };
    }

    case 'DATA_CENTERS_FETCH_SUCCEEDED': {
      return {
        ...state,
        isLoadingDataCenterFacilities: false,
        dataCenterFacilities: Boolean(action) && Array.isArray(action.payload) ?
          action.payload.map(dataCenterFacility => (
            dataCenterFacility && {
              ...dataCenterFacility,
              consentToOpenData: dataCenterFacility.consent_to_open_data,
              createdAt: dataCenterFacility.created_at,
              energyInputRestEndpoint: dataCenterFacility.energy_input_rest_endpoint,
              energyInputStreamEndpoint: dataCenterFacility.energy_input_stream_endpoint,
              energyInputStreamTopic: dataCenterFacility.energy_input_stream_topic,
              energyOutputRestEndpoint: dataCenterFacility.energy_output_rest_endpoint,
              energyOutputStreamEndpoint: dataCenterFacility.energy_output_stream_endpoint,
              energyOutputStreamTopic: dataCenterFacility.energy_output_stream_topic,
              equipmentInventoryRestEndpoint: dataCenterFacility.equipment_inventory_rest_endpoint,
              latitude: dataCenterFacility.geo_lat,
              longitude: dataCenterFacility.geo_lon,
              totalElectricalCapacity: dataCenterFacility.total_electrical_capacity,
              updatedAt: dataCenterFacility.updated_at
            }
          )) :
          null,
      };
    }

    case 'DATA_CENTERS_FETCH_FAILED': {
      return { ...state, isLoadingDataCenterFacilities: false };
    }

    case 'GRID_ZONES_FETCH_REQUESTED': {
      return { ...state, hasConnectionWarning: false, isLoadingGrid: true };
    }

    case 'GRID_ZONES_FETCH_SUCCEEDED': {
      // Create new grid object
      const newGrid = Object.assign({}, {
        zones: Object.assign({}, state.grid.zones)
      });

      // Create new state
      const newState = Object.assign({}, state);
      newState.grid = newGrid;

      // Set date
      newGrid.datetime = action.payload.datetime;

      // Populate with realtime country data
      Object.entries(action.payload).forEach((entry) => {
        const [key, value] = entry;
        const zone = newGrid.zones[key];

        if (!zone) {
          console.warn(`${key} has no zone configuration.`);
          return;
        }

        // Assign data from payload
        Object.keys(value).forEach((k) => {
          // Warning: k takes all values, even those that are not meant
          // to be updated (like maxCapacity)
          zone[k] = value[k];
        });
      });

      newState.hasInitializedGrid = true;
      newState.isLoadingGrid = false;
      return newState;
    }

    case 'GRID_ZONES_FETCH_FAILED': {
      return { ...state, hasGridZonesError: true, isLoadingGrid: false };
    }

    default:
      return state;
  }
};
