module.exports = {
  activate: async function(context) {
    return { entryPoint: 'index.js' };
  },
  
  deactivate: async function() {},
  
  drivers: [],
  widgets: [],
  parsers: []
};