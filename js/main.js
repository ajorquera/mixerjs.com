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

const taggleContainer = taggleLibraries.getContainer();

// taggleContainer.addEventListener('click', ev => {
//     let target = ev.target;
//
//     const isDiv = target.classList.contains('taggle'));
//
//     if(isDiv) {
//         target = target.querySelector('taggle_text');
//     }
//
//     const isSpan = target && target.classList.contains('taggle_text'));
//
//     let tag;
//     if(isSpan) {
//         tag = target.innerHTML;
//         getInfo(tag);
//     }
//
// });

const setLoader = function(spin) {
    const loader = document.querySelector('#loader');

    if(spin) {
        loader.classList.add('fa-spin');
    } else {
        loader.classList.remove('fa-spin');

    }

}

const loadingPromises = [];
const searchPackages = function(query) {
    loadingPromises[query] = true;

    setLoader(true);

    const promise = (function(query){
        return fetch('https://libraries.io/api/bower-search?q=' + query).then(resp => {
            delete loadingPromises[query];
            if(Object.keys(loadingPromises).length === 0) {
                setLoader(false);
            }

            return resp.json();
        });
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
