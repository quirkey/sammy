(function($) {
    var Handlebars = {
        compilerCache: {},

        compile: function(string) {
            if (Handlebars.compilerCache[string] == null) {
                var fnBody = Handlebars.compileFunctionBody(string);
                var fn = new Function("context", "fallback", "Handlebars", fnBody);
                Handlebars.compilerCache[string] =
                function(context, fallback) { return fn(context, fallback, Handlebars); };
            }

            return Handlebars.compilerCache[string];
        },

        compileToString: function(string) {
            var fnBody = Handlebars.compileFunctionBody(string);
            return "function(context, fallback) { " + fnBody + "}";
        },

        compileFunctionBody: function(string) {
            var compiler = new Handlebars.Compiler(string);
            compiler.compile();

            return "fallback = fallback || {}; var stack = [];" + compiler.fn;
        },

        isFunction: function(fn) {
            return Object.prototype.toString.call(fn) == "[object Function]";
        },

        trim: function(str) {
            return str.replace(/^\s+|\s+$/g, '');
        },

        escapeText: function(string) {
            string = string.replace(/'/g, "\\'");
            string = string.replace(/\"/g, "\\\"");
            return string;
        },

        escapeExpression: function(string) {
            // don't escape SafeStrings, since they're already safe
            if (string instanceof Handlebars.SafeString) {
                return string.toString();
            }
            else if (string === null) {
                string = "";
            }

            return string.toString().replace(/&(?!\w+;)|["\\<>]/g, function(str) {
                switch(str) {
                    case "&":
                        return "&amp;";
                        break;
                    case '"':
                        return "\"";
                    case "\\":
                        return "\\\\";
                        break;
                    case "<":
                        return "&lt;";
                        break;
                    case ">":
                        return "&gt;";
                        break;
                    default:
                        return str;
                }
            });
        },

        compilePartial: function(partial) {
            if (Handlebars.isFunction(partial)) {
                compiled = partial;
            } else {
                compiled = Handlebars.compile(partial);
            }

            return compiled;
        },

        evalExpression: function(path, context, stack) {
            var parsedPath = Handlebars.parsePath(path);
            var depth = parsedPath[0];
            var parts = parsedPath[1];
            if (depth > stack.length) {
                context = null;
            } else if (depth > 0) {
                context = stack[stack.length - depth];
            }

            for (var i = 0; i < parts.length && context !== undefined; i++) {
                context = context[parts[i]];
            }

            return context;
        },

        buildContext: function(context, stack) {
            var ContextWrapper = function(stack) {
                this.__stack__ = stack.slice(0);
                this.__get__ = function(path) {
                    return Handlebars.evalExpression(path, this, this.__stack__);
                };
            };

            ContextWrapper.prototype = context;
            return new ContextWrapper(stack);
        },

        // spot to memoize paths to speed up loops and subsequent parses
        pathPatterns: {},

        // returns a two element array containing the numbers of contexts to back up the stack and
        // the properties to dig into on the current context
        //
        // for example, if the path is "../../alan/name", the result will be [2, ["alan", "name"]].
        parsePath: function(path) {
            if (path == null) {
                return [0, []];
            } else if (Handlebars.pathPatterns[path] != null) {
                return Handlebars.pathPatterns[path];
            }

            var parts = path.split("/");
            var readDepth = false;
            var depth = 0;
            var dig = [];
            for (var i = 0, j = parts.length; i < j; i++) {
                switch(parts[i]) {
                    case "..":
                        if (readDepth) {
                            throw new Handlebars.Exception("Cannot jump out of context after moving into a context.");
                        } else {
                            depth += 1;
                        }
                        break;
                    case ".":
                    // do nothing - using .'s is pretty dumb, but it's also basically free for us to support
                    case "this":
                        // if we do nothing you'll end up sticking in the same context
                        break;
                    default:
                        readDepth = true;
                        dig.push(parts[i]);
                }
            }

            var ret = [depth, dig];
            Handlebars.pathPatterns[path] = ret;
            return ret;
        },

        isEmpty: function(value) {
            if (typeof value === "undefined") {
                return true;
            } else if (!value) {
                return true;
            } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length == 0) {
                return true;
            } else {
                return false;
            }
        },

        // Escapes output and converts empty values to empty strings
        filterOutput: function(value, escape) {

            if (Handlebars.isEmpty(value)) {
                return "";
            } else if (escape) {
                return Handlebars.escapeExpression(value);
            } else {
                return value;
            }
        },

        handleBlock: function(lookup, context, arg, fn, notFn) {
            var out = "";
            if (Handlebars.isFunction(lookup)) {
                out = out + lookup.call(context, arg, fn);
                if (notFn != null && Handlebars.isFunction(lookup.not)) {
                    out = out + lookup.not.call(context, arg, notFn);
                }
            }
            else {
                if (!Handlebars.isEmpty(lookup)) {
                    out = out + Handlebars.helperMissing.call(arg, lookup, fn);
                }

                if (notFn != null) {
                    out = out + Handlebars.helperMissing.not.call(arg, lookup, notFn);
                }
            }

            return out;
        },

        handleExpression: function(lookup, context, arg, isEscaped) {
            var out = "";

            if (Handlebars.isFunction(lookup)) {
                out = out + Handlebars.filterOutput(lookup.call(context, arg), isEscaped);
            } else if(!Handlebars.isEmpty(lookup)) {
                out = out + Handlebars.filterOutput(lookup, isEscaped);
            }

            return out;
        },

        handleInvertedSection: function(lookup, context, fn) {
            var out = "";
            if(Handlebars.isFunction(lookup) && Handlebars.isEmpty(lookup())) {
                out = out + fn(context);
            } else if (Handlebars.isEmpty(lookup)) {
                out = out + fn(context);
            }
            return out;
        }
    }

    Handlebars.Compiler = function(string) {
        this.string = string;
        this.pointer = -1;
        this.mustache = false;
        this.text = "";
        this.fn = "var out = ''; var lookup; ";
        this.newlines = "";
        this.comment = false;
        this.escaped = true;
        this.partial = false;
        this.inverted = false;
        this.endCondition = null;
        this.continueInverted = false;
    };

    Handlebars.Exception = function(message) {
        this.message = message;
    };

// Build out our basic SafeString type
    Handlebars.SafeString = function(string) {
        this.string = string;
    }
    Handlebars.SafeString.prototype.toString = function() {
        return this.string.toString();
    }

    Handlebars.helperMissing = function(object, fn) {
        var ret = "";

        if(object === true) {
            return fn(this);
        } else if(object === false) {
            return "";
        } else if(Object.prototype.toString.call(object) === "[object Array]") {
            for(var i=0, j=object.length; i<j; i++) {
                ret = ret + fn(object[i]);
            }
            return ret;
        } else {
            return fn(object);
        }
    };
    Handlebars.helperMissing.not = function(context, fn) {
        return fn(context);
    }

    Handlebars.Compiler.prototype = {
        getChar: function(n) {
            var ret = this.peek(n);
            this.pointer = this.pointer + (n || 1);
            return ret;
        },

        peek: function(n) {
            n = n || 1;
            var start = this.pointer + 1;
            return this.string.slice(start, start + n);
        },

        compile: function(endCondition) {
            // if we're at the end condition already then we don't have to do any work!
            if (!endCondition || !endCondition(this)) {
                var chr;
                while(chr = this.getChar()) {
                    if(chr === "{" && this.peek() === "{" && !this.mustache) {
                        this.getChar();
                        this.parseMustache();

                    } else {
                        if(chr === "\n") {
                            this.newlines = this.newlines + "\n";
                            chr = "\\n";
                        } else if (chr === "\r") {
                            this.newlines = this.newlines + "\r";
                            chr = "\\r";
                        } else if (chr === "\\") {
                            chr = "\\\\";
                        }
                        this.text = this.text + chr;
                    }

                    if (endCondition && this.peek(5) == "{{^}}") {
                        this.continueInverted = true;
                        this.getChar(5);
                        break;
                    }
                    else if(endCondition && endCondition(this)) { break };
                }
            }

            this.addText();
            this.fn += "return out;";

            return;
        },

        addText: function() {
            if(this.text) {
                this.fn = this.fn + "out = out + \"" + Handlebars.escapeText(this.text) + "\"; ";
                this.fn = this.fn + this.newlines;
                this.newlines = "";
                this.text = "";
            }
        },

        addExpression: function(mustache, param) {
            param = param || null;
            var expr = this.lookupFor(mustache);
            this.fn += "var proxy = Handlebars.buildContext(context, stack);"
            this.fn += "out = out + Handlebars.handleExpression(" + expr + ", proxy, " + param + ", " + this.escaped + ");";
        },

        addInvertedSection: function(mustache) {
            var compiler = this.compileToEndOfBlock(mustache);
            var result = compiler.fn;

            // each function made internally needs a unique IDs. These are locals, so they
            // don't need to be globally unique, just per compiler
            var fnId = "fn" + this.pointer.toString();
            this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
            this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
            this.fn += "out = out + Handlebars.handleInvertedSection(lookup, context, " + fnId + ");"

            this.openBlock = false;
            this.inverted = false;
        },

        lookupFor: function(param) {
            var parsed = Handlebars.parsePath(param);
            var depth = parsed[0];
            var parts = parsed[1];

            if (depth > 0 || parts.length > 1) {
                return "(Handlebars.evalExpression('" + param + "', context, stack))";
            } else if (parts.length == 1) {
                return "(context['" + parts[0] + "'] || fallback['" + parts[0] + "'])";
            } else {
                return "(context || fallback)";
            }
        },

        compileToEndOfBlock: function(mustache) {
            var compiler = new Handlebars.Compiler(this.string.slice(this.pointer + 1));

            // sub-compile with a custom EOF instruction
            compiler.compile(function(compiler) {
                if (compiler.peek(3) === "{{/") {
                    if(compiler.peek(mustache.length + 5) === "{{/" + mustache + "}}") {
                        compiler.getChar(mustache.length + 5);
                        return true;
                    } else {
                        throw new Handlebars.Exception("Mismatched block close: expected " + mustache + ".");
                    }
                }
            });

            // move the pointer forward the amount of characters handled by the sub-compiler
            this.pointer += compiler.pointer + 1;

            return compiler;
        },

        addBlock: function(mustache, param, parts) {
            // set up the stack before the new compiler starts
            //this.fn += "stack.push(context);";
            var compiler = this.compileToEndOfBlock(mustache);
            var result = compiler.fn;

            // each function made internally needs a unique IDs. These are locals, so they
            // don't need to be globally unique, just per compiler
            var fnId = "fn" + this.pointer.toString();
            this.fn += "var wrappedContext = Handlebars.buildContext(context, stack);";
            this.fn += "stack.push(context);";
            this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
            this.fn += "lookup = " + this.lookupFor(mustache) + "; ";

            if (compiler.continueInverted) {
                var invertedCompiler = this.compileToEndOfBlock(mustache);
                this.fn += " var " + fnId + "Not = function(context) { " + invertedCompiler.fn + " };";
            }
            else {
                this.fn += " var " + fnId + "Not = null;";
            }
            this.fn += "out = out + Handlebars.handleBlock(lookup, wrappedContext, " + param + ", " + fnId + ", " + fnId + "Not);"

            this.fn += "stack.pop();";
            this.openBlock = false;
        },

        addPartial: function(mustache, param) {
            // either used a cached copy of the partial or compile a new one
            this.fn += "if (typeof fallback['partials'] === 'undefined' || typeof fallback['partials']['" + mustache + "'] === 'undefined') throw new Handlebars.Exception('Attempted to render undefined partial: " + mustache + "');";
            this.fn += "out = out + Handlebars.compilePartial(fallback['partials']['" + mustache + "'])(" + param + ", fallback);";
        },

        parseMustache: function() {
            var chr, part, mustache, param;

            var next = this.peek();

            if(next === "!") {
                this.comment = true;
                this.getChar();
            } else if(next === "#") {
                this.openBlock = true;
                this.getChar();
            } else if (next === ">") {
                this.partial = true;
                this.getChar();
            } else if (next === "^") {
                this.inverted = true;
                this.openBlock = true;
                this.getChar();
            } else if(next === "{" || next === "&") {
                this.escaped = false;
                this.getChar();
            }

            this.addText();
            this.mustache = " ";

            while(chr = this.getChar()) {
                if(this.mustache && chr === "}" && this.peek() === "}") {
                    var parts = Handlebars.trim(this.mustache).split(/\s+/);
                    mustache = parts[0];
                    param = this.lookupFor(parts[1]);

                    this.mustache = false;

                    // finish reading off the close of the handlebars
                    this.getChar();
                    // {{{expression}} is techically valid, but if we started with {{{ we'll try to read
                    // }}} off of the close of the handlebars
                    if (!this.escaped && this.peek() === "}") {
                        this.getChar();
                    }

                    if(this.comment) {
                        this.comment = false;
                        return;
                    } else if (this.partial) {
                        this.addPartial(mustache, param)
                        this.partial = false;
                        return;
                    } else if (this.inverted) {
                        this.addInvertedSection(mustache);
                        this.inverted = false;
                        return;
                    } else if(this.openBlock) {
                        this.addBlock(mustache, param, parts)
                        return;
                    } else {
                        return this.addExpression(mustache, param);
                    }

                    this.escaped = true;
                } else if(this.comment) {
                    ;
                } else {
                    this.mustache = this.mustache + chr;
                }
            }
        }
    };

// CommonJS Exports
    var exports = exports || {};
    exports['compile'] = Handlebars.compile;
    exports['compileToString'] = Handlebars.compileToString;

    Sammy = Sammy || {};

    // <tt>Sammy.Handlebars</tt> provides a quick way of using Handlebars templates in your app.
    // The plugin itself includes the handlebars.js library created by Yehuda Katz at
    // at http://github.com/wycats/handlebars.js
    //
    // Handlebars.js is an extension to the Mustache templating language  created by Chris Wanstrath. Handlebars.js
    // and Mustache are both logicless templating languages that keep the view and the code separated like
    // we all know they should be.
    //
    // By default using Sammy.Handlbars in your app adds the <tt>handlebars()</tt> method to the EventContext
    // prototype. However, just like <tt>Sammy.Template</tt> you can change the default name of the method
    // by passing a second argument (e.g. you could use the hbr() as the method alias so that all the template
    // files could be in the form file.hbr instead of file.handlebars)
    //
    // ### Example #1
    //
    // The template (mytemplate.hb):
    //
    //       <h1>\{\{title\}\}<h1>
    //
    //       Hey, {{name}}! Welcome to Handlebars!
    //
    // The app:
    //
    //       var $.app = $.sammy(function() {
    //         // include the plugin and alias handlebars() to hb()
    //         this.use(Sammy.Handlebars, 'hb');
    //
    //         this.get('#/hello/:name', function() {
    //           // set local vars
    //           this.title = 'Hello!'
    //           this.name = this.params.name;
    //           // render the template and pass it through handlebars
    //           this.partial('mytemplate.hb');
    //         });
    //
    //       });
    //
    // If I go to #/hello/AQ in the browser, Sammy will render this to the <tt>body</tt>:
    //
    //       <h1>Hello!</h1>
    //
    //       Hey, AQ! Welcome to Handlebars!
    //
    //
    // ### Example #2 - Handlebars partials
    //
    // The template (mytemplate.hb)
    //
    //       Hey, {{name}}! {{>hello_friend}}
    //
    //
    // The partial (mypartial.hb)
    //
    //       Say hello to your friend {{friend}}!
    //
    // The app:
    //
    //       var $.app = $.sammy(function() {
    //         // include the plugin and alias handlebars() to hb()
    //         this.use(Sammy.Handlebars, 'hb');
    //
    //         this.get('#/hello/:name/to/:friend', function() {
    //           var context = this;
    //
    //           // fetch handlebars-partial first
    //           $.get('mypartial.hb', function(response){
    //             context.partials = response;
    //
    //             // set local vars
    //             context.name = this.params.name;
    //             context.hello_friend = {name: this.params.friend};
    //
    //             // render the template and pass it through handlebars
    //             context.partial('mytemplate.hb');
    //           });
    //         });
    //
    //       });
    //
    // If I go to #/hello/AQ/to/dP in the browser, Sammy will render this to the <tt>body</tt>:
    //
    //       Hey, AQ! Say hello to your friend dP!
    //
    // Note: You dont have to include the handlebars.js file on top of the plugin as the plugin
    // includes the full source.
    //
    Sammy.Handlebars = function(app, method_alias) {

        var handlebars_cache = {};
        // *Helper* Uses handlebars.js to parse a template and interpolate and work with the passed data
        //
        // ### Arguments
        //
        // * `template` A String template.
        // * `data` An Object containing the replacement values for the template.
        //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
        //
        var handlebars = function(template, data, partials, name) {
            // use name for caching
            if (typeof name == 'undefined') name = template;
            var fn = handlebars_cache[name];
            if (!fn) {
                fn = handlebars_cache[name] = Handlebars.compile(template);
            }

            data     = $.extend({}, this, data);
            partials = $.extend({}, data.partials, partials);

            return fn(data, {"partials":partials});
        };

        // set the default method name/extension
        if (!method_alias) method_alias = 'handlebars';
        app.helper(method_alias, handlebars);

    };

})(jQuery);
