var Datastore = require('nedb');

var debug = 1;

var _ = require('lodash');
import helpers from '../helpers/helpers.js';
_.extend(window, helpers);

function myDeltaFunction(doc) {
  doc.counter = doc.counter || 0;
  doc.counter++;
  return doc;
}

function finishIt(what, err, result, callback) {
  if(err) {
    console.warn('Warning {0} doc'.format([what]), err, result);
    return;
  }
  debug && console.log(what, result);
  callback && callback(result)
}


var Collection = (function() {
  function Collection(name, index) {
    this.db = new Datastore({
        filename: '/tmp/{0}.ndb'.f([name]),
        autoload: true
      });
    if(index) {
      this.db.ensureIndex(index, function(err) {
        if(err) {
          console.error(err);
        }
      })
    }
  }
  Collection.prototype.insert = function(doc, callback) {
    this.db.insert(doc, function(err, doc) {
      finishIt('inserting', err, doc, callback);
    });
  };
  Collection.prototype.update = function(cryteria, item, options, callback) {
    pp(cryteria, item, options)
    this.db.update(cryteria, item, options, function(err, numReplaced, upsert) {
      if (err) {
        console.log('Error updating ' + err);
        return;
      }
      debug && console.log('Update of {0} was upserted {1}'.f([numReplaced, upsert]));
      callback && callback(item)
    });
  };
  Collection.prototype.upsert = function(item, callback) {
    if(!item._id) {
      throw Error('Upsert requires item to has _id')
    }
    this.update({_id: item._id}, item, {upsert: true, multi: false}, callback)
  };
  Collection.prototype.get = function(id, callback, errorCallback) {
    this.db.findOne({_id: id}, function(err, doc) {
      if(err) {
        errorCallback && errorCallback(err);
        console.error('Error finding id {0}'.f([id]), err);
        return;
      }
      callback(doc);
    });
  };
  Collection.prototype.find = function(cryteria, callback) {
    return this.db.find(cryteria, function(err, docs) {
      finishIt('find', err, docs, callback)
    })
  };
  Collection.prototype.remove = function(criteria, callback) {
    return this.db.remove(criteria, function(err, numDeleted) {
      if(err) {
        console.error(err);
        return;
      }
      debug && console.log('Removed {} docs'.f([numDeleted]));
      callback && callback(numDeleted)
    });
  };
  Collection.prototype.removeById = function(id, callback, beforeRemove) {
    var self = this;
    if(beforeRemove) {
      this.getById(id, function(err, doc) {
        finishIt('find', err, doc, beforeRemove);
        self.remove({_id: id}, callback)
      });
    }
  };
  Collection.prototype.init = function(ddoc) {
    // build fucking indexes
  };
  Collection.prototype.ensureIndexes = function(ddoc) {
  };
  return Collection;
})();

export default {
  Collection : Collection
}
