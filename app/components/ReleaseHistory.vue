<template>
  <div class="container-fluid">
    <crud
        :model="model"
        :extension="extension"
        v-on:crudsubmit="crudSubmit"
        ref="crud"
        ></crud>
  </div>

</template>

<script>
  var debug = 1;
  import ReleaseHistory from '../data/ReleaseHistory.js'
  import Workers from '../data/Workers.js';
  import Inventory from '../data/Inventory.js';
  import CrudComponents from '../traits/CrudComponent.js';
  import AffectsInventory from '../traits/AffectsInventory.js';

  var workers = Workers.Workers;
  var inventory = Inventory.Inventory;
  var vueReleaseHistory = {
    name: 'ReleaseHistory',
    data: function() {
      return {
        title: 'ReleaseHistory',
        model : ReleaseHistory.ReleaseHistory,
        workers : {},
        extension : {
          extend : function(vm) {
            inventory.generateOptions({
              oKey : ['Description', 'Size', 'Origin'],
              callback: function(options) {
                vm.fieldsObject.Workwear.options = options;
              },
              typeObject : 1,
            });
          }
        }
      }
    },
    created: function() {
      routerCall(this)
    },
    methods: {
      crudSubmit: function(e) {
        var itemId = e.postEdit.Workwear,
            qty = parseInt(e.postEdit.Qty);
        if(!qty || !itemId) {
          return;
        }
        var self = this;
        if(!e.id) {
          // if id is null take of inventory
          return this.updateInventoryQty(itemId, -1 * qty, 'decreased');
        }
        var preQty = parseInt(e.preEdit.Qty);
        if(qty > preQty) {
          // else if qty was increased take of inventory
          return this.updateInventoryQty(itemId, -1 *(qty - preQty), 'decreased');
        } else {
          self.warning("Pre edit value is higher that post edit," +
              " I do not know what to do, you need to update Inventory yourself for " +
              itemId);
        }
      },
      onDelete: function(doc) {
        var itemId = doc.Workwear;
        if(!doc.Qty || !itemId) {
          return;
        }
        debug && console.log('RH onDelete', doc);
        this.updateInventoryQty(itemId, parseInt(doc.Qty));
      },
      refresh: function() {
        this.$refs.crud.refresh();
      }
    },
  };
  _.extend(vueReleaseHistory.methods, CrudComponents.UserMessages);
  _.extend(vueReleaseHistory.methods, AffectsInventory.AffectsInventory);


  export default vueReleaseHistory;

//  function employeeAutocomplete (self) {
//    $( "#EmployeeReleaseHistory" ).autocomplete({
//      source: function(req, show) {
//        workers.list(function(data) {
//          var list = [];
//          _.each(data.rows, function(doc) {
//            self.workers[doc.doc.Name] = doc;
//            list.push(doc.doc.Name + ' ' + doc.doc.Id);
//          });
//          show(list)
//        }, req.term)
//      }
//    });
//  }

</script>

