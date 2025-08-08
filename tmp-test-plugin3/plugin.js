module.exports = {
  activate: async function(context) {
    return { entryPoint: 'plugin.js' };
  },
  
  deactivate: async function() {},
  
  drivers: [],
  widgets: [],
  parsers: []
};