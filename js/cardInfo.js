var simpleRequest = require('./simpleRequest');
var lscache       = require('lscache');
var CACHE_EXPIRES = require('../config').CACHE_EXPIRES;

var getPackageInfo = function(tag) {
    var tagInfo;
    var promise;

    lscache.setBucket('package-info')
    tagInfo = lscache.get(tag);

    if(tagInfo) {
        promise = Promise.resolve(tagInfo);
    } else {
        promise = simpleRequest('https://libraries.io/api/npm/' + tag);
        promise.then(function(tagInfo) {
            lscache.setBucket('package-info')
            lscache.set(tag, tagInfo, CACHE_EXPIRES);
        });
    }

    return promise;
}

var createTagCardHTML = function(tag) {
return `
    <div class="card">
        <h3 class="card-header text-capitalize text-center"> <a target="_blank" href="${tag.homepage}">${tag.name}</a></h3>
        <div class="card-body">
            <p class="card-text">${tag.description}</p>
            <p>Stable Release: <span class="badge badge-pill badge-primary">${tag.latest_release_number}</span></p>
            <input class="form-control" value="${tag.latest_release_number}" placeholder="Version"><br>

            <br>
            <iframe src="https://ghbtns.com/github-btn.html?user=twbs&repo=bootstrap&type=star&count=true&size=large" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>
            <br>
            <button class="btn btn-info" href="#">Select</button>
        </div>
    </div>
`
}


module.exports = {
    getPackageInfo,
    createTagCardHTML
};
