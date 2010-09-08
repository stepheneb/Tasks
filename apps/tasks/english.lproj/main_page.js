// ==========================================================================
// Project: Tasks
// ==========================================================================
/*globals CoreTasks Tasks sc_require SCUI sc_static*/

sc_require('core');
sc_require('mixins/localized_label');
sc_require('views/logo');
sc_require('views/summary');

/** @namespace

  This page lays out the Tasks application user interface.
  
  @extends SC.Object
  @author Suvajit Gupta
  @author Joshua Holt
*/

Tasks._wideLogo = document.title.match(/Eloqua/)? true : false;
Tasks.mainPageHelper = SC.Object.create({

  displayedTasksCountBinding: SC.Binding.oneWay('Tasks.tasksController*arrangedObjects.length'),
  autoSaveBinding: SC.Binding.oneWay('CoreTasks*autoSave'),
  shouldNotifyBinding: SC.Binding.oneWay('CoreTasks*shouldNotify'),
  clippyDetailsId: 'clippy-details',
  clippyDetails: null,

  _embedClippy: function(context) {
    var clippyTooltip = "_ClippyTooltip".loc();
    context.push('<span style="display:none;" id="' + Tasks.mainPageHelper.clippyDetailsId + '"></span>');
    context.push('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"\n' +
                 'width="14"\n' +
                 'height="15"\n' +
                 'id="clippy-object" >\n' +
                 '<param name="movie" value="' + static_url('clippy.swf') + '"/>\n' +
                 '<param name="allowScriptAccess" value="always" />\n' +
                 '<param name="quality" value="high" />\n' +
                 '<param name="scale" value="noscale" />\n' +
                 '<param NAME="FlashVars" value="id=' + Tasks.mainPageHelper.clippyDetailsId + '">\n' +
                 '<param name="bgcolor" value="#FFF">\n' +
                 '<param name="wmode" value="opaque">\n' +
                 '<embed src="' + static_url('clippy.swf') + '"\n' +
                 'width="14"\n' +
                 'height="15"\n' +
                 'name="clippy"\n' +
                 'quality="high"\n' +
                 'allowScriptAccess="always"\n' +
                 'type="application/x-shockwave-flash"\n' +
                 'pluginspage="http://www.macromedia.com/go/getflashplayer"\n' +
                 'FlashVars="id=' + Tasks.mainPageHelper.clippyDetailsId + '"\n' +
                 'bgcolor="#FFF"\n' +
                 'wmode="opaque"\n' +
                 '/>\n' +
                 '</object>\n').attr('title', clippyTooltip).attr('alt', clippyTooltip);
  },
  
  _listActions: function() {
    var ret = [];
    if(this.getPath('displayedTasksCount') > 0) {
      ret.push({ title: "_LaunchStatistics".loc(), icon: 'statistics-icon', target: 'Tasks', action: 'viewStatistics', isEnabled: YES });
      ret.push({ isSeparator: YES });
    }
    ret.push({ title: "_LaunchSettings".loc(), icon: 'settings-icon', target: 'Tasks', action: 'settings', isEnabled: YES });
    var autoSave = this.get('autoSave');
    ret.push({ title: "_Toggle".loc() + "_AutoSave".loc(), icon: 'save-icon', target: 'Tasks', action: 'toggleAutoSave', isEnabled: YES, checkbox: autoSave });
    if(Tasks.get('canServerSendNotifications')) {
      var shouldNotify = this.get('shouldNotify');
      ret.push({ title: "_Toggle".loc() + "_SendNotifications".loc(), icon: 'email-icon', target: 'Tasks', action: 'toggleShouldNotify', isEnabled: YES, checkbox: shouldNotify });
    }
    ret.push({ isSeparator: YES });
    ret.push({ title: "_LaunchImport".loc(), icon: 'import-icon', target: 'Tasks', action: 'importData', isEnabled: YES });
    ret.push({ title: "_LaunchExportText".loc(), icon: 'text-icon', target: 'Tasks.exportDataController', action: 'exportDataAsText', isEnabled: YES });
    ret.push({ title: "_LaunchExportHTML".loc(), icon: 'html-icon', target: 'Tasks.exportDataController', action: 'exportDataAsHTML', isEnabled: YES });
    ret.push({ isSeparator: YES });
    ret.push({ title: "_LaunchHelp".loc(), icon: 'sc-icon-help-16', target: 'Tasks', action: 'help', isEnabled: YES });
    ret.push({ title: "_Logout".loc(), icon: 'logout-icon', target: 'Tasks', action: 'logout', isEnabled: YES });
    return ret;
  }.property('displayedTasksCount', 'autoSave', 'shouldNotify').cacheable(),
  
  currentUserNameBinding: SC.Binding.oneWay('CoreTasks*currentUser.name'),
  currentUserRoleBinding: SC.Binding.oneWay('CoreTasks*currentUser.role'),
  welcomeMessage: function() {
    var name = this.get('currentUserName');
    var role = this.get('currentUserRole');
    if(SC.none(name) || SC.none(role)) return '';
    if(!Tasks.softwareMode && role === CoreTasks.USER_ROLE_DEVELOPER) role = "_User";
    return "_Hi".loc() + '<b>' + name + '</b><br><small>' + role.loc() + '</small>';
  }.property('currentUserName', 'currentUserRole').cacheable()
  
});

