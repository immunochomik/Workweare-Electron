import Model from './Model.js';

var ReleaseHistory = new Model.Model({
  title : 'ReleaseHistory',
  uni:  'RH',
  fields: [
    { name: 'DateTime', type: 'text', 'class': 'datetime',
      onUpsert: function(value) {
        return value ? value : now();
      },
      placeholder: 'Equals to now if blank'
    },
    { name: 'EId', type :'number'},
    { name: 'Workwear', type :'select', options: {}},
    { name: 'Qty', type :'number', value:1, attrs: {min:1, step:1}},
  ],
  idTemplate : "_{EId}_{Workwear}_{DateTime}",
  version : 1
});

export default {
  ReleaseHistory
}