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
  /**
   * If you want to add return item throughout goods in you need to add that row to inventory first
   * or we add that permutation to inventory population script.
   */
  import GoodsIn from '../data/GoodsIn.js'
  import Inventory from '../data/Inventory.js';
  const inventory = Inventory.Inventory;
  import CrudComponents from '../traits/CrudComponent.js';
  import AffectsInventory from '../traits/AffectsInventory.js';

  const vueGoodsIn = {
    data: function() {
      return {
        title: 'GoodsIn',
        model : GoodsIn.GoodsIn,
        workers : {},
        extension : {
          extend : function(vm) {
            inventory.generateOptions({
              // we need to being able to accept goods only that have row in inventory
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
            qty = e.postEdit.Qty;
        if(!qty || !itemId) {
          return;
        }
        if(!e.id) {
          // if id is null take of inventory
          return this.updateInventoryQty(itemId, qty);
        }
        var preQty = parseInt(e.preEdit.Qty);
        if(qty > preQty) {
          // else if qty was increased take of inventory
          return this.updateInventoryQty(itemId, qty - preQty);
        } else {
          this.warning("Pre edit value is higher that post edit," +
              " I do not know what to do, you need to update Inventory yourself for " +
              itemId);
        }
      },
      onDelete: function(doc) {
        var itemId = doc.Workwear;
        if(!doc.Qty || !itemId) {
          return;
        }
        this.updateInventoryQty(itemId, -1 * parseInt(doc.Qty), 'decreased');
      },
      refresh: function() {
        this.$refs.crud.refresh();
      }
    },
  };

  _.extend(vueGoodsIn.methods, CrudComponents.UserMessages);
  _.extend(vueGoodsIn.methods, AffectsInventory.AffectsInventory);

  export default vueGoodsIn;
</script>

