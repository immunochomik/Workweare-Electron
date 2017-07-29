/**
 * Created by tomek on 15/07/17.
 */
String.prototype.format = String.prototype.f =  function() {
  var args;
  args = arguments;
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
    args = args[0];
  }
  return this.replace(/{([^}]*)}/g, function(match, key) {
    return (typeof args[key] !== "undefined" ? args[key] : match);
  });
};

const fs = require('fs');

var filename = '/tmp/test.ndb';
if (fs.existsSync(filename)) {
  fs.unlink(filename);
}

var Datastore = require('nedb');
const db = new Datastore({
  filename: filename,
  autoload: true
});


var _id = 'my_first_id';
var item = {
  _id:  _id,
  name: 'Scott',
  twitter: '@ScottWRobinson',
  qty: 2
};

db.findOne({_id: _id}, function(err, doc) {
  console.log('Find One');
  console.log('ERROR', err);
  console.log('DOC', doc);
});

db.insert(item, function(err, doc) {
  console.log('Insert');
  console.log('ERROR', err);
  console.log('DOC', doc);
});


db.update({_id: 'x', qty: {$lt: 1}}, {_id: 'x', qty:5}, {'upsert': 1}, function(err, numReplaced, upsert) {
  if (err) {console.log('Error updating ' + err);}
  console.log('Update of {0} was upserted {1}'.f([numReplaced, upsert]))});

db.update({_id: 'x', qty: {$lt: 1}}, {_id: 'x', qty:5}, {'upsert': 1}, function(err, numReplaced, upsert) {
  if (err) {console.log('Error updating ' + err);}
  console.log('Update of {0} was upserted {1}'.f([numReplaced, upsert]))});

db.insert({_id: 'x', qty:0}, function(err, doc) {
  if(err) {//console.error('EEEEE' ,err);
  } else {
    console.log('Inserted ', doc);
  }
});