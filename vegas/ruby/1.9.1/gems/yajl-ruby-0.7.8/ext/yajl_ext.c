/*
 * Copyright (c) 2008-2009 Brian Lopez - http://github.com/brianmario
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

#include "yajl_ext.h"

#define YAJL_RB_TO_JSON                                   \
 VALUE rb_encoder;                                        \
 rb_scan_args(argc, argv, "01", &rb_encoder);             \
 VALUE cls = rb_obj_class(rb_encoder);                    \
 if (rb_encoder == Qnil || cls != cEncoder) {             \
     rb_encoder = rb_yajl_encoder_new(0, NULL, cEncoder); \
 }                                                        \
 return rb_yajl_encoder_encode(1, &self, rb_encoder);     \

/* Helpers for building objects */
inline void yajl_check_and_fire_callback(void * ctx) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);

    /* No need to do any of this if the callback isn't even setup */
    if (wrapper->parse_complete_callback != Qnil) {
        int len = RARRAY_LEN(wrapper->builderStack);
        if (len == 1 && wrapper->nestedArrayLevel == 0 && wrapper->nestedHashLevel == 0) {
            rb_funcall(wrapper->parse_complete_callback, intern_call, 1, rb_ary_pop(wrapper->builderStack));
        }
    } else {
        int len = RARRAY_LEN(wrapper->builderStack);
        if (len == 1 && wrapper->nestedArrayLevel == 0 && wrapper->nestedHashLevel == 0) {
            wrapper->objectsFound++;
            if (wrapper->objectsFound > 1) {
                rb_raise(cParseError, "%s", "Found multiple JSON objects in the stream but no block or the on_parse_complete callback was assigned to handle them.");
            }
        }
    }
}

inline void yajl_set_static_value(void * ctx, VALUE val) {
    yajl_parser_wrapper * wrapper;
    VALUE lastEntry, hash;
    int len;

    GetParser((VALUE)ctx, wrapper);

    len = RARRAY_LEN(wrapper->builderStack);
    if (len > 0) {
        lastEntry = rb_ary_entry(wrapper->builderStack, len-1);
        switch (TYPE(lastEntry)) {
            case T_ARRAY:
                rb_ary_push(lastEntry, val);
                if (TYPE(val) == T_HASH || TYPE(val) == T_ARRAY) {
                    rb_ary_push(wrapper->builderStack, val);
                }
                break;
            case T_HASH:
                rb_hash_aset(lastEntry, val, Qnil);
                rb_ary_push(wrapper->builderStack, val);
                break;
            case T_STRING:
            case T_SYMBOL:
                hash = rb_ary_entry(wrapper->builderStack, len-2);
                if (TYPE(hash) == T_HASH) {
                    rb_hash_aset(hash, lastEntry, val);
                    rb_ary_pop(wrapper->builderStack);
                    if (TYPE(val) == T_HASH || TYPE(val) == T_ARRAY) {
                        rb_ary_push(wrapper->builderStack, val);
                    }
                }
                break;
        }
    } else {
        rb_ary_push(wrapper->builderStack, val);
    }
}

static void yajl_encoder_wrapper_free(void * wrapper) {
    yajl_encoder_wrapper * w = wrapper;
    if (w) {
        yajl_gen_free(w->encoder);
        free(w);
    }
}

static void yajl_encoder_wrapper_mark(void * wrapper) {
    yajl_encoder_wrapper * w = wrapper;
    if (w) {
        rb_gc_mark(w->on_progress_callback);
        rb_gc_mark(w->terminator);
    }
}

