<template lang="pug">
    div(ref="elem" id="text" v-on:keyup="onKeyUp"  v-on:click="onClickTag" v-on:awesomplete-select="onAwesompleteSelect")
</template>
<script>
    import simpleRequest from '../utils/simpleRequest'
    import Taggle from'taggle'
    import lscache from 'lscache'
    import Awesomplete from 'awesomplete'

    export default {
        name: 'tagglePackages',
        data: function() {
            return {
                taggle: null
            }
        },

        props: {
            searchTimeout: {
                type: Number,
                default: 1000
            },
            expires: {
                type: Number,

                //1 day in seconds
                default: 86400
            },
            searchPackages: {
                type: Object,
                default: () => {}
            },
            replace: {
                type: String
            }
        },

        computed: {
            awesompleteList: function() {
                const that = this;
                return Object.keys(this.searchPackages).map(packageName => {
                    const packageItem = this.searchPackages[packageName];

                    if(packageItem) {
                        const name = this.searchPackages[packageName].name;
                        return {label: name, value: name};
                    }
                });
            }
        },

        watch: {
            replace: function(tag) {
                const tagsArray = this.taggle.getTagValues();
                let found = false;
                for(var i=0; i < tagsArray.length; i++) {
                    const tagToReplace = tagsArray[i];

                    if(this.simplifyTag(tag) === this.simplifyTag(tagToReplace)) {
                        tagsArray[i] = tag;
                        found = true;
                    }
                }
                if(found) {
                    this.taggle.getContainer().querySelector('.selected .taggle_text').innerHTML = tag;
                    this.$emit('update:selectedPackages', tagsArray);
                }
            }
        },

        methods: {
            simplifyTag(tag) {
                return tag.replace(/=.+/, '');
            },

            onTagAdd(ev, tag) {
                const selectedPackages = this.taggle.getTags().values;
                this.$emit('update:selectedPackages', selectedPackages);
            },

            onTagRemove(ev, tag) {
                const selectedPackages = this.taggle.getTags().values;
                this.$emit('update:selectedPackages', selectedPackages);
            },

            onBeforeAddTagTaggle(ev, tag) {

                //don't add if trigger comes from an event
                const shouldTagBeAdded = !ev;

                return shouldTagBeAdded;
            },
            onAwesompleteSelect(ev) {
                ev.preventDefault();
                this.awesomplete.close();
                this.taggle.add(ev.text.value);
            },

            getFromCache() {
                lscache.setBucket(this.name);
                return lscache.get('packages');
            },

            setCache(item) {
                lscache.setBucket(this.name);
                lscache.set('packages', item, this.expires);
            },

            handleError(response) {
                const error = {response};

                if(response.status === 404) {
                    error.code = 'notFound';
                    error.message = 'Nothing found on search'
                } else {
                    error.code = 'unknown';
                    error.message = 'Something went wrong!'
                }
                this.$emit('update:error', error);
            },

            selectTag(tagDOM) {
                if(this.selectedTag) this.selectedTag.classList.remove('selected');
                this.selectedTag = tagDOM;
                this.selectedTag.classList.add('selected');
            },

            onClickTag(ev) {
                const that = this;
                let target = ev.target;

                const isDiv = target.classList.contains('taggle');

                if(isDiv) {
                    target = target.querySelector('.taggle_text');
                }

                const isTagFound = target && target.classList.contains('taggle_text');

                if(isTagFound) {
                    const tag = target.innerHTML.replace(/=.+/, '');
                    this.selectTag(target.parentNode);
                    this.$emit('update:selectedPackage', this.searchPackages[tag]);
                }
            },

            onKeyUp(ev) {
                const that = this;
                const query = ev.target.value;
                if(!query) return;

                if(!this.exist(query)) {
                    window.clearTimeout(this.searchTimeoutCB);
                    this.searchTimeoutCB = window.setTimeout(function() {
                        that.search(query).then(function(newPackages) {
                            that.add(newPackages);
                        }, that.handleError);
                    }, that.searchTimeout);
                }
            },

            add(newPackages) {
                if(newPackages.length <= 0) return;

                const that = this;

                newPackages.forEach(function(newPackage) {
                    that.searchPackages[newPackage.name] = newPackage
                });

                const updatedPackages = Object.assign({}, this.searchPackages);

                this.setCache(this.searchPackages);

                this.$emit('update:searchPackages', updatedPackages);

                this.updateAwesompleteList();
            },

            updateAwesompleteList() {
                this.awesomplete.list = this.awesompleteList;
                this.awesomplete.evaluate();
            },

            exist(packageName) {
                return !!this.searchPackages[packageName]
            },

            toggleLoading() {
                this.loading = !this.loading;
                this.$emit('update:loading', this.loading);
            },

            search(query) {
                const that = this;
                this.$emit('update:error', null);

                this.toggleLoading();
                const promise = simpleRequest('https://libraries.io/api/bower-search?q=' + query);

                promise.then(this.toggleLoading.bind(this), (err) => {
                    that.toggleLoading();
                });
                return promise;
            },
        },

        mounted() {
            const taggleDOM = this.$refs.elem;

            this.taggle = new Taggle(taggleDOM, {
                duplicateTagClass  : 'bounce',
                placeholder        : 'jquery, react, angular',
                onBeforeTagAdd     : this.onBeforeAddTagTaggle,
                onTagRemove        : this.onTagRemove,
                onTagAdd           : this.onTagAdd,
                submitKeys         : [188, 9, 13, 32],
                preserveCase       : true
            });

            this.awesomplete = new Awesomplete(this.taggle.getInput(), {
                maxItems: 20,
                minChars: 1,
                autoFirst: true
            })

            let packages = this.getFromCache()

            if(packages) {
                packages = Object.keys(packages).map(name => packages[name]);
                this.add(packages);
            }

        }
    }

