<template lang="pug">
    div(ref="particleDOM" id="particles-js")
</template>

<script>
import particles from 'particles.js'

export default {
    name: 'particles',
    data: function() {
        return {
            particles: 0,
            pJSDom: null
        };
    },
    props: {

        effect: [String],
        max: {
            type: Number,
            default: 100
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

    watch: {
        effect: function(name) {

            const that = this;
            switch (name) {
                case 'speedUp':
                    that.speedUp();
                    break;
                default:

            }
        },
        newParticles: function() {
            const newParticles = window.parseInt(this.newParticles*this.multiplier);

            if(newParticles) {
                this.createParticles(newParticles);
            }
        }
    },

    methods: {
        speedUp: function() {
            const oldSpeed = this.pJSDom.tmp.obj.move_speed;
            const newSpeed = oldSpeed*5;
            this.pJSDom.tmp.obj.move_speed = newSpeed;
            this.pJSDom.fn.retinaInit();
        },
        createParticles(total) {
            let count = 0;
            const that = this;
            return new Promise((resolve, reject) => {

                if(!total) {
                    reject('total is not valid: ' + total );
                } else if(this.particles >= this.max) {
                    reject('max number particles reached');
                }


                let interval = setInterval(function() {
                    if(count >= total || that.particles >= that.max) {
                        resolve();
                        return clearInterval(interval)
                    };

                    that.pJSDom.fn.modes.pushParticles(1);
                    count += 1;
                    that.particles += 1;
                }, this.creationSpeed);
            });

        }
    },

    mounted() {
        particlesJS('particles-js', this.options);
        this.pJSDom = window.pJSDom[window.pJSDom.length -1].pJS;
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
