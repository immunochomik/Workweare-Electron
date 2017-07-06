<template>
  <div class="container-fluid">
     <crud
           :model="model"
           :extension="extension"
           ref="crud"
           ></crud>
  </div>
</template>

<script>
  import Workers from '../data/Workers.js'
  import WorkPositions from '../data/WorkPositions.js';
  import WorkwearTypes from '../data/WorkwearTypes.js'
  var workPositions = WorkPositions.WorkPositions;
  var wTypes = WorkwearTypes.WorkwearTypes;
  var selectsDone = false;

  var prepareSizes = function(options) {
    var sizes = [];
    for(var option in options) {
      sizes.push("{0}_{1} => [  ] // reference ({2})".f(option.split('_')));
    }
    return sizes.join('\n');
  };

  export default {
    name: 'Workers',
    data: function() {
      return {
        title: 'Workers',
        model: Workers.Workers,
        positions : {},
        extension : {
          extend: function(vm) {
            workPositions.generateOptions({
              oKey:'Description',
              typeObject:true,
              callback: function(options) {
                vm.fieldsObject.Position.options = options;
              }
            });
            vm.$watch('fieldsObject.Gender.value', function(gender) {
              if(!gender) {
                return;
              }
              wTypes.generateOptions({
                oKey: ['Description', 'Gender', 'Sizes'],
                condition: function(doc) {
                  return doc.Sizes && (doc.Gender === 'U' || doc.Gender === gender);
                },
                callback: function(options) {
                  if(vm.fieldsObject.Sizes.value) {
                    if(vm.isEdit()) {
                      return;
                    } else if(!confirm('Do you want to replace sizes?')) {
                      return;
                    }
                  }
                  vm.fieldsObject.Sizes.value = prepareSizes(options);
                },
                typeObject: true
              });
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
    },
  }
</script>

