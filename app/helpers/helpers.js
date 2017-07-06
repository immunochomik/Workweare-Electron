var d3 = require('d3');

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
String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function printIt(x) {
  var cache = [];
  x = JSON.stringify(x, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
  cache = null; // Enable garbage collection
  console.log(x);
}

var dFormat = d3.timeFormat('%Y-%m-%d');

var dayFrom = function(count, date) {
  date = date ? date : new Date();
  var result = d3.time.day.offset(date, count);
  return dFormat(result);
};
var c = 1;
function cuniq() {
  var d = new Date(),
    m = d.getMilliseconds() + "",
    u = ++d + m + (++c === 10000 ? (c = 1) : c);
  return u;
}

function randString(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < (len || 5); i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function array_combine (keys, values) {
  var newArray = {};
  if (typeof keys !== 'object') {
    return false
  }
  if (typeof values !== 'object') {
    return false
  }
  if (typeof keys.length !== 'number') {
    return false
  }
  if (typeof values.length !== 'number') {
    return false
  }
  if (!keys.length) {
    return false
  }
  if (keys.length !== values.length) {
    return false
  }
  for (var i = 0; i < keys.length; i++) {
    newArray[keys[i]] = values[i]
  }
  return newArray
}

function range(start, stop, step) {
  if (typeof stop == 'undefined') {
    stop = start;
    start = 0;
  }
  if (typeof step == 'undefined') {
    step = 1;
  }
  step = parseInt(step);
  start = parseInt(start);
  stop = parseInt(stop);
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }
  var result = [];
  var sanity = 1000;
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
    if(sanity-- <0) {
      throw new Error('Endless loop detected');
    }
  }
  return result;
};


export default {
  randString: randString,
  dFormat : dFormat,
  dayFrom : dayFrom,
  cuniq: cuniq,
  range: range,
  array_combine: array_combine,
  toggleTopNavActive : function(id) {
    $('.nav-li').removeClass('active');
    $('#' + id).addClass('active');
  },

  daysPeriod : function(from, to, sanity) {
    sanity = sanity ? sanity : 10;
    if(from > to) {
      var temp = to; to = from; from = temp;
    }
    var start = new Date(from),
      period = [dFormat(start)];
    for(var i = 1; i < sanity; i++) {
      period.push(dayFrom(i, start));
      if(period[period.length -1] == to) {
        return period
      }
    }
    return period
  },

  sortObject: function(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  },

  pp : function(){
    for(var i in arguments) {
      printIt(arguments[i]);
    }
  },

  el : function (id) {
    return document.getElementById(id);
  },

  getParam: function(key, def) {
    var resp = def;
    if(window.location.href) {
      var href = window.location.href.split('?');
      if (href.length === 2) {
        href[1].split('&').forEach(function (pair) {
          pair = pair.split('=');
          if (pair[0] === key) {
            resp = pair[1];
          }
        });
      }
    }
    return resp;
  },
  now: function(date) {
    date = date ? date : new Date();
    return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
  },
  today : function(day) {
    day = day ? day : new Date();
    var dd = day.getDate();
    var mm = day.getMonth()+1; //January is 0!
    var yyyy = day.getFullYear();
    if(dd < 10) {
      dd = '0' + dd
    }
    if(mm < 10) {
      mm = '0' + mm
    }
    return yyyy +'-' + mm + '-' + dd;
  },

  routerCall : function(obj) {
    document.title = obj.title;
    toggleTopNavActive('topNavLi' + obj.title.replace(/ /g, ''));
  }
}
