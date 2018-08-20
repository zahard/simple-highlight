
import HtmlParser from './parser-html';
import JsParser from './parser-js';

var SimpleHighlight = {
  mainClass: '.simple-highlight',
  themePrefix: 'sh-theme-',
  regEmpty: /^\s+$/,
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

  var lang = codeNode.getAttribute('lang') || 'js';
  var code = preNode[lang === 'html' ? 'innerHTML': 'innerText'];
  var readyLines = this.parseCode(code, lang).split('\n');

  // Remove trailing empty lines
  for (var line = readyLines.length - 1; line > 0; line--) {
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

SimpleHighlight.parseCode = function(text, lang) {
  switch (lang) {
    case 'html':
      return HtmlParser.parse(text);
    case 'js':
      return JsParser.parse(text);
  }
  // No lang found
  return text;
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

  var s, m, color, font, style;
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
    tag: 'red',
    attrName: 'green',
    attrVal: 'yellow',
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
    tag: 'brown',
    attrName: 'purple',
    attrVal: 'green',
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