void yajl_encode_part(void * wrapper, VALUE obj, VALUE io) {
    VALUE str, outBuff, otherObj;
    yajl_encoder_wrapper * w = wrapper;
    yajl_gen_status status;
    int idx = 0;
    const unsigned char * buffer;
    const char * cptr;
    unsigned int len;

    if (io != Qnil || w->on_progress_callback != Qnil) {
        status = yajl_gen_get_buf(w->encoder, &buffer, &len);
        if (len >= WRITE_BUFSIZE) {
            outBuff = rb_str_new((const char *)buffer, len);
            if (io != Qnil) {
                rb_io_write(io, outBuff);
            } else if (w->on_progress_callback != Qnil) {
                rb_funcall(w->on_progress_callback, intern_call, 1, outBuff);
            }
            yajl_gen_clear(w->encoder);
        }
    }

    switch (TYPE(obj)) {
        case T_HASH:
            status = yajl_gen_map_open(w->encoder);

            /* TODO: itterate through keys in the hash */
            VALUE keys = rb_funcall(obj, intern_keys, 0);
            VALUE entry, keyStr;
            for(idx=0; idx<RARRAY_LEN(keys); idx++) {
                entry = rb_ary_entry(keys, idx);
                keyStr = rb_funcall(entry, intern_to_s, 0); /* key must be a string */
                /* the key */
                yajl_encode_part(w, keyStr, io);
                /* the value */
                yajl_encode_part(w, rb_hash_aref(obj, entry), io);
            }

            status = yajl_gen_map_close(w->encoder);
            break;
        case T_ARRAY:
            status = yajl_gen_array_open(w->encoder);
            for(idx=0; idx<RARRAY_LEN(obj); idx++) {
                otherObj = rb_ary_entry(obj, idx);
                yajl_encode_part(w, otherObj, io);
            }
            status = yajl_gen_array_close(w->encoder);
            break;
        case T_NIL:
            status = yajl_gen_null(w->encoder);
            break;
        case T_TRUE:
            status = yajl_gen_bool(w->encoder, 1);
            break;
        case T_FALSE:
            status = yajl_gen_bool(w->encoder, 0);
            break;
        case T_FIXNUM:
        case T_FLOAT:
        case T_BIGNUM:
            str = rb_funcall(obj, intern_to_s, 0);
            cptr = RSTRING_PTR(str);
            len = RSTRING_LEN(str);
            if (memcmp(cptr, "NaN", 3) == 0 || memcmp(cptr, "Infinity", 8) == 0 || memcmp(cptr, "-Infinity", 9) == 0) {
                rb_raise(cEncodeError, "'%s' is an invalid number", cptr);
            }
            status = yajl_gen_number(w->encoder, cptr, len);
            break;
        case T_STRING:
            cptr = RSTRING_PTR(obj);
            len = RSTRING_LEN(obj);
            status = yajl_gen_string(w->encoder, (const unsigned char *)cptr, len);
            break;
        default:
            if (rb_respond_to(obj, intern_to_json)) {
                str = rb_funcall(obj, intern_to_json, 0);
                cptr = RSTRING_PTR(str);
                len = RSTRING_LEN(str);
                status = yajl_gen_number(w->encoder, cptr, len);
            } else {
                str = rb_funcall(obj, intern_to_s, 0);
                cptr = RSTRING_PTR(str);
                len = RSTRING_LEN(str);
                status = yajl_gen_string(w->encoder, (const unsigned char *)cptr, len);
            }
            break;
    }
}

void yajl_parser_wrapper_free(void * wrapper) {
    yajl_parser_wrapper * w = wrapper;
    if (w) {
        yajl_free(w->parser);
        free(w);
    }
}

void yajl_parser_wrapper_mark(void * wrapper) {
    yajl_parser_wrapper * w = wrapper;
    if (w) {
        rb_gc_mark(w->builderStack);
        rb_gc_mark(w->parse_complete_callback);
    }
}

void yajl_parse_chunk(const unsigned char * chunk, unsigned int len, yajl_handle parser) {
    yajl_status stat;

    stat = yajl_parse(parser, chunk, len);

    if (stat != yajl_status_ok && stat != yajl_status_insufficient_data) {
        unsigned char * str = yajl_get_error(parser, 1, chunk, len);
        rb_raise(cParseError, "%s", (const char *) str);
        yajl_free_error(parser, str);
    }
}

/* YAJL Callbacks */
static int yajl_found_null(void * ctx) {
    yajl_set_static_value(ctx, Qnil);
    yajl_check_and_fire_callback(ctx);
    return 1;
}

static int yajl_found_boolean(void * ctx, int boolean) {
    yajl_set_static_value(ctx, boolean ? Qtrue : Qfalse);
    yajl_check_and_fire_callback(ctx);
    return 1;
}

static int yajl_found_number(void * ctx, const char * numberVal, unsigned int numberLen) {
    char buf[numberLen+1];
    buf[numberLen] = 0;
    memcpy(buf, numberVal, numberLen);

    if (memchr(buf, '.', numberLen) ||
        memchr(buf, 'e', numberLen) ||
        memchr(buf, 'E', numberLen)) {
        yajl_set_static_value(ctx, rb_float_new(strtod(buf, NULL)));
    } else {
        yajl_set_static_value(ctx, rb_cstr2inum(buf, 10));
    }
    return 1;
}

