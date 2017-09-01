var simpleRequest = require('./simpleRequest');

var searchPackages = function(query) {
    return simpleRequest('https://libraries.io/api/bower-search?q=' + query).then(function(resp) {

        list = resp.map(item => {
            return {label: item.name, value: item.name}
        });

        return Promise.resolve(list);
    });
};

module.exports = searchPackages;
