<template lang="pug">
    div(ref="particleDOM" id="particles-js")
</template>

<script>
import particles from 'particles.js'

export default {
    name: 'particles',
    data: function() {
        this.createParticles(this.newParticles);
        return {};
    },
    props: {
        max: {
            type: Number,
            default: 300
        },
        multiplier: {
            type: Number,
            default: 0.1
        },
        newParticles: {
            type: Number,
            default: 0
        },

        //milliseconds
        creationSpeed: {
            type: Number,
            default: 100
        },

        options: {
            type: Object,
            required: true
        }
    },

    methods: {
        createParticles(total) {
            const that = this;
            total = parseInt(total*this.multiplier);

            if(!total || this.particles >= this.max) return;

            let count = 0;

            let interval = setInterval(function() {
                if(count >= total || that.particles >= that.max) return clearInterval(interval);

                that._canvas.click();
                count += 1;
                that.particles += 1;
            }, this.creationSpeed);
        }
    },

    mounted() {
        particlesJS('particles-js', this.options);
        this._canvas = this.$refs.particleDOM.querySelector('canvas');
    }
}

</script>

<style lang="less" scope>


#particles-js {
    position: absolute;
    height: 100%;
    width: 100%;
    top:0;
}
</style>
