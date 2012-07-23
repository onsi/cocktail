window.MyPaginatedView = Backbone.View.extend({
  mixins: [MyMixins.PaginateMixin],

  render: function() {
    this.$el.append('<div class="the-number"></div>')
  },

  renderCurrentPage: function(page) {
    this.$('.the-number').text(page + 1);
  },

  numberOfPages: function() {
    return 10;
  }
})
