/*
    json2.js
    2008-03-14

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    See http://www.JSON.org/js.html

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load third party
    code into your pages.
*/

if (!this.JSON) {

    JSON = function () {

        function f(n) {    // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function () {
            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };


        var m = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

        function stringify(value, whitelist) {
            var a,          // The array holding the partial texts.
                i,          // The loop counter.
                k,          // The member key.
                l,          // Length.
                r = /["\\\x00-\x1f\x7f-\x9f]/g,
                v;          // The member value.

            switch (typeof value) {
            case 'string':

                return r.test(value) ?
                    '"' + value.replace(r, function (a) {
                        var c = m[a];
                        if (c) {
                            return c;
                        }
                        c = a.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) +
                                                   (c % 16).toString(16);
                    }) + '"' :
                    '"' + value + '"';

            case 'number':

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                return String(value);

            case 'object':

                if (!value) {
                    return 'null';
                }

                if (typeof value.toJSON === 'function') {
                    return stringify(value.toJSON());
                }
                a = [];
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

                    l = value.length;
                    for (i = 0; i < l; i += 1) {
                        a.push(stringify(value[i], whitelist) || 'null');
                    }

                    return '[' + a.join(',') + ']';
                }
                if (whitelist) {
                    l = whitelist.length;
                    for (i = 0; i < l; i += 1) {
                        k = whitelist[i];
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                } else {

                    for (k in value) {
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                }

                return '{' + a.join(',') + '}';
            }
        }

        return {
            stringify: stringify,
            parse: function (text, filter) {
                var j;

                function walk(k, v) {
                    var i, n;
                    if (v && typeof v === 'object') {
                        for (i in v) {
                            if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                                n = walk(i, v[i]);
                                if (n !== undefined) {
                                    v[i] = n;
                                } else {
                                    delete v[i];
                                }
                            }
                        }
                    }
                    return filter(k, v);
                }

                if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    j = eval('(' + text + ')');

                    return typeof filter === 'function' ? walk('', j) : j;
                }

                throw new SyntaxError('parseJSON');
            }
        };
    }();
}

/*
Copyright Jason E. Smith 2008 Licensed under the Apache License, Version 2.0 (the "License");
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

/*
* CREDITS:
* Thanks to Kris Zyp from SitePen for contributing his source for
* a standalone port of JSONQuery (from the dojox.json.query module).
*
* OVERVIEW:
* JSONQuery.js is a standalone port of the dojox.json.query module. It is intended as
* a dropin solution with zero dependencies. JSONQuery is intended to succeed and improve upon
* the JSONPath api (http://goessner.net/articles/JsonPath/) which offers rich powerful
* querying capabilities similar to those of XQuery.
*
* EXAMPLES / USAGE:
* see http://www.sitepen.com/blog/2008/07/16/jsonquery-data-querying-beyond-jsonpath/
*
*     *Ripped from original source.
*         JSONQuery(queryString,object)
        and
        JSONQuery(queryString)(object)
        always return identical results. The first one immediately evaluates, the second one returns a
        function that then evaluates the object.

      example:
        JSONQuery("foo",{foo:"bar"})
        This will return "bar".

      example:
        evaluator = JSONQuery("?foo='bar'&rating>3");
        This creates a function that finds all the objects in an array with a property
        foo that is equals to "bar" and with a rating property with a value greater
        than 3.
        evaluator([{foo:"bar",rating:4},{foo:"baz",rating:2}])
        This returns:
        {foo:"bar",rating:4}

      example:
        evaluator = JSONQuery("$[?price<15.00][\rating][0:10]");
        This finds objects in array with a price less than 15.00 and sorts then
        by rating, highest rated first, and returns the first ten items in from this
        filtered and sorted list.

      example:
        var data = {customers:[
          {name:"Susan", purchases:29},
          {name:"Kim", purchases:150},
          {name:"Jake", purchases:27}
      ]};

      var results = json.JSONQuery("$.customers[?purchases > 21 & name='Jake'][\\purchases]",data);

      returns customers sorted by higest number of purchases to lowest.

*/

