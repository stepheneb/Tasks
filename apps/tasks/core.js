// ==========================================================================
// Project:   Tasks
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/**

  "Tasks" - an agile project management tool
  
  @extends SC.Object
  @author Suvajit Gupta
  @version 0.1
*/
/*globals Tasks CoreTasks sc_require */
sc_require('statechart');

// FIXME: [SG] remove hacks when switching to SC ToT where logicalAnd() has been replaced with and()
(function() {
  if (SC.Binding.logicalAnd) {
    SC.Binding.and = SC.Binding.logicalAnd;
  }
  else if (SC.Binding.and) {
    SC.Binding.logicalAnd = SC.Binding.and;
  }
})();

Tasks = SC.Object.create(SC.Statechart,
  /** @scope Tasks.prototype */ {

  NAMESPACE: 'Tasks',
  VERSION: '1.0',
  isLoaded: NO, // for Lebowski
  
  /*
   * Tasks server types
   */
  NO_SERVER: 0x0000,
  PERSEVERE_SERVER: 0x0001,
  GAE_SERVER: 0x0002,
  serverType: 0x0002,
  
  /**
   * A computed property to indicate whether the server is capable of sending notifications.
   * @returns {Boolean} true: if connected to a server that supports notifications, false otherwise
   */
  canServerSendNotifications: function() {
    if(!CoreTasks.get('remoteDataSource')) return true; // to assist with testing via fixtures
    return this.get('serverType') === this.GAE_SERVER;
  }.property('serverType').cacheable(),
  
  /**
   * Deselect all tasks.
   */
  deselectTasks: function() {
    Tasks.tasksController.set('selection', '');
  },
  
  getBaseUrl: function() {
    return window.location.protocol + '//' + window.location.host + window.location.pathname;
  },
  
  nameAlphaSort: function(a,b) {
    var aName = a.get('name');
    var bName = b.get('name');
    if(aName === bName) return 0;
    else return aName > bName? 1 : -1;
  }
    
});


/**
  Some view overrides to turn off escapeHTML for menu items in context menus and select buttons.
*/
SC.MenuItemView = SC.MenuItemView.extend({
  escapeHTML: NO
});

SC.SelectButtonView = SC.SelectButtonView.extend({
  escapeHTML: NO
});

SCUI.ContextMenuPane = SCUI.ContextMenuPane.extend({
  exampleView: SC.MenuItemView
});

SCUI.ComboBoxView.prototype.dropDownButtonView = SC.View.extend( SCUI.SimpleButton, {
  classNames: 'scui-combobox-dropdown-button-view',
  layout: { top: 0, right: 0, height: 24, width: 28 }
});

/**
  A Standard Binding transform to localize a string in a binding.
*/
SC.Binding.toLocale = function() {
  return this.transform(function(value, binding) {
    var returnValue = '';
    if (SC.typeOf(value) === SC.T_STRING) {
      returnValue = "%@".fmt(value).loc();
    }
    return returnValue;
  });
};

// if software mode set to false, works as a simple To Do list (Task Type/Validation are not available through GUI)
Tasks.softwareMode = document.title.match(/todo/i)? false: true;