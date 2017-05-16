var yoloServices = angular.module('yoloServices', ['ngResource', 'ngCookies']);

//Bucketlist services
yoloServices.factory('Bucketlist', ['$resource', 'getAuthTokens','globalVars',
    function ($resource, getAuthTokens, globalVars) {
        // console.log(globalVars.authToken);
        return $resource(
            globalVars.apiRoot + 'bucketlists/',
        {}, {
        get: {
            method: 'GET',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + globalVars.authToken }},
        create: {
            method: 'POST',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + globalVars.authToken, 'Content-Type': 'application/x-www-form-urlencoded'}}
    });
}]);

yoloServices.factory('SingleBucketlist', ['$resource', 'getAuthTokens','globalVars',
    function ($resource, getAuthTokens, globalVars) {
        return $resource(
            globalVars.apiRoot + 'bucketlists/:id',
        {}, {
        get: {
            method: 'GET',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + globalVars.authToken}
        },
        remove: {
            method: 'DELETE',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + globalVars.authToken}
        },
        edit: {
            method: 'PUT',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + globalVars.authToken, 'Content-Type': 'application/x-www-form-urlencoded'}
        }
        }
        );
    }
]);

yoloServices.factory('Item', ['$resource', 'getAuthTokens','globalVars',
    function ($resource, getAuthTokens, globalVars) {
        return $resource(
            globalVars.apiRoot + 'bucketlists/:bucketlistId/items/',
            {},{
            add: {
                method: 'POST',
                cache: false,
                isArray: false,
                headers: { Authorization: 'Basic ' + globalVars.authToken, 'Content-Type': 'application/x-www-form-urlencoded'}
            }
            }
        );
    }
]);

yoloServices.factory('SingleItem', ['$resource', 'getAuthTokens','globalVars',
    function ($resource, getAuthTokens, globalVars){
        return $resource(
            globalVars.apiRoot + 'bucketlists/:bucketlistId/items/:itemId/',
            {},{
            edit: {
                method: 'PUT',
                cache: false,
                isArray: false,
                headers: { Authorization: 'Basic ' + globalVars.authToken, 'Content-Type': 'application/x-www-form-urlencoded'}
            },
            remove: {
                method: 'DELETE',
                cache: false,
                isArray: false,
                headers: { Authorization: 'Basic ' + globalVars.authToken}
            }
            }
        );
    }
]);

// Store auth tokens
yoloServices.factory('saveAuthToken',['$window','globalVars',
    function($window, globalVars) {
        return function(token) {
        var encodedToken = btoa(token + ':');
        $window.localStorage.setItem('authtoken', encodedToken);
        globalVars.authToken = $window.localStorage.getItem('authtoken');
    };
}]);

// Check for auth-tokens
yoloServices.factory('getAuthTokens', ['$window','globalVars',
    function($window, globalVars) {
        return function() {
            globalVars.authToken = $window.localStorage.getItem('authtoken');
        };
    }]);

// Delete auth credentials
yoloServices.factory('deleteAuthToken', ['$window','globalVars',
    function($window, globalVars) {
        return function() {
            $window.localStorage.removeItem('authtoken');
            globalVars.authToken = null;
    };
}]);

// Global variables
yoloServices.factory('globalVars', [
    function() {
        return {
            apiRoot: 'http://127.0.0.1:5000/api/v1/',
            authToken: null
        };
    }
]);