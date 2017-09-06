<template lang="pug">
div(class="app")
    div(class="jumbotron jumbotron-fluid")
        particles(:options="particleJSOptions" :newParticles="newParticles" :effect="effect")
        div(class="container")
            div(class="row justify-content-center utils-center-v")
                div(class="col-sm-12 col-md-4")
                    img(:src="config.links.logo" class="img-fluid d-block mx-auto")

                div(class="col-md-offset-1 col-md-8 col-sm-12 text-sm-center text-center text-md-left")
                    p(class="lead").
                        With <strong>MixerJS</strong> you will be able to compile and minify javascript libraries
                        in a single request. Try it now!

    div(class="container main")
        div(class="row")
            div(class="col-md-6 col-xs-12")


                taggle-packages(class="mixerjs-taggle"
                                :searchPackages.sync="searchPackages"
                                :selectedPackages.sync="selectedPackages"
                                :selectedPackage.sync="selectedPackage"
                                :loading.sync="loading"
                                :error.sync="error"
                                :replace="replaceTag")

        div(class="row")
            div(class="col-md-6 col-xs-12")
                div(class="form-check form-check-inline text-right")
                    label(class="form-check-label")
                        input(class="form-check-input" type="checkbox" v-model="minify")
                        | &nbsp;Minify?&nbsp;

                download(:packages="selectedPackages"
                         :loading="loading"
                         class="btn btn-info btn-lg col-6"
                         :error.sync="error"
                         :minify="minify")


            div(class="col-md-4 col-xs-12 mt-3")
                errorCallout(v-if="isError" :error="error" class="bs-callout" classPrefix="bs-callout" :error.sync="error")
                package-info(v-else :package="selectedPackage" v-on:update:replace="onReplaceTag")
</template>

<script>
import particlesComponent from './components/particles.vue'
import tagglePackages from './components/tagglePackages.vue'
import errorCallout from './components/errorCallout.vue'
import download from './components/download.vue'
import packageInfo from './components/packageInfo.vue'
import particleJSOptions from './particlesjs-config'
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
            packageName: null,
            searchPackages: {},
            loadingSearchPackages: false,
            selectedPackages: [],
            selectedPackage: null,
            replaceTag: null,
            error: {},
            minify: false
        }
    },
    computed: {
        newParticles: function() {
            const newParticles = Object.keys(this.searchPackages).length - this.particles;
            this.particles += newParticles;

            return newParticles;
        },

        isError: function() {
            return (this.error && Object.keys(this.error).length > 0);
        }

    },
    watch: {
        selectedPackage: function(newPackage) {
            if(newPackage) {

                this.error = null;
            }
        },

        error: function(newError) {
            if(newError) {
                this.selectedPackage = null;
                this.error = newError;
            }
        }
    },

    methods: {
        onReplaceTag(tag) {
            this.replaceTag = tag;
        }
    },
    components: {
        particles: particlesComponent,
        tagglePackages,
        packageInfo,
        errorCallout,
        download
    }
}
</script>

<style lang="less" scope>
    @import (css) "../node_modules/bootstrap/dist/css/bootstrap.min.css";
    @import (css) "../node_modules/animate.css/animate.min.css";
    @import "../node_modules/font-awesome/less/font-awesome";
    @import "../less/utilities";

    .jumbotron {
        position: relative;
        background-color: white;
        height: 400px;

        .container, .row {
            position: relative;
            height: 100%;
        }
    }

    footer {
        padding: 50px;
        background-color: @color-mixerjs-blue;
        margin-top: 20px;

    }
</style>
