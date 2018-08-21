(function () {
  'use strict';

  var themeDark = {
    name: 'dark',
    background: '#282923',
    text: '#f7f7f7',
    linesCount: '#666',
    colors: {
      orange: '#fd9621',
      green: '#a6e22c',
      darkgreen: '#438c26',
      purple: '#ac80ff',
      yellow: '#e7db74',
      red: '#f92472',
      blue: '#67d8ef',
      grey: '#999',
    },
    styles: {
      html: {
        tag: 'red',
        name: 'green',
        val: 'yellow', 
        comment: 'grey'
      }, 
      js: {
        comment: 'darkgreen',
        comment_ml: 'grey',
        self: 'orange',
        def: 'blue',
        args: 'orange',
        method: 'green',
        number: 'purple',
        string: 'yellow',
        operator: 'red',
        keyword: 'red',
        blockname: 'blue|i',
        globalname: 'blue|i',
        func: 'blue',
        boolean: 'purple'
      },
      css: {
        tag: 'red',
        classname: 'green',
        id: 'orange',
        name: 'blue|i',
        val: 'blue|i',
        valstr: 'yellow',
        valunit: 'red',
        valnum: 'purple',
        valhash: 'grey',
        comment: 'grey',
      }
    }
  };

  var themeLight = {
    name: 'light',
    background: '#eee',
    text: '#333',
    linesCount: '#999',
    colors: {
      lightblue: '#07a',
      green: '#690',
      purple: '#905',
      red: '#DD4A68',
      grey: '#333',
      brown: '#a67f59',
      lightgrey:'#708090'
    },
    styles: {
      html: {
        tag: 'purple',
        name: 'green',
        val: 'lightblue', 
        comment: 'grey'
      }, 
      js: {
        comment_ml: 'lightgrey',
        comment:'lightgrey',
        self: 'lightblue',
        def: 'lightblue',
        args: 'grey',
        method: 'red',
        number: 'purple',
        string: 'green',
        operator: 'brown',
        keyword: 'lightblue',
        blockname: 'lightblue',
        globalname: 'grey',
        func: 'red',
        boolean: 'purple'
      },
      css: {
        tag: 'green',
        classname: 'green',
        id: 'green',
        name: 'purple',
        val: 'grey',
        valstr: 'brown',
        valunit: 'grey',
        valnum: 'purple',
        valhash: 'lightblue',
        comment: 'lightgrey'
      }
    }
  };

  var colorThemes = [themeDark, themeLight];

  /* */
  function appendThemesStyles (themes, mainClass, themePrefix) {
    var styleId = 'simple-higlight-styles';
    // Styles aready added
    if (document.getElementById(styleId)) {
      return;
    }

    var cssArr = [];
    cssArr.push('code'+mainClass+' { font-size: 16px; padding: 15px;line-height:1.4;');
    cssArr.push('display: block; margin: 5px; border-radius:4px}');
    cssArr.push(mainClass + ' > pre { margin: 0;font-family: Monospace;overflow-x: auto; }');
    cssArr.push(mainClass +' .sh-lines{float:left;line-height:inherit;text-align:right;margin-right:15px;left:10px;');
    cssArr.push('border-right:1px solid #ccc; padding-right: 5px;user-select: none;}');

    for (var t = 0; t < themes.length; t++) {
        createThemeCss(themes[t], cssArr);
    }
    var css = cssArr.join('\n');
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = styleId;
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);

    function createThemeCss(theme, css) {
      var prefixName = mainClass + themePrefix + theme.name;
      css.push(prefixName + ' { background: '+theme.background+'}');
      css.push(prefixName + ' > pre {color: '+theme.text+'}');
      css.push(prefixName + ' .sh-lines {color: '+theme.linesCount+';border-color:'+theme.linesCount+'}');

      var s, m, color, font, style, lang;
      for (var lang in theme.styles) {
        for (var type in theme.styles[lang]) {
          s = theme.styles[lang][type].split('|');
          color = s[0];
          font = s[1];
          style = 'color:' + theme.colors[color];
          // If additional option exists
          if (font) {
            for (m = 0; m < font.length; m++) {
              if (font[m] === 'i') {
                style += ';font-style: italic';
              } else if(font[m] === 'b') {
                style += ';font-weight: bold';
              }
            }
          }
          css.push(prefixName+' .sh-'+lang+'-'+type+' {'+style+'}');
        }
      }
    }
  }

  function parseRegExp(obj) {
    if (!obj.text) {
      return ''
    }
    var text = obj.text;
    var reg = obj.reg;
    var matchFunc = obj.match;
    var noMatchFunc = obj.noMatch || function(t) { return t};

    var processed = [];
    var index = 0;
    var match;
    var nonRegLen;

    while (match = reg.exec(text)) {
      if (nonRegLen = match.index - index) {
        processed.push(noMatchFunc(text.substr(index, nonRegLen), match));
      }
      // Apply user function to current match
      processed.push(matchFunc(match));
      index = match.index + match[0].length;
    }

    // Trailing characters
    if (index < text.length - 1) {
      processed.push(noMatchFunc(text.substr(index), {}));
    }

    return processed.join('');
  }

  function applyStyle(word, tokenType) {
  	return ['<span class="sh-', tokenType, '">', word, '</span>'].join('');	
  }

  function generateKeywords() {
    var tokens = {
      self: 'this',
      blockname: 'class|function|constructor',
      globalname: 'document|window|console',
      def: 'var|const|let',
    };
    tokens.keyword = 'return|if|else|for|while|break|continue|';
    tokens.keyword += 'case|do|while|switch|extends|implements|new|public|private|static';
    var keywords = {};
    var words;
    for (var token in tokens) {
      words = tokens[token].split('|');
      for (var i = 0; i < words.length; i++) {
        keywords[words[i]] = 'js-'+ token;
      }
    }
    return keywords;
  }


  var JsParser = {
    keywords: generateKeywords(),
    nextWordModifiers: {
      'class': 'js-method',
      'extends': 'js-method',
      'implements': 'js-method',
      'function': 'js-method',
      'new': 'js-globalname',
      'console': 'js-globalname',
    },
    regEmpty: /^\s+$/,
    regNumeric: /^\-?[0-9]+$/,
    regBool: /^true|false$/,
    regNameChar: /[a-zA-Z0-9\_]/,
    regOperator: /^[\!\&\+\-\*\|\/\>\<\=]+$/,

    openBlockLevel: 0,
    classLevel: null,
    isClass: false,
    isArguments: false,
    isFunctionDefinition: false,
    isComment: false,
  };

  // All token names
  var TOKENS = {
    comment:'js-comment',
    self: 'js-self',
    def: 'js-def',
    args: 'js-args',
    method: 'js-method',
    number: 'js-number',
    string: 'js-string',
    operator: 'js-operator',
    keyword: 'js-keyword',
    blockname: 'js-blockname',
    globalname: 'js-globalname',
    functionCall: 'js-func',
    boolean: 'js-boolean'
  };

  JsParser.parse = function(text) {
    // Reset counters
    this.reset();
    var lines = text.split('\n');
    var readyLines = [];
    for (var line = 0; line < lines.length; line++) {
      readyLines.push(this.processLine(lines[line]));
    }
    return readyLines.join('\n');
  };


  JsParser.processLine = function(line) {
    var char;
    var processed = [];
    var wordStart = false;
    var word = [];
    var wordString;
    var nextWordModifier;
    var startFrom = 0;

    //Check if line commented
    if (this.isComment) {
      var commentEnd = line.indexOf('*/');
      if (commentEnd === -1) {
        return applyStyle(line, TOKENS.comment);
      } else {
        this.isComment = false;
        startFrom = commentEnd + 2;
        processed.push(applyStyle(line.substr(0, startFrom), TOKENS.comment));
      }
    }

    if (this.isMultilineString) {
      var stringEnd = line.substr(i).indexOf('`');
      if (stringEnd === -1) {
        return applyStyle(line, TOKENS.string);
      } else {
        this.isMultilineString = false;
        startFrom = stringEnd + 2;
        processed.push(applyStyle(line.substr(0, startFrom), TOKENS.string));
      }
    } 

    for (var i = startFrom; i < line.length; i++) {
      char = line[i];
      if (this.isWordChar(char)) {
        if (!wordStart) {
          wordStart = true;
        }
        word.push(char);
      } else {
        if (wordStart) {
          // End of word
          wordString = word.join('');
          // Function call
          if (char === '(' && ! this.isFunctionDefinition && !this.isClassMethod()) {
            nextWordModifier = TOKENS.functionCall;
          }

          // Object method assignment
          if (processed[processed.length-1] === '.') {
            // Find next not space char
            var nextChar = this.findNextCharIndex(line, i+1);
            // If its object propety assignemt
            if (line[nextChar] === '=') {
              var nextWordStart = this.findNextCharIndex(line, nextChar + 1);
              if (line.substr(nextWordStart, 8) === 'function') {
                nextWordModifier = TOKENS.method;
              }
            }

          }
          processed.push(this.getWord(wordString, nextWordModifier));
          nextWordModifier = this.nextWordRule(wordString);
          wordStart = false;
          word = [];

          // Process next words in current block leve as method names
          if (wordString === 'class') {
            this.classLevel = this.openBlockLevel + 1;
            this.isClass = true;
          }

          if (wordString === 'function') {
            this.isFunctionDefinition = true;
          }
        }

        switch (char) {
          // Strings
          case '"':
          case "'":
          case "`":
            // Find next same char and close this range as string
            var closeString = line.substr(i+1).indexOf(char);
            if (closeString !== -1) {
                processed.push(applyStyle(line.substr(i, closeString+2), TOKENS.string));
                i += closeString+1;
                continue;
            } else {
              if (char === '`') {
                this.isMultilineString = true;
              }
              processed.push(applyStyle(line.substr(i), TOKENS.string));
              // Exit line processing
              i = line.length;
              continue;
            }
            break;

          case '/':
            var next = line[i+1];
            if (next) {
              if (next === '/') {
                // get all the rest of line and apply comment style
                processed.push(applyStyle(line.substr(i), TOKENS.comment));
                // Exit line processing
                i = line.length;
                continue;
              } else if (next === '*') { // Multiline comment
                // If comment not ended on same line
                if (line.substr(i).indexOf('*/') === -1) {
                  this.isComment = true;
                  processed.push(applyStyle(line.substr(i), TOKENS.comment));
                  // Exit line processing
                  i = line.length;
                  continue;
                }

              }
            }
            break;

          case '(':
            if (this.isClassMethod() || this.isFunctionDefinition) {
              this.isArguments = true;
              // Recet function and class names
              nextWordModifier = null;
            }
            break;
          case ')':
            if (this.isClassMethod() || this.isFunctionDefinition) {
              this.isArguments = false;
            }
            break;
          case '{':
            this.openBlockLevel++;
            this.isFunctionDefinition = false;
            break;
          case '}':
            if (this.isClassMethod()) {
              this.isClass = false;
            }
            this.openBlockLevel--;
            break;
          case '=':
            var next = line[i+1];
            if (next && next === '>') {
              var nextChar = this.findNextCharIndex(line, i+2);
              // Is arrow function
              if (line[nextChar] === '{') {
                processed.push(applyStyle('=>', TOKENS.blockname));
                //skip next char
                i++;
                continue;
              }
            }
            break;
        }

        processed.push(this.getCharStyle(char));
      }
    }

    return processed.join('');
  };

  JsParser.findNextCharIndex = function(line, start) {
    for (var i = start; i < line.length; i++) {
      if (!(this.regEmpty.test(line[i]))) {
        return i;
      }
    }
  };

  JsParser.isClassMethod = function() {
    return this.isClass && this.classLevel === this.openBlockLevel;
  };

  JsParser.getWord = function(word, customStyle) {
    var token = this.keywords[word] || customStyle; 

    if (!token) {
      if (this.isArguments) {
        token = TOKENS.args;
      } else if (this.isClassMethod()) {
        // Methods
        token = TOKENS.method;
      } else if (this.regNumeric.test(word)) {
        // Numbers
        token = TOKENS.number;
      } else if (this.regBool.test(word)) {
        token = TOKENS.boolean;
      }
    }

    if (!token) {
      var firstCharCode = word.charCodeAt(0);
      // Upper case letter consider as global object
      if (firstCharCode > 64 && firstCharCode < 91) {
        token = TOKENS.globalname;
      }
    }

    if (token) {
      return applyStyle(word, token);
    } else {
      return word;
    }
  };

  JsParser.nextWordRule = function(keyword) {
    if (this.nextWordModifiers.hasOwnProperty(keyword)) {
      return this.nextWordModifiers[keyword];
    } else {
      return null;
    }
  };

  JsParser.isWordChar = function(char) {
    return this.regNameChar.test(char)
  };

  JsParser.getCharStyle = function(char) {
    if (this.regOperator.test(char)) {
      return applyStyle(char, TOKENS.operator);
    } else {
      return char;
    }
  };

  JsParser.reset = function() {
    this.openBlockLevel = 0;
    this.classLevel = null;
    this.isClass = false;
    this.isArguments = false;
    this.isFunctionDefinition = false;
    this.isComment = false;
  };

  var CssParser = {
    regCss: /([^\s][^\{]*?[^\s]?)(\s?)(\{)([^\}]*?)(\})/g,
    regSelector: /(\#?\.?)([a-zA-Z0-9\-]+)/g,
    regValueString: /(([\'\"])[^\2]*?\2)/g,
    regValueColor: /(\#)([0-9a-eA-E]{3,6})/,
    regValueNumber: /([0-9\.]+)([a-zA-Z]+)?/,

    TOKENS: {
      selectorTag: 'css-tag',
      selectorClass: 'css-classname',
      selectorId: 'css-id',
      ruleName: 'css-name',
      ruleVal: 'css-val',
      ruleValString: 'css-valstr',
      ruleValUnit: 'css-valunit',
      ruleValNum: 'css-valnum',
      ruleValHash: 'css-valhash',
    }
  };

  CssParser.parse = function(text) {
    return parseRegExp({
      reg: this.regCss,
      text: text,
      match: function(css) {
        return [
          this.parseSelector(css[1]),
          css[2],
          css[3],
          this.parseRules(css[4]),
          css[5],
        ].join('');
      }.bind(this)
    });
  };

  CssParser.parseSelector = function(text) {
    return parseRegExp({
      reg: this.regSelector, 
      text: text, 
      match: function(path) {
        var token = this.TOKENS.selectorTag;
        if (path[1] === '.') {
          token = this.TOKENS.selectorClass;
        } else if(path[1] === '#') {
          token = this.TOKENS.selectorId;
        }
        return applyStyle(path[0], token);
      }.bind(this)
    });
  };

  CssParser.parseRules = function(text) {
    var rules = [];
    // Split by separate rules
    text.split(';').forEach(function(rule) {
      // Split into rule name and value
      var parts = rule.split(':');
      if (parts.length < 2) {
        rules.push(rule);
        return;
      }
      if (parts.length > 2) {
        // Situation when semicolon missed  before line break
        var fixedRules = rule.split('\n');
        var fixed = [];
        for (var i=0;i < fixedRules.length;i++) {
          if (!fixedRules[i]) {
            fixed.push('');
            continue;
          }
          var parts = fixedRules[i].split(':');
          fixed.push([
            applyStyle(parts[0], this.TOKENS.ruleName),
            this.parseRuleValue(parts[1])
          ].join(':'));
          
        }
        rules.push(fixed.join('\n'));
        return;
      } else {
        rules.push([
          applyStyle(parts[0], this.TOKENS.ruleName),
          this.parseRuleValue(parts[1])
        ].join(':'));
      }
    }.bind(this));

    return rules.join(';');
  };

  CssParser.parseRuleValue = function(value) {
    // Separate string and non string values
    return parseRegExp({
      reg: this.regValueString,
      text: value,
      match: this.parseRuleString.bind(this),
      noMatch: this.parseRuleNonString.bind(this)
    });
  };

  CssParser.parseRuleString = function(match) {
    return applyStyle(match[1], this.TOKENS.ruleValString);
  };

  CssParser.parseRuleNonString = function(rule) {
    // Split non string by white space
    var ready = [];
    var parts = rule.split(' ');
    var part;
    var match;
    for (var i = 0; i < parts.length; i++) {
      part = parts[i];
      if (!part) {
        ready.push(part);
        continue;
      }

      if (match = this.regValueColor.exec(part)) {
        ready.push([
          applyStyle(match[1], this.TOKENS.ruleValHash),
          applyStyle(match[2], this.TOKENS.ruleValNum)
        ].join(''));
        continue;
      }

      if (match = this.regValueNumber.exec(part)) {
        var num = [applyStyle(match[1], this.TOKENS.ruleValNum)];
        if (match[2]) {
          num.push(applyStyle(match[2], this.TOKENS.ruleValUnit));
        }
        ready.push(num.join(''));
        continue;
      }
      ready.push(applyStyle(part, this.TOKENS.ruleVal)); 
    }
    return ready.join(' ');
  };

  var HtmlParser = {
    regTags: /<[^\>]+>/g,
    regTagParts: /^(<\/?)([a-zA-Z\-0-9]+)([^\>]*?)(\/?>)$/,
    regAttrs: /([a-zA-Z\-\_\*\$]+)(((=)(([\'\"])[^\6]*?\6))|\s)?/g,
    TOKENS: {
      tag: 'html-tag',
      attrName: 'html-name',
      attrVal: 'html-val',
      comment: 'html-comment',
    }
  };

  HtmlParser.parse = function(html) {
    //Check for comment start
    var startComment = html.indexOf('<!--');
    var startFrom = (startComment !== -1) ? startComment + 4 : 0;
    var commentEnd = html.indexOf('-->');
    var end = (commentEnd !== -1) ? commentEnd - startFrom : undefined;
    html = html.substr(startFrom, end);

    //Unescape HTML special chars
    html = this.unescape(html);

    return parseRegExp({
      reg: this.regTags,
      text: html,
      match: this.parseHtmlTag.bind(this),
      noMatch: function(text, match) {
        // Process inline script and style tags
        var res;
        switch (match[0]) {
          case '</script>':
            res = '<span class="inline-js">'+JsParser.parse(text)+'</span>';
            break;
          case  '</style>':
            res = CssParser.parse(text);
            break;
          default:
            res = text;
        }
        return res;
      }
    });
  };

  HtmlParser.parseHtmlTag = function(tag) {
    var match = this.regTagParts.exec(tag[0]);
    if (!match) {
      return this.replaceHtmlChars(tag[0]);
    }
    var tagName = match[2];
    var tagAttrs = match[3];  
    return [
      this.replaceHtmlChars(match[1]), // < char
      applyStyle(tagName, this.TOKENS.tag),
      this.parseHtmlAttrs(tagAttrs),
      this.replaceHtmlChars(match[4]) // /> char
    ].join('');
  };

  HtmlParser.parseHtmlAttrs = function(attrs) {
    return parseRegExp({
      reg: this.regAttrs,
      text: attrs,
      match: this.highlightAttr.bind(this)
    });
  };

  HtmlParser.highlightAttr = function(attr) {
    var attrStr = [];

    // Attribute name
    attrStr.push(applyStyle(attr[1], this.TOKENS.attrName));
    // If attribute has value
    if (attr[4]) {
      // = char
      attrStr.push(attr[4]);
      // Attribute value
      attrStr.push(applyStyle(attr[5], this.TOKENS.attrVal));

    } else if(attr[2]) {
      // Empty space after attribute without value
      attrStr.push(attr[2]);
    }
    return attrStr.join('');
  };

  HtmlParser.replaceHtmlChars = function(text) {
    var replaceChars = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '&': '&amp;',
    };
    return text.replace(/\<|\>|\"|\&/g, function(match) { 
      return replaceChars[match];
    });
  };

  HtmlParser.unescape = function(html) {
    var el = document.createElement('div');
    return html.replace(/\&[#0-9a-z]+;/gi, function (enc) {
        el.innerHTML = enc;
        return el.innerText
    });
  };

  var SimpleHighlight = {
    mainClass: '.simple-highlight',
    themeClass: '.sh-theme-',
    themePrefix: 'sh-theme-',
    regEmpty: /^\s?$/,
  };

  SimpleHighlight.highlightCodeNode = function(codeNode) {
    // Get <PRE> tag wich contains code
    var preNode = codeNode.querySelector('pre');

    // If was already highlithed - skip
    if (!preNode || preNode.className.indexOf('sh-processed') !== -1) {
      return;
    }
    
    var lang = codeNode.getAttribute('lang') || 'js';

    var parsedCode = this.parseCode(preNode.innerHTML, lang);
    
    // Split code by lines
    var lines = parsedCode.split('\n');

    // Remove trailing empty lines from start and end
    while (lines.length && this.regEmpty.test(lines[0])) {
      lines.shift();
    }
    while (lines.length && this.regEmpty.test(lines[lines.length - 1])) {
      lines.pop();
    }

    if (!lines.length) {
      lines.push('//');
    }
   
    preNode.innerHTML = lines.join('\n');
    preNode.className = 'sh-processed';

    // remove other tags except PRE from CODE
    for (var i = 0; i < codeNode.childNodes.length; i++) {
      if (codeNode.childNodes[i] !== preNode) {
        codeNode.removeChild(codeNode.childNodes[i]);
      }
    }

    // Create lines 
    var lineEl = document.createElement('div');
    lineEl.className = 'sh-lines';
    var linesHtml = [];
    var linesCount = lines.length;
    for (i = 1; i <= linesCount; i++) {
      linesHtml.push(i);
    }
    lineEl.innerHTML = linesHtml.join('<br/>');
    codeNode.insertBefore(lineEl, preNode);

    //If no theme selected - apply default
    if (codeNode.className.indexOf(this.themePrefix) === -1) {
      codeNode.className = codeNode.className + ' ' + this.themePrefix + 'light';
    }
  };

  SimpleHighlight.highlightOnPage = function() {
    var codeNodes = document.querySelectorAll('code' + this.mainClass);
    if (!codeNodes.length) {
      return;
    }

    for (var i = 0; i < codeNodes.length; i++) {
      this.highlightCodeNode(codeNodes[i]);
    }
  };

  SimpleHighlight.parseCode = function(text, lang) {
    switch (lang) {
      case 'js':
        return JsParser.parse(text);
      case 'css':
        return CssParser.parse(text);
      case 'html':
        return HtmlParser.parse(text);
    }
    // No lang found
    return text;
  };

  // Include CSS on page
  appendThemesStyles(
    colorThemes, 
    SimpleHighlight.mainClass, 
    SimpleHighlight.themeClass
  );

  // Hightlight initially on dom ready
  document.addEventListener("DOMContentLoaded", function() {
    SimpleHighlight.highlightOnPage();
  });

  window.SimpleHighlight = function(node) {
    if (node) {
      SimpleHighlight.highlightCodeNode(node);  
    } else {
      SimpleHighlight.highlightOnPage();
    }
  };

}());
