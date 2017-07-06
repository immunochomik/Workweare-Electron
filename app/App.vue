
<template>
  <div id="app">
      <top-nav></top-nav>
      <router-view></router-view>
  </div>
</template>

<script>
import TopNav from './components/TopNav.vue'
export default {

  components:{
    TopNav
  },
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello Vue!!!!!'
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
  padding-top: 4em;
}
</style>
