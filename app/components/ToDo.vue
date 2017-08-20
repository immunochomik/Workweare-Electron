<template>
  <div class="container-fluid" style="margin-top: 5em">
    <messages
        :messages="messages"
        ></messages>
    <div class="panel panel-default">
      <div class="panel-heading">
        <div class="row">
          <div class="col-sm-6">
            <h4>To Do</h4>
          </div>
          <div class="col-sm-6 text-right">
            <button class="btn btn-danger" @click="calculate">Calculate</button>
          </div>
        </div>
      </div>
      <div class="panel-body">
        <!-- Table -->
        <table @click="tableClick($event)" id="listTableToDo" class="display" width="100%"></table>
      </div>
    </div>
  </div>
</template>

<script>
  var debug = 1;
  import Workers from '../data/Workers.js'
  import WorkPositions from '../data/WorkPositions.js';
  import WorkwearTypes from '../data/WorkwearTypes.js'
  import ReleaseHistory from '../data/ReleaseHistory.js';
  var workers = Workers.Workers;
  var workPositions = WorkPositions.WorkPositions;
  var workweareTypes = WorkwearTypes.WorkwearTypes;
  var rHistory = ReleaseHistory.ReleaseHistory;
  import AffectsInventory from '../traits/AffectsInventory.js';
  import Messages from '../traits/Messages.js';

  var positions = {};
  var sizes = {};
  var sizeLessWorkweare = {};

  var privates = (function() {
    function p(context) {
      this.context = context;
    }
    // for each worker get hers position
    // for item in position check release history for that worker
    p.prototype.processWorker = function(worker) {
      var self = this;
      // get goods out history for that worker
      rHistory.list(function(rHistory) {
        var received = {};
        _.each(rHistory, function(item) {
          // get name from workwear description
          var workweare = item.Workwear.split('_')[0];
          if(! received[workweare]) {
            received[workweare] = []
          }
          //save what and when was given to the worker
          received[workweare].push(item.DateTime);
        });
        self.toDosForWorker(worker, received);
        self.context.renderTable();
      }, worker.Id + '_');
    };

    p.prototype.toDosForWorker = function(worker, received) {
      // we know what she received and
      // for each item in position get the date from last received and calculate nex data
      var position = positions[worker.Position];
      for(var item in position) {
        var last = received[item] ? received[item][0] : false;
        this.context.addToDo(worker, item, whenNeeded(last, position[item]).slice(0,10));
      }
    };
    p.prototype.neededSizelessWorkweare = function(itemClass, gender) {
      // item can be gendered or Unisex so we need two keys to test
      var keys = ["{0}_{1}".f([itemClass, gender]), "{0}_{1}".f([itemClass, 'U'])];
      for (var i in keys) {
        if (sizeLessWorkweare[keys[i]]) {
          return sizeLessWorkweare[keys[i]] + '_';
        }
      }
      return false;
    };

    function whenNeeded(lastReceived, monthsAllowed) {
      if(!lastReceived) {
        return now();
      }
      var last = new Date(lastReceived);
      last = last.setMonth(last.getMonth() + parseInt(monthsAllowed));
      return new Date(last).toISOString();
    }

    return p;
  })();

  var TODO = {
    name: 'ToDo',
    data: function() {
      return {
        title: 'ToDo',
        todos: [],
        messages : {
          warning : '',
          success : '',
          error : '',
        },
      }
    },
    created: function() {
      document.title = 'To Do';
      toggleTopNavActive('topNavLiToDo');
      this.privates = new privates(this);
      // I need positions cache so will not call pouch to get positions
      workPositions.generateOptions({
        oKey : ['Description'],
        oValue : ['WorkweareTypes'],
        callback : function(options) {
          for(var position in options) {
            positions[position] = preparePosition(options[position].split('\n').filter(
                function(x) {return x;}));
          }
        }
      });
      // collect size less workweare so we can add it to to dos with appropriate gender
      workweareTypes.generateOptions({
        oKey: ['Description', 'Gender'],
        condition: function(doc) {
          return !doc.Sizes;
        },
        callback: function(options) {
          sizeLessWorkweare = options;
        },
        typeObject: true
      });
    },
    methods: {
      renderTable: function() {
        var data = {
          data: this.todos,
          columns: [
            {title:'Employee'},
            {title:'Workwear'},
            {title:'Needed'},
            {title:'Position'},
            {title:''},
          ],
          destroy:true,
          order : [[2,'asc']]
        };
        var table = $('#listTableToDo');
        table.destroy && table.destroy();
        table.DataTable(data);
      },
      calculate: function() {
        // Take all workers
        var self = this;
        this.todos = [];
        workers.list(function(data) {
          _.each(data, function(worker) {
            self.privates.processWorker(worker);
          });
        });

      },
      // args example :  Adma Pentla, Hat, '2017-01-01 12:00:00'
      addToDo: function(worker, itemClass, whenToAdd) {
        debug && console.log('ADDED_TODO', worker.Id, itemClass, whenToAdd);
        if(!sizes[worker.Id]) {
          sizes[worker.Id] = workers.workerSizes(worker.Sizes)
        }
        var self = this;
        // we can have more than one sizes per workweare type in sizes so we need
        // for each
        if(sizes[worker.Id][itemClass]) {
          _.each(sizes[worker.Id][itemClass], function (wokweare) {
            self.todos.push([worker.Id, wokweare, whenToAdd || now(), worker.Position,
              self.makeButtons(worker.Id, wokweare)])
          });
        } else {
          var sizeLessWorkwear = self.privates.neededSizelessWorkweare(itemClass, worker.Gender);
          if (sizeLessWorkwear) {
            // there are items with out sizes like a hat
            self.todos.push([worker.Id, sizeLessWorkwear, whenToAdd || now(), worker.Position,
              self.makeButtons(worker.Id, sizeLessWorkwear)])
          }
        }
        debug && pp(self.todos)
      },
      makeButtons: function(workerId, workwear) {
        return ("<div style='text-align: right'><div class='btn-group'>" +
        "<button class='btn btn-default btn-sm release' data-worker='{0}' data-weare='{1}'>Release</button>" +
            "<button class='btn btn-danger btn-sm ignore' data-worker='{0}' data-weare='{1}'>Ignore</button></div></div>")
            .f([workerId,  workwear]);
      },
      tableClick: function(e) {
        var elClass = e.target.getAttribute('class') || '';
        if(elClass.indexOf('release') != -1) {
          this.release(e.target.getAttribute('data-worker'), e.target.getAttribute('data-weare'));
        } else if(elClass.indexOf('ignore') != -1 && confirm('Do you want to ignore?')) {
          this.ignoreItem(e.target.getAttribute('data-worker'), e.target.getAttribute('data-weare'));
        }
      },
      ignoreItem: function(name, workwear) {
        this.updateReleaseHistory(name, workwear, 'ignored');
        this.calculate();
      },
      release: function(workerId, workwear) {
        workwear = this.updateReleaseHistory(workerId, workwear);
        this.updateInventoryQty(workwear, -1, 'decreased');
        this.calculate();
      },
      updateReleaseHistory: function(woekreId, workwear, kind) {
        console.log(woekreId, workwear);
        workwear += ('_' + (kind || 'new'));
        rHistory.insert({
          DateTime: now(),
          EId : woekreId,
          Workwear: workwear,
          Qty: 1
        });
        this.warning("Item [{0}] added to history for worker [{1}]".f([workwear, woekreId]));
        return workwear;
      }
    },
  };

  _.extend(TODO.methods, AffectsInventory.AffectsInventory);
  _.extend(TODO.methods, Messages.UserMessages);

  export default TODO;

  // build an object from storage format
  // "Kalesony => 12;"  =  {Kalesony : 12}
  function preparePosition(list) {
    var out = {};
    _.each(list, function(row) {
      row = row.split('=>').map(function(x) {
        return x.replace(/^ | $/g, '').replace(';', '');});
      out[row[0]] = parseInt(row[1]);
    });
    return out;
  }


</script>

