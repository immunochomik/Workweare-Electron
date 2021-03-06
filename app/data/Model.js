import StoreCollection from '../storeNedb';
var store = new StoreCollection.Collection('workwear', {'fieldName': '_t'});

var _ = require('lodash');
import helpers from '../helpers/helpers.js';
_.extend(window, helpers);

var makeKey = function(parts, doc) {
  var key = [];
  _.each(parts, function(part) {
    key.push(doc[part]);
  });
  return key.join('_').replace(/_$/g, '');
};

var debug = 0;
// TODO use fields or fieldsObject only
var Model = (function() {

  var listNeDb = function(callback) {
    debug && console.log('LIST', callback);
    store.find({_t: this.uni}, callback);
  };

  function Model(settings) {
    this.title = settings.title;
    this.uni = settings.uni || this.title.replace(/ /g, '');
    this.fields = settings.fields;
    this.fieldsObject = {};
    var self = this;
    _.each(this.fields, function(item) {
      self.fieldsObject[item.name] = item;
      if(!self.fieldsObject[item.name].value && self.fieldsObject[item.name].value !== 0) {
        self.fieldsObject[item.name].value = "";
      }
    });
    this.idTemplate = settings.idTemplate || "_{Id}";
    this.version = settings.version || 1;
    this._columns = [];
    for(var i = 0; i< this.fields.length; i++) {
      if(this.fields[i].class && this.fields[i].class.indexOf('ignore-input') != -1) {
        continue;
      }
      self._columns.push(this.fields[i].name);
    }
  };
  Model.prototype.getUni = function() {
    return this.uni;
  };
  Model.prototype.columns = function() {
    return this._columns;
  };
  Model.prototype.getFieldsObject = function() {
    return this.fieldsObject;
  };
  Model.prototype.getFields = function() {
    return this.fields;
  };
  /**
   *
   * @param args
   */
  Model.prototype.generateOptions = function(args) {
    var oKey = args.oKey;
    var oValue = args.oValue;
    var options = [];
    if(!Array.isArray(oKey)) {
      oKey = [oKey];
    }
    console.log('oKey', oKey);
    if(oValue && !Array.isArray(oValue)) {
      oValue = [oValue];
    }
    console.log('oValue', oValue);
    this.list(function(resp) {
      _.each(resp, function(doc) {
        if(args.condition && !args.condition(doc)) {
          return;
        }

        var usedKey = makeKey(oKey, doc);
        var usedValue = usedKey;
        if(oValue) {
          usedValue = makeKey(oValue, doc);
        }
        options.push([usedKey, usedValue]);
      });
      options.sort(function(a,b) {return (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0);});
      if(!args.list) {
        var temp = {};
        _.each(options, row => {
          temp[row[0]] = row[1];
        });
        options = temp;
      }
      debug && pp('options', options);
      args.callback(options);
    });
  };
  Model.prototype.setSelect = function(selectId, oKey, oValue, condition) {
    var self = this;
    this.generateOptions({
      oKey: oKey, oValue: oValue, condition: condition,
      callback: function (options) {
        self.replaceSelect(selectId, options);
      },
      list: true,
    });
  };
  Model.prototype.replaceSelect = function(selectId, options) {
    var $el = $(selectId);
    $el.empty();
    _.each(options, function(row) {
      $el.append("<option value='{1}'>{0}</option>".f(row));
    });
  };
  /**
   * List all documents from start to end if provided
   * @param callback
   * @param start
   * @param end
   */
  Model.prototype.list = listNeDb;
  Model.prototype.get = function(id, callback, errorCallback) {
    if(! id.startsWith(this.uni ) ) {
      id = '{0}_{1}'.f([this.uni, id])
    }
    debug && console.log('Get', id);
    store.get(id, callback, errorCallback);
  };
  Model.prototype.update = function(id, cryteria, item, callback) {
    store.update(
      Object.assign({_id: id}, cryteria || {}),
      Object.assign({_id: id}, item),
      {multi: false},
      callback
    )
  };
  Model.prototype.upsert = function(id, item, callback) {
    item = this.onUpsert(item);
    if(!item) {
      return;
    }
    item['_id'] = id || this.makeId(item);
    item['_t'] = this.uni;
    store.upsert(item, callback);
  };
  Model.prototype.onUpsert = function(data) {
    for(var name in data) {
      if(this.fieldsObject[name] && this.fieldsObject[name].onUpsert)  {
        data[name] = this.fieldsObject[name].onUpsert( data[name]);
      }
    }
    return data;
  };
  Model.prototype.insert = function(item, callback) {
    item._id = this.makeId(item);
    item['_t'] = this.uni;
    store.insert(item, callback)
  };
  Model.prototype.removeById = function(id, callback, beforeRemove) {
    store.removeById(id, callback, beforeRemove);
  };
  Model.prototype.makeId = function(data) {
    return this.uni + this.idTemplate.f(data);
  };
  return Model;
})();




export default {
  Model,
}