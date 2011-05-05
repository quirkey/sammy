(function ($) {

    Sammy = Sammy || {};





    /**
    * Copyright (c) 2010 Maxim Vasiliev
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in
    * all copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    * THE SOFTWARE.
    *
    * @author Maxim Vasiliev
    * Date: 09.09.2010
    * Time: 19:02:33
    */

    (function () {
        /**
        * Returns form values represented as Javascript object
        * "name" attribute defines structure of resulting object
        *
        * @param rootNode {Element|String} root form element (or it's id)
        * @param delimiter {String} structure parts delimiter defaults to '.'
        * @param skipEmpty {Boolean} should skip empty text values, defaults to true
        */
        window.form2object = function (rootNode, delimiter, skipEmpty) {
            if (typeof skipEmpty == 'undefined' || skipEmpty == null) skipEmpty = true;
            if (typeof delimiter == 'undefined' || delimiter == null) delimiter = '.';
            rootNode = typeof rootNode == 'string' ? document.getElementById(rootNode) : rootNode;

            var formValues = getFormValues(rootNode);
            var result = {};
            var arrays = {};

            for (var i = 0; i < formValues.length; i++) {
                var value = formValues[i].value;
                if (skipEmpty && value === '') continue;

                var name = formValues[i].name;
                var nameParts = name.split(delimiter);

                var currResult = result;
                var arrayKey = '';

                for (var j = 0; j < nameParts.length; j++) {
                    var namePart = nameParts[j];

                    var arrName = '';

                    if (namePart.indexOf('[]') > -1 && j == nameParts.length - 1) {
                        arrayKey = arrName = namePart.substr(0, namePart.indexOf('['));

                        if (!currResult[arrName]) currResult[arrName] = [];
                        currResult[arrName].push(value);
                    }
                    else {
                        if (namePart.indexOf('[') > -1) {
                            arrName = namePart.substr(0, namePart.indexOf('['));
                            var arrIdx = namePart.replace(/^[a-z]+\[|\]$/gi, '');
                            arrayKey = arrayKey + arrName + arrIdx;

                            /*
                            * Because arrIdx in field name can be not zero-based and step can be
                            * other than 1, we can't use them in target array directly.
                            * Instead we're making a hash where key is arrIdx and value is a reference to
                            * added array element
                            */

                            if (!arrays[arrayKey]) arrays[arrayKey] = {};
                            if (!currResult[arrName]) currResult[arrName] = [];

                            if (j == nameParts.length - 1) {
                                currResult[arrName].push(value);
                            }
                            else {
                                if (!arrays[arrayKey][arrIdx]) {
                                    currResult[arrName].push({});
                                    arrays[arrayKey][arrIdx] = currResult[arrName][currResult[arrName].length - 1];
                                }
                            }

                            currResult = arrays[arrayKey][arrIdx];
                        }
                        else {
                            if (j < nameParts.length - 1) /* Not the last part of name - means object */
                            {
                                if (!currResult[namePart]) currResult[namePart] = {};
                                currResult = currResult[namePart];
                            }
                            else {
                                currResult[namePart] = value;
                            }
                        }
                    }
                }
            }

            return result;
        }

        function getFormValues(rootNode) {
            var result = [];
            var currentNode = rootNode.firstChild;

            while (currentNode) {
                if (currentNode.nodeName.match(/INPUT|SELECT|TEXTAREA/i)) {
                    var fieldValue = getFieldValue(currentNode);
                    if (fieldValue !== null) result.push({ name: currentNode.name, value: fieldValue });
                }
                else {
                    var subresult = getFormValues(currentNode);
                    result = result.concat(subresult);
                }

                currentNode = currentNode.nextSibling;
            }

            return result;
        }

        function getFieldValue(fieldNode) {
            switch (fieldNode.nodeName) {
                case 'INPUT':
                case 'TEXTAREA':
                    switch (fieldNode.type.toLowerCase()) {
                        case 'radio':
                        case 'checkbox':
                            if (fieldNode.checked) return fieldNode.value;
                            break;

                        case 'button':
                        case 'reset':
                        case 'submit':
                        case 'image':
                            return '';
                            break;

                        default:
                            return fieldNode.value;
                            break;
                    }
                    break;

                case 'SELECT':
                    return getSelectedOptionValue(fieldNode);
                    break;

                default:
                    break;
            }

            return null;
        }

        function getSelectedOptionValue(selectNode) {
            var multiple = selectNode.multiple;
            if (!multiple) return selectNode.value;

            var result = [];
            for (var options = selectNode.getElementsByTagName("option"), i = 0, l = options.length; i < l; i++) {
                if (options[i].selected) result.push(options[i].value);
            }

            return result;
        }

        /**
        * @deprecated Use form2object() instead
        * @param rootNode
        * @param delimiter
        */
        window.form2json = window.form2object;

    })();








    Sammy.Form2JSON = function (app) {

        app._parseFormParams = function (form) { return form2object(form[0]); };

    };

})(jQuery);