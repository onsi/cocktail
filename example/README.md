# Testing Cocktail Mixins

This readme presents a testing pattern for testing mixins with [Jasmine](http://www.github.com/pivotal/jasmine).  To run the specs for this example, open up `example/SpecRunner.html`

### The problem

Mixins define new behavior that can be applied across multiple Backbone objects.  This DRYs up code nicely.  But how to test each object that uses the mixin without repeating the same test code across multiple specs?

### The heart of the problem

One solution is to DRY up our specs by only testing one of the objects that uses the mixin in question.  This is the wrong answer: we really do want to test that our mixin operates correctly in *all* objects that use it.

Moreover, this becomes crucially important in an interpreted language like JavaScript where there are no explicit interfaces.  Quite often objects that use mixins must abide by some sort of **implicit** contract.  An easy to use, and robust, spec can serve the dual purpose of making that contract **explicit** *and* of enforcing it.

### An example mixin

Consider a mixin that allows views to perform some basic pagination:

    // PaginateMixin.js

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

It is not immediately obvious, but any class that uses this mixin must abide by an implicit contract.  It must define `numberOfPages()` and `renderCurentPage()`.

### An example mixin spec

Jasmine does not have a formal way to define shared behaviors.  This is not a problem (we're using JavaScript after all)!  Here's one way to pull off shared behaviors:

    // PaginateMixinSpec.js

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

That's a lot of code!  All the more reason to avoid repeating it!

Note that the mixin spec is simply a function builds a mini-hierarchy of Jasmine tests.  This function accepts a `context` argument.  The `context` allows our spec to pass information down to the mixin spec; in particular, we pass three things in: the `view` to be tested, the number of pages to expect the view to have, and a method called `ensureOnPage` that runs all the tests necessary to ensure that the view is, indeed, displaying the passed in page.

Note also that we explicitly test the contract as part of the mixin test.  This makes it very easy for the author of the mixin to communicate his or her intent to developers who wish to use the mixin.

### An example usage and its accompanying spec

Consider this view:

    // PaginatedView.js

    window.MyPaginatedView = Backbone.View.extend({
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

    Cocktail.mixin(MyPaginatedView, MyMixins.PaginateMixin);

Here's how we'd test this view:

    // PaginatedViewSpec.js

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

Note that we set up the context as a closure variable in the outermost describe and **modify** (not *assign* to) that object in our `beforeEach`.  The modifications get passed down to the hierarchy built by `MyMixinSpecs.PaginateMixinSpec` thanks to the closure.

Obviously this is a somewhat canned example.  However this principle could apply to more complicated mixins and classes.