(function(){
  function map(arr, fun /*, thisp*/){
    var len = arr.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[2];
    for (var i = 0; i < len; i++) {
      if (i in arr)
        res[i] = fun.call(thisp, arr[i], i, arr);
    }

    return res;
  }

  function filter(arr, fun /*, thisp*/){
    var len = arr.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[2];
    for (var i = 0; i < len; i++) {
      if (i in arr) {
        var val = arr[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, arr))
          res.push(val);
      }
    }

    return res;
  };

  function slice(obj,start,end,step){
    // handles slice operations: [3:6:2]
    var len=obj.length,results = [];
    end = end || len;
    start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
    end = (end < 0) ? Math.max(0,end+len) : Math.min(len,end);
     for(var i=start; i<end; i+=step){
       results.push(obj[i]);
     }
    return results;
  }
  function expand(obj,name){
    // handles ..name, .*, [*], [val1,val2], [val]
    // name can be a property to search for, undefined for full recursive, or an array for picking by index
    var results = [];
    function walk(obj){
      if(name){
        if(name===true && !(obj instanceof Array)){
          //recursive object search
          results.push(obj);
        }else if(obj[name]){
          // found the name, add to our results
          results.push(obj[name]);
        }
      }
      for(var i in obj){
        var val = obj[i];
        if(!name){
          // if we don't have a name we are just getting all the properties values (.* or [*])
          results.push(val);
        }else if(val && typeof val == 'object'){

          walk(val);
        }
      }
    }
    if(name instanceof Array){
      // this is called when multiple items are in the brackets: [3,4,5]
      if(name.length==1){
        // this can happen as a result of the parser becoming confused about commas
        // in the brackets like [@.func(4,2)]. Fixing the parser would require recursive
        // analsys, very expensive, but this fixes the problem nicely.
        return obj[name[0]];
      }
      for(var i = 0; i < name.length; i++){
        results.push(obj[name[i]]);
      }
    }else{
      // otherwise we expanding
      walk(obj);
    }
    return results;
  }

  function distinctFilter(array, callback){
    // does the filter with removal of duplicates in O(n)
    var outArr = [];
    var primitives = {};
    for(var i=0,l=array.length; i<l; ++i){
      var value = array[i];
      if(callback(value, i, array)){
        if((typeof value == 'object') && value){
          // with objects we prevent duplicates with a marker property
          if(!value.__included){
            value.__included = true;
            outArr.push(value);
          }
        }else if(!primitives[value + typeof value]){
          // with primitives we prevent duplicates by putting it in a map
          primitives[value + typeof value] = true;
          outArr.push(value);
        }
      }
    }
    for(i=0,l=outArr.length; i<l; ++i){
      // cleanup the marker properties
      if(outArr[i]){
        delete outArr[i].__included;
      }
    }
    return outArr;
  }

  var JSONQuery = function(/*String*/query,/*Object?*/obj){
    // summary:
    //     Performs a JSONQuery on the provided object and returns the results.
    //     If no object is provided (just a query), it returns a "compiled" function that evaluates objects
    //     according to the provided query.
    // query:
    //     Query string
    // obj:
    //     Target of the JSONQuery
    //
    //  description:
    //    JSONQuery provides a comprehensive set of data querying tools including filtering,
    //    recursive search, sorting, mapping, range selection, and powerful expressions with
    //    wildcard string comparisons and various operators. JSONQuery generally supersets
    //    JSONPath and provides syntax that matches and behaves like JavaScript where
    //    possible.
    //
    //    JSONQuery evaluations begin with the provided object, which can referenced with
    //    $. From
    //    the starting object, various operators can be successively applied, each operating
    //    on the result of the last operation.
    //
    //    Supported Operators:
    //    --------------------
    //    * .property - This will return the provided property of the object, behaving exactly
    //     like JavaScript.
    //    * [expression] - This returns the property name/index defined by the evaluation of
    //     the provided expression, behaving exactly like JavaScript.
    //    * [?expression] - This will perform a filter operation on an array, returning all the
    //     items in an array that match the provided expression. This operator does not
    //     need to be in brackets, you can simply use ?expression, but since it does not
    //     have any containment, no operators can be used afterwards when used
    //     without brackets.
    //    * [^?expression] - This will perform a distinct filter operation on an array. This behaves
    //     as [?expression] except that it will remove any duplicate values/objects from the
    //     result set.
    //    * [/expression], [\expression], [/expression, /expression] - This performs a sort
    //     operation on an array, with sort based on the provide expression. Multiple comma delimited sort
    //     expressions can be provided for multiple sort orders (first being highest priority). /
    //     indicates ascending order and \ indicates descending order
    //    * [=expression] - This performs a map operation on an array, creating a new array
    //     with each item being the evaluation of the expression for each item in the source array.
    //    * [start:end:step] - This performs an array slice/range operation, returning the elements
    //     from the optional start index to the optional end index, stepping by the optional step number.
    //    * [expr,expr] - This a union operator, returning an array of all the property/index values from
    //     the evaluation of the comma delimited expressions.
    //    * .* or [*] - This returns the values of all the properties of the current object.
    //    * $ - This is the root object, If a JSONQuery expression does not being with a $,
    //     it will be auto-inserted at the beginning.
    //    * @ - This is the current object in filter, sort, and map expressions. This is generally
    //     not necessary, names are auto-converted to property references of the current object
    //     in expressions.
    //    *  ..property - Performs a recursive search for the given property name, returning
    //     an array of all values with such a property name in the current object and any subobjects
    //    * expr = expr - Performs a comparison (like JS's ==). When comparing to
    //     a string, the comparison string may contain wildcards * (matches any number of
    //     characters) and ? (matches any single character).
    //    * expr ~ expr - Performs a string comparison with case insensitivity.
    //    * ..[?expression] - This will perform a deep search filter operation on all the objects and
    //     subobjects of the current data. Rather than only searching an array, this will search
    //     property values, arrays, and their children.
    //    * $1,$2,$3, etc. - These are references to extra parameters passed to the query
    //     function or the evaluator function.
    //    * +, -, /, *, &, |, %, (, ), <, >, <=, >=, != - These operators behave just as they do
    //     in JavaScript.
    //
    //
    //
    //   |  dojox.json.query(queryString,object)
    //      and
    //   |  dojox.json.query(queryString)(object)
    //      always return identical results. The first one immediately evaluates, the second one returns a
    //      function that then evaluates the object.
    //
    //   example:
    //   |  dojox.json.query("foo",{foo:"bar"})
    //      This will return "bar".
    //
    //   example:
    //   |  evaluator = dojox.json.query("?foo='bar'&rating>3");
    //      This creates a function that finds all the objects in an array with a property
    //      foo that is equals to "bar" and with a rating property with a value greater
    //      than 3.
    //   |  evaluator([{foo:"bar",rating:4},{foo:"baz",rating:2}])
    //      This returns:
    //   |  {foo:"bar",rating:4}
    //
    //  example:
    //   |  evaluator = dojox.json.query("$[?price<15.00][\rating][0:10]");
    //      This finds objects in array with a price less than 15.00 and sorts then
    //      by rating, highest rated first, and returns the first ten items in from this
    //      filtered and sorted list.
    tokens = [];
    var depth = 0;
    var str = [];
    query = query.replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|[\[\]]/g,function(t){
      depth += t == '[' ? 1 : t == ']' ? -1 : 0; // keep track of bracket depth
      return (t == ']' && depth > 0) ? '`]' : // we mark all the inner brackets as skippable
          (t.charAt(0) == '"' || t.charAt(0) == "'") ? "`" + (str.push(t) - 1) :// and replace all the strings
            t;
    });
    var prefix = '';
    function call(name){
      // creates a function call and puts the expression so far in a parameter for a call
      prefix = name + "(" + prefix;
    }
    function makeRegex(t,a,b,c,d){
      // creates a regular expression matcher for when wildcards and ignore case is used
      return str[d].match(/[\*\?]/) || c == '~' ?
          "/^" + str[d].substring(1,str[d].length-1).replace(/\\([btnfr\\"'])|([^\w\*\?])/g,"\\$1$2").replace(/([\*\?])/g,".$1") + (c == '~' ? '$/i' : '$/') + ".test(" + a + ")" :
          t;
    }
    query.replace(/(\]|\)|push|pop|shift|splice|sort|reverse)\s*\(/,function(){
      throw new Error("Unsafe function call");
    });

    query = query.replace(/([^<>=]=)([^=])/g,"$1=$2"). // change the equals to comparisons
      replace(/@|(\.\s*)?[a-zA-Z\$_]+(\s*:)?/g,function(t){
        return t.charAt(0) == '.' ? t : // leave .prop alone
          t == '@' ? "$obj" :// the reference to the current object
          (t.match(/:|^(\$|Math|true|false|null)$/) ? "" : "$obj.") + t; // plain names should be properties of root... unless they are a label in object initializer
      }).
      replace(/\.?\.?\[(`\]|[^\]])*\]|\?.*|\.\.([\w\$_]+)|\.\*/g,function(t,a,b){
        var oper = t.match(/^\.?\.?(\[\s*\^?\?|\^?\?|\[\s*==)(.*?)\]?$/); // [?expr] and ?expr and [=expr and =expr
        if(oper){
          var prefix = '';
          if(t.match(/^\./)){
            // recursive object search
            call("expand");
            prefix = ",true)";
          }
          call(oper[1].match(/\=/) ? "map" : oper[1].match(/\^/) ? "distinctFilter" : "filter");
          return prefix + ",function($obj){return " + oper[2] + "})";
        }
        oper = t.match(/^\[\s*([\/\\].*)\]/); // [/sortexpr,\sortexpr]
        if(oper){
          // make a copy of the array and then sort it using the sorting expression
          return ".concat().sort(function(a,b){" + oper[1].replace(/\s*,?\s*([\/\\])\s*([^,\\\/]+)/g,function(t,a,b){
              return "var av= " + b.replace(/\$obj/,"a") + ",bv= " + b.replace(/\$obj/,"b") + // FIXME: Should check to make sure the $obj token isn't followed by characters
                  ";if(av>bv||bv==null){return " + (a== "/" ? 1 : -1) +";}\n" +
                  "if(bv>av||av==null){return " + (a== "/" ? -1 : 1) +";}\n";
          }) + "})";
        }
        oper = t.match(/^\[(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)\]/); // slice [0:3]
        if(oper){
          call("slice");
          return "," + (oper[1] || 0) + "," + (oper[2] || 0) + "," + (oper[3] || 1) + ")";
        }
        if(t.match(/^\.\.|\.\*|\[\s*\*\s*\]|,/)){ // ..prop and [*]
          call("expand");
          return (t.charAt(1) == '.' ?
              ",'" + b + "'" : // ..prop
                t.match(/,/) ?
                  "," + t : // [prop1,prop2]
                  "") + ")"; // [*]
        }
        return t;
      }).
      replace(/(\$obj\s*(\.\s*[\w_$]+\s*)*)(==|~)\s*`([0-9]+)/g,makeRegex). // create regex matching
      replace(/`([0-9]+)\s*(==|~)\s*(\$obj(\s*\.\s*[\w_$]+)*)/g,function(t,a,b,c,d){ // and do it for reverse =
        return makeRegex(t,c,d,b,a);
      });
    query = prefix + (query.charAt(0) == '$' ? "" : "$") + query.replace(/`([0-9]+|\])/g,function(t,a){
      //restore the strings
      return a == ']' ? ']' : str[a];
    });
    // create a function within this scope (so it can use expand and slice)

    var executor = eval("1&&function($,$1,$2,$3,$4,$5,$6,$7,$8,$9){var $obj=$;return " + query + "}");
    for(var i = 0;i<arguments.length-1;i++){
      arguments[i] = arguments[i+1];
    }
    return obj ? executor.apply(this,arguments) : executor;
  };

  if(typeof namespace == "function"){
    namespace("json::JSONQuery", JSONQuery);
  }
  else {
    window["JSONQuery"] = JSONQuery;
  }
})();


//------------------------------------------------------------------------------
//
// jquery.cloudkit.js source
//
// Copyright (c) 2008, 2009 Jon Crosby http://joncrosby.me
//
// For the complete source with the bundled dependencies,
// run 'rake dist' and use the contents of the dist directory.
//
//------------------------------------------------------------------------------

(function($) {

  $.cloudkit = $.cloudkit || {};

  //----------------------------------------------------------------------------
  // Resource Model
  //----------------------------------------------------------------------------
  var buildResource = function(collection, spec, metadata) {
    var that = {};
    var meta = {};
    var json = spec;

    // return a key that is unique across all local items
    var generateId = function() {
      return (new Date).getTime() + '-' + Math.floor(Math.random()*10000);
    };

    var saveFromRemote = function() {
      meta = metadata;
      meta.id = generateId();
    };

    that.save = function(callbacks) {
      if (!(typeof metadata === 'undefined')) {
        return saveFromRemote();
      }
      $.ajax({
        type: 'POST',
        url: collection,
        data: JSON.stringify(spec),
        contentType: 'application/json',
        dataType: 'json',
        processData: false,
        complete: function(response, statusText) {
          if (response.status == 201) {
            meta = JSON.parse(response.responseText);
            meta.id = generateId();
            callbacks.success();
          } else {
            callbacks.error(response.status);
          }
        }
      });
    };

    that.update = function(spec, callbacks) {
      var id = meta.id;
      $.ajax({
        type: 'PUT',
        url: meta.uri,
        data: JSON.stringify($.extend(json,spec)),
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('If-Match', meta.etag);
        },
        processData: false,
        complete: function(response, statusText) {
          if (response.status == 200) {
            meta = JSON.parse(response.responseText);
            meta.id = id;
            json = $.extend(json,spec);
            callbacks.success();
          } else {
            // TODO implement default 412 strategy as progressive diff/merge
            callbacks.error(response.status);
          }
        }
      });
    };

    that.destroy = function(callbacks) {
      var id = meta.id
      $.ajax({
        type: 'DELETE',
        url: meta.uri,
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('If-Match', meta.etag);
        },
        processData: false,
        complete: function(response, statusText) {
          meta = JSON.parse(response.responseText);
          meta.id = id;
          if (response.status == 200) {
            meta.deleted = true;
            callbacks.success();
          } else {
            callbacks.error(response.status);
          }
        }
      });
    };

    that.json = function() {
      return json;
    };

    that.id = function() {
      return meta.id;
    };

    that.uri = function() {
      return meta.uri;
    };

    that.isDeleted = function() {
      return (meta.deleted == true);
    };

    that.attr = function(name, value) {
      if (typeof json[name] != 'undefined') {
        switch(typeof value) {
          case 'undefined':
            return json[name]; break;
          case 'function':
            return json[name] = value.apply(json[name]); break;
          default:
            return json[name] = value;
        }
      } else if (typeof meta[name] != 'undefined') {
        return meta[name];
      }
    };

    return that;
  };

  //----------------------------------------------------------------------------
  // Internal Data Store
  //----------------------------------------------------------------------------
  var buildStore = function(collection) {
    var that = {};

    var key = function(resource) {
      return collection+resource.id();
    };

    var persist = function(resource) {
      var k = key(resource);
      $.data(window, k, resource);
      var index = $.data(window, collection+'index') || [];
      index.push(k);
      $.data(window, collection+'index', index);
    };

    that.create = function(spec, callbacks) {
      resource = buildResource(collection, spec);
      resource.save({
        success: function() {
          persist(resource);
          callbacks.success(resource);
        },
        error: function(status) {
          callbacks.error(status);
        }
      });
    };

    that.createFromRemote = function(spec, metadata) {
      resource = buildResource(collection, spec, metadata);
      resource.save();
      persist(resource);
      return resource;
    };

    that.all = function(spec) {
      // TODO - don't ignore spec
      var result = [];
      var index = $.data(window, collection+'index');
      $(index).each(function(count, id) {
        var item = $.data(window, id);
        if (!item.isDeleted()) {
          result.push(item);
        }
      });
      return result;
    };

    that.get = function(id) {
      return $.data(window, collection+id);
    };

    that.query = function(spec) {
      var jsonObjects = [];
      var self = this;
      $(this.all()).each(function(index, item) {
        json = $.extend(item.json(), {'___id___':item.id()});
        jsonObjects.push(json);
      });
      var query_result = JSONQuery(spec, jsonObjects);
      var resources = []
      $(query_result).each(function(index, item) {
        resources.push(self.get(item['___id___']));
      });
      return resources;
    }

    return that;
  };

  //----------------------------------------------------------------------------
  // Private API
  //----------------------------------------------------------------------------

  var collectionURIs = []; // collection URIs found during boot via discovery
  var collections    = {}; // local stores, one per remote resource collection

  // load remote collection URIs
  var loadMeta = function(callbacks) {
    $.ajax({
      type: 'GET',
      url: '/cloudkit-meta',
      complete: function(response, statusText) {
        data = JSON.parse(response.responseText);
        if (response.status == 200) {
          collectionURIs = data.uris;
          callbacks.success();
        } else if (response.status >= 400) {
          callbacks.error(response.status);
        } else {
          callbacks.error('unexpected error');
        }
      }
    });
  };

  // configure a local collection
  var configureCollection = function(collection) {
    $.data(window, collection+'index', []);
    var name = collection.replace(/^\//, '');
    collections[name] = buildStore(collection);
  };

  // load remote data into local store
  var populateCollectionsFromRemote = function(index, callbacks) {
    if (index == collectionURIs.length) {
      callbacks.success();
      return;
    }
    $.ajax({
      type: 'GET',
      url: collectionURIs[index]+"/_resolved",
      dataType: 'json',
      processData: false,
      complete: function(response, statusText) {
        if (response.status == 200) {
          var resources = JSON.parse(response.responseText).documents;
          var name = collectionURIs[index].replace(/^\//, '');
          for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];
            collections[name].createFromRemote(
              JSON.parse(resource.document),
              {
                uri: resource.uri,
                etag: resource.etag,
                last_modified: resource.last_modified
              }
            );
          }
          populateCollectionsFromRemote(index+1, callbacks);
        } else {
          callbacks.error(response.status);
        }
      }
    });
  };

  // extend jquery
  $.fn.extend($.cloudkit, {

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    // setup the local store
    boot: function(callbacks) {
      collectionURIs = [];
      collections = [];
      loadMeta({
        success: function() {
          $(collectionURIs).each(function(index, collection) {
            configureCollection(collection);
          });
          populateCollectionsFromRemote(0, {
            success: function() {
              callbacks.success();
            },
            error: function(status) {
              callbacks.error(status);
            }
          });
        },
        error: function(status) {
          callbacks.error(status);
        }
      });
    },

    // return all collections
    collections: function() {
      return collections;
    },

    // return a specific collection
    collection: function(name) {
      return this.collections()[name];
    }
  });
})(jQuery);
