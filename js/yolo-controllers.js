'use strict';
/* Controllers */
var yoloControllers = angular.module('yoloControllers', ['yoloServices']);

yoloControllers.controller('MainCtrl', ['$scope','$http','$location','saveAuthToken','deleteAuthToken','globalVars',
    function MainCtrl($scope, $http, $location, saveAuthToken, deleteAuthToken, globalVars) {
        $scope.appName = 'yolo';
        $scope.showLogin = false;
        $scope.showSignup = true;
        $scope.userExists = false;

        // Highlight inputs if they have errors
        $scope.highlightInput = function(inputid){
            $('#' + inputid).css('border', '1px solid #f00');
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
            // Check passwords match
            if ($scope.signupPassword !== $scope.signupRepeatPassword){
                // Highlight errors
                $scope.highlightInput('signup-password');
                $scope.highlightInput('signup-repeat-password');

                // Display message
                $scope.errors.signupRepeatPassword = ["Passwords don't match"];
                return
            }
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
            // Delete existing tokens, save new ones, switch to dashboard
            deleteAuthToken();
            saveAuthToken(response.data.token);
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
            $scope.bucketlist = response
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

        $scope.errors = {
            itemName: [],
            bucketlistErrors: []
        }

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

        $scope.editItem = function(itemId, itemIndex) {
            // Use service to edit the item
            if ($scope.bucketlist.items[itemIndex].name === '' || $scope.bucketlist.items[itemIndex].name === undefined){
                $scope.errors.itemName = ['Name cannot be empty'];
                return;
            }
            SingleItem.edit({bucketlistId: $scope.bucketlist.id, 'itemId': itemId}, $.param({name: $scope.bucketlist.items[itemIndex].name},
            function success(response){
                // Reassign object
                $scope.bucketlist.items[itemIndex] = response;
            }, function error(response){
                $scope.errors.itemName = ['Item could not be edited'];
            }));
        }

        $scope.deleteBucketlist = function(){
            // Close modal
            SingleBucketlist.remove({id: $scope.bucketlist.id}, function success(response){
                // Switch to dashboard
                $scope.bucketlist = {};
                $scope.errors.bucketlistErrors = ['Item deleted. Nothing to do here. Reload page.'];
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
            // Name cannot be empty
            if ($scope.bucketlist.name === '' || $scope.bucketlist.name === undefined){
                $scope.errors.bucketlistErrors = ['Bucketlist name cannot be empty'];
                return;
            }
            // Edit the bucketlist name
            SingleBucketlist.edit({id: $scope.bucketlist.id}, $.param({name: $scope.bucketlist.name}),
            function success(response) {
                // Change the name
                $scope.bucketlist = response;
            }, function error(response) {
                // Show errors
                $scope.errors.bucketlistErrors = ['An error occured and we could not edit the name'];
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
