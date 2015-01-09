angular.module('ui-notification',[]);

angular.module('ui-notification').value('uiNotificationTemplates','angular-ui-notification.html');

angular.module('ui-notification').factory('Notification', function(
	$timeout, uiNotificationTemplates, $http, $compile, $templateCache, $rootScope, $injector, $sce) {

	var startTop = 10;
	var startRight = 10;
	var verticalSpacing = 10;
	var horizontalSpacing = 10;
	var type = '';
	var delay = 5000;
	var align='';

	var messageElements = [];

	var notify = function(args, t){

		if (typeof args !== 'object'){
			args = {message:args};
		}

		args.template = args.template ? args.template : uiNotificationTemplates;
		args.delay = !angular.isUndefined(args.delay) ? args.delay : delay;
		args.type = t ? t : '';

		$http.get(args.template,{cache: $templateCache}).success(function(template) {

			var scope = $rootScope.$new();

			scope.message = $sce.trustAsHtml(args.message);
			scope.title = $sce.trustAsHtml(args.title);
			scope.closeBtn = !(angular.isUndefined(args.closeBtn))?args.closeBtn:false;


			scope.t = args.type.substr(0,1);
			scope.delay = args.delay;

			if (typeof args.scope === 'object'){
				for (var key in args.scope){
					scope[key] = args.scope[key];
				}
			}
			if (typeof args.align === 'string' && args.align!==''){
				align = args.align;
			}else{
				align = 'right';
			}

			var reposite = function() {
				var j = 0;
				var k = 0;
				var lastTop = startTop;
				var lastRight = startRight;
				for(var i = messageElements.length - 1; i >= 0; i --) {
					var element = messageElements[i];
					var elHeight = parseInt(element[0].offsetHeight);
					var elWidth = parseInt(element[0].offsetWidth);
					if ((top + elHeight) > window.innerHeight) {
						lastTop = startTop;
						k ++;
						j = 0;
					}
					var top = lastTop + (j === 0 ? 0 : verticalSpacing);
					var right = startRight + (k * (horizontalSpacing + elWidth));


					element.css('top', top + 'px');
					if(align =='center'){
						element.css('right', 0 + 'px');
						element.css('left', 0 + 'px');
						element.css('margin', '0 auto');
					}
					else
						element.css('right', right + 'px');

					lastTop = top + elHeight;
					j ++;
				}
			};

			var templateElement = $compile(template)(scope);
			templateElement.addClass(args.type);

			if(args.noHoverEffect){
				templateElement.addClass('no-hover-effect');
			}else
				templateElement.addClass('hover-effect');

			templateElement.bind('webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd click', function(e){

				var removeOnClick = !scope.closeBtn && e.type === 'click';


				if (removeOnClick || (e.propertyName === 'opacity' && e.elapsedTime >= 1)){

					closeNotification();
				}
			});


			var closeNotification = function(){
				templateElement.remove();
				messageElements.splice(messageElements.indexOf(templateElement), 1);
				reposite();
			};

			$timeout(function() {
				templateElement.addClass('killed');
			}, args.delay);

			angular.element(document.getElementsByTagName('body')).append(templateElement);
			messageElements.push(templateElement);

			$timeout(reposite);

			scope.dismissNotification = function(){
				closeNotification();
			}


		}).error(function(data){
			throw new Error('Template ('+args.template+') could not be loaded. ' + data);
		});

	};

	notify.config = function(args){
		startTop = args.top ? args.top : startTop;
		verticalSpacing = args.verticalSpacing ? args.verticalSpacing : verticalSpacing;
	};
	notify.primary = function() {
		this(args, '');
	};
	notify.error = function(args) {
		this(args, 'error');
	};
	notify.success = function(args) {
		this(args, 'success');
	};
	notify.info = function(args) {
		this(args, 'info');
	};
	notify.warning = function(args) {
		this(args, 'warning');
	};

	return notify;
});
