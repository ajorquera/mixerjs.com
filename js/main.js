var Taggle           = require('taggle');
var particles        = require('particles.js');
var Awesomplete      = require("awesomplete");
var lscache          = require('lscache');

var css              = require('../less/style.less');

var particlesOptions = require('./particlesjs-config')
var download         = require('./download');
var simpleRequest    = require('./simpleRequest');
var cardInfo         = require('./cardInfo');
var searchPackages   = require('./searchPackages');
var utils            = require('./utilities');
var config           = require('../config');

//-------CONSTANTS---------------------------------------------

//minutes
var CACHE_EXPIRES = config.CACHE_EXPIRES;

//---------------DOM ELEMENTS----------------------------------------

var librariesLoaderDOM = document.querySelector('#libraries-loader');
var minifyCheckboxDOM  = document.querySelector('#minify-checkbox');
var errorContainerDOM  = document.querySelector('#error-container');
var downloadButtonDOM  = document.querySelector('#download-button');
var particlesJSDOM     = document.querySelector('#particles-js');
var cardInfoDOM        = document.querySelector('#card-info-container');
var taggleDOM          = document.querySelector('#libraries-with-taggle');
var particleCanvas     = null;
var taggleInputDOM     = null;

//----------LISTENERS--------------------------------------------------------

var onBeforeAddTagTaggle = function(event, tag) {

    //don't add tags that come from an event
    var shouldTagBeAdded = !event;

    return shouldTagBeAdded;
};

var onClickTag = function(ev) {
    var target = ev.target;

    var isDiv = target.classList.contains('taggle');

    if(isDiv) {
        target = target.querySelector('taggle_text');
    }

    var isTagFound = target && target.classList.contains('taggle_text');

    if(isTagFound) {
        var tag = target.innerHTML;
        cardInfo.getPackageInfo(tag).then(function(tagInfo) {
            cardInfoDOM.innerHTML = cardInfo.createTagCardHTML(tagInfo);
        }, handleError);;
    }
}

var onkey = (function() {

    //create a closure for searchTimeout
    var searchTimeout = null;

    return function(ev) {
        var value = taggleInputDOM.value;
        if(!value) return;

        lscache.setBucket('search-packages');
        var isSearchMade = lscache.get(value);

        if(!isSearchMade) {
            window.clearTimeout(searchTimeout);
            searchTimeout = window.setTimeout(function() {
                utils.setLoader(librariesLoaderDOM, true);

                searchPackages(value).then(function(list) {
                    utils.setLoader(librariesLoaderDOM, false);
                    setList(list);

                    //set that this search has been made
                    lscache.setBucket('search-packages');
                    lscache.set(value, true, CACHE_EXPIRES);

                }, handleError);
            },1000);
        }
    };
})();

var onAwesompleteSelect = function(ev) {
    ev.preventDefault();
    autoComplete.close();
    taggleLibraries.add(ev.text.value);
}

var onClickDownload = function(event) {
    var tags = taggleLibraries.getTags().values;
    var isMinify = minifyCheckboxDOM.checked
    simpleRequest(`http://api.mixerjs.com/compile.${isMinify ? 'min.' : ''}js?${tags.join('&')}`).then(response => {
        download(response);
    }, handleError);
}

//-------------------------OTHERS------------------------------------------------------------------

var handleError = function(e) {
    var message;
    var resp = e.xhr

    if(resp.status === 404) {
        message = 'Something strange happend. Check the library information';
    }

    message = message || resp.message;

    document.querySelector('#error-message').innerHTML = message;
    errorContainerDOM.classList.remove('invisible');

    utils.setLoader(librariesLoaderDOM, false);
}

var getList = function() {
    lscache.setBucket('package-list');
    return lscache.get('list') || [];
}

var setList = function(list) {
    var newList = getList()
    var newCount = 0;
    list.forEach(function(newItem) {
        for (var i = 0; i < newList.length; i++) {
            var oldItem = newList[i]

            if(oldItem.value === newItem.value) {
                return;
            }
        }

        newList.push(newItem);
        newCount += 1;
    });

    createParticles(newCount);
    autoComplete.list = newList;
    lscache.set('list', newList, CACHE_EXPIRES);
    autoComplete.evaluate();
}

var createParticles = (function() {
    var numberParticles = 0;
    var maxParticleNumber = config.particlesJS.maxNumberParticles;

    return function(total) {
        total = total === undefined ? getList().length : total;

        total = parseInt(total*config.particlesJS.particleMultiplier);

        if(!total || numberParticles > maxParticleNumber) return;

        var count = 0;

        var interval = setInterval(function() {
            if(count > total || numberParticles > maxParticleNumber) return clearInterval(interval);

            particleCanvas.click();
            count += 1;
            numberParticles += 1;
        }, config.particlesJS.creationSpeed);
    };
})();


//-------------------Taggle PLUGIN-----------------------------------------------------

var taggleLibraries = new Taggle(taggleDOM, {
    duplicateTagClass  : 'bounce',
    placeholder        : 'jquery, react, angular',
    onBeforeTagAdd     : onBeforeAddTagTaggle,
    submitKeys         : [188, 9, 13, 32]
});

taggleInputDOM = taggleLibraries.getInput();

taggleDOM.addEventListener('click', onClickTag);

//-------------------particles.js PLUGIN----------------------------------------------------------------

particlesJS('particles-js', particlesOptions);
particleCanvas = particlesJSDOM.querySelector('canvas');

createParticles();

//-------------------Awesomplete PLUGIN---------------------------------------------------------------

lscache.setBucket('package-list');

var autoComplete = new Awesomplete(taggleLibraries.getInput(), {
    maxItems: 20,
    minChars: 1,
    autoFirst: true,
    list: getList()
})

taggleInputDOM.addEventListener('awesomplete-select', onAwesompleteSelect);
taggleInputDOM.addEventListener('keyup', onkey);

//----------------------Download Button-------------------------------------------------------------------
downloadButtonDOM.addEventListener('click', onClickDownload);
