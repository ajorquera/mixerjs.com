<template lang="pug">
    div(:class="[classPrefix + '-danger', {invisible: !isError}]") 
        h4 Error
        p(v-if="message").
            {{message}}
        p(v-else).
            Something went wrong. Please create an issue in github

</template>

<script>
    export default {
        name: 'errorCallout',
        data: function() {
            return {

            };
        },
        props: {
            error: {
                type: Object,
                default: () => {}
            },
            classPrefix: {
                type: String
            }
        },
        computed: {
            isError: function() {
                return !!(this.error && Object.keys(this.error).length);
            },
            message: function() {
                return (this.error && this.error.message)
            }
        }
    };
</script>

<style lang="less">

.bs-callout {
    padding: 20px;
    margin: 20px 0;
    border: 1px solid #eee;
    border-left-width: 5px;
    border-radius: 3px;

    &:empty {
        padding: 20px;
        margin: 0px;
        border: none;
    }

    &h4 {
        margin-top: 0;
        margin-bottom: 5px;

    }

    p:last-child {
        margin-bottom: 0;
    }

    code {
        border-radius: 3px;
    }

    &.bs-callout-danger {
        border-left-color: #d9534f;

        h4 {
            color: #d9534f;
        }
    }
}

</style>
