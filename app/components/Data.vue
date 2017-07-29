<style>
  .quoter {
    display: inline-block;
    width: 23.5%;
  }
</style>
<template>
  <div class="container-fluid" style="margin-top: 5em">

    <div class="row" style="padding-left: 1em; padding-right: 1em">
      <div class="panel-body col-sm-6" >
        <label>Query</label>
        <textarea v-model="query" class="form-control" placeholder="were"> </textarea>
        <div style="margin-top: 1em;" class="text-center">
          <button class="btn btn-default quoter" @click="find">Find</button>
          <button class="btn btn-default quoter" @click="insert">Insert</button>
          <button class="btn btn-default quoter" @click="updateDoc">Update</button>
          <button class="btn btn-danger quoter" @click="deleteItems">Delete</button>
        </div>
      </div>
      <div class="panel-body col-sm-6">
        <label>Update</label>
        <textarea v-model="update" class="form-control" placeholder="update"> </textarea>
      </div>
    </div>
    <div class="panel-body">
      <pre class="pre-scrollable" style="min-height: 30em;">{{ fullDataString }}</pre>
    </div>
    <div class="panel-body row">
      <div class="col-sm-6 col-md-6">
        <input class="form-control" type="file" id="files" name="files[]" multiple />
      </div>

      <div class="col-sm-6 col-md-6">
        <button @click="importItems" class="btn btn-default">Import</button>
        <button @click="exportData" class="btn btn-default">Export</button>
        <button @click="deleteAll" class="btn btn-danger">Delete All</button>
        <button @click="compact" class="btn btn-danger">Compact</button>
      </div>

    </div>
    <div class="row">
      <hr>
      <div class="col-sm-9"  style="padding: 0 2em">
      <textarea v-model="applyToData" class="form-control" rows="20"
                placeholder="Function to apply to data minimum code {return doc;}"></textarea>
      </div>
      <div class="col-sm-3">
        <button class="btn btn-danger" style="width: 100%"
                @click="applyMapper">Map</button>
        <button class="btn btn-danger" style="width: 100%; margin-top:5px;"
                @click="applyReducer">Reduce</button>
        <pre v-if="aggregate" style="margin-top: 5px;">{{ displayAggregate }}</pre>
      </div>
    </div>
    <hr>
  </div>
