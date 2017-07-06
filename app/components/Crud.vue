<template>
  <div id="crudBody" style="margin-top: 5em;">
    <div class="panel">
      <messages
        :messages="messages"
          ></messages>

      <ul class="nav nav-tabs">
        <li v-bind:class="{ active: formActive }"><a data-toggle="tab" v-bind:href="'#form' + uni">Edit {{title}}</a></li>
        <li v-bind:class="{ active: listActive }"><a data-toggle="tab" v-bind:href="'#list' + uni">List</a></li>
      </ul>
      <div class="crud-options" style="display: inline-block; float: right;position: relative; bottom: 2em;">
        <span class="crud-options-el">
          <label class="checkboxtext">Allow deleting</label>
          <input v-model="allow_delete" type="checkbox"/>
        </span>
      </div>
      <div class="tab-content">
        <div v-bind:id="'form' + uni" v-bind:class="{ active: formActive }" class="tab-pane fade in">
          <form  v-on:submit.prevent="onSubmit">
            <div class="panel">
            <div class="panel-body">
              <div v-for="(item, index) in fieldsObject" class="row form-group" style="margin-bottom: 0.5em">
                <label class="control-label col-xs-3 col-md-2 text-right">{{item.name}}</label>
                <div class="col-xs-9 col-md-10">
                  <div v-if="item.type == 'select' || item.type == 'textarea'">
                    <select v-if="item.type == 'select'" v-bind:id="item.name + uni"
                            v-bind:class="'form-control input '+ item.class"
                            v-bind:name="item.name" v-model="item.value">
                      <option v-for="(val, key) in item.options" :value="val" v-text="key"></option>
                    </select>
                  <textarea v-if="item.type == 'textarea'" v-bind:id="item.name  + uni" rows="6"
                            v-bind:class="'form-control input ' +item.class" v-model="item.value"
                            v-bind:name="item.name" v-bind:placeholder="item.placeholder"></textarea>
                  </div>
                  <input v-if="item.type == 'number'" v-bind:id="item.name  + uni" v-bind:class="'form-control input '+ item.class"
                         v-bind:placeholder="item.placeholder" type="number" v-bind:name="item.name"
                         v-bind:value="item.value" v-model="item.value"/>
                  <input v-if="item.type == 'text'" v-bind:id="item.name  + uni" v-bind:class="'form-control input '+ item.class"
                         v-bind:placeholder="item.placeholder" type="text" v-bind:name="item.name"
                         v-bind:value="item.value" v-model="item.value"/>
                </div>
              </div>
            </div>
            <div class="panel-footer text-right">
              <button v-for="button in additionalButtons" class="btn btn-default"
                      v-bind:id="button.id" @click="clicked(button.id)">{{button.name}}</button>
              <button class="btn btn-default"  v-if="currentId" @click="cancelEdit">Cancel Edit</button>
              <button class="btn btn-danger" @click="submit">Submit</button>
            </div>
          </div>
          </form>
        </div>
        <div v-bind:id="'list' + uni" v-bind:class="{ active: listActive }" class="tab-pane fade in">
          <table @click="tableClick($event)" v-bind:id="'listTable' + uni" class="display" width="100%"></table>
          <hr>
          <div style="text-align: right"><button class="btn btn-default" @click="refresh">Refresh</button></div>
        </div>
      </div>
    </div>
    <button class="btn btn-default" @click="toggleDebug">DEBUG</button>
    <div v-if="debug" style="padding-top: 1em">
      <pre>{{ currentId }}</pre>
      <pre>{{ fieldsObject }}</pre>
    </div>
  </div>
</template>