</script >
<style lang="less">
@import (css) "../../node_modules/awesomplete/awesomplete.css";
@import '../less/variables';

@keyframes pulsate {
    to {
        box-shadow: .05em .1em .3em rgba(0,0,0,.3) inset, 0 0 .3em .1em #58a;
    }
}

@-webkit-keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        -webkit-transform: translateY(0);
    }
    40% {
        -webkit-transform: translateY(-16px);
    }
    60% {
        -webkit-transform: translateY(-7px);
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        -webkit-transform: translateY(0);
        transform: translateY(0);
    }
    40% {
        -webkit-transform: translateY(-16px);
        transform: translateY(-16px);
    }
    60% {
        -webkit-transform: translateY(-7px);
        transform: translateY(-7px);
    }
}


.bounce {
    -webkit-animation-name: bounce;
    animation-name: bounce;
}


.mixerjs-taggle {
    display: inline-block;
    width: 100%;
    padding: 10px;
    border: 0;
    border: 1px solid @color-mixerjs-orange;
    border-radius: .3em;
    box-shadow: .05em .1em .3em rgba(0,0,0,.3) inset;
    min-height: 100px;

    &.active {
        outline: none;
        border: 1px solid @color-mixerjs-blue;
        animation: pulsate 2s infinite alternate linear;
    }

    .awesomplete > ul {
        top: 35px;
    }
}

.taggle_list {
    float: left;
    padding: 0;
    margin: 0;
    width: 100%;
}

.taggle_input {
    border: none;
    outline: none;
    font-size: 16px;
    font-weight: 300;
}

.taggle_list li {
    float: left;
    display: inline-block;
    white-space: nowrap;
    font-weight: 500;
    margin-bottom: 5px;
}

.taggle_list .taggle {
    margin-right: 8px;
    background: rgba(255, 127, 0, 0.54);
    color: @color-mixerjs-blue;
    padding: 5px 10px;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    transition: all .3s;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;

    &.selected, &.selected:hover {
        background-color: @color-mixerjs-orange;
    }
}

.taggle_list .taggle_hot {
    background: rgba(239, 4, 4, 0.54);
    color: white;
}

.taggle_list .taggle .close {
    font-size: 1.1rem;
    position: absolute;
    top: 10px;
    right: 3px;
    text-decoration: none;
    padding: 0;
    line-height: 0.5;
    color: @color-mixerjs-blue;
    padding-bottom: 4px;
    display: none;
    border: 0;
    background: none;
    cursor: pointer;
}

.taggle_list .taggle:hover {
    padding: 5px;
    padding-right: 15px;
    background: rgba(255, 127, 0, 0.54);
    transition: all .3s;
}

.taggle_list .taggle:hover > .close {
    display: block;
}

.taggle_list .taggle .close:hover {
    color: @color-mixerjs-blue;
}

.taggle_placeholder {
    position: absolute;
    color: #CCC;
    transition: opacity, .25s;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.taggle_input {
    padding: 8px;
    padding-left: 0;
    float: left;
    margin-top: -5px;
    background: none;
    width: 100%;
    max-width: 100%;
}

.taggle_sizer {
    padding: 0;
    margin: 0;
    position: absolute;
    top: -500px;
    z-index: -1;
    visibility: hidden;
}
</style>
