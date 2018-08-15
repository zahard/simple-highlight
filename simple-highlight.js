var themes = [{
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
}];

themes.push({
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
    string: 'yellow',
    operand: 'red',
    keyword: 'red',
    b_name: 'grey|b',
    g_name: 'grey|i'
  }
});

var keywords = {
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
};

var modifiers = {
  'class': 'method',
  'function': 'method',
  'new': 'g_name',
  'console': 'g_name',
};

var openBlockLevel = 0;
var classLevel;
var isClass = false;
var isArguments = false;
var isFunctionDefinition = false;

highlightCode();

function highlightCode() {
  var codeNodes = document.querySelectorAll('code.simple-highlight');
  if (!codeNodes.length) {
    return;
  }
  
  appendStyles(themes);

  for (var i = 0; i < codeNodes.length; i++) {
    var codeNode = codeNodes[i];
    var preNode = codeNode.firstElementChild;

    if (preNode.tagName.toLowerCase() !== 'pre') {
      continue;
    }

    var lines = preNode.innerText.split('\n');
    var finalLines = [];
    for (var line = 0; line < lines.length; line++) {
      finalLines.push(processLine(lines[line]));
    }
    preNode.innerHTML = finalLines.join('\n');

    //If no theme selected - apply default
    if (codeNode.className.indexOf('sh-theme-') === -1) {
      codeNode.className = codeNode.className + ' sh-theme-light';
    }
  }
}

function appendStyles(themes) {
  var cssArr = [];
  cssArr.push('code.simple-highlight { font-size: 16px; padding: 15px; display: block;}');
  cssArr.push('.simple-highlight > pre { margin: 0}');
  for (var t = 0; t < themes.length; t++) {
      createThemeCss(themes[t], cssArr);
  }
  var css = cssArr.join('\n');
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
}

function createThemeCss(theme, css) {
  var prefixName = '.simple-highlight.sh-theme-' + theme.name;
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

function isClassMethod() {
  return isClass && classLevel === openBlockLevel;
}

function getWord(word, customStyle) {
  var style = keywords[word] || customStyle; 
  if (!style) {
    if (isArguments) {
      style = 'args';
    } else  if (isClassMethod()) {
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
    return applyStyle(word, style);
  } else {
    return word;
  }
}

function applyStyle(word, style) {
  return ['<span class="sh-',style,'">',word,'</span>'].join('');
}

function nextWordRule(keyword) {
  if (modifiers.hasOwnProperty(keyword)) {
    return modifiers[keyword];
  } else {
    return null;
  }
}

function isWordChar(char) {
  return /[a-zA-Z0-9\_\-\'\"]/.test(char)
};

function getCharStyle(char) {
  if (/^[\+\-\*\|\/\>\<\=]+$/.test(char)) {
    return applyStyle(char, 'operand');
  } else {
    return char;
  }
}

function processLine(line) {
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
    if (isWordChar(char)) {
      if (!wordStart) {
        wordStart = true;
      }
      word.push(char);
    } else {
      if (wordStart) {
        // End of word
        wordString = word.join('');
        processed.push(getWord(wordString, nextWordModifier));
        nextWordModifier = nextWordRule(wordString);
        wordStart = false;
        word = [];

        // Process next words in current block leve as method names
        if (wordString === 'class') {
          classLevel = openBlockLevel + 1;
          isClass = true;
        }

        if (wordString === 'function') {
          isFunctionDefinition = true;
        }
      }

      switch (char) {
        case '(':
          if (isClassMethod() || isFunctionDefinition) {
            isArguments = true;
          }
          break;
        case ')':
          if (isClassMethod() || isFunctionDefinition) {
            isArguments = false;
          }
          break;
        case '{':
          openBlockLevel++;
          isFunctionDefinition = false;
          break;
        case '}':
          if (isClass && classLevel == openBlockLevel) {
            isClass = false;
          }
          openBlockLevel--;
          break;
        case '=':
          var next = line[i+1];
          if (next && next === '>') {
            var nextChar;
            var k = 1;
            while(!nextChar) {
              if (! (/\s/.test(line[i+1+k]))) {
                nextChar = line[i+1+k]
              } else {
                k++;
              }
            }
            // Is arrow function
            if (nextChar === '{') {
              processed.push(applyStyle('=>', 'b_name'));
              //skip next char
              i++;
              continue;
            }
          }
          break;
      }
      

      processed.push(getCharStyle(char));
    }
  }

  return processed.join('');
}
