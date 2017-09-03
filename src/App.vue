

<template lang="pug">
div
    div(class="jumbotron jumbotron-fluid")
        particles(:options="particleJSOptions" :newParticles="newParticles" :effect="effect")
        div(class="container")
            div(class="row")
                div(class="col-4")
                    img(:src="config.links.logo" class="img-fluid")

                div(class="col-offset-1 col-8 utils-center-v")
                    p(class="lead").
                        With <strong>MixerJS</strong> you will be able to compile and minify javascript libraries
                        in a single request. Try it now!

    div(class="container")
        div(class="row")
            div(class="col-6")
                div(class="form-check form-check-inline")
                    label(class="form-check-label")
                        input(class="form-check-input" type="checkbox" id="minify-checkbox")
                        | &nbsp;Minify?

                taggle-packages(class="mixerjs-taggle" v-on:update:packages="onPackagesUpdate" v-on:loading="onLoadingUpdate")
</template>

<script>
import particlesComponent from './components/particles.vue'
import tagglePackages from './components/tagglePackages.vue'
import particleJSOptions from './assets/particlesjs-config'
import config from '../config'

export default {
    name: 'app',
    data () {
        return {
            particleJSOptions,
            loading: false,
            config,
            particles: 0,
            effect: null,
            bowerPackages: {}
        }
    },
    computed: {
        newParticles: function() {
            const newParticles = Object.keys(this.bowerPackages).length - this.particles;
            this.particles += newParticles;

            return newParticles;
        }

    },

    methods: {
        onPackagesUpdate(packages) {
            this.bowerPackages = packages;
        },

        onLoadingUpdate(isLoading) {
            this.loading = isLoading;
        }
    },
    components: {
        particles: particlesComponent,
        tagglePackages
    }
}
</script>

<style lang="less" scope>
    @import (css) "../node_modules/bootstrap/dist/css/bootstrap.min.css";
    @import "less/utilities";

    .jumbotron {
        position: relative;
        background-color: white;
        height: 400px;

        .container, .row {
            position: relative;
            height: 100%;
        }
    }
</style>
