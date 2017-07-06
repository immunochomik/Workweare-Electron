<template>
  <div class="container-fluid">
    <crud
          :model="model"
          ref="crud"
          ></crud>
  </div>
</template>

<script>
  import WorkPositions from '../data/WorkPositions.js'
  var selectsDone;
  export default {
    name: 'WorkPositions',
    data: function() {
      return {
        title: 'WorkPositions',
        model: WorkPositions.WorkPositions,
      }
    },
    created: function() {
      routerCall(this)
    },
    methods: {
      refresh: function() {
        this.$refs.crud.refresh();
      }
    },
  }
</script>