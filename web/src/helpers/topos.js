const topojson = require('topojson');
const topo = require('../world.json');

const constructTopos = () => {
  const zones = {};
  Object.keys(topo.objects).forEach((k) => {
    if (!topo.objects[k].arcs) { return; }
    const geo = {
      geometry: topojson.merge(topo, [topo.objects[k]]),
      properties: topo.objects[k].properties
    };
    // Exclude zones with null geometries.
    if (geo.geometry) {
      zones[k] = geo;
    }
  });

  return zones;
};

module.exports = constructTopos;
