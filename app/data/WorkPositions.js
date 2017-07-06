import Model from './Model.js';
import WorkwearTypes from '../data/WorkwearTypes.js';
var wTypes = WorkwearTypes.WorkwearTypes;

var WorkPositions = new Model.Model({
  title : 'WorkPositions',
  uni: 'WP',
  fields: [
    {name: 'Description', type :'text'},
    {name: 'WorkweareTypesHelper', type:'select', options: {},
      'class':'ignore-input', extend:function(vm) {
      vm.$nextTick(function () {
        wTypes.generateOptions({
          oKey:['Description'],
          callback : function(options) {
            vm.fieldsObject.WorkweareTypesHelper.options = options;
          }
        });
      });
      vm.$watch('fieldsObject.WorkweareTypesHelper.value', function(value) {
        var output = vm.fieldsObject.WorkweareTypes;
        if(value && output.value.indexOf(value) === -1) {
          output.value += value + ' => 12;\n';
        }
      })}},
    {name: 'WorkweareTypes', type :'textarea', placeholder:'List of workweare type ids'},
  ],
  idTemplate : "_{Description}",
  version : 1
});

export default {
  WorkPositions
}