Tasks.mainPage = SC.Page.design({
  
 mainPane: SC.MainPane.design({
   
   welcomeMessage: SC.outlet('masterDetailView.detailView.topToolbar.welcomeMessageLabel'),
   projectsList:   SC.outlet('masterDetailView.masterView.contentView.contentView'),
   tasksList:      SC.outlet('masterDetailView.detailView.contentView.contentView'),
   serverMessage:  SC.outlet('masterDetailView.detailView.contentView.tasksBottomBar.serverMessageView'),

   layout: { left: 0, right: 0, top: 0, bottom: 0, minWidth: 1024, minHeight: 640 },
   childViews: 'masterDetailView'.w(),

   masterDetailView: SC.MasterDetailView.design({
     
     layout: { top: 0, left: 0, right: 0, bottom: 0 },
     masterWidth: 250,
     
     masterView: SC.WorkspaceView.extend({
       
      topToolbar: SC.ToolbarView.extend({
        
        childViews: "installationLogo tasksLogo".w(),
        classNames: ['title-bar'],
        
        installationLogo: SC.View.design({
          layout: { left: Tasks._wideLogo? 4: 25, centerY: 0, width: Tasks._wideLogo? 80: 35, height: Tasks._wideLogo? 20 : 35 },
          tagName: 'img',
          render: function(context, firstTime) {
            if(document.title.match(/Dev/)) {
              context.attr('src', sc_static('images/dev-logo.jpg'));
            }
            else if(document.title.match(/Demo/)) {
              context.attr('src', sc_static('images/demo-logo.jpg'));
            }
            else if(document.title.match(/SproutCore/)) {
              context.attr('src', sc_static('images/sproutcore-logo.png'));
            }
            else if(document.title.match(/Greenhouse/)) {
              context.attr('src', sc_static('images/greenhouse-logo.png'));
            }
            else if(document.title.match(/TPG/)) {
              context.attr('src', sc_static('images/tpg-logo.png'));
            }
            else if(document.title.match(/Eloqua/)) {
              context.attr('src', sc_static('images/eloqua-logo.gif'));
            }
          }
        }), // installationLogo
        
        tasksLogo: Tasks.LogoView.design({
          layout: { left: Tasks._wideLogo? 95 : 70, width: 145, centerY: 0, height: 24 }
        })
        
      }), // topToolBar
       
      contentView: SC.View.design({ // projectsList/BottomBar
        
        childViews: "projectsList projectsBottomBar".w(),
         
        projectsList: SC.ScrollView.design({
          contentView: SC.ListView.design({
            layout: { top: 0, left:0, bottom: 27, right: 0 },
            contentValueKey: 'displayName',
            contentUnreadCountKey: 'displayCountDown',
            contentBinding: 'Tasks.sourcesController.arrangedObjects',
            selectionBinding: 'Tasks.projectsController.selection',
            localize: YES,
            rowHeight: 24,
            classNames: ['projects-pane-inner'],
            hasContentIcon: YES,
            contentIconKey: 'icon',
            exampleView: Tasks.ProjectItemView,
            groupExampleView: Tasks.GroupItemView,
            isEditable: YES,
            allowDeselectAll: YES,
            canEditContent: YES,
            canReorderContent: YES,
            canDeleteContent: YES,
            destroyOnRemoval: YES,
            selectOnMouseDown: YES,
            delegate: Tasks.projectsListDelegate,

            selectionEvent: null,
            mouseDown: function(event) {
              var ret = sc_super();
              if(event.which === 3) { // right click
                this.set('selectionEvent', event);
                this.invokeLast('popupContextMenu');
              }
              return ret;
            },
            popupContextMenu: function() {
              var items = Tasks.ProjectItemView.buildContextMenu();
              if(items.length > 0) {
                var pane = SCUI.ContextMenuPane.create({
                  contentView: SC.View.design({}),
                  layout: { width: 125, height: 0 },
                  itemTitleKey: 'title',
                  itemIconKey: 'icon',
                  itemIsEnabledKey: 'isEnabled',
                  itemTargetKey: 'target',
                  itemActionKey: 'action',
                  itemSeparatorKey: 'isSeparator',
                  items: items
                });
                pane.popup(this, this.get('selectionEvent')); // pass in the mouse event so the pane can figure out where to put itself
              }
            }
          }) // projectsSourceList
        }), // projectsList
         
         projectsBottomBar: SC.View.design({
           
           layout: { bottom: 0, height: 26, left: 0, right: 0 },
           childViews: 'addProjectButton deleteProjectButton'.w(),

           addProjectButton: SC.ButtonView.design({
             layout: { centerY: 0, left: 10, height: 24, width: 32 },
             classNames: ['dark'],
             titleMinWidth: 0,
             icon: 'add-icon',
             toolTip: "_AddProjectTooltip".loc(),
             isVisibleBinding: 'CoreTasks.permissions.canCreateProject',
             target: 'Tasks',
             action: 'addProject'
           }),
           deleteProjectButton: SC.ButtonView.design({
             layout: { centerY: 0, left: 52, height: 24, width: 32 },
             classNames: ['dark'],
             titleMinWidth: 0,
             icon: 'delete-icon',
             toolTip: "_DeleteProjectTooltip".loc(),
             isVisibleBinding: 'CoreTasks.permissions.canDeleteProject',
             isEnabledBinding: 'Tasks.projectsController.isDeletable',
             target: 'Tasks',
             action: 'deleteProject'
           })
           
         }) // projectsBottomBar
         
       }) // projectsList/BottomBar
       
     }), // masterView

     detailView: SC.WorkspaceView.extend({

       topToolbar: SC.ToolbarView.extend({
         
         childViews: "actionsButton displayModeSegments masterPickerButton welcomeMessageLabel clippyIcon filterPanelButton filterCancelButton tasksSearchField tasksSearchCancelButton".w(),
         classNames: ['title-bar'],
         
         actionsButton: SC.ButtonView.design(SCUI.DropDown, {
           layout: { centerY: 0, left: 10, height: 24, width: 50 },
           classNames: ['dark'],
           titleMinWidth: 0,
           hasIcon: YES,
           icon: 'actions-icon',
           toolTip: "_ActionsButtonTooltip".loc(),
           dropDown: SC.MenuPane.design({
             contentView: SC.View.design({}),
             layout: { width: 175, height: 0 },
             itemTitleKey: 'title',
             itemIconKey: 'icon',
             itemTargetKey: 'target',
             itemActionKey: 'action',
             itemSeparatorKey: 'isSeparator',
             itemIsEnabledKey: 'isEnabled',
             itemCheckboxKey: 'checkbox',
             itemsBinding: SC.Binding.oneWay('Tasks.mainPageHelper._listActions')    
           })
         }),

         displayModeSegments: SC.SegmentedView.design(SCUI.ToolTip, {
           layout: { left: 70, centerY: 0, height: 24, width: 90 },
           items: [
             { title: '', icon: 'sc-icon-group-16', value: Tasks.DISPLAY_MODE_TEAM },
             { title: '', icon: 'tasks-icon', value: Tasks.DISPLAY_MODE_TASKS }
           ],
           itemTitleKey: 'title',
           itemIconKey: 'icon', // disabling icons for now - appearing too cluttered
           itemValueKey: 'value',
           toolTip: "_DisplayModeTooltip".loc(),
           valueBinding: 'Tasks.assignmentsController.displayMode'
         }),

         masterPickerButton: SC.ButtonView.extend({
           layout: { left: 170, centerY: 0, height: 24, width: 32 },
           titleMinWidth: 0,
           icon: 'project-icon',
           classNames: ['dark'],
           action: 'toggleMasterPicker',
           isVisible: NO,
           isVisibleBinding: 'Tasks.mainPage.mainPane.masterDetailView.masterIsHidden'
         }),
         
         welcomeMessageLabel: SC.LabelView.design(SCUI.ToolTip, {
           layout: { centerX: -55, centerY: 0, width: 250, height: 32 },
           classNames: ['welcome-message'],
           escapeHTML: NO,
           mouseDown: function() {
             Tasks.showCurrentUserTasks();
           },
           valueBinding: SC.Binding.oneWay('Tasks.mainPageHelper.welcomeMessage')
         }),

         clippyIcon: SC.View.design({
           layout: { centerY: 0, right: 278, height: 14, width: 14 },
           isVisibleBinding: SC.Binding.oneWay('Tasks.tasksController.hasSelection'),
           render: function(context, firstTime) {
             if(firstTime) {
               Tasks.mainPageHelper._embedClippy(context);
             }
           }
         }),

         filterPanelButton: SC.ButtonView.design({
           layout: { centerY: 0, height: 24, right: 216, width: 50 },
           titleMinWidth: 0,
           icon: 'filter-icon',
           classNames: ['dark'],
           toolTip: "_FilterTooltip".loc(),
           target: 'Tasks',
           action: 'filterTasks'
         }),
         filterCancelButton: SC.View.design({ // Filter cancel button
           layout: { centerY: 0, height: 12, right: 219, width: 12 },
           isVisible: NO,
           classNames: ['filter-cancel-icon'],
           mouseDown: function() {
             Tasks.assignmentsController.clearAttributeFilter();
             Tasks.assignmentsController.showAssignments();
           },
           isVisibleBinding: SC.Binding.oneWay('Tasks.assignmentsController.attributeFilterEnabled').bool()
         }),

         tasksSearchField: SC.TextFieldView.design({
           layout: { centerY: -4, height: 25, right: 10, width: 200 },
           classNames: ['search-bar'],
           hint: "_TasksSearchHint".loc(),
           renderMixin: function(context, firstTime) { // Used custom tooltip rendering to avoid escaping by SCUI.Toolip
             context.attr('title', "_TasksSearchTooltip".loc()) ;
           },
           valueBinding: 'Tasks.assignmentsController.searchFilter'
         }),
         tasksSearchCancelButton: SC.View.design({ // Tasks Search cancel button
           layout: { centerY: 0, height: 12, right: 10, width: 12 },
           isVisible: NO,
           classNames: ['filter-cancel-icon'],
           mouseDown: function() {
             Tasks.assignmentsController.set('searchFilter', '');
           },
           isVisibleBinding: SC.Binding.oneWay('Tasks.assignmentsController.searchFilter').bool()
         })

       }), // topToolbar

       contentView: SC.View.design({ // tasksList/BottomBar
         
         childViews: "tasksList tasksBottomBar".w(),
         
         tasksList: SC.ScrollView.design({
           
             contentView: SC.ListView.design({
               layout: { top: 0, bottom: 27, left: 0, right: 0 },
               contentValueKey: 'displayName',
               contentUnreadCountKey: 'displayEffort',
               contentBinding: 'Tasks.tasksController.arrangedObjects',
               selectionBinding: 'Tasks.tasksController.selection',
               localize: YES,
               rowHeight: 24,
               classNames: ['tasks-pane-inner'],
               hasContentIcon: Tasks.softwareMode,
               contentIconKey: 'icon',
               exampleView: Tasks.TaskItemView,
               groupExampleView: Tasks.AssigneeItemView,
               isEditable: YES,
               allowDeselectAll: YES,
               canEditContent: YES,
               canReorderContent: YES,
               canDeleteContent: YES,
               destroyOnRemoval: YES,
               selectOnMouseDown: YES,
               delegate: Tasks.tasksListDelegate,

               headerRowHeight: 40,
               rowDelegate: function() {
                 return this;
               }.property().cacheable(),
               customRowHeightIndexes: function() {
                 return SC.IndexSet.create(0, this.get('length'));
               }.property('length').cacheable(),
               contentIndexRowHeight: function(view, content, idx) {
                 var outlineLevel = this.get('contentDelegate').contentIndexOutlineLevel(this, content, idx);
                 var isHeader = (outlineLevel === 0) ? YES : NO;
                 return idx && isHeader? this.get('headerRowHeight') : this.get('rowHeight');
               },
               _contentDidChange: function() { // Force tasks list indexes to be recomputed when content changes
                 this.rowHeightDidChangeForIndexes(SC.IndexSet.create(0, this.get('length')));
               }.observes('content'),

               selectionEvent: null,
               mouseDown: function(event) {
                 var ret = sc_super();
                 if(event.which === 3) { // right click
                   this.set('selectionEvent', event);
                   this.invokeLast('popupContextMenu');
                 }
                 return ret;
               },
               popupContextMenu: function() {
                 var items = Tasks.TaskItemView.buildContextMenu();
                 if(items.length > 0) {
                   var pane = SCUI.ContextMenuPane.create({
                     contentView: SC.View.design({}),
                     layout: { width: 180, height: 0 },
                     escapeHTML: NO,
                     itemTitleKey: 'title',
                     itemIconKey: 'icon',
                     itemIsEnabledKey: 'isEnabled',
                     itemTargetKey: 'target',
                     itemActionKey: 'action',
                     itemSeparatorKey: 'isSeparator',
                     itemCheckboxKey: 'checkbox',
                     items: items        
                   });
                   pane.popup(this, this.get('selectionEvent')); // pass in the mouse event so the pane can figure out where to put itself
                 }
               },

               /* Helper image display logic:
                   No projects selected - "select project" helper
                 	Single project selected:
                 	  if project has no tasks:
                 		  addTask enabled - "add tasks tasks" helper
                   		else - "display mode" helper
                   	else project has tasks
               		    if no tasks filtering through - "adjust filter" helper
                 	Multiple projects selected
                 		if projects have tasks:
                 		  if no tasks filtering through - "adjust filter" helper
             	*/
               render: function(context, firstTime) {

                 // console.log('DEBUG: Tasks Detail render(), editorPoppedUp=' + Tasks.editorPoppedUp);
                 if(CoreTasks.loginTime) return;
                 var sel = Tasks.projectsController.getPath('selection');
                 var selectedProjectsCount = sel? sel.get('length') : 0;
                 if(selectedProjectsCount === 0) { // No projects selected
                   context.addClass('helper-select-project');
                   return;
                 }
                 else if(selectedProjectsCount === 1) { // Single project selected
                   if(sel.getPath('firstObject.tasks.length') === 0) { // Project has no tasks
                     if(Tasks.tasksController.isAddable()) context.addClass('helper-add-tasks');
                     else context.addClass('helper-display-mode');
                     return;
                   }
                   else { // Project has tasks
                     if(this.getPath('content.length') === 0) { // No tasks filtering through
                       context.addClass('helper-adjust-filter');
                       return;
                     }
                   }
                 }
                 else { // Multiple projects selected
                   var tasksCount = 0;
                   var ctx = {};
                   for (var i = 0; i < selectedProjectsCount; i++) {
                     var project = sel.nextObject(i, null, ctx);
                     tasksCount += project.getPath('tasks.length');
                   }
                   if(tasksCount > 0) { // Projects have tasks
                     if(this.getPath('content.length') === 0) { // No tasks filtering through
                       context.addClass('helper-adjust-filter');
                       return;
                     }
                   }
                 }

                 // Remove helper images (if any) and render tasks
                 context.removeClass('helper-add-tasks');
                 context.removeClass('helper-display-mode');
                 context.removeClass('helper-adjust-filter');
                 sc_super();
               }

             }),

             // Hotkeys - be careful to avoid conflicts with browser shortcuts!
             keyDown: function(event) {
               var ret, commandCode = event.commandCodes();
               // console.log('DEBUG: hotkey "' + commandCode[0] + '" pressed');
               if (commandCode[0] === 'ctrl_='){  // control_equals
                 Tasks.addTask();
                 ret = YES;
               }
               else if (commandCode[0] === 'ctrl_shift_+'){  // control_shift_plus
                 Tasks.duplicateTask();
                 ret = YES;
               }
               else {
                 ret = NO;
               }
               return ret;
             }
             
          }), // tasksList

          tasksBottomBar: SC.View.design({

             layout: { bottom: 0, height: 26, left: 0, right: 0 },
             childViews: 'addTaskButton deleteTaskButton summaryView serverMessageView saveButton refreshButton'.w(),

             addTaskButton: SC.ButtonView.design({
               layout: { centerY: 0, left: 10, height: 24, width: 32 },
               classNames: ['dark'],
               titleMinWidth: 0,
               icon: 'add-icon',
               toolTip: "_AddTaskTooltip".loc(),
               isVisibleBinding: 'CoreTasks.permissions.canCreateTask',
               isEnabledBinding: 'Tasks.tasksController.isAddable',
               target: 'Tasks',
               action: 'addTask'
             }),
             deleteTaskButton: SC.ButtonView.design(SCUI.Permissible,{
               layout: { centerY: 0, left: 52, height: 24, width: 32 },
               classNames: ['dark'],
               titleMinWidth: 0,
               icon: 'delete-icon',
               toolTip: "_DeleteTaskTooltip".loc(),
               isVisibleBinding: 'CoreTasks.permissions.canDeleteTask',
               isEnabledBinding: SC.Binding.and('Tasks.tasksController.isDeletable', 'Tasks.tasksController.notGuestOrGuestSubmittedTasks'),
               isPermittedBinding: 'Tasks.tasksController.notGuestOrGuestSubmittedTasks',
               target: 'Tasks',
               action: 'deleteTask'
             }),

             summaryView: Tasks.SummaryView.design({
               layout: { centerY: 0, height: 18, left: 95, width: 400 },
               classNames: ['bottom-bar-label'],
               escapeHTML: NO,
               textAlign: SC.ALIGN_CENTER,
               assignmentsSummaryBinding: SC.Binding.oneWay('Tasks.assignmentsController.assignmentsSummary'),
               projectsSelectionBinding: SC.Binding.oneWay('Tasks.projectsController.selection'),
               tasksSelectionBinding: SC.Binding.oneWay('Tasks.tasksController.selection')
             }),

             serverMessageView: SC.LabelView.design({
               layout: { centerY: 0, height: 18, right: 95, width: 250 },
               classNames: ['bottom-bar-label'],
               escapeHTML: NO,
               icon: '',
               textAlign: SC.ALIGN_RIGHT,
               value: '',
               isVisible: NO,
               isVisibleBinding: SC.Binding.transform(function(value, binding) {
                                                        return !value;
                                                      }).from('Tasks.mainPage.mainPane.masterDetailView.masterIsHidden')
             }),

             saveButton: SC.ButtonView.design({
               layout: { centerY: 0, right: 53, height: 24, width: 32 },
               classNames: ['dark'],
               titleMinWidth: 0,
               icon: 'save-icon',
               toolTip: "_SaveTooltip".loc(),
               isEnabledBinding: 'CoreTasks.needsSave',
               isVisibleBinding: SC.Binding.transform(function(value, binding) {
                                                        return !value;
                                                      }).from('CoreTasks.autoSave'),
               target: 'Tasks',
               action: 'saveData'
             }),
             refreshButton: SC.ButtonView.design({
               layout: { centerY: 0, right: 10, height: 24, width: 32 },
               classNames: ['dark'],
               titleMinWidth: 0,
               icon: 'refresh-icon',
               toolTip: "_RefreshTooltip".loc(),
               target: 'Tasks',
               action: 'refreshData',
               isEnabledBinding: SC.Binding.transform(function(value, binding) {
                                                        return value === ''; // when not saving, shown via progress icon
                                                      }).from('Tasks.mainPage.mainPane.serverMessage.icon')
             })

           }) // tasksBottomBar

          }) // tasksList/BottomBar

        }) // detailView

      }) // masterDetailView
       
   }) // mainPane

}); // mainPage
