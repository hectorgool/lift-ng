angular
  .module('zen.lift.proxy', [])
  .service('liftProxy', ['$http', '$q', function ($http, $q) {
    var svc = {
      callbacks: {},
      request: function (requestData) {
        var random = function() {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for( var i=0; i < 20; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

          return text;
        };

        var q = $q.defer();
        var id = random();
        var req = requestData.name+'='+encodeURIComponent(JSON.stringify({id:id, data:requestData.data}));
        var cleanup = function() {delete svc.callbacks[id]};

        var responseToQ = function(data) {
          if (data.success) {
            if (data.data) {
              q.resolve(data.data);
            }
            else {
              q.resolve();
            }
          } else {
            q.reject(data.msg)
          }
          cleanup();
        };

        svc.callbacks[id] = responseToQ;

        var returnQ = function(response) {
          var data = response.data;
          if(!data.future) {
            responseToQ(data)
          }
          return q.promise;
        };

        return $http.post('/ajax_request/' + lift_page + '/', req, {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).then(returnQ);
      },
      response: function(response) {
        svc.callbacks[response.id](response);
      }
    };

    return svc;
  }
]);