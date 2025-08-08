module.exports = {
  activate: async function(context) {
    return { customEntry: true };
  },
  
  deactivate: async function() {},
  
  customExport: true,
  widgets: []
};