angular.module('demoModule', ['ngSanitize']).config(function myAppConfig() {

}).run(function run($rootScope) {

}).controller('myController', function AppCtrl($scope, $location, $rootScope, $timeout, $http, $sce) {

	$http.get("labelling.json").success(function(data) {

		$scope.questions = data.
		return          . att_questions;
		$scope.setQuestion(2);

	});

	var dragStartLeft = [];
	var dragStartTop = [];
	var userOrder = "";
	var userInputOrder = [];
	$scope.colorArr = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)', 'rgba(192,192,192,0.5)', 'rgba(255,255,0,0.5)', 'rgba(255,0,255,0.5)', 'rgba(255,150,140,0.5)'];
	$scope.crossBtnModel = [];
	$scope.setQuestion = function(index) {
		$scope.dropables = [];
		$scope.currQuestion = $scope.questions[index];
		$scope.questioncomponents = $scope.questions[index].questioncomponents;
		console.log($scope.currQuestion);
		$scope.currQuestion.answers.forEach(function(x, index) {
			var pos = x.text.split(",");
			var drop = {};
			drop.left = pos[0] + 'px';
			drop.top = pos[1] + 'px';
			drop.width = Math.abs(pos[2] - pos[0]) + 'px';
			drop.height = Math.abs(pos[3] - pos[1]) + 'px';
			drop.id = x.id;
			$scope.crossBtnModel[index] = false;
			$scope.dropables.push(drop);
		});

		var imgregex = /<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/g;
		//regex for image in question text
		var images = $scope.questions[index].text.match(imgregex);
		var arr = [];
		var widthRegex = /(?!")(\d+)(?=")/g;
		if (images.length > 1) {
			images.forEach(function(x) {
				arr.push(Number(x.match(widthRegex)[0]));
			});
            
            //works above IE 8
			var maxWidthImgIndex = arr.indexOf(Math.max.apply(Math, arr));
			
			var maxWidthImage = images[maxWidthImgIndex];

			/****loop for replacing other images******/
            images.forEach(function(image) {

				if (image !== maxWidthImage) {
					$scope.questions[index].text = $scope.questions[index].text.replace(image, "");
				}

			});
		}

		$scope.currQuestionText = $sce.trustAsHtml($scope.questions[index].text);

	};

	function setDropablePosition() {
		$("#dropHolder").css({
			top : $("#question img").position().top,
			left : $("#question img").position().left
		});
	}

	var previousAttr, currentAttr;
	setTimeout(function() {
		setDropablePosition();
		$(".option").draggable({
			containment : ".container",
			revert : "invalid",
			start : function(event, ui) {
				$("#" + ui.helper[0].id).css("zIndex", "5");
				console.log($("#" + ui.helper[0].id).attr("droppedOn"));
				previousAttr = $("#" + ui.helper[0].id).attr("droppedOn");

			},
			stop : function(event, ui) {
				currentAttr = $("#" + ui.helper[0].id).attr("droppedOn");
				$("#" + ui.helper[0].id).css("zIndex", "0");
				if (previousAttr !== currentAttr) {
					$("#cross_" + previousAttr).parent().css("background-color", "transparent");
				}

				var arrOption = $($(".option"));
				arrOption.each(function(e) {
					if ($((arrOption)[e]).attr("droppedOn") === currentAttr) {
						var splitter = $((arrOption)[e]).attr("id").split("_")[2];
						splitter = +splitter;
						var id = $((arrOption)[e]).attr("id");
						$("#" + id).css("top", dragStartTop[splitter - 1] + "px").css("left", dragStartLeft[splitter - 1] + "px");
					}

				});
				$(".crossBtn").css("pointer-events", "auto");
			}
		});

		$(".droppable").droppable({
			accept : ".option",
			drop : function(event, ui) {

				var droppedOn = $(this).attr("id").split("_")[2];
				var arrOption = $($(".option"));
				arrOption.each(function(e) {
					if ($((arrOption)[e]).attr("droppedOn") === droppedOn) {
						console.log("pehle se hai", $((arrOption)[e]), $((arrOption)[e]).attr("id"));
						var splitter = $((arrOption)[e]).attr("id").split("_")[2];
						splitter = +splitter;
						var id = $((arrOption)[e]).attr("id");
						$("#" + id).css("top", dragStartTop[splitter - 1] + "px").css("left", dragStartLeft[splitter - 1] + "px").attr("droppedOn", "0");
					}
				});
				var bgColor = $("#" + ui.helper[0].id).css('backgroundColor');
				$(this).css('backgroundColor', bgColor);
				//css("top", $(this).position().top + "px").css("left", $(this).position().left + "px")
				$("#" + ui.helper[0].id).attr("droppedOn", droppedOn);
				enableDisableDraggable();
				$timeout(function() {
					checkforAllDrops();
				});

			}
		});

		handleDrag();

	}, 1000);

	function enableDisableDraggable() {

		var arrOption = $($(".option"));
		arrOption.each(function(x) {
			var splitter = $((arrOption)[x]).attr("id").split("_")[2];
			splitter = +splitter;
			var id = $((arrOption)[x]).attr("id");
			if ($((arrOption)[x]).attr("droppedOn") === "0") {
				$("#" + id).draggable('enable');

			} else {
				$("#" + id).draggable('disable');
				$scope.crossBtnModel[Number($((arrOption)[x]).attr("droppedOn"))] = true;
			}
		});
		console.log($scope.crossBtnModel);
		if (!$scope.$$phase) {
			$scope.$apply();
		}

	}

	function checkforAllDrops() {
		var arrOption = $($(".option"));
		allDropped = false;

		for (var i = 0; i < arrOption.length; i++) {
			if ($((arrOption)[i]).attr("droppedOn") === "0") {
				allDropped = false;
				break;
			} else {
				allDropped = true;
			}
		}

		console.log(allDropped);
		if (allDropped) {
			userOrder = "";
			for (var j = 1; j <= 5; j++) {
				userInputOrder[j - 1] = $("[droppedOn="+j+"]").attr("id").split("_")[1];
				userOrder = userOrder + $("[droppedOn="+j+"]").attr("id").split("_")[1] + "," + j + ";";
			}
			console.log(userOrder);
			$scope.goAhead = true;

		} else {
			$scope.goAhead = false;
		}

	}

	function handleDrag() {

		var arrOption = $($(".option"));
		arrOption.each(function(e) {
			//console.log(e);
			dragStartLeft[e] = $((arrOption)[e]).position().left;
			dragStartTop[e] = $((arrOption)[e]).position().top;
		});

	}


	$scope.revertDrop = function(index) {
		$("#cross_" + index).parent().css("background-color", "transparent");
		var arrOption = $($(".option"));
		var indexString = index.toString();
		arrOption.each(function(e) {
			if ($((arrOption)[e]).attr("droppedOn") === indexString) {
				var splitter = $((arrOption)[e]).attr("id").split("_")[2];
				splitter = +splitter;
				var id = $((arrOption)[e]).attr("id");
				$scope.crossBtnModel[Number($((arrOption)[e]).attr("droppedOn"))] = false;
				/*$("#" + id).animate({
				 top : dragStartTop[splitter - 1] + "px",
				 left : dragStartLeft[splitter - 1] + "px",
				 }, 500, function() {
				 $("#" + id).attr("droppedOn", "0");
				 });*/
				$("#" + id).attr("droppedOn", "0");
				//$("#" + id).css("top", dragStartTop[splitter - 1] + "px").css("left", dragStartLeft[splitter - 1] + "px").attr("droppedOn", "0");
			}

		});
		enableDisableDraggable();
	};

	$scope.saveAssessment = function() {
		var correctAns = [];
		var savedData = null;
		var answer = false;
		$scope.correctCount = 0;
		var save = appService.saveAssessment(courseID, assessID, $scope.assessmentData[$scope.questionCounter].id, userOrder);
		save.success(function(data) {
			console.log(data);
			savedData = data.
			return;
			console.log(savedData.answers, "answers");

			for (var j = 0; j < savedData.answers.length; j++) {
				if (savedData.answers[j].component_id !== undefined) {
					correctAns[savedData.answers[j].text - 1] = savedData.answers[j].component_id;
				}

			}
			console.log(correctAns, userInputOrder);
			if (correctAns.length === userInputOrder.length) {
				for (var k = 0; k < correctAns.length; k++) {
					if (correctAns[k] == userInputOrder[k]) {
						$scope.correctCount++;
					}
				}
			}

			console.log($scope.correctCount, "answer");
			if ($scope.correctCount > $scope.maxCount) {
				$scope.maxCount = $scope.correctCount;
			}
		});
	};

});
