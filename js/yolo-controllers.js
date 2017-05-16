'use strict';
/* Controllers */
var yoloControllers = angular.module('yoloControllers', ['yoloServices']);

yoloControllers.controller('NavCtrl',['$scope','$location','$window','deleteAuthToken',
    function NavCtrl($scope, $location, $window, deleteAuthToken) {
        $scope.appName = 'yolo';
        $scope.userName = $window.localStorage.getItem('username');

        $scope.logout = function(){
            // Delete authtoken
            deleteAuthToken();
            // Delete username
            $window.localStorage.removeItem('username');
            $scope.userName = null;
            // Go to landingpage
            $location.path('/');
        };

        $scope.goToDashboard = function() {
            $location.path('/dashboard');
        };
    }
]);

yoloControllers.controller('MainCtrl', ['$scope','$http','$location','saveAuthToken','globalVars','$window',
    function MainCtrl($scope, $http, $location, saveAuthToken, globalVars, $window) {
        $scope.appName = 'yolo';
        $scope.showLogin = false;
        $scope.showSignup = true;
        $scope.userExists = false;
        $scope.erredInputs = [];
        $scope.errors = {
            signupUsername: [],
            signupEmail: [],
            signupPassword: [],
            signupRepeatPassword: [],
            loginUsername: [],
            loginPassword: []
        };

        // Highlight inputs if they have errors
        $scope.highlightInput = function(inputid){
            // Using jquery to add class
            $('#' + inputid).addClass('yolo-erred-input');
            // Add erred input id
            $scope.erredInputs.push(inputid);
        }


        // Toggle login form
        $scope.toggleLogin = function(event){
            $scope.showLogin = !$scope.showLogin;
            $scope.showSignup = $scope.showSignup ? !$scope.showSignup : $scope.showSignup;
        };
        // Toggle signup form
        $scope.toggleSignup = function(event){
            $scope.showSignup = !$scope.showSignup;
            $scope.showLogin = $scope.showLogin ? !$scope.showLogin : $scope.showLogin;
         };

         // Access register endpoint
        $scope.yoloRegister = function(){
            // Remove previous errors
            $scope.errors.signupUsername = [];
            $scope.errors.signupEmail = [];
            $scope.errors.signupPassword = [];
            $scope.errors.signupRepeatPassword = [];
            for(var i=0; i < $scope.erredInputs.length; i++) {
                // Remove error highlight via jquery
                $('#' + $scope.erredInputs[i]).removeClass('yolo-erred-input');
            }
            var erred = false;
            // Check username is not empty
            if (!$scope.signupUsername) {
                $scope.highlightInput('signup-username');
                $scope.errors.signupUsername.push('Username cannot be empty');
                erred = true;
            }

            // Check email is not empty
            if (!$scope.signupEmail) {
                $scope.highlightInput('signup-email');
                $scope.errors.signupEmail.push('Email cannot be empty');
                erred = true;
            }

            // Check password is not empty
            if (!$scope.signupPassword) {
                $scope.highlightInput('signup-password');
                $scope.errors.signupPassword.push('Password cannot be empty');
                erred = true;
            }

            // Check passwords match
            if ($scope.signupPassword !== $scope.signupRepeatPassword) {
                // Highlight errors
                $scope.highlightInput('signup-password');
                $scope.highlightInput('signup-repeat-password');

                // Display message
                $scope.errors.signupRepeatPassword.push("Passwords don't match");
                erred = true;
            }

            if(erred)
                return;

            // Access API
            $http({
                method : 'POST',
                url : globalVars.apiRoot + 'auth/register',
                data: $.param({
                    'username': $scope.signupUsername,
                    'email': $scope.signupEmail,
                    'password': $scope.signupPassword
                }),
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function success(response) {
            // Log in user
            $scope.loginUsername = response.data.username;
            $scope.loginPassword = $scope.signupPassword;
            $scope.yoloLogin();
        },
        function error(response){
            // Highlight new errors
            if (response.status == 400){  // Form errors
                 if (response.data.username){
                    $scope.highlightInput('signup-username');
                    $scope.errors.signupUsername = response.data.username;
                 }
                 if (response.data.email){
                    $scope.highlightInput('signup-email');
                    $scope.errors.signupEmail = response.data.email;
                 }
                 if (response.data.password){
                    $scope.highlightInput('signup-password');
                    $scope.errors.signupPassword = response.data.password;
                 }
            }
            else if (response.status == 403){ // User exists
                // Go to login
                $scope.userExists = true;
                $scope.showSignup = false;
                $scope.showLogin = true;
                $scope.loginUsername = $scope.signupUsername;
                $scope.userErrorMessage = 'User exists. Could you be trying to log in?';
            }
        });
        };

        // Access login endpoint
        $scope.yoloLogin = function(){
            // Clear previous errors
            $scope.errors.loginPassword = [];
            $scope.errors.loginUsername = [];
            for(var i=0; i < $scope.erredInputs.length; i++) {
                // Remove error highlight via jquery
                $('#' + $scope.erredInputs[i]).removeClass('yolo-erred-input');
            }

            var erred = false;
            // Check username is not empty
            if(!$scope.loginUsername){
                $scope.highlightInput('login-username');
                $scope.errors.loginUsername.push('Fill in username');
                erred = true;
            }
            // Check password is not empty
            if(!$scope.loginPassword){
                $scope.highlightInput('login-password');
                $scope.errors.loginPassword.push('Fill in password');
                erred = true;
            }

            if(erred)
                return;

            $http({
                method : 'POST',
                url : globalVars.apiRoot + 'auth/login',
                data: $.param({
                    'username': $scope.loginUsername,
                    'password': $scope.loginPassword
                }),
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function success(response) {
            // Save new token
            saveAuthToken(response.data.token);
            // Save new username
            $window.localStorage.setItem('username',response.data.user)
            // Go to dashboard
            $location.path('/dashboard');
        },
        function error(response){
            // Highlight form errors
            if (response.status == 400){
                if (response.data.username){
                    $scope.highlightInput('login-username');
                    $scope.errors.loginUsername = response.data.username;
                 }
                 if (response.data.password){
                    $scope.highlightInput('login-password');
                    $scope.errors.loginPassword = response.data.password;
                 }
            }
            // Bad credentials but no form error
            else if (response.status == 401){
                $scope.userErrorMessage = 'Wrong username or password';
                $scope.userExists = true
            }

        });
        };
    }]);

yoloControllers.controller('DashboardCtrl', ['$scope', '$http','Bucketlist','$location',
    function DashboardCtrl($scope, $http, Bucketlist, $location){
        // Get all bucketlists
        Bucketlist.get({}, function success(response){
            $scope.bucketlists = response.bucketlists;
            $scope.currentPage = response.current_page;
            $scope.totalPages = response.pages;
            $scope.pagesButtons = new Array(response.pages);
            // Populate pages buttons with the page
            for(var i=0; i<$scope.pagesButtons.length; i++) {
                $scope.pagesButtons[i] = i+1;
            }
            $scope.noBucketlistsMsg = (!response.number) ? 'You have no bucketlists present' : '';
        },
        function error(response){
            // Lacks authentication, go back home
            $location.path('/')
        });
        $scope.loadBucketlist = function(){
            $location.path('/viewbucketlist/1');
        };

        $scope.searchBucketlists = function(){
            // send request to search
            if($scope.searchTerm !== '' && $scope.searchTerm !== undefined){
                var searchPath = '/search/' + $scope.searchTerm;
                $location.path(searchPath);
            }
            return;
        };

        $scope.showBucketlistForm = false;
        $scope.toggleBucketlistForm = function(){
            $scope.showBucketlistForm = !$scope.showBucketlistForm;
        };
        $scope.errors = {
            bucketlistName: []
        };

        $scope.createBucketlist = function(){
            if($scope.bucketlistName === '' || $scope.bucketlistName === undefined){
                // Add errors
                $scope.errors.bucketlistName.push('Name cannot be empty');
                return;
            }
            // Post to API
            Bucketlist.create({}, $.param({ 'name': $scope.bucketlistName }), function success(response){
                // Add new bucketlist
                $scope.bucketlists.push(response);

                // Clear no bucketlist message
                if ($scope.noBucketlistsMsg)
                    $scope.noBucketlistsMsg = '';

            }, function error(response){
                if (response.status == 400){ // Form errors
                    for (var i=0;i<response.data.name.length;i++){
                        $scope.errors.bucketlistName.push(response.data.name[i]);
                    }
                }
                else if (response.status == 403){
                    // Lacks authentication, go home
                    $location.path("/");
                }

            });
        };

        $scope.getPage = function(page){
            // Use bucketlist service with pages variable
            Bucketlist.get({page: page}, function success(response){
                $scope.bucketlists = response.bucketlists;
                $scope.currentPage = response.current_page;
                $scope.totalPages = response.pages;
                },
                function error(response){
                    // Lacks authentication, go back home
                    $location.path('/');
            });
        };
    }]);

yoloControllers.controller('BucketlistCtrl', ['$scope','$routeParams','SingleBucketlist','Item','$location','SingleItem',
    function($scope, $routeParams, SingleBucketlist, Item, $location, SingleItem){
        // Get the bucketlist
        SingleBucketlist.get({id: $routeParams.id}, function success(response){
            $scope.bucketlist = response;
            $scope.isBucketlistPresent = true;
        }, function error(response){
            // Go back to dashboard,
            if (response.status === 400){
                    $scope.errors.itemName = (response.data.name);
                }
            else if (response.status === 401){
                $scope.isBucketlistPresent = false;
                $location.path('/');
            }
            $location.path('/dashboard');
        });

        $scope.showEditBucketlistForm = false;

        $scope.toggleEditBucketlistForm = function() {
            $scope.showEditBucketlistForm = !$scope.showEditBucketlistForm;
        };

        $scope.errors = {
            itemName: [],
            bucketlistErrors: [],
            bucketlistEditErrors: []
        };

        $scope.addNewItem = function() {
            // Use item service to add item if name is present
            if($scope.newItemName === '' || $scope.newItemName === undefined) {
                $scope.errors.itemName = ['Item name cannot be empty'];
                return;
                }
            Item.add({bucketlistId: $scope.bucketlist.id}, $.param({name: $scope.newItemName}), function success(response){
                $scope.bucketlist.items.push(response);
                $scope.errors.itemName = [];
            }, function error(response) {
                // Logged out
                if (response.status === 401){
                    $location.path('/');
                }
                // Form errors
                else if (response.status === 400){
                    $scope.errors.itemName = (response.data.name);
                }
                // Server errors etc
                else{
                    $scope.errors.itemName = ['An error occured and item could not be added. Reload page.'];
                }
            });

        };

        $scope.showEditBox = function(itemId, itemIndex) {
            // Show an item's edit box via jquery
            $("#item-" + itemId).toggleClass('hidden');
            // Set name
            $('#new-name-' + itemId).val($scope.bucketlist.items[itemIndex].name);
            // Set done
            $('#item-edit-done-' + itemId).attr('checked', $scope.bucketlist.items[itemIndex].done);
        };

        $scope.editItem = function(itemId, itemIndex) {
            // Clear previous errors
            $scope.errors.itemName = []

            // Get new name via jquery
            var newItemName = $('#new-name-' + itemId).val();
            var itemEditDone = $('#item-edit-done-' + itemId).is(':checked');
            // Use service to edit the item
            if (newItemName === '' || newItemName === undefined){
                $scope.errors.itemName = ['Name cannot be empty'];
                return;
            }
            SingleItem.edit({bucketlistId: $scope.bucketlist.id, 'itemId': itemId}, $.param({name: newItemName, done:itemEditDone}),
            function success(response){
                // Reassign object
                $scope.bucketlist.items[itemIndex] = response;
            }, function error(response){
                if(response.status === 400){
                    $scope.errors.itemName = response.data.name;
                }
                else{
                    $scope.errors.itemName = ['Item could not be edited'];
                }
            });
        }

        $scope.setActiveItem = function(itemId, itemIndex) {
            $scope.activeItem = {id:itemId, index: itemIndex};
        };

        $scope.deleteChosenItem = function() {
            // Clear previous errors
            $scope.itemDeleteSuccess = '';
            $scope.errors.itemDeleteSuccess = '';

            SingleItem.remove({bucketlistId: $scope.bucketlist.id, 'itemId': $scope.activeItem.id},
            function success(response) {
                // Show message and remove item
                $scope.itemDeleteSuccess = response.message;
                $scope.bucketlist.items[$scope.activeItem.index] = null;
            },
            function error(response) {
                // Show error
                if (response.status === 404){
                    $scope.errors.itemDeleteError = response.data.message;
                }
                else{
                    $scope.errors.itemDeleteError = 'An error occurred and the item could not be deleted';
                }
            }
            );
        };

        $scope.deleteBucketlist = function(){
            // Close modal
            SingleBucketlist.remove({id: $scope.bucketlist.id}, function success(response){
                // Switch to dashboard
                $scope.isBucketlistPresent = false;
                $scope.bucketlist = null;
                $scope.errors.bucketlistErrors = ['Bucketlist deleted. Nothing to do here. Reload page.'];
            }, function error(response){
                if (response.status === 404){
                    $scope.errors.bucketlistErrors = [response.data.message];
                }
                else{
                    $scope.errors.bucketlistErrors = ['An error occured while deleting. Reload page'];
                }
            });
        };

        $scope.editBucketlistName = function(){
            // Clear previous errors
            $scope.errors.bucketlistEditErrors = [];

            // Name cannot be empty
            if ($scope.newBucketlistName === '' || $scope.newBucketlistName === undefined){
                $scope.errors.bucketlistEditErrors = ['Bucketlist name cannot be empty'];
                return;
            }
            // Edit the bucketlist name
            SingleBucketlist.edit({id: $scope.bucketlist.id}, $.param({name: $scope.newBucketlistName}),
            function success(response) {
                // Change the name
                $scope.bucketlist = response;
                $scope.errors.bucketlistErrors = ['Bucketlist has been edited successfully'];
            }, function error(response) {
                // Show errors
                if (response.status == 400) {
                    $scope.errors.bucketlistEditErrors = response.data.name;
                }else{
                    $scope.errors.bucketlistEditErrors = ['An error occured and we could not edit the name'];
                }
            });
        };

        $scope.goToDashboard = function(){
            $location.path('/dashboard');
        };

    }
]);

yoloControllers.controller('SearchCtrl', ['$scope','Bucketlist','$location','$routeParams',
    function($scope, Bucketlist, $location, $routeParams){
        $scope.searchTerm = $routeParams.searchTerm;
        Bucketlist.get({q: $scope.searchTerm}, function success(response){
            $scope.bucketlists = response.bucketlists;
            $scope.currentPage = response.current_page;
            $scope.totalPages = response.pages;
            $scope.totalResults = response.number;
            $scope.pagesButtons = new Array(response.pages);
            // Populate pages buttons with the page
            for(var i=0; i<$scope.pagesButtons.length; i++) {
                $scope.pagesButtons[i] = i+1;
            }
        });
        $scope.goToDashboard = function(){
            $location.path('/dashboard');
        };
    }

]);

yoloControllers.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() +
      input.substr(1).toLowerCase() : '';
    }
});