static int yajl_found_string(void * ctx, const unsigned char * stringVal, unsigned int stringLen) {
    VALUE str = rb_str_new((const char *)stringVal, stringLen);
#ifdef HAVE_RUBY_ENCODING_H
    rb_encoding *default_internal_enc = rb_default_internal_encoding();
    rb_enc_associate(str, utf8Encoding);
    if (default_internal_enc) {
      str = rb_str_export_to_enc(str, default_internal_enc);
    }
#endif
    yajl_set_static_value(ctx, str);
    yajl_check_and_fire_callback(ctx);
    return 1;
}

static int yajl_found_hash_key(void * ctx, const unsigned char * stringVal, unsigned int stringLen) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);
    VALUE keyStr;
#ifdef HAVE_RUBY_ENCODING_H
    rb_encoding *default_internal_enc = rb_default_internal_encoding();
#endif

    if (wrapper->symbolizeKeys) {
        char buf[stringLen+1];
        memcpy(buf, stringVal, stringLen);
        buf[stringLen] = 0;
        yajl_set_static_value(ctx, ID2SYM(rb_intern(buf)));
    } else {
        keyStr = rb_str_new((const char *)stringVal, stringLen);
#ifdef HAVE_RUBY_ENCODING_H
        rb_enc_associate(keyStr, utf8Encoding);
        if (default_internal_enc) {
          keyStr = rb_str_export_to_enc(keyStr, default_internal_enc);
        }
#endif
        yajl_set_static_value(ctx, keyStr);
    }
    yajl_check_and_fire_callback(ctx);
    return 1;
}

static int yajl_found_start_hash(void * ctx) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);
    wrapper->nestedHashLevel++;
    yajl_set_static_value(ctx, rb_hash_new());
    return 1;
}

static int yajl_found_end_hash(void * ctx) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);
    wrapper->nestedHashLevel--;
    if (RARRAY_LEN(wrapper->builderStack) > 1) {
        rb_ary_pop(wrapper->builderStack);
    }
    yajl_check_and_fire_callback(ctx);
    return 1;
}

static int yajl_found_start_array(void * ctx) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);
    wrapper->nestedArrayLevel++;
    yajl_set_static_value(ctx, rb_ary_new());
    return 1;
}

static int yajl_found_end_array(void * ctx) {
    yajl_parser_wrapper * wrapper;
    GetParser((VALUE)ctx, wrapper);
    wrapper->nestedArrayLevel--;
    if (RARRAY_LEN(wrapper->builderStack) > 1) {
        rb_ary_pop(wrapper->builderStack);
    }
    yajl_check_and_fire_callback(ctx);
    return 1;
}


/* Ruby Interface */

/*
 * Document-class: Yajl::Parser
 *
 * This class contains methods for parsing JSON directly from an IO object.
 * The only basic requirment currently is that the IO object respond to #read(len) and #eof?
 * The IO is parsed until a complete JSON object has been read and a ruby object will be returned.
 */

/*
 * Document-method: new
 *
 * call-seq: new([:symbolize_keys => true, [:allow_comments => false[, :check_utf8 => false]]])
 *
 * :symbolize_keys will turn hash keys into Ruby symbols, defaults to false.
 *
 * :allow_comments will turn on/off the check for comments inside the JSON stream, defaults to true.
 *
 * :check_utf8 will validate UTF8 characters found in the JSON stream, defaults to true.
 */
