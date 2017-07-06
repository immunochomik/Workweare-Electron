import Model from './Model.js';

var GoodsIn = new Model.Model({
  title : 'Goods In',
  uni: 'In',
  fields: [
    { name: 'DateTime', type: 'text', 'class': 'datetime',
      onUpsert: function(value) {
        return value ? value : now();
      },
      placeholder: 'Equals to now if blank'
    },
    { name: 'Workwear', type :'select', options: {}},
    { name: 'Qty', type :'number', value:1, attrs: {min:1, step:1}},
  ],
  idTemplate : "_{DateTime}_{Workwear}",
  version : 1
});

export default {
  GoodsIn
}