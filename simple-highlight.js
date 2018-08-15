!(function(globalObject) {

function generateKeywords() {
  var tokens = {
    self: 'this',
    blockname: 'class|function|constructor',
    globalname: 'document|window|console',
    def: 'var|const|let',
  };
  tokens.keyword = 'return|if|else|for|while|break|continue|';
  tokens.keyword += 'case|do|while|switch|extends|implements|new';
  var keywords = {};
  var words;
  for (var token in tokens) {
    words = tokens[token].split('|');
    for (var i = 0; i < words.length; i++) {
      keywords[words[i]] = token;
    }
  }
  return keywords;
}

// All token names
var TOKENS = {
  comment:'comment',
  self: 'self',
  def: 'def',
  args: 'args',
  method: 'method',
  number: 'number',
  string: 'string',
  operator: 'operator',
  keyword: 'keyword',
  blockname: 'blockname',
  globalname: 'globalname',
  functionCall: 'func',
  boolean: 'boolean'
}

var SimpleHighlight = {
  mainClass: '.simple-highlight',
  themePrefix: 'sh-theme-',
  keywords: generateKeywords(),
  nextWordModifiers: {
    'class': 'method',
    'extends': 'method',
    'implements': 'method',
    'function': 'method',
    'new': 'globalname',
    'console': 'globalname',
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

SimpleHighlight.highlightCodeNode = function(codeNode) {
  var preNode = codeNode.querySelector('pre');
  // If pre tag wasnt found inside code
  if (!preNode) {
    return;
  }

  // remove other tags except PRE from CODE
  for (var i = 0; i < codeNode.childNodes.length; i++) {
    if (codeNode.childNodes[i] !== preNode) {
      codeNode.removeChild(codeNode.childNodes[i]);
    }
  }

  this.reset();

  var lines = preNode.innerText.split('\n');
  var readyLines = [];
  for (var line = 0; line < lines.length; line++) {
    readyLines.push(this.processLine(lines[line]));
  }

  // Remove trailing empty lines
  for (line = line-1; line > 0; line--) {
    if (!readyLines[line].length || this.regEmpty.test(readyLines[line])) {
      readyLines.pop();
    } else {
      break;
    }
  }
  preNode.innerHTML = readyLines.join('\n');

  var lineEl = document.createElement('div');
  lineEl.className = 'sh-lines';
  var linesHtml = [];
  var linesCount = readyLines.length
  for (i = 1; i <= linesCount; i++) {
    linesHtml.push(i);
  }
  lineEl.innerHTML = linesHtml.join('<br/>')
  codeNode.insertBefore(lineEl,preNode);

  //If no theme selected - apply default
  if (codeNode.className.indexOf(this.themePrefix) === -1) {
    codeNode.className = codeNode.className + ' ' + this.themePrefix + 'light';
  }
}

SimpleHighlight.highlightOnPage = function() {
  // Appned styles
  this.appendStyles(this.themes);

  var codeNodes = document.querySelectorAll('code' + this.mainClass);
  if (!codeNodes.length) {
    return;
  }

  for (var i = 0; i < codeNodes.length; i++) {
    this.highlightCodeNode(codeNodes[i]);
  }
};

SimpleHighlight.processLine = function(line) {
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
      return this.applyStyle(line, TOKENS.comment);
    } else {
      this.isComment = false;
      startFrom = commentEnd + 2;
      processed.push(this.applyStyle(line.substr(0, startFrom), TOKENS.comment));
    }
  }

  if (this.isMultilineString) {
    var stringEnd = line.substr(i).indexOf('`');
    if (stringEnd === -1) {
      return this.applyStyle(line, TOKENS.string);
    } else {
      this.isMultilineString = false;
      startFrom = stringEnd + 2;
      processed.push(this.applyStyle(line.substr(0, startFrom), TOKENS.string));
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
              processed.push(this.applyStyle(line.substr(i, closeString+2), TOKENS.string));
              i += closeString+1;
              continue;
          } else {
            if (char === '`') {
              this.isMultilineString = true;
            }
            processed.push(this.applyStyle(line.substr(i), TOKENS.string));
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
              processed.push(this.applyStyle(line.substr(i), TOKENS.comment));
              // Exit line processing
              i = line.length;
              continue;
            } else if (next === '*') { // Multiline comment
              // If comment not ended on same line
              if (line.substr(i).indexOf('*/') === -1) {
                this.isComment = true;
                processed.push(this.applyStyle(line.substr(i), TOKENS.comment));
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
              processed.push(this.applyStyle('=>', TOKENS.blockname));
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
}

SimpleHighlight.findNextCharIndex = function(line, start) {
  for (var i = start; i < line.length; i++) {
    if (!(this.regEmpty.test(line[i]))) {
      return i;
    }
  }
}

SimpleHighlight.isClassMethod = function() {
  return this.isClass && this.classLevel === this.openBlockLevel;
}

SimpleHighlight.getWord = function(word, customStyle) {
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
    return this.applyStyle(word, token);
  } else {
    return word;
  }
}

SimpleHighlight.applyStyle = function(word, token) {
  return ['<span class="sh-',token,'">',word,'</span>'].join('');
}

SimpleHighlight.nextWordRule = function(keyword) {
  if (this.nextWordModifiers.hasOwnProperty(keyword)) {
    return this.nextWordModifiers[keyword];
  } else {
    return null;
  }
}

SimpleHighlight.isWordChar = function(char) {
  return this.regNameChar.test(char)
};

SimpleHighlight.getCharStyle = function(char) {
  if (this.regOperator.test(char)) {
    return this.applyStyle(char, TOKENS.operator);
  } else {
    return char;
  }
}

SimpleHighlight.reset = function() {
  this.openBlockLevel = 0;
  this.classLevel = null;
  this.isClass = false;
  this.isArguments = false;
  this.isFunctionDefinition = false;
  this.isComment = false;
}

SimpleHighlight.appendStyles = function(themes) {
  var styleId = 'simple-higlight-styles';
  // Styles aready added
  if (document.getElementById(styleId)) {
    return;
  }

  var cssArr = [];
  cssArr.push('code'+this.mainClass+' { font-size: 16px; padding: 15px;line-height:1.4;');
  cssArr.push('display: block; margin: 5px; border-radius:4px}');
  cssArr.push(this.mainClass + ' > pre { margin: 0;font-family: Monospace;overflow-x: auto; }');
  cssArr.push(this.mainClass +' .sh-lines{float:left;text-align:right;margin-right:15px;left:10px;');
  cssArr.push('border-right:1px solid #ccc; padding-right: 5px;user-select: none;}');

  for (var t = 0; t < themes.length; t++) {
      this.createThemeCss(themes[t], cssArr);
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
}

SimpleHighlight.createThemeCss = function(theme, css) {
  var prefixName = this.mainClass + '.sh-theme-' + theme.name;
  css.push(prefixName + ' { background: '+theme.background+'}');
  css.push(prefixName + ' > pre {color: '+theme.text+'}');
  css.push(prefixName + ' .sh-lines {color: '+theme.linesCount+';border-color:'+theme.linesCount+'}');

  var s, m, color, font;
  for (var type in theme.styles) {
    s = theme.styles[type].split('|');
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
    css.push(prefixName+' .sh-'+type+' {'+style+'}');
  }
}

SimpleHighlight.themes = [{
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
    blue: '#67d8ef'
  },
  styles: {
    comment: 'darkgreen',
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
  }
}, {
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
  }
}];

// Hightlight initially on dom ready
document.addEventListener("DOMContentLoaded", function() {
  SimpleHighlight.highlightOnPage();
});

// Export public method
globalObject.SimpleHighlight = function(node) {
  if (node) {
    SimpleHighlight.highlightCodeNode(node);
  } else {
    SimpleHighlight.highlightOnPage();
  }
};

})(window);
