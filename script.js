(function (self, $, undefined) {
    /*---- Variable Declarations ---- */
    var text = undefined;
	var $taskContext= undefined;
	var $taskEditor = undefined;
	var holdCords = {
		holdX : 0,
		holdY : 0
	};
	self.panel;
	self.taskContextType = ko.observable("");
	self.taskContextTypes = {task:1, lane:2};
	self.currentTask = ko.observable(undefined);
	self.currentLane = ko.observable(undefined);

    /*---- Private Methods ---- */
	function loadDummyData(){
		self.panel = new kanbanData.Panel();		
		addLane("Ready", 0);
		addLane("Doing",5);
		addLane("Done",0);
		self.panel.addCategory(new kanbanData.Category("#0000FF","Kek"));
		self.panel.addCategory(new kanbanData.Category("#9ACD32","Zoldes"));
		self.panel.addCategory(new kanbanData.Category("#DEB887","Barna"));
		self.panel.addCategory(new kanbanData.Category("#ADFF2F","Kaki"));
		self.panel.addCategory(new kanbanData.Category("#FF4500","Narancs"));
		self.panel.addCategory(new kanbanData.Category("#FFFF00","Sarga"));		
		self.panel.lanes()[0]().tasks.push(new kanbanData.Task("title1", "description",self.panel.categories()[0]));		
		self.panel.lanes()[0]().tasks.push(new kanbanData.Task("title2", "description",self.panel.categories()[0]));		
		self.panel.lanes()[0]().tasks.push(new kanbanData.Task("title3", "description",self.panel.categories()[0]));		
		self.panel.lanes()[0]().tasks.push(new kanbanData.Task("title4", "description",self.panel.categories()[0]));	
		self.panel.lanes()[1]().tasks.push(new kanbanData.Task("title1", "description",self.panel.categories()[0]));		
		self.panel.lanes()[2]().tasks.push(new kanbanData.Task("title2", "description",self.panel.categories()[0]));		
		self.panel.lanes()[1]().tasks.push(new kanbanData.Task("title3", "description",self.panel.categories()[0]));		
		self.panel.lanes()[2]().tasks.push(new kanbanData.Task("title4", "description",self.panel.categories()[0]));
	}
	
    function loadInitialData(){	
		var data = localStorage.kanban
		if(data !== undefined){
			//OK
			//alert(data.toString());
			var jsData = JSON.parse(data);			
			var i, l, j, k;
			
			self.panel = new kanbanData.Panel();
			
			var categories = jsData.categories;
			l=categories.length;
			for(i=0;i<l;i++){
				var categ = categories[i];
				self.panel.addCategory(new kanbanData.Category(categ.color,categ.name));
			}
			
			var lanes = jsData.lanes;
			l=lanes.length;
			for(i=0;i<l;i++){
				var lane = lanes[i];
				var laneVM = addLane(lane.description, lane.limit, lane.id);
				k=lanes[i].tasks.length;
				for(j=0;j<k;j++){
					var task = lanes[i].tasks[j];
					laneVM().tasks.push(new kanbanData.Task(task.title, task.description,getCategoryByName(task.category.name)));		
				}
			}
			
			//loadDummyData(); //Change this
		}else{
			//NOK!
			loadDummyData();
		}
	}	
	
	function saveDataBeforeExit(){
		//ToDo...
		localStorage.kanban = ko.toJSON(self.panel);
	}
	
	function dataPresistence(){
		loadInitialData();
		window.onbeforeunload = function(){   						
			saveDataBeforeExit();
			return "Are you sure you want to leave Kanban?";        
		};
	}
	
	function getCategoryByName(name){
		for(var i=0;i<self.panel.categories().length; i++){
			var categ = self.panel.categories()[i];
			if(categ.name() === name){
				return self.panel.categories()[i];
			}
		}
		return self.panel.categories()[0];
	}
	
	function trackPosition(){
		$(document).on('vmousedown', function(event){
				holdCords.holdX = event.pageX;
				holdCords.holdY = event.pageY;
		});
	}
	
	function swapItems(itemList, from, to){
		if( typeof(itemList.splice) == "function" && $.isNumeric(from) && $.isNumeric(to)){
			itemList.splice(to, 0, itemList.splice(from,1)[0]);
		}
	}
	
	function addLane(name, limit, id){
		id = id || self.panel.lanes().length;
		var lane = new kanbanData.Lane(name, limit, id);
		var observableLane = ko.observable(lane);
		self.panel.addLane(observableLane);
		return observableLane;
	}
	
	function initTaskContextMenu(){
		$taskContext=$( "#taskContext" );
		$taskContext.popup({ theme: "a"});
			$taskContext.popup("close");
			$(".panel").on("taphold dblclick", ".lane, .task", function(e){
				e.stopPropagation();
				e.preventDefault();
				if($(e.currentTarget).hasClass("task")){
					self.taskContextType(self.taskContextTypes.task);
					self.currentTask(ko.dataFor(e.currentTarget));
					self.currentLane(ko.dataFor($(e.currentTarget).parents(".lane")[0]));
				}else{
					self.taskContextType(self.taskContextTypes.lane);
					self.currentTask(undefined);
					self.currentLane(ko.dataFor(e.currentTarget));
				}
				$taskContext.popup("open", {x:holdCords.holdX, y:holdCords.holdY});
			});
	}
	
	function initTaskEditor(){
		$taskEditor = $("#taskEditor").popup({ theme: "a"});
		$taskEditor.popup("close");		
	}
	
	function makeEditorsDraggable(){
		$taskEditor.draggable();
		$("#categoryEditor").draggable();
		$("#laneEditor").draggable();
	}
	
	function onPageLoad(){
		$(document).on("pageload, ready", function () {	
			dataPresistence();
			trackPosition();
			initTaskContextMenu();
			initTaskEditor();
			//makeEditorsDraggable();
			ko.applyBindings(self);
		});
	}
	
    /*---- Immediately executed code ---- */
	onPageLoad();	

    /*---- Public Methods ---- */
	self.deleteLane = function(index){
		var i = index();
		self.panel.lanes.splice(i,1);
	};
	
	self.moveLane= function(index, isDown){
		var i = index();
		if(isDown){
			swapItems(self.panel.lanes, i, i+1);
		}else{
			swapItems(self.panel.lanes, i, i-1);
		}
	};
	
    self.addLane = function(){
		addLane("Name",0);
	};
	
	self.closeTaskEditor = function(){
		$taskEditor.popup("close");
	};
	
	self.addTask = function(){
		self.currentTask(new kanbanData.Task("", "",self.panel.categories()[0]));
		self.currentLane().tasks.push(self.currentTask());
		self.editTask();
	};
	
	self.deleteTask = function(){		
		$taskContext.popup("close");
		var taskList = self.currentLane().tasks();
		var taskListLength = taskList.length;
		for(var i=0;i< taskListLength; i++){
			if(taskList[i].id == self.currentTask().id){
				self.currentLane().tasks.splice(i,1);
				return true;
			}
		}
		return false;
	};
	
	self.editTask = function(){
		$taskContext.popup("close");
		setTimeout(function(){
			$taskEditor.popup("open");
		},200);
	};
	
	self.deleteCategory = function(index, data, event){
		var i = index();
		self.panel.deleteCategory(i);
	};
	
	self.addNewCategory = function(){
		var categ = new kanbanData.Category("#FFFFFF","Name");
		categ.expanded(true);
		self.panel.addCategory(categ);
	};
	
} (window.kanban = window.kanban || {}, jQuery));

