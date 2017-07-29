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
  var debug = 1;
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
                wTypes.list(function(documents) {
                  _.each(documents, insertItemIfNotInInventory);
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
    var document = wType.doc || wType;
    var sizes = wTypes.extractSizes(document);
    _.each(sizes, function(size) {
      inventory.insert({
            Description: document.Description + '_' + document.Gender,
            Size: size,
            Origin: 'new',
            Qty: 0,
          },
          function(doc) {
            console.log('Callback updated', doc);
          }
      )
    });
  };


</script>