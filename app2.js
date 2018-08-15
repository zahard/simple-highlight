
var code = document.querySelector('#source');
var text = code.innerText;


//block
//class NAME
//function name (args?)

var funcArgs;
var blockName;

var keywords = /^(var|let|const|function|class|if|for|while|return|new|else|break)$/;

var allowedVariableChars = /[a-zA-Z0-9\_\$]/
var isString = /\'\"\`/;
var result = [];

var char;
var wordStart = false;
var word = [];

for (var i=0; i<text.length;i++) {
  char = text[i];

  if(!wordStart){
    if(allowedVariableChars.test(char)){
      wordStart = true;
      word.push(char);
    } else {
      result.push(char)
    }
  }else{
    if(allowedVariableChars.test(char)){
      word.push(char);
    } else {
      result.push(word.join(''))
      word = [];
      wordStart = false
      result.push(char)
    }
  }
}








var html = result.join('');
document.querySelector('#dest').innerHTML = html;