//     Cocktail.js 0.1.0

//     (c) 2012 Onsi Fakhouri
//     Cocktail.js may be freely distributed under the MIT license.
//     http://github.com/onsi/cocktail

(function() {
  var originalExtend = Backbone.Model.extend;

  var extend = function(protoProps, classProps) {
    var klass = originalExtend.call(this, protoProps, classProps);
    var mixins = klass.prototype.mixins;

    if (mixins && klass.prototype.hasOwnProperty('mixins')) {
      var collisions = {};

      _(mixins).each(function(mixin) {
        _(mixin).each(function(value, key) {
          if (key == 'events') {
            klass.prototype.events = _.extend({}, klass.prototype.events || {}, value);
          } else if (_.isFunction(value)) {
            if (klass.prototype[key]) {
              collisions[key] = collisions[key] || [klass.prototype[key]];
              collisions[key].push(value);
            }
            klass.prototype[key] = value;
          }
        });
      });

      _(collisions).each(function(propertyValues, propertyName) {
        klass.prototype[propertyName] = function() {
          var that = this, args = arguments, returnValue = undefined;

          _(propertyValues).each(function(value) {
            var returnedValue = _.isFunction(value) ? value.apply(that, args) : value;
            returnValue = (returnedValue === undefined ? returnValue : returnedValue);
          });

          return returnValue;
        }
      });
    }

    return klass;
  }

  Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = extend;
})();