ko.bindingHandlers.sortable.beforeMove = function(){return true;};
ko.bindingHandlers.sortable.afterMove = function(){return true;};

function GUID(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;
			return v.toString(16);
		});
}

(function (self, $, undefined) {
    /*---- Public Methods ---- */
	self.Panel = function(){
		var self=this;
		self.lanes = ko.observableArray([]);
		self.categories = ko.observableArray([]);
		self.addLane = function(lane){
			self.lanes.push(lane);
		};
		self.addCategory = function(category){
			self.categories.push(category);
		};
		
		self.deleteCategory = function(index){
			self.categories.splice(index,1);
		};
	};	
	
	self.Lane = function(description, limit, id){
		var self = this;
		self.id = id;
		self.description = ko.observable(description);
		self.limit=ko.observable(limit);
		self.tasks = ko.observableArray([]);
		self.addTask = function(task){
			self.tasks.push(task);
		};
	};
	
	self.Task = function(title, description, category){
		var self = this;
		self.id = GUID();
		self.title = ko.observable(title);
		self.description = ko.observable(description);
		self.category = ko.observable(category);
	};
	
	self.Category = function(color, name){
		var self = this;
		self.color = ko.observable(color);
		self.name = ko.observable(name);
		self.inverted = ko.observable(invert());
		self.expanded = ko.observable(false);
		
		self.toggleExpanded = function(data, e){
			self.expanded(!self.expanded());
			if(self.expanded()){
				//$(e.currentTarget).removeClass("ui-btn-up-b").addClass("ui-btn-up-d");
				$(e.currentTarget).find(".ui-icon").removeClass("ui-icon-arrow-r").addClass(" ui-icon-arrow-d");
			}else{
				//$(e.currentTarget).removeClass("ui-btn-up-d").addClass("ui-btn-up-b");
				$(e.currentTarget).find(".ui-icon").removeClass("ui-icon-arrow-d").addClass(" ui-icon-arrow-r");
			}
		};
		
		function invert(){
			var rgbcolor = $("<div style='color:"+self.color()+"'></div>").css("color");
			var list = rgbcolor.split('(')[1].split(')')[0].split(', ');
			for(var i=0;i<list.length;i++){
				var nr = Number(list[i]);
				list[i] = 255-nr;
			}
			return "rgb(" + list[0] + ", " + list[1] + ", " + list[2] + ")";
		}
	}
} (window.kanbanData = window.kanbanData || {}, jQuery));
