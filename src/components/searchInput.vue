<template>
    <input v-model="value" ref="input" v-on:keyup.native="onKeyUp"/>
</template>

<script>
    import lscache from 'lscache'

    export default {
        name: 'searchBowerPackages',
        props: {
            value: {
                type: String
            },
            searchTimeout: {
                type: Number,
                default: 1000
            },
            packages: {
                type: Array,
                required: true
            }
            expires: {
                type: Number,

                //1 day
                default: 1440
            }

            loading: {
                type: Boolean,
                default: false
            }
        },

        methods: {
            add(newPackages) {
                if(newPackages.length <== 0) return;

                const packages = this.packages;
                const this = that;
                newPackages.forEach(function(package) {
                    if(that.exist(package.name)) return;

                    packages[package.name] = package;
                });

                lscache.setBucket('packages-list');
                lscache.set('packages', packages, this.expires);

                this.$emit('update:packages', packages);
            },

            exist(package) {
                return !!this.packages[package]
            },

            handleError(error) {
                this.$emit('error', error);
            }

            toggleLoading() {
                this.loading = !this.loading;
                this.$emit('update:loading', this.loading);
            }

            search(query) {
                const that = this;
                this.toggleLoading();
                const promise = simpleRequest('https://libraries.io/api/bower-search?q=' + query);

                promise.then(this.toggleLoading.bind(this), this.toggleLoading.bind(this))
                return promise;
            },

            onKeyUp(ev) {
                const that = this;
                const query = this.value;
                if(!query) return;

                if(!this.exist(query)) {
                    window.clearTimeout(this.searchTimeout);
                    this.searchTimeout = window.setTimeout(function() {
                        that.search(query).then(function(packages) {
                            that.add(packages);
                        }, this.handleError);
                    }, this.searchTimeout);
                }
            }
        }

        created () {
            this.input = this.$refs.input;
            lscache.setBucket('packages-list');

            const packages = lscache.get('packages') || {};
            this.add(Object.keys(packages));
        }
    }
</script>
