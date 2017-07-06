
import Model from './Model.js';


var Workers = new Model.Model({
  title : 'Workers',
  uni: 'W',
  fields: [
    { name: 'Id', type :'number'},
    { name: 'Name', type :'text'},
    { name: 'Position', type: 'select', options: {}},
    { name: 'Gender',  type: 'select', options : {Male: 'M',Female : 'F'}},
    { name: 'Start', type: 'text', 'class': 'date',
      onUpsert: function(value) {
        return value ? value : today();
      }},
    { name: 'Sizes', type: 'textarea', attrs:{rows: 10},
      onUpsert: function(text) {
        return text.replace(/\/\/.*\n/g, '\n').replace(/\/\/\ reference.*$/, '');
      }},
  ],
  idTemplate : "_{Id}",
  version : 1
});

/**
 * Get string representation of worker sizes and produce object
 * used in generation of todos .
 *
 * @param sizes string  'Kurtka_M => [ 50 ]
 *                       Obuwie_U => [ 38 ]'
 * @return object { Kurtka : [ Kurtka_M_50 ] ... }
 */
Workers.workerSizes = function(sizes) {
  var out = {};
  if(!sizes)  {
    return {};
  }
  sizes = sizes.split('\n')
    // remove empty strings
    .filter(function(x) {if(!x) return x; return x.replace(/\s/g, '').length})
    // each row split on => and trim both parts of the split
    .map(function(x) {
      return x.split('=>').map(function(x) {return x.replace(/^ | $/g, '')})});

  _.each(sizes, function(row) {
    if(!row[1]) {
      return;
    }
    var name = row[0].split('_');
    out[name[0]] = row[1].replace(/^\[\ *|\ *\]$/g, '').split(';')
      .map(function(x) { return [name[0],name[1],x].join('_')});
  });
  return out;
};

export default {
  Workers
}