<template>
  <div class="container-fluid">
    <crud
        :model="model"
        :extension="extension"
        :form-active="false"
        :list-active="true"
        ref="crud"
        ></crud>
  </div>
</template>

<script>
  var debug = false;
  import Inventory from '../data/Inventory.js'
  import WorkwearTypes from '../data/WorkwearTypes.js';
  var wTypes = WorkwearTypes.WorkwearTypes;
  var inventory = Inventory.Inventory;
  var selectsDone;

  var Inventory_vue = {
    name: 'Inventory',
    data: function() {
      return {
        title:'Inventory',
        model: inventory,
        extension : {
          extend: function (crud_instance) {
            crud_instance.additionalButtons = [{
              id:'insertWorkwearTypes',
              name:'Insert Workwear Types'
            }];
            crud_instance.addedMethods = {
              insertWorkwearTypes : function() {
                // get data from types
                wTypes.list(function(res) {
                  _.each(res.rows, insertItemIfNotInInventory);
                  crud_instance.success('We are inserting workweare types int inventory, now you need to reload the page.')
                });
              }
            };
            wTypes.generateOptions({
              oKey: ['Description', 'Gender'],
              callback: function(options) {
                crud_instance.fieldsObject.Description.options = options;
              },
              typeObject: true
            });
          }
        }
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
  };

  export default Inventory_vue

  function insertItemIfNotInInventory(wType) {
    var idBase = wType.id.replace(wTypes.uni, '').replace(/^_/, '');
    var sizes = wTypes.extractSizes(wType.doc);
    _.each(sizes, function(size) {
      var itemId = "{0}_{1}_new".f([idBase, size]);
      inventory.get(itemId, function(doc) {
            debug && console.log('Found', doc);
          },
          function(err) {
            if(err.status !== 404) {
              console.error(err);
              return;
            }
            inventory.put({
              Description: wType.doc.Description + '_' + wType.doc.Gender,
              Size: size,
              Origin: 'new',
              Qty: 0,
            });
          }
      );
    });
  };


</script>