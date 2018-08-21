import colorThemes from './themes';
import appendThemesStyles from './themeBuilder';
import HtmlParser from './parser-html';
import JsParser from './parser-js';
import CssParser from './parser-css';

var SimpleHighlight = {
  mainClass: 'simple-highlight',
  themeClass: 'sh-theme-',
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
  var linesCount = lines.length
  for (i = 1; i <= linesCount; i++) {
    linesHtml.push(i);
  }
  lineEl.innerHTML = linesHtml.join('<br/>')
  codeNode.insertBefore(lineEl, preNode);

  // If no theme selected - apply default
  if (codeNode.className.indexOf(this.themeClass) === -1) {
    codeNode.className = codeNode.className + ' ' + this.themeClass + 'light';
  }

  // If no main class - add one 
  // (for cases when code DOM node passed manually)
  if (codeNode.className.indexOf(this.mainClass) === -1) {
    codeNode.className = codeNode.className + ' ' + this.mainClass;
  }
}

SimpleHighlight.highlightOnPage = function() {
  var codeNodes = document.querySelectorAll('code.' + this.mainClass);
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
}
