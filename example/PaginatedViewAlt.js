(function (Cocktail) {
  'use strict';

  // Showcases the instance-based mixin method
  // as opposed to the constructor extension
  window.MyPaginatedViewAlt = Backbone.View.extend({
    initialize: function () {
      Cocktail.mixin(this, window.MyMixins.PaginateMixin);
    },

    render: function() {
      this.$el.append('<div class="the-number"></div>');
    },

    renderCurrentPage: function(page) {
      this.$('.the-number').text(page + 1);
    },

    numberOfPages: function() {
      return 10;
    }
  });
})(window.Cocktail);
