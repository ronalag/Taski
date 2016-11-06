module.exports = {
    "cloneProperties": function (obj) {
       var properties = obj && obj.properties,
           object = obj && obj.object,
           result = {};

       if (!Array.isArray(properties) || !object) {
         return result;
       }

       properties.forEach(function (property) {
         var value = object[property];

         if (typeof value !== "undefined") {
           result[property] = value;
         }
       });

       return result;
    },
    "createGuid": function() {
        var s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },
    "resolvePath": function (obj, path) {
        var arr = typeof path === "string" && path.split("."),
            i,
            length = arr && arr.length;

        if (!obj || !Array.isArray(arr)) {
            return undefined;
        }

        for (i = 0; obj && i < length; i++) {
            obj = obj[arr[i]];
        }

        return obj;
    },
};
