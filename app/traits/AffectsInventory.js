/**
 * Created by tomek on 24/01/17.
 */
"use strict";

import Inventory from '../data/Inventory.js';
var inventory = Inventory.Inventory;

var AffectsInventory = {
  updateInventoryQty: function(itemId, qty, dir) {
    var self = this;
    dir = dir || 'increase';
    inventory.updateQuantity(itemId, qty, function() {
      self.success("Inventory item {0} qty {2} by {1}".f([itemId, qty, dir]))
    }, function() {
      self.error("Inventory item not found for " + itemId);
    });
  },
};


export default {
  AffectsInventory,
}