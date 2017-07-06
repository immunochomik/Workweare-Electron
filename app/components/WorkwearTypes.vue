<template>
  <div class="container-fluid">
    <crud
        :model="model"
        :form-active="false"
        :list-active="true"
        ref="crud"
        ></crud>
  </div>
</template>

<script>
  import WorkwearTypes from '../data/WorkwearTypes.js'
  export default {
    name: 'WorkwearTypes',
    data: function() {
      return {
        title: 'WorkwearTypes',
        model: WorkwearTypes.WorkwearTypes,
      }
    },
    created: function() {
      routerCall(this)
    },
    methods: {
      refresh: function() {
        this.$refs.crud.refresh();
      }
    }
  }
</script>