<script>
  const debug = 0;
  const Crud = {
    name: 'Crud',
    props : {
      formActive : {
        type: Boolean,
        'default': true
      },
      listActive : {
        type: Boolean,
        'default': false
      },
      model: {
        type: Object,
        required: true,
      },
      extension: {
        type: Object,
      },
    },
    data: function() {
      return {
        items: [],
        currentId: null,
        allow_delete: false,
        fieldsObject : this.model.getFieldsObject(),
        debug : debug,
        // To add an additional button,
        additionalButtons:[],
        preEdit: {},
        messages : {
          warning : '',
          success : '',
          error : '',
        },
      }
    },
    created: function() {
      debug && console.log('CRUD CREATED', this.uni);
      var self = this;
      $('.ignore-input').removeClass('input');
      if(self.extension) {
        debug &&  console.log('LOAD EXTENSIONS', self.uni);
        self.extension.extend(self);
      }
      for(var key in self.fieldsObject) {
        if(self.fieldsObject[key].extend) {
          self.fieldsObject[key].extend(self);
        }
        if(self.fieldsObject[key].attrs) {
          var $el = $('#'+key + self.uni);
          for(var attr in self.fieldsObject[key].attrs) {
            $el.attr(attr, self.fieldsObject[key].attrs[attr]);
          }
        }
      }
      self.refresh();
    },
    mounted: function() {
      debug && console.log('MOUNTED', this.uni);
      var self = this;
      const onTimeChange = function(event) {
        var target = $(event.currentTarget);
        self.fieldsObject[target.attr('name')].value = target.val();
      };
      $('.date').datetimepicker({timepicker: false, format: 'Y-m-d'}).on('change', onTimeChange);
      $('.datetime').datetimepicker({format: 'Y-m-d H:i:s'}).on('change', onTimeChange);
    },
    destroyed: function() {
      debug && console.log('DESTROYED', this.uni);
    },
    updated: function() {
      debug && console.log('UPDATED', this.uni);
    },
    events: {
      userMessage : function(e) {
        var self = this;
        self.messages[e.type] = e.message;
        setTimeout(function() {
          self.messages[e.type] = ''
        }, 15000)
      },
      appendInput: function(e) {
        this.fieldsObject[e.name]['value'] += e.value;
      },
      call: function(e) {
        e.func(this, e.params);
      }
    },
    computed: {
      uni: function() {
        return this.model.getUni();
      },
      columns : function() {
        return this.model.columns()
      },
      title: function() {
        return this.model.title;
      }
    },
    methods: {
      clicked: function(id) {
        this.addedMethods[id]();
      },
      onSubmit:function(e, i) {
        console.log('ON SUBMIT');
      },
      isEdit: function() {
        return this.currentId;
      },
      refresh: function() {
        debug && console.log('REFRESHING', this.uni);
        var self = this;
        self.items = [];
        var d = new Date();
        self.model.list( function(res) {
          _.each(res.rows, function(doc) {
            self.items.push(self.docToRow(doc.doc));
          });
          self.renderTable(d.getMilliseconds());
        });
      },
      renderTable: function(x) {
        debug && console.log('RENDER', this.uni, x);
        var columns = [];
        _.each(this.columns, function(col) {
          columns.push({title:col});
        });
        columns.push({title:""});
        var data = {
          data: this.items,
          columns: columns,
          destroy:true,
        };
        var table = $('#listTable'+ this.uni);
        table.destroy && table.destroy();
        table.DataTable(data);
      },
      docToRow: function(doc) {
        var row = [];
        _.each(this.columns, function(col) {
          row.push(doc[col] || "");
        });
        var temp = '<div style="text-align: right"><button class="btn btn-xs btn-danger delete-item" data-id="{0}">Delete</button> \
                    <button class="btn btn-xs btn-default edit-item" data-id="{0}">Edit</span></button></div>';
        row.push(temp.f([doc._id]));
        return row;
      },
      edit: function(id) {
        console.log('Edit', id);
        var self = this;
        self.currentId = id;
        this.model.get(id, function(doc) {
          for(var name in self.fieldsObject) {
            self.fieldsObject[name].value = doc[name];
            self.preEdit[name] = doc[name];
          }
          self.show('form' + self.uni);
        });
      },
      dispatchSubmit: function() {
        var event = {

          id: this.currentId,
          preEdit: {}, postEdit: {},
        };
        for(var key in this.fieldsObject) {
          event.preEdit[key] = this.preEdit[key];
          event.postEdit[key] = this.fieldsObject[key].value;
        }
        this.$emit('crudsubmit', event);
      },
      submit: function() {
        var data = {};
        this.dispatchSubmit();
        var self = this;
        _.each(this.columns, function(name) {
          data[name] = self.fieldsObject[name].value;
          self.fieldsObject[name].value = "";
        });
        this.model.upsert(this.currentId, data, function() {
          self.refresh();
        });
        this.currentId = null;
      },
      show: function(what) {
        $('a[href*="#'+what+'"]').click();
      },
      cancelEdit: function() {
        this.currentId = null;
        for(var key in this.fieldsObject) {
          this.fieldsObject[key].value = '';
        }
        this.preEdit = {};
      },
      deleteItem: function(id) {
        if(! id ) {
          return;
        }
        if(! this.allow_delete) {
          this.warning('You need to allow deleting to delete.');
          return;
        }
        var self = this;
        this.model.removeById(id, function() {
          self.refresh();
        }, this.$parent.onDelete);
      },
      tableClick: function(e) {
        var elClass = e.target.getAttribute('class') || '';
        if(elClass.indexOf('delete-item') != -1) {
          this.deleteItem(e.target.getAttribute('data-id'));
        } else if (elClass.indexOf('edit-item') != -1) {
          this.edit(e.target.getAttribute('data-id'));
        }
      },
      toggleDebug: function() {
        this.debug = !this.debug;
      }
    }
  }

  import Messages from '../traits/Messages.js';
  _.extend(Crud.methods, Messages.UserMessages);

  export default Crud
</script>

<style>
  .tab-pane {
    padding-top: 1em;
  }
  div.alert {
    margin-bottom: 5px;
  }

  input[type=checkbox]
  {
    /* Double-sized Checkboxes */
    -ms-transform: scale(2); /* IE */
    -moz-transform: scale(2); /* FF */
    -webkit-transform: scale(2); /* Safari and Chrome */
    -o-transform: scale(2); /* Opera */
    padding: 10px;
  }

  /* Might want to wrap a span around your checkbox text */
  .checkboxtext
  {
    /* Checkbox text */
    font-size: 110%;
    display: inline;
    margin-right: 1em;
  }
</style>