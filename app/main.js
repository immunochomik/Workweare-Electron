import Vue from 'vue';
import VueRouter from 'vue-router';
import Inventory from './components/Inventory.vue';
import Workers from './components/Workers.vue';
import WorkPositions from './components/WorkPositions.vue';
import WorkwearTypes from './components/WorkwearTypes.vue';
import ReleaseHistory from './components/ReleaseHistory.vue';
import GoodsIn from './components/GoodsIn.vue';
import Crud from './components/Crud.vue';
import Messages from './components/Messages.vue';
import ToDo from './components/ToDo.vue';


const _ = require('lodash');
import helpers from './helpers/helpers.js';
_.extend(window, helpers);
require('expose?$!expose?jQuery!jquery');
require('bootstrap-webpack');
require('bootstrap/dist/css/bootstrap-theme.min.css');

var $ = require( 'jquery');
require( 'datatables.net/js/jquery.dataTables.js' );
require( 'datatables.net-dt/css/jquery.dataTables.css' );
require( 'jquery-datetimepicker/build/jquery.datetimepicker.min.js' );
require( 'jquery-datetimepicker/build/jquery.datetimepicker.min.css' );

require( 'jquery-ui/ui/widgets/autocomplete.js' );
require( 'jquery-ui/themes/base/all.css' );

Vue.component('crud', Crud);
Vue.component('messages', Messages);

// install router
Vue.use(VueRouter);

// routing
const router = new VueRouter({
  routes: [
    {
      path: '/goods-out',
      component: ReleaseHistory
    },
    {
      path: '/goods-in',
      component: GoodsIn
    },
    {
      path: '/workers',
      component: Workers
    },
    {
      path: '/inventory',
      component: Inventory
    },
    {
      path: '/workweartypes',
      component: WorkwearTypes
    },
    {
      path: '/workpositions',
      component: WorkPositions
    },
    {
      path: '/todo',
      component: ToDo
    },
    {
      path: '*',
      redirect: '/workers'
    }
  ]
});

const app = new Vue({
    router,
    render: h => h(require('./App.vue'))
}).$mount('app');