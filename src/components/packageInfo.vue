<template lang="pug">
    div(v-if="isPackage" :class="[animate ? 'animated bounceIn' : '', 'card']")
        h3(class="card-header text-capitalize text-center")
            a(target="_blank" :href="package.homepage")
                | {{package.name}}
        div(class="card-body")
            p(class="card-text")
                | {{package.description}}

            p(v-if="package.latest_stable_release")
                | Stable Release:&nbsp;
                span(class="badge badge-pill badge-primary")
                    | {{package.latest_stable_release.name}}
            form(class="form-inline")
                input(class="form-control col-7" id="versionInput" ref="versionInput" v-model="version" placeholder="Version" :disabled="!versionsAvailable")
                button(:class="['btn btn-sm btn-info col-4 ml-auto', versionsAvailable ? '' : 'utils-clickable'] " v-on:click="getVersions" :disabled="versionsAvailable || loading")
                    span(v-if="loading")
                        i(class="fa fa-spinner fa-spin")
                    span(v-else) Get Versions
            br
            iframe(v-if="this.github" :src="this.github.iframeUrl" frameborder="0" scrolling="0" width="160px" height="30px")
            br
            button(class="btn btn-info utils-clickable" v-on:click="setLibraryVersion") Replace
</template>

<script>
    import lscache from 'lscache'
    import simpleRequest from '../utils/simpleRequest'
    import Awesomplete from 'awesomplete'


    export default {
        name: 'packageInfo',
        data() {
            return {
                version: '',
                animate: false,
                versions: [],
                loading: false,
                awesomplete: null
            };
        },
        props: {
            package: {
                type: Object
            },
            expires: {
                type: Number,

                //1 day
                default: 86400
            }
        },
        computed: {
            versionsAvailable: function() {
                return (this.package && this.package.versions && this.package.versions.length !== 0)
            },
            isLatest: function() {
                if(!this.version || !this.package || !this.package.latest_stable_release) return;

                return this.version === this.package.latest_stable_release.name.replace('v', '');
            },
            isPackage: function() {
                return !!(this.package && this.package.name)
            },
            github: function() {
                if(!this.package) return;

                const url = this.package.repository_url;
                if (!url) return null;

                const urlParts = url.replace(/http?s:\/\//, '').split('/');
                const user = urlParts[1];
                const repo = urlParts[2].replace('.git', '');

                const iframeUrl = `https://ghbtns.com/github-btn.html?user=${user}&repo=${repo}&type=star&count=true&size=large`
                return {
                    url,
                    user,
                    repo,
                    iframeUrl
                }
            }
        },

        updated: function() {
            this.$nextTick(function () {
                const inputDom = document.querySelector('#versionInput');

                if(!this.awesomplete && inputDom) {
                    this.awesomplete = new Awesomplete(inputDom, {
                        maxItems: 10,
                        minChars: 1,
                        autoFirst: true
                    });

                    const awesompleteDom = inputDom.parentNode;
                    if(awesompleteDom) {
                        awesompleteDom.addEventListener('awesomplete-select', this.onAwesompleteSelect.bind(this));
                    }
                }

            })
        },

        watch: {
            package: function(newPackage) {
                if(newPackage) {
                    this.version = newPackage.latest_stable_release && newPackage.latest_stable_release.name.replace('v', '');
                    this.doAnimation();
                }
            },

            versionsAvailable: function(versionsAvailable) {
                if(versionsAvailable && this.awesomplete) {
                    const list = this.package.versions.map(item => item.number);


                    this.awesomplete.list = list;
                    this.awesomplete.evaluate();

                }
            }
        },

        methods: {
            onAwesompleteSelect(ev) {
                this.version = ev.text.value;
            },
            doAnimation() {
                const that = this;
                this.animate = true;

                window.setTimeout(function() {
                    that.animate = false;
                }, 500);
            },
            getPackageFromCache(name) {
                lscache.setBucket(this.name);
                return lscache.get(name);
            },

            setPackageInCache(packageName, packageItem) {
                lscache.setBucket(this.name);
                return lscache.set(packageName, packageItem, this.expires);
            },
            setLoading(isLoading) {
                this.loading = isLoading;
                this.$emit('update:loading', isLoading)
            },
            getVersions(ev) {
                const that = this;
                ev.preventDefault();

                this.searchPackage().then(function(resp) {
                    that.package.versions = resp.versions;
                }, this.handleError.bind(this));
            },

            handleError(error) {
                this.$emit('update:error', error);
            },

            searchPackage() {
                if(!this.package) return;
                const packageName = this.package.name;

                const packageInfo = this.getPackageFromCache(packageName);
                let promise;

                if(packageInfo) {
                    promise = Promise.resolve(packageInfo);
                } else {
                    this.setLoading(true);
                    promise = simpleRequest('https://libraries.io/api/npm/' + packageName);
                    promise.then(packageInfo => {
                        this.setLoading(false);
                        this.setPackageInCache(packageName, packageInfo, this.expires)
                    }, error => {
                        this.setLoading(false);
                    });
                }

                return promise;
            },

            setLibraryVersion: function() {
                let replaceStr;
                if(this.isLatest) {
                    replaceStr = this.package.name;
                } else {
                    replaceStr = `${this.package.name}=${this.version}`;
                }


                this.$emit('update:replace', replaceStr)
            }
        }
    }
</script>

<style lang="less">
    .card {
        .awesomplete {
            position: absolute;
            width: 90%;
        }
    }
</style>
