<template>
  <b-notification 
    :active.sync="response && response.length > 0"
    :duration="10000"
    auto-close
    type="is-success" 
    has-icon>
    Transfer is completed, thank you for using my website.
    I copy all labels from <a 
      :href="currentLink+'/labels'"
      target="_blank" 
    >{{ currentLink }}</a> to <a 
      :href="destLink+'/labels'"
      target="_blank" 
    >{{ destLink }}</a>
  </b-notification>
</template>

<script>
export default {
  props: {
    response: {
      type: [Object, Array],
      default: undefined
    },
    base: {
      type: Object,
      default: () => {}
    },
    dest: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    currentLink() {
      return `https://github.com/${this.base.owner}/${this.base.repo}`
    },
    destLink() {
      return `https://github.com/${this.dest.owner}/${this.dest.repo}`
    }
  }
}
</script>