static VALUE rb_yajl_parser_new(int argc, VALUE * argv, VALUE klass) {
    yajl_parser_wrapper * wrapper;
    yajl_parser_config cfg;
    VALUE opts, obj;
    int allowComments = 1, checkUTF8 = 1, symbolizeKeys = 0;

    /* Scan off config vars */
    if (rb_scan_args(argc, argv, "01", &opts) == 1) {
        Check_Type(opts, T_HASH);

        if (rb_hash_aref(opts, sym_allow_comments) == Qfalse) {
            allowComments = 0;
        }
        if (rb_hash_aref(opts, sym_check_utf8) == Qfalse) {
            checkUTF8 = 0;
        }
        if (rb_hash_aref(opts, sym_symbolize_keys) == Qtrue) {
            symbolizeKeys = 1;
        }
    }
    cfg = (yajl_parser_config){allowComments, checkUTF8};

    obj = Data_Make_Struct(klass, yajl_parser_wrapper, yajl_parser_wrapper_mark, yajl_parser_wrapper_free, wrapper);
    wrapper->parser = yajl_alloc(&callbacks, &cfg, NULL, (void *)obj);
    wrapper->nestedArrayLevel = 0;
    wrapper->nestedHashLevel = 0;
    wrapper->objectsFound = 0;
    wrapper->symbolizeKeys = symbolizeKeys;
    wrapper->builderStack = rb_ary_new();
    wrapper->parse_complete_callback = Qnil;
    rb_obj_call_init(obj, 0, 0);
    return obj;
}

/*
 * Document-method: initialize
 *
 * call-seq: new([:symbolize_keys => true, [:allow_comments => false[, :check_utf8 => false]]])
 *
 * :symbolize_keys will turn hash keys into Ruby symbols, defaults to false.
 *
 * :allow_comments will turn on/off the check for comments inside the JSON stream, defaults to true.
 *
 * :check_utf8 will validate UTF8 characters found in the JSON stream, defaults to true.
 */
static VALUE rb_yajl_parser_init(int argc, VALUE * argv, VALUE self) {
    return self;
}

/*
 * Document-method: parse
 *
 * call-seq:
 *  parse(input, buffer_size=8092)
 *  parse(input, buffer_size=8092) { |obj| ... }
 *
 * +input+ can either be a string or an IO to parse JSON from
 *
 * +buffer_size+ is the size of chunk that will be parsed off the input (if it's an IO) for each loop of the parsing process.
 * 8092 is a good balance between the different types of streams (off disk, off a socket, etc...), but this option
 * is here so the caller can better tune their parsing depending on the type of stream being passed.
 * A larger read buffer will perform better for files off disk, where as a smaller size may be more efficient for
 * reading off of a socket directly.
 *
 * If a block was passed, it's called when an object has been parsed off the stream. This is especially
 * usefull when parsing a stream of multiple JSON objects.
 *
 * NOTE: you can optionally assign the +on_parse_complete+ callback, and it will be called the same way the optional
 * block is for this method.
*/
static VALUE rb_yajl_parser_parse(int argc, VALUE * argv, VALUE self) {
    yajl_status stat;
    yajl_parser_wrapper * wrapper;
    VALUE rbufsize, input, blk;
    unsigned int len;
    const char * cptr;

    GetParser(self, wrapper);

    /* setup our parameters */
    rb_scan_args(argc, argv, "11&", &input, &rbufsize, &blk);
    if (NIL_P(rbufsize)) {
        rbufsize = INT2FIX(READ_BUFSIZE);
    } else {
        Check_Type(rbufsize, T_FIXNUM);
    }
    if (!NIL_P(blk)) {
        rb_yajl_parser_set_complete_cb(self, blk);
    }

    if (TYPE(input) == T_STRING) {
        cptr = RSTRING_PTR(input);
        len = RSTRING_LEN(input);
        yajl_parse_chunk((const unsigned char*)cptr, len, wrapper->parser);
    } else if (rb_respond_to(input, intern_io_read)) {
        VALUE parsed = rb_str_new(0, FIX2LONG(rbufsize));
        while (rb_funcall(input, intern_io_read, 2, rbufsize, parsed) != Qnil) {
            cptr = RSTRING_PTR(parsed);
            len = RSTRING_LEN(parsed);
            yajl_parse_chunk((const unsigned char*)cptr, len, wrapper->parser);
        }
    } else {
        rb_raise(cParseError, "input must be a string or IO");
    }

    /* parse any remaining buffered data */
    stat = yajl_parse_complete(wrapper->parser);

    if (wrapper->parse_complete_callback != Qnil) {
        yajl_check_and_fire_callback((void *)self);
        return Qnil;
    }

    return rb_ary_pop(wrapper->builderStack);
}

/*
 * Document-method: parse_chunk
 *
 * call-seq: parse_chunk(string_chunk)
 *
 * +string_chunk+ can be a partial or full JSON string to push on the parser.
 *
 * This method will throw an exception if the +on_parse_complete+ callback hasn't been assigned yet.
 * The +on_parse_complete+ callback assignment is required so the user can handle objects that have been
 * parsed off the stream as they're found.
 */
