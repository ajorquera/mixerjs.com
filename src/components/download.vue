<template lang="pug">
button(v-on:click="onClick" :disabled="isDisable" :class="[{'utils-clickable': !isDisable}]")
    span(v-if="!loading") Download
    i(v-if="loading" class="fa fa-refresh fa-spin") 
</template>

<script>

    import simpleRequest from '../utils/simpleRequest'
    import download from '../utils/download'

    export default {
        name: 'download',
        data: function() {
            return {
                loading: false
            }
        },
        props: {
            packages: {
                type: Array,
                default: () => []
            },
            minify: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            isDisable: function() {
                return (this.packages.length <= 0 || this.loading)
            }
        },
        methods: {
            onClick: function(ev) {
                this.$emit('update:error', null);
                const that = this;
                this.loading = true;
                const promise = simpleRequest(`http://api.mixerjs.com/compile.${this.minify ? 'min.':''}js?` + this.packages.join('&'));

                promise.then(function(resp) {
                    download(JSON.stringify(resp));
                    that.loading=false;
                },function(error) {
                    that.handleError(error);
                    that.loading=false;
                });
            },

            handleError: function(error) {
                console.log(error);
                this.$emit('update:error', error);
            }
        }
    };

</script>
