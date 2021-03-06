// ==========================================================================
// Project: Tasks 
// ==========================================================================
/*globals CoreTasks Tasks sc_require SCUI*/
sc_require('mixins/localized_label');

/** 

  Used as exampleView for user information display in the User Manager.
  
  @extends SC.ListItemView
  @author Suvajit Gupta
*/

Tasks.UserItemView = SC.ListItemView.extend(Tasks.LocalizedLabel,
/** @scope Tasks.UserItemView.prototype */ {
  
  render: function(context, firstTime) {
    
    var content = this.get('content');
    if(!content) return;
    // console.log('DEBUG: User render(' + firstTime + '): ' + content.get('displayName'));
    sc_super();
    
    // Put a dot before users that were created or updated recently
    if(content.get('isRecentlyUpdated')) {
      context = context.begin('div').addClass('recently-updated').attr({
        title: "_RecentlyUpdatedTooltip".loc(),
        alt: "_RecentlyUpdatedTooltip".loc()
      }).end();
    }
    
    if(content.get('id')) context.addClass('user-item');
    
    // Indicate which users have a password
    var password = content.get('password');
    if(password) {
      context = context.begin('div').addClass('password-icon')
                  .attr('title', "_PasswordTooltip".loc()).attr('alt', "_PasswordTooltip".loc()).end();
    }

  }
  
});


Tasks.UserItemView.mixin(/** @scope Tasks.UserItemView */ {

  buildContextMenu: function() {
    
    var ret = [];
    
    if(CoreTasks.getPath('permissions.canCreateUser')) {
      ret.push({
        title: "_Add".loc(),
        icon: 'add-icon',
        isEnabled: YES,
        target: 'Tasks',
        action: 'addUser'
      });
    }
    
    if(CoreTasks.getPath('permissions.canDeleteUser')) {
      ret.push({
        title: "_Delete".loc(),
        icon: 'delete-icon',
        isEnabled: YES,
        target: 'Tasks',
        action: 'deleteUser'
      });
    }
    
    ret.push({
      isSeparator: YES
    });

    var role = Tasks.usersController.get('role');
    ret.push({
      title: CoreTasks.USER_ROLE_MANAGER.loc(),
      icon: 'user-role-manager',
      isEnabled: YES,
      checkbox: role === CoreTasks.USER_ROLE_MANAGER,
      target: 'Tasks.usersController',
      action: 'setRoleManager'
    });
    ret.push({
      title: (Tasks.softwareMode? CoreTasks.USER_ROLE_DEVELOPER.loc() : "_User".loc()),
      icon: 'user-role-developer',
      isEnabled: YES,
      checkbox: role === CoreTasks.USER_ROLE_DEVELOPER,
      target: 'Tasks.usersController',
      action: 'setRoleDeveloper'
    });
    if(Tasks.softwareMode) {
    ret.push({
        title: CoreTasks.USER_ROLE_TESTER.loc(),
        icon: 'user-role-tester',
        isEnabled: YES,
        checkbox: role === CoreTasks.USER_ROLE_TESTER,
        target: 'Tasks.usersController',
        action: 'setRoleTester'
      });
    }
    ret.push({
      title: CoreTasks.USER_ROLE_GUEST.loc(),
      icon: 'user-role-guest',
      isEnabled: YES,
      checkbox: role === CoreTasks.USER_ROLE_GUEST,
      target: 'Tasks.usersController',
      action: 'setRoleGuest'
    });

    return ret;
    
  }

});