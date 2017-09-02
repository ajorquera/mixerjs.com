

<template lang="pug">
    div(id="app")
        div(class="jumbotron jumbotron-fluid")
            particles(:options="particleJSOptions" :newParticles="100")
            div(class="container")
                div(class="row")
                    div(class="col-4")
                        img(:src="config.links.logo" class="img-fluid")

                    div(class="col-offset-1 col-8 utils-center-v")
                        p(class="lead").
                            With <strong>MixerJS</strong> you will be able to compile and minify javascript libraries
                            in a single request. Try it now!

        div(class="container")
            | Libraries <i id="libraries-loader" class="fa fa-cog fa-fw" spinner></i> &nbsp;&nbsp;

            div(class="form-check form-check-inline")
                label(class="form-check-label")
                    input(class="form-check-input" type="checkbox" id="minify-checkbox")
                    | &nbsp;Minify?

            div(class="row")
                div(class="form-group col-6")
                    div(class="custom stackoverflow" id="libraries-with-taggle")

                    div(class="bs-callout bs-callout-danger invisible" id="error-container")
                        h4 Error
                        p(id="error-message")
</template>

<script>
import particles from './components/particles.vue'

import particleJSOptions from './assets/particlesjs-config'
import config from '../config'

export default {
    name: 'app',
    data () {
        return {
            particleJSOptions,
            config
        }
    },
    components: {
        particles
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
