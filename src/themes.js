
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

export default [themeDark, themeLight];