</template>
<script>
  const dbName = 'workwear';
  //import StoreCollection from '../storeNedb';
  //var store = new StoreCollection.Collection(dbName,  {'fieldName': '_t'});

  import StoreCollection from '../storeCollection';
  var store = new StoreCollection.Collection(dbName);



  import Vue from 'vue';
  var _ = require('lodash');


  function findInDoc(doc, key, expected, compare) {
    if(key.indexOf('.') == -1) {
      if(compare) {
        return compare(doc[key], expected)
      }
      return doc[key] == expected
    }
    var keyParts = key.split('.'),
        inDock = doc[keyParts.shift()];
    if(inDock === undefined) {
      return false;
    }
    return findInDoc(inDock, keyParts.join('.'), expected)
  }

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  export default {
    name: 'Data',
    data: function() {
      return {
        fullData : {},
        update: '{}',
        query: '{}',
        applyToData : '',
        aggregate: null
      }
    },
    created: function() {
      toggleTopNavActive('topNavLiData');
      this.refresh();
    },
    methods : {
      validateMapper : function(code) {
        if(!code) {
          console.error('We need apply to data model to be set');
          return;
        }
        var func = Function('doc', code);
        var test = {test:1};
        try {
          test = func(test);
        } catch (e) {
          console.error('Error while testing transformation function', e);
          return;
        }
        if(!test) {
          console.error('Transformation function hast to return value');
          return;
        }
        return func;
      },
      validateReducer: function(code) {
        if(!code) {
          console.error('We need apply to data model to be set');
          return;
        }
        var func = new Function('doc', 'reduce', code);
        var aggregation = {};
        var test = {test:1};
        try {
          aggregation = func(test, aggregation);
        } catch (e) {
          console.error('Error while testing transformation function', e);
          return;
        }
        if(!aggregation) {
          console.error('Function hast to return value');
          return;
        }
        return func;
      },
      applyReducer : function() {
        var func = this.validateReducer(this.applyToData);
        if(!func) {
          return;
        }
        this.aggregate = {};
        var self = this;
        try {
          this.fullData.forEach(function(item) {
            self.aggregate = func(item.doc, self.aggregate);
          });
        } catch(err) {
          console.error(err);
        }
      },
      applyMapper: function() {
        var func = this.validateMapper(this.applyToData);
        if(!func) {
          return;
        }
        this.fullData.forEach(function(item) {
          try {
            item.doc = func(item.doc);
            if(JSON.stringify(item.doc) === JSON.stringify(item.doc)) {
              pp(item.doc);
              return;
            }
            store.update(item.doc).then(res => {
              console.log(res);
            }).catch(err => {
              console.log('Error', err);
            });
          } catch(err) {
            console.error(err);
          }
        });
      },
      compact : function() {
        store.compact();
      },
      updateDoc : function () {
        if(this.update) {
          var doc = JSON.parse(this.update);
          if(!doc) {
            console.error('We need dock to update');
            return;
          }
          store.update(doc);
        }
      },
      deleteItems : function() {
        if(!this.query || !confirm('Do you want to delete ')) {
          return;
        }
        this.exportData('delete_backup');
        var self = this;
        setTimeout(function() {
          self.refresh();
        }, 3000);
        store.all().then(res => {
          var data = this.filterFind(res.rows);
          if(data) {
            console.log(data);
            data.forEach(function(item) {
              store.removeById(item.id);
            })
          }
        }).catch(err => {
          console.log(err);
        });
      },
      importItems: function() {
        var input = el('files');
        var reader = new FileReader();
        reader.onload =(function(theFile) {
          return function(e) {
            var data = JSON.parse(e.target.result);
            if(data) {
              data.forEach(function(item) {
                delete item.doc._rev;
                store.put(item.doc).then(res => {
                  console.log(res);
                }).catch(err => {
                  console.log('Error', err);
                });
              });
            }
          }
        })(input.files[0]);
        reader.readAsText(input.files[0]);
      },
      exportData : function(label) {
        label = label || '';
        download('export_{0}{1}.json'.f([today(), label]), JSON.stringify(this.fullData));
      },
      find: function() {
        this.refresh();
      },
      insert : function() {
        if(this.update) {
          var doc = JSON.parse(this.update);
          if(!doc) {
            return;
          }
          store.put(doc);
        }
      },
      delete : function() {

        var doc = JSON.parse(this.query);
        if(!doc || !doc.id) {
          return;
        }
        store.remove(doc).then(res => {
          this.refresh();
        }).catch(err => {
          console.log('Error', err);
        });
      },
      filterFind : function(docs) {
        var query = JSON.parse(this.query);
        if(query) {
          docs = docs.filter(function(row) {
            for(var key in query) {
              if(!findInDoc(row, key, query[key])) {
                return false;
              }
            }
            return true;
          });
          console.log(query);
        }
        return docs;
      },
      refresh : function() {
        store.all().then(res => {
          this.fullData = this.filterFind(res.rows);
        }).catch(err => {
          if(err.message === 'database is destroyed') {
            store = new StoreCollection.Collection(dbName);
            store.all().then(res => {
              this.fullData = this.filterFind(res.rows);
            })
          } else {
            console.log(err);
          }
        });
        console.log('Refreshed');
      },
      deleteAll : function() {
        if(confirm('Destroy ?')) {
          download('snapshot_{0}.json'.f([today()]), JSON.stringify(this.fullData));
          console.log('Destroy');
          store.destroy();
          this.refresh();
        }
      },
      createIndexes: function () {
        store.addIndexes();
        this.refresh();
      },
      doStuff: function() {
        //return;
        Vue.util.warn('Hello');
      }
    },
    computed : {
      fullDataString: function() {
        return JSON.stringify(this.fullData, null, 2);
      },
      displayAggregate : function() {
        return JSON.stringify(this.aggregate, null, 2);
      }
    }

  }
  function getTags(doc, reduce) {
    if(_.isArray(doc.tags)) {
      doc.tags.forEach(function(tag) {
        reduce[tag] = true;
      });
    }
    return reduce;
  }

  function tr(doc) {
    var pr= 'project';
    var ty = 'type';
    var te = 'technology';
    var pe = 'person';
    var known = {
      elmin : pr,
      api : pr,
      dm : pr,
      logs : pr,
      pc : pr,
      bug : ty,
      request : ty,
      research : ty,
      refund : ty,
      redo : ty,
      feature : ty,
      tests: ty,
      jira : ty,
      fire : ty,
      opps : ty,
      office :ty,
      review : ty,
      maintenance : ty,
      wiki : ty,
      edu : ty,
      es : te,
      skerkby : pe,
      committing : ty,
      code_management : ty,
      tools : ty,
      cs: pe,
      snapshots : pr,
      automation : ty,
      people : ty,
      meeting : ty,
      kibana : te,
      impuls : ty,
      profiling : ty,
      hols: ty,
      change: ty,
      usability : ty,
      nojira : ty,
    };
    var tags = {};
    var itIsTheSame = function(tag) {
      var same = {
        emlin : 'elmin',
        rewrite : 'redo',
        test: 'tests',
        testing : 'tests',
        ops : 'opps',
        investigation: 'research',
        figure: 'research',
        elite : 'api',
        'sharing-knowledge' : 'people',
        mistake : 'bug',
        emails : 'people',
        email : 'people',
        telemetry : 'logs',
        meting : 'meeting',
        reuest : 'request',
        data : 'logs',
        bugs : 'bug',
        'api-bug' : 'bug',
        requests : 'request',
        'elite-api' : 'api',
        'engineers' : 'api',
        log : 'logs',
        'clean-code' : 'redo',
        tool : 'tools',
        jire : 'jira',
        sharing : 'people',
        sick : 'hols',
        info : 'people',
        phpStorm : 'tools'
      };
      return same[tag] || tag;
    };
    if(Array.isArray(doc.tags) ) {
      doc.tags.forEach(function(tag) {
        tag = itIsTheSame(tag.toLocaleString().trim());
        console.log(tag);
        if(known[tag]) {
          if(!tags[known[tag]]) {
            tags[known[tag]] = {};
          }
          tags[known[tag]][tag] = true;
        }
      });
      doc.tagsOld = doc.tags;
      doc.tags = tags;
    }
    return doc;
  }
</script>

