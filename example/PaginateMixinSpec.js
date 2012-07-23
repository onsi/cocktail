window.MyMixinSpecs = {};
MyMixinSpecs.PaginateMixinSpec = function(context) {
  describe("[Pagination]", function() {
    var view, numberOfPages, ensureOnPage;

    beforeEach(function() {
      view = context.view;
      numberOfPages = context.numberOfPages;
      ensureOnPage = context.ensureOnPage;
    });

    describe("The Contract", function() {
      it("should implement numberOfPages", function() {
        expect(view.numberOfPages).toBeTruthy();
        expect(view.numberOfPages()).toEqual(numberOfPages);
      });

      it("should implement renderCurrentPage", function() {
        expect(view.renderCurrentPage).toBeTruthy();
        view.renderCurrentPage(0);
        ensureOnPage(0);
      });
    });

    describe("jumping to a particular page", function() {
      describe("when the page is in bounds", function() {
        it("should jump to the specified page", function() {
          view.goToPage(0);
          ensureOnPage(0);
          view.goToPage(numberOfPages - 1);
          ensureOnPage(numberOfPages - 1);
        });
      });

      describe("when the page is out of bounds", function() {
        it("should jump to the nearest legal page", function() {
          view.goToPage(-1);
          ensureOnPage(0);
          view.goToPage(numberOfPages);
          ensureOnPage(numberOfPages - 1);
        });
      });
    });

    describe("clicking between pages", function() {
      it("should allow the user to go to the next/previous page and hide/show the next/previous buttons appropriately", function() {
          view.goToPage(0);
          expect(view.$('.previous').hasClass('hidden')).toBeTruthy();

          view.$('.next').click();
          ensureOnPage(1);
          expect(view.$('.previous').hasClass('hidden')).toBeFalsy();

          view.goToPage(numberOfPages - 1);
          ensureOnPage(numberOfPages - 1);
          expect(view.$('.next').hasClass('hidden')).toBeTruthy();
          expect(view.$('.previous').hasClass('hidden')).toBeFalsy();

          view.$('.previous').click();
          ensureOnPage(numberOfPages - 2);
          expect(view.$('.next').hasClass('hidden')).toBeFalsy();
      });
    })
  });
}