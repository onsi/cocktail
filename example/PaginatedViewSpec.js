describe("MyPaginatedView", function() {
  var context = {};

  beforeEach(function() {
    context.view = new MyPaginatedView();
    context.numberOfPages = 10;
    context.ensureOnPage = function(page) {
      expect($('.the-number').text()).toEqual(page + 1 + '');
    }

    $('#content').append(context.view.$el);
    context.view.render();
  });

  MyMixinSpecs.PaginateMixinSpec(context);
});
