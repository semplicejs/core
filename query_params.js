module.exports = function(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
  }