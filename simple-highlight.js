!(function(globalObject) {

var SimpleHighlight = {
  mainClass: '.simple-highlight',
  themePrefix: 'sh-theme-',
  keywords: {
    'class': 'b_name',
    'function': 'b_name',
    'this': 'self',
    'constructor': 'b_name',
    'document': 'g_name',
    'window': 'g_name',
    'console': 'g_name',
    'return' :'keyword',
    'if': 'keyword',
    'else': 'keyword',
    'const': 'def',
    'var': 'def',
    'let': 'def',
    'new': 'keyword',
  },
  modifiers: {
    'class': 'method',
    'function': 'method',
    'new': 'g_name',
    'console': 'g_name',
  },

  openBlockLevel: 0,
  classLevel: null,
  isClass: false,
  isArguments: false,
  isFunctionDefinition: false,
};


SimpleHighlight.highlightCodeNode = function(codeNode) {
  var preNode = codeNode.firstElementChild;
  // If pre tag wasnt found inside code
  if (preNode.tagName.toLowerCase() !== 'pre') {
    return;
  }

  this.reset();

  var lines = preNode.innerText.split('\n');
  var readyLines = [];
  for (var line = 0; line < lines.length; line++) {
    readyLines.push(this.processLine(lines[line]));
  }
  preNode.innerHTML = readyLines.join('\n');

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
  var code;
  var processed = [];
  var wordStart = false;
  var word = [];
  var wordString;
  var nextWordModifier;
  for (var i=0; i < line.length; i++) {
    char = line[i];
    code = char.charCodeAt(0);
    if (this.isWordChar(char)) {
      if (!wordStart) {
        wordStart = true;
      }
      word.push(char);
    } else {
      if (wordStart) {
        // End of word
        wordString = word.join('');
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
        case '(':
          if (this.isClassMethod() || this.isFunctionDefinition) {
            this.isArguments = true;
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
            var nextChar;
            var k = 1;
            while (!nextChar) {
              if (! (/\s/.test(line[i+1+k]))) {
                nextChar = line[i+1+k]
              } else {
                k++;
              }
            }
            // Is arrow function
            if (nextChar === '{') {
              processed.push(this.applyStyle('=>', 'b_name'));
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


SimpleHighlight.isClassMethod = function() {
  return this.isClass && this.classLevel === this.openBlockLevel;
}

SimpleHighlight.getWord = function(word, customStyle) {
  var style = this.keywords[word] || customStyle; 
  if (!style) {
    if (this.isArguments) {
      style = 'args';
    } else  if (this.isClassMethod()) {
      // Methods
      style = 'method';
    } else if (/^[0-9]+$/.test(word)) {
      // Numbers
      style = 'number'
    } else if(/^[\'\"].*[\'\"]+$/.test(word)) {
      // Strings
      style = 'string'
    }
  }

  if (style) {
    return this.applyStyle(word, style);
  } else {
    return word;
  }
}

SimpleHighlight.applyStyle = function(word, style) {
  return ['<span class="sh-',style,'">',word,'</span>'].join('');
}

SimpleHighlight.nextWordRule = function(keyword) {
  if (this.modifiers.hasOwnProperty(keyword)) {
    return this.modifiers[keyword];
  } else {
    return null;
  }
}

SimpleHighlight.isWordChar = function(char) {
  return /[a-zA-Z0-9\_\-\'\"]/.test(char)
};

SimpleHighlight.getCharStyle = function(char) {
  if (/^[\+\-\*\|\/\>\<\=]+$/.test(char)) {
    return this.applyStyle(char, 'operand');
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
}

SimpleHighlight.appendStyles = function(themes) {
  var styleId = 'simple-higlight-styles';
  // Styles aready added
  if (document.getElementById(styleId)) {
    return;
  }

  var cssArr = [];
  cssArr.push('code'+this.mainClass+' { font-size: 16px; padding: 15px; overflow-x: auto; display: block; margin: 5px; border-radius:4px}');
  cssArr.push(this.mainClass + ' > pre { margin: 0}');
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

  var s, m, color, font;
  for (var type in theme.styles) {
    s = theme.styles[type].split('|');
    color = s[0];
    font = s[1];
    style = 'color:' + theme.colors[color];
    // If additional option exists
    if (font) {
      for (m = 0; m < font.length; m++) {
        if (font[m] == 'i') {
          style += ';font-style: italic';
        } else if(font[m] == 'b') {
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
  colors: {
    orange: '#fd9621',
    green: '#a6e22c',
    purple: '#ac80ff',
    yellow: '#e7db74',
    red: '#f92472',
    blue: '#67d8ef',
  },
  styles: {
    def: 'blue',
    args: 'orange',
    method: 'green',
    number: 'purple',
    string: 'yellow',
    operand: 'red',
    keyword: 'red',
    b_name: 'blue|i',
    g_name: 'blue|i'
  }
}, {
  name: 'light',
  background: '#eee',
  text: '#222',
  colors: {
    orange: '#fd9621',
    green: '#a6e22c',
    purple: '#ac80ff',
    yellow: '#e7db74',
    red: '#f92472',
    blue: '#67d8ef',
    grey: '#555'
  },
  styles: {
    def: 'red',
    args: 'orange|b',
    method: 'purple',
    number: 'green',
    string: 'green',
    operand: 'red',
    keyword: 'red',
    b_name: 'grey',
    g_name: 'grey'
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