static VALUE rb_yajl_parser_parse_chunk(VALUE self, VALUE chunk) {
    yajl_parser_wrapper * wrapper;
    unsigned int len;

    GetParser(self, wrapper);
    if (NIL_P(chunk)) {
        rb_raise(cParseError, "Can't parse a nil string.");
        return Qnil;
    }

    if (wrapper->parse_complete_callback != Qnil) {
        const char * cptr = RSTRING_PTR(chunk);
        len = RSTRING_LEN(chunk);
        yajl_parse_chunk((const unsigned char*)cptr, len, wrapper->parser);
    } else {
        rb_raise(cParseError, "The on_parse_complete callback isn't setup, parsing useless.");
    }

    return Qnil;
}

/*
 * Document-method: on_parse_complete=
 *
 * call-seq: on_parse_complete = Proc.new { |obj| ... }
 *
 * This callback setter allows you to pass a Proc/lambda or any other object that responds to #call.
 *
 * It will pass a single parameter, the ruby object built from the last parsed JSON object
 */
static VALUE rb_yajl_parser_set_complete_cb(VALUE self, VALUE callback) {
    yajl_parser_wrapper * wrapper;
    GetParser(self, wrapper);
    wrapper->parse_complete_callback = callback;
    return Qnil;
}

/*
 * Document-class: Yajl::Encoder
 *
 * This class contains methods for encoding a Ruby object into JSON, streaming it's output into an IO object.
 * The IO object need only respond to #write(str)
 * The JSON stream created is written to the IO in chunks, as it's being created.
 */

/*
 * Document-method: new
 *
 * call-seq: initialize([:pretty => false[, :indent => '  '][, :terminator => "\n"]])
  *
  * :pretty will enable/disable beautifying or "pretty priting" the output string.
  *
  * :indent is the character(s) used to indent the output string.
  *
  * :terminator allows you to specify a character to be used as the termination character after a full JSON string has been generated by
  * the encoder. This would be especially useful when encoding in chunks (via a block or callback during the encode process), to be able to
  * determine when the last chunk of the current encode is sent.
  * If you specify this option to be nil, it will be ignored if encoding directly to an IO or simply returning a string. But if a block is used,
  * the encoder will still pass it - I hope that makes sense ;).
 */
static VALUE rb_yajl_encoder_new(int argc, VALUE * argv, VALUE klass) {
    yajl_encoder_wrapper * wrapper;
    yajl_gen_config cfg;
    VALUE opts, obj, indent;
    const char * indentString = "  ";
    int beautify = 0;

    /* Scan off config vars */
    if (rb_scan_args(argc, argv, "01", &opts) == 1) {
        Check_Type(opts, T_HASH);

        if (rb_hash_aref(opts, sym_pretty) == Qtrue) {
            beautify = 1;
            indent = rb_hash_aref(opts, sym_indent);
            if (indent != Qnil) {
#ifdef HAVE_RUBY_ENCODING_H
                indent = rb_str_export_to_enc(indent, utf8Encoding);
#endif
                Check_Type(indent, T_STRING);
                indentString = RSTRING_PTR(indent);
            }
        }
    }
    cfg = (yajl_gen_config){beautify, indentString};

    obj = Data_Make_Struct(klass, yajl_encoder_wrapper, yajl_encoder_wrapper_mark, yajl_encoder_wrapper_free, wrapper);
    wrapper->encoder = yajl_gen_alloc(&cfg, NULL);
    wrapper->on_progress_callback = Qnil;
    if (opts != Qnil && rb_funcall(opts, intern_has_key, 1, sym_terminator) == Qtrue) {
        wrapper->terminator = rb_hash_aref(opts, sym_terminator);
#ifdef HAVE_RUBY_ENCODING_H
        if (TYPE(wrapper->terminator) == T_STRING) {
            wrapper->terminator = rb_str_export_to_enc(wrapper->terminator, utf8Encoding);
        }
#endif
    } else {
        wrapper->terminator = 0;
    }
    rb_obj_call_init(obj, 0, 0);
    return obj;
}

