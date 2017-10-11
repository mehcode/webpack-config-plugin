const { JsonPropertyFilter } = require('json-property-filter');

module.exports = function () {
  const { config, filter = [] } = JSON.parse(this.query.slice(1));

  if (Array.isArray(filter) && filter.length > 0) {
    const propertyFilter = new JsonPropertyFilter(filter);
    const filteredOutput = propertyFilter.apply(config);

    return `module.exports = ${JSON.stringify(filteredOutput)}`;
  }

  return `module.exports = ${JSON.stringify(config)}`;
};
