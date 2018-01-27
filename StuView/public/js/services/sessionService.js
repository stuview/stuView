/**
 * Session service for handling sessions
 */
materialAdmin.factory('sessionService', ['$http', function($http) {
    return {
        get: function(key) {
            return sessionStorage.getItem(key);
        },
        set: function(key, value) {
            return sessionStorage.setItem(key, value);
        },
        setAll: function(ara) {
            var result = {};
            angular.forEach(ara, function(val, key) {
                result[key] = sessionStorage.setItem(key, val);
            });
            return result;
        },
        destroy: function(keyAra) {
            var result = {};
            angular.forEach(keyAra, function(val, key) {
                result[key] = sessionStorage.removeItem(key);
            });

            return result;
        }
    }
}]);