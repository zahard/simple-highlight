import colorThemes from './themes';
import appendThemesStyles from './themeBuilder';
import HtmlParser from './parser-html';
import JsParser from './parser-js';
import CssParser from './parser-css';

var SimpleHighlight = {
  mainClass: '.simple-highlight',
  themePrefix: '.sh-theme-',
  regEmpty: /^\s+$/,
};

SimpleHighlight.highlightCodeNode = function(codeNode) {
  var preNode = codeNode.querySelector('pre');
  // If pre tag wasnt found inside code
  if (!preNode || preNode.className.indexOf('.sh-processed') !== -1) {
    return;
  }

  preNode.className += ' .sh-processed';

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
}


// Include CSS on page
appendThemesStyles(colorThemes, 
    SimpleHighlight.mainClass, 
    SimpleHighlight.themePrefix);


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
}