/*
 * Document-method: initialize
 *
 * call-seq: initialize([:pretty => false[, :indent => '  '][, :terminator => "\n"]])
 *
 * :pretty will enable/disable beautifying or "pretty priting" the output string.
 *
 * :indent is the character(s) used to indent the output string.
 *
 * :terminator allows you to specify a character to be used as the termination character after a full JSON string has been generated by
 * the encoder. This would be especially useful when encoding in chunks (via a block or callback during the encode process), to be able to
 * determine when the last chunk of the current encode is sent.
 * If you specify this option to be nil, it will be ignored if encoding directly to an IO or simply returning a string. But if a block is used,
 * the encoder will still pass it - I hope that makes sense ;).
 */
static VALUE rb_yajl_encoder_init(int argc, VALUE * argv, VALUE self) {
    return self;
}

/*
 * Document-method: encode
 *
 * call-seq: encode(obj[, io[, &block]])
 *
 * +obj+ is the Ruby object to encode to JSON
 *
 * +io+ is an optional IO used to stream the encoded JSON string to.
 * If +io+ isn't specified, this method will return the resulting JSON string. If +io+ is specified, this method returns nil
 *
 * If an optional block is passed, it's called when encoding is complete and passed the resulting JSON string
 *
 * It should be noted that you can reuse an instance of this class to continue encoding multiple JSON
 * to the same stream. Just continue calling this method, passing it the same IO object with new/different
 * ruby objects to encode. This is how streaming is accomplished.
 */
static VALUE rb_yajl_encoder_encode(int argc, VALUE * argv, VALUE self) {
    yajl_encoder_wrapper * wrapper;
    const unsigned char * buffer;
    unsigned int len;
    VALUE obj, io, blk, outBuff;

    GetEncoder(self, wrapper);

    rb_scan_args(argc, argv, "11&", &obj, &io, &blk);

    if (blk != Qnil) {
        wrapper->on_progress_callback = blk;
    }

    /* begin encode process */
    yajl_encode_part(wrapper, obj, io);

    /* just make sure we output the remaining buffer */
    yajl_gen_get_buf(wrapper->encoder, &buffer, &len);
    outBuff = rb_str_new((const char *)buffer, len);
#ifdef HAVE_RUBY_ENCODING_H
    rb_enc_associate(outBuff, utf8Encoding);
#endif
    yajl_gen_clear(wrapper->encoder);

    if (io != Qnil) {
        rb_io_write(io, outBuff);
        if (wrapper->terminator != 0 && wrapper->terminator != Qnil) {
            rb_io_write(io, wrapper->terminator);
        }
        return Qnil;
    } else if (blk != Qnil) {
        rb_funcall(blk, intern_call, 1, outBuff);
        if (wrapper->terminator != 0) {
            rb_funcall(blk, intern_call, 1, wrapper->terminator);
        }
        return Qnil;
    } else {
        if (wrapper->terminator != 0 && wrapper->terminator != Qnil) {
            rb_str_concat(outBuff, wrapper->terminator);
        }
        return outBuff;
    }
    return Qnil;
}

/*
 * Document-method: on_progress
 *
 * call-seq: on_progress = Proc.new {|str| ...}
 *
 * This callback setter allows you to pass a Proc/lambda or any other object that responds to #call.
 *
 * It will pass the caller a chunk of the encode buffer after it's reached it's internal max buffer size (defaults to 8kb).
 * For example, encoding a large object that would normally result in 24288 bytes of data will result in 3 calls to this callback (assuming the 8kb default encode buffer).
 */
static VALUE rb_yajl_encoder_set_progress_cb(VALUE self, VALUE callback) {
    yajl_encoder_wrapper * wrapper;
    GetEncoder(self, wrapper);
    wrapper->on_progress_callback = callback;
    return Qnil;
}


/* JSON Gem compatibility */

/*
 * Document-class: Hash
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of Hash to JSON
 */
static VALUE rb_yajl_json_ext_hash_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: Array
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of Array to JSON
 */
static VALUE rb_yajl_json_ext_array_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: Fixnum
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of Fixnum to JSON
 */
static VALUE rb_yajl_json_ext_fixnum_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: Float
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of Float to JSON
 */
static VALUE rb_yajl_json_ext_float_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: String
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of TrueClass to JSON
 */
static VALUE rb_yajl_json_ext_string_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: TrueClass
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of TrueClass to JSON
 */
