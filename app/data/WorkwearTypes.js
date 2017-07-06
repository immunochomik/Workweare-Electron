import Model from './Model.js';

var WorkwearTypes = new Model.Model({
  title : 'WorkwearTypes',
  uni: 'T',
  fields: [
    { name: 'Description', type :'text'},
    { name: 'Gender',  type: 'select', options : {Male: 'M',Female : 'F', Universal: 'U'}},
    { name: 'Sizes', type :'textarea', placeholder:'Can be list of values or,  range 36-48 s:2, default step is 2 so can be omitted'},
  ],
  idTemplate : "_{Description}_{Gender}",
  version : 1
});

// makes sizes array from string representation
// 36 - 42  = [36,38,40,42]
// M;L;XL  => [M,L,XL]
WorkwearTypes.extractSizes = function(doc) {
  var raw = [];
  const regex = /(^\d+)\ *\-\ *(\d+)(\ +s:(\d))?.*/;
  var match = regex.exec(doc.Sizes);
  if(match) {
    var min = parseInt(match[1]);
    var max = parseInt(match[2]);
    var step = parseInt(match[4]) || 2;
    raw = range(min, max + step, step);
  } else {
    raw = doc.Sizes.split(';').map(it=>{return it.trim()});
  }
  return raw;
};


export default {
  WorkwearTypes
}