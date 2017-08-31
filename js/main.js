import style from '../less/style.less'

import Taggle from 'taggle'
import particles from 'particles.js'
import particlesOptions from './particlesjs-config'
import Awesomplete from "awesomplete"

let isTagSelected = false;

const taggleLibraries = new Taggle(document.querySelector('#libraries-with-taggle'), {
    duplicateTagClass: 'bounce',
    placeholder: 'Add the libraries you want to compile. Example: jquery, react=3.4, angular',
    onBeforeTagAdd: function(event, tag) {
        return !event;
    },
});

const tagCache = {};

const requestTag = function(tag) {
    return fetch('https://libraries.io/api/npm/' + tag).then(resp => {
        if (resp.status >= 200 && resp.status < 300) {
            return resp.json();
        } else {
            handleError(resp);
        }
    }, handleError);
}

const getInfo = function(tag) {
    let tagInfo;
    let promise;
    tagInfo = tagCache[tag];

    if(tagInfo) {
        promise = Promise.resolve(tagInfo);
    } else {
        promise = requestTag(tag);
    }

    promise.then(tagInfo => {
        const cardInfo = document.querySelector('#card-info-container');
        cardInfo.innerHTML = createTagCard(tagInfo);
    });
}

const createTagCard = function(tag) {
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

const taggleContainer = taggleLibraries.getContainer();

taggleContainer.addEventListener('click', function(ev) {
    let target = ev.target;

    const isDiv = target.classList.contains('taggle');

    if(isDiv) {
        target = target.querySelector('taggle_text');
    }

    const isSpan = target && target.classList.contains('taggle_text');

    let tag;
    if(isSpan) {
        tag = target.innerHTML;
        getInfo(tag);
    }

});

const setLoader = function(spin) {
    const loader = document.querySelector('#loader');

    if(spin) {
        loader.classList.add('fa-spin');
    } else {
        loader.classList.remove('fa-spin');

    }

}

const handleError = function(resp) {
    let message;

    if(resp.status === 404) {
        message = 'Something strange happend. Check the library information';
    }

    message = message || resp.message;

    document.querySelector('#error-message').innerHTML = message;
    document.querySelector('#error-container').classList.remove('invisible');
    setLoader(false);
}

const loadingPromises = [];
const searchPackages = function(query) {
    loadingPromises[query] = true;

    setLoader(true);

    const promise = (function(query){
        return fetch('https://libraries.io/api/bower-search?q=' + query).then(resp => {
            if (resp.status >= 200 && resp.status < 300) {
                delete loadingPromises[query];
                if(Object.keys(loadingPromises).length === 0) {
                    setLoader(false);
                }

                return resp.json();
            } else {
                handleError(resp)
            }

        }, handleError);
    })(query);



    cache[query] = true;

    promise.then(function(resp) {
        resp.forEach(function(newItem) {
            let exist = false;

            for (var i = 0; i < list.length; i++) {
                const item = list[i];
                if(newItem.name === item.name) {
                    exist = true;
                }
            }

            if(!exist) {
                list.push({label: newItem.name, value: newItem.name});
            }
        });

        autoComplete.evaluate();
    });
};


let searchTimeout = null;

const cache = {};

const libraryInput = taggleLibraries.getInput();
taggleLibraries.getInput().addEventListener('keyup', function(ev) {

    const value = libraryInput.value;

    let query = cache[value];

    if(query) {

    } else {
        window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(function() {
            searchPackages(value);
        },1000);
    }
});


particlesJS('particles-js', particlesOptions, function() {
  console.log('callback - particles.js config loaded');
});

const list = [];
const autoComplete = new Awesomplete(taggleLibraries.getInput(), {
    maxItems: 20,
    minChars: 1,
    autoFirst: true,
	list
})

taggleLibraries.getInput().addEventListener('awesomplete-select', function(ev) {
    isTagSelected = true;
    ev.preventDefault();
    autoComplete.close();
    taggleLibraries.add(ev.text.value);
});

const download = function(event) {
    let query = '';

    const tags = taggleLibraries.getTags().values;

    tags.forEach(tag => {
        query += `${tag}&`
    });

    let xhr = new XMLHttpRequest();
    //set the request type to post and the destination url to '/convert'
    xhr.open('GET', 'http://api.mixerjs.com/compile.js?' + query);
    //set the reponse type to blob since that's what we're expecting back
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
        if (this.status == 200) {
            // Create a new Blob object using the
            //response data of the onload object
            var blob = new Blob([this.response], {type: 'application/javascript'});
            //Create a link element, hide it, direct
            //it towards the blob, and then 'click' it programatically
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            //Create a DOMString representing the blob
            //and point the link element towards it
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'compile.js';
            //programatically click the link to trigger the download
            a.click();
            //release the reference to the file by revoking the Object URL
            window.URL.revokeObjectURL(url);
        }else{
            handleError(e);
        }
    };

    xhr.send();
}

document.querySelector('#download-button').addEventListener('click', download);
