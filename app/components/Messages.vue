<template>
  <div>
    <div v-if="messages.error" class="alert alert-danger alert-dismissible" role="alert">
      <button type="button" class="close" @click="messages.error = ''">
        <span aria-hidden="true">&times;</span></button>
      {{messages.error}}
    </div>
    <div v-if="messages.success" class="alert alert-success alert-dismissible" role="alert">
      <button type="button" class="close" @click="messages.success = ''">
        <span aria-hidden="true">&times;</span></button>
      {{messages.success}}
    </div>
    <div v-if="messages.warning" class="alert alert-warning" role="alert">
      <button type="button" class="close" @click="messages.warning = ''" aria-label="Close">
        <span aria-hidden="true">&times;</span></button>
      <strong>Warning!</strong> {{messages.warning}}
    </div>
  </div>
</template>

<script>
  export default {
    props : {
      messages: {
       type: Object,
        required: true,
      }
    },
    data: function () {
      return {}
    },
    methods: {}
  }
</script>

<style>
</style>