static VALUE rb_yajl_json_ext_true_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: FalseClass
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of FalseClass to JSON
 */
static VALUE rb_yajl_json_ext_false_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: NilClass
 */
/*
 * Document-method: to_json
 *
 * call-seq: to_json(encoder=Yajl::Encoder.new)
 *
 * +encoder+ is an existing Yajl::Encoder used to encode JSON
 *
 * Encodes an instance of NilClass to JSON
 */
static VALUE rb_yajl_json_ext_nil_to_json(int argc, VALUE * argv, VALUE self) {
  YAJL_RB_TO_JSON;
}

/*
 * Document-class: Yajl::Encoder
 */
/*
 * Document-method: enable_json_gem_compatability
 *
 * call-seq: enable_json_gem_compatability
 *
 * Enables the JSON gem compatibility API
 */
static VALUE rb_yajl_encoder_enable_json_gem_ext(VALUE klass) {
    rb_define_method(rb_cHash, "to_json", rb_yajl_json_ext_hash_to_json, -1);
    rb_define_method(rb_cArray, "to_json", rb_yajl_json_ext_array_to_json, -1);
    rb_define_method(rb_cFixnum, "to_json", rb_yajl_json_ext_fixnum_to_json, -1);
    rb_define_method(rb_cFloat, "to_json", rb_yajl_json_ext_float_to_json, -1);
    rb_define_method(rb_cString, "to_json", rb_yajl_json_ext_string_to_json, -1);
    rb_define_method(rb_cTrueClass, "to_json", rb_yajl_json_ext_true_to_json, -1);
    rb_define_method(rb_cFalseClass, "to_json", rb_yajl_json_ext_false_to_json, -1);
    rb_define_method(rb_cNilClass, "to_json", rb_yajl_json_ext_nil_to_json, -1);
    return Qnil;
}


/* Ruby Extension initializer */
void Init_yajl_ext() {
    mYajl = rb_define_module("Yajl");

    cParseError = rb_define_class_under(mYajl, "ParseError", rb_eStandardError);
    cEncodeError = rb_define_class_under(mYajl, "EncodeError", rb_eStandardError);

    cParser = rb_define_class_under(mYajl, "Parser", rb_cObject);
    rb_define_singleton_method(cParser, "new", rb_yajl_parser_new, -1);
    rb_define_method(cParser, "initialize", rb_yajl_parser_init, -1);
    rb_define_method(cParser, "parse", rb_yajl_parser_parse, -1);
    rb_define_method(cParser, "parse_chunk", rb_yajl_parser_parse_chunk, 1);
    rb_define_method(cParser, "<<", rb_yajl_parser_parse_chunk, 1);
    rb_define_method(cParser, "on_parse_complete=", rb_yajl_parser_set_complete_cb, 1);

    cEncoder = rb_define_class_under(mYajl, "Encoder", rb_cObject);
    rb_define_singleton_method(cEncoder, "new", rb_yajl_encoder_new, -1);
    rb_define_method(cEncoder, "initialize", rb_yajl_encoder_init, -1);
    rb_define_method(cEncoder, "encode", rb_yajl_encoder_encode, -1);
    rb_define_method(cEncoder, "on_progress=", rb_yajl_encoder_set_progress_cb, 1);

    rb_define_singleton_method(cEncoder, "enable_json_gem_compatability", rb_yajl_encoder_enable_json_gem_ext, 0);

    intern_io_read = rb_intern("read");
    intern_call = rb_intern("call");
    intern_keys = rb_intern("keys");
    intern_to_s = rb_intern("to_s");
    intern_to_json = rb_intern("to_json");
    intern_to_sym = rb_intern("to_sym");
    intern_has_key = rb_intern("has_key?");
    intern_as_json = rb_intern("as_json");

    sym_allow_comments = ID2SYM(rb_intern("allow_comments"));
    sym_check_utf8 = ID2SYM(rb_intern("check_utf8"));
    sym_pretty = ID2SYM(rb_intern("pretty"));
    sym_indent = ID2SYM(rb_intern("indent"));
    sym_terminator = ID2SYM(rb_intern("terminator"));
    sym_symbolize_keys = ID2SYM(rb_intern("symbolize_keys"));

#ifdef HAVE_RUBY_ENCODING_H
    utf8Encoding = rb_utf8_encoding();
#endif
}
