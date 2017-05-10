var yoloServices = angular.module('yoloServices', ['ngResource', 'ngCookies']);

//Bucketlist services
yoloServices.factory('Bucketlist', ['$resource', 'getAuthTokens','globalVars',
    function ($resource, getAuthTokens, globalVars) {
        return $resource(
            globalVars.apiRoot + 'bucketlists/',
        {}, {
        get: {
            method: 'GET',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + getAuthTokens() }},
        create: {
            method: 'POST',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + getAuthTokens(), 'Content-Type': 'application/x-www-form-urlencoded'}}
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
            headers: { Authorization: 'Basic ' + getAuthTokens()}
        },
        remove: {
            method: 'DELETE',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + getAuthTokens()}
        },
        edit: {
            method: 'PUT',
            cache: false,
            isArray: false,
            headers: { Authorization: 'Basic ' + getAuthTokens(), 'Content-Type': 'application/x-www-form-urlencoded'}
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
                headers: { Authorization: 'Basic ' + getAuthTokens(), 'Content-Type': 'application/x-www-form-urlencoded'}
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
                headers: { Authorization: 'Basic ' + getAuthTokens(), 'Content-Type': 'application/x-www-form-urlencoded'}
            }
            }
        );
    }
]);

// Store auth tokens
yoloServices.factory('saveAuthToken',['$cookies',
    function($cookies) {
        return function(token) {
        var encodedToken = btoa(token + ':');
//        $cookies.authToken = encodedToken;
        var now = new Date()
        var expiryDate = new Date(now.getFullYear(), now.getMonth()+12, now.getDate());
        $cookies.put('authToken', encodedToken, {expires: expiryDate})
    };
}]);

// Check for auth-tokens
yoloServices.factory('getAuthTokens', ['$cookies',
    function($cookies) {
        return function() {
            var authentication = $cookies.get("authToken");
            if (authentication !== undefined && authentication !== "") {
                return authentication;
            }
            return "";
        };
    }]);

// Delete auth credentials
yoloServices.factory('deleteAuthToken', ['$cookies',
    function($cookies) {
        return function() {
        if ($cookies.get('authToken') !== '' || $cookies.get('authToken') !== undefined){
            $cookies.remove('authToken');
        }
    };
}]);

// Global variables
yoloServices.factory('globalVars', [
    function() {
        return {
            apiRoot: 'http://127.0.0.1:5000/api/v1/'
        };
    }
]);