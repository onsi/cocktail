window.MyMixins = {};
MyMixins.PaginateMixin = {
  initialize: function() {
    this.currentPage = 0;
  },

  events: {
    'click .previous': 'goToPreviousPage',
    'click .next': 'goToNextPage'
  },

  render: function() {
    this.$el.append('<div class="previous"></div>');
    this.$el.append('<div class="next"></div>');
    this.renderCurrentPage(this.currentPage);
  },

  goToPage: function(page) {
    var numberOfPages = this.numberOfPages();

    this.currentPage = Math.min(Math.max(page, 0), numberOfPages - 1);
    this.renderCurrentPage(this.currentPage);

    this.$('.previous').toggleClass('hidden', this.currentPage == 0);
    this.$('.next').toggleClass('hidden', this.currentPage == numberOfPages - 1);

    return this.currentPage;
  },

  goToNextPage: function() {
    return this.goToPage(this.currentPage + 1);
  },

  goToPreviousPage: function() {
    return this.goToPage(this.currentPage - 1);
  }
}