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
                taggle: null,
                packages: {}
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
            }
        },

        computed: {
            awesompleteList: function() {
                return Object.keys(this.packages).map(packageName => {
                    const name = this.packages[packageName].name;

                    return {label: name, value: name};
                });
            }
        },
        methods: {

            addListeners() {

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
            getPackageInfo(packageName) {
                lscache.setBucket('packageInfo');
                const packageInfo = lscache.get(packageName);
                let promise;

                if(packageInfo) {
                    promise = Promise.resolve(packageInfo);
                } else {
                    promise = simpleRequest('https://libraries.io/api/npm/' + packageName);
                    promise.then(packageInfo => {
                        lscache.setBucket('packageInfo');
                        lscache.set(packageName, packageInfo, this.expires);
                    }, this.handleError);
                }

                return promise;
            },

            handleError(error) {
                this.$emit('error', error);
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
                    const tag = target.innerHTML;
                    this.selectTag(target.parentNode);

                    this.getPackageInfo(tag).then(function(packageInfo) {
                        that.$emit('packageInfo', packageInfo);
                    });;
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
                        });
                    }, that.searchTimeout);
                }
            },

            add(newPackages) {
                if(newPackages.length <= 0) return;

                const that = this;

                newPackages.forEach(function(newPackage) {
                    that.packages[newPackage.name] = newPackage
                });

                const updatedPackages = Object.assign({}, this.packages);

                lscache.setBucket('packages-list');
                lscache.set('packages', this.packages, this.expires);

                this.packages = updatedPackages;
                this.$emit('update:packages', updatedPackages);

                this.updateAwesompleteList();
            },

            updateAwesompleteList() {
                this.awesomplete.list = this.awesompleteList;
                this.awesomplete.evaluate();
            },

            exist(packageName) {
                return !!this.packages[packageName]
            },

            handleError(error) {
                this.$emit('error', error);
            },

            toggleLoading() {
                this.loading = !this.loading;
                this.$emit('loading', this.loading);
            },

            search(query) {
                const that = this;
                this.toggleLoading();
                const promise = simpleRequest('https://libraries.io/api/bower-search?q=' + query);

                promise.then(this.toggleLoading.bind(this), (err) => {
                    that.toggleLoading();
                    that.handleError(err)
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
                submitKeys         : [188, 9, 13, 32]
            });

            this.awesomplete = new Awesomplete(this.taggle.getInput(), {
                maxItems: 20,
                minChars: 1,
                autoFirst: true
            })

            lscache.setBucket('packages-list');
            let packages = lscache.get('packages');

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
    padding: 10px;
    border: 0;
    border: 1px solid @color-mixerjs-orange;
    border-radius: .3em;
    box-shadow: .05em .1em .3em rgba(0,0,0,.3) inset;
    min-height: 100px;
    overflow: hidden;

    &.active {
        outline: none;
        border: 1px solid @color-mixerjs-blue;
        animation: pulsate 2s infinite alternate linear;
    }

    .awesomplete > ul {
        margin-top: 38px;
        position: fixed;
        left: initial;
        max-width: 30%;
        min-width: 30px
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
    color: #990033;
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
