# Cocktail

Break out your shared [Backbone.js](http://backbonejs.org) model/collection/view behaviors into separate modules and mix them into your classes with Cocktail - an implementation of Backbone mixins.

## Concocting Mixins

Mixins are simply bare-bones JavaScript objects that provide additional functionality to your Backbone objects.  Think of them as bags of methods that will get added to all instances of your objects.

Here's an example mixin that implements selectability on a view based on a model's selection state:

    window.MyMixins = {};
    
    MyMixins.SelectMixin = {
      initialize: function() {
        this.model.on('change:select', this.refreshSelect, this);
      },

      events: {
        click: 'toggleSelect'
      },

      render: function() {
        this.refreshSelect();
      },

      refreshSelect: function() {
        this.$el.toggleClass('selected', this.model.get('selected'));
      },

      toggleSelect: function() {
        this.model.set('selected', !this.model.get('selected'));
      }
    }

As you can see: nothing special, just a bag of functions.

> Obviously, the bit about `window.MyMixins` is just a suggested pattern for organizing your mixins!

> And, yes, having models know about view state like selection is often an anti-pattern... but it makes for a simple intelligible example!

## Mixing Mixins In

Once you have your mixins defin;;ed including them in your Backbone object definitions is a one-liner:

    var MyView = Backbone.View.extend({

      mixins: [MyMixins.SelectMixin, MyMixins.SometherMixin],

      events: {
        'click .myChild': 'myCustomHandler'
      }

      initialize: function() {
        ...
      },

      render: function() {
        ...
      },

      etc...
    });

Now all instances of `MyView` will have the selection behavior defined in the `SelectMixin`:

    var view = new MyView(...);
    view.toggleSelect(); //works!


## But What About Collisions?

In the example above, both `MyView` and `SelectMixin` defined `initialize`, `render`.  What happens with these colliding properties?

Cocktail automatically ensures that methods defined in your mixins do not obliterate the corresponding methods in your classes.  This is accomplished by wrapping all colliding methods into a new method that is then assigned to the final composite object.

### How are colliding functions called?

Let's take a concrete example.  Class **X** implements `render` and mixes in mixins **A**, **B**, and **C** (in that order).  Of these only **A** and **C** implement `render`.

When `render` is called on instances of **X** the implementation of `render` in **X** is called first, followed by the implementation in **A** and then **C**.  In this way the original implementation is always called first, followed by the mixins.

### What are the return values from colliding functions?

The return value of the composite function is the **last** non-`undefined` return value from the chain of colliding functions.

To be clear: let's say **X** mixes in **A** and **B**.  Say **X** implements a method `foo` that returns `bar`, **A** implements `foo` but returns nothing (i.e. `undefined` is implicitly returned) and **B** implements `baz`.  Then instances of **X** will return `baz` -- the last non-`undefined` return value from `foo`'s **X** &rarr; **A** &rarr; **B** collision chain.

## And how about that events hash?

The events hash is special-cased by Cocktail.  Mixins can define new events hashes. The set of event hashes (original implementation + each mixin) are merged together.

Note that key-collisions are still possible.  If two mixins add a `click` handler to the events hash (`{'click': ... }`) then the last mixin in the mixins list's event handler will win.

## Dependencies and "Installation"

Cocktail requires:

  - [Backbone](http://backbonejs.org) (duh) (tested with 0.9.2)
  - [Underscore](http://underscorejs.org) (tested with 1.3.3)

To use Cocktail you must include `Cocktail.js` it *after* including Underscore and Backbone.  Cocktail monkey-patches backbone's extend!

Future changes to backbone could break Cocktail or obviate its need.  If the latter happens - great!  If the former: let me know and I'll try to ensure compatibility going forward.

## If you like Cocktail...
...check out [Coccyx](http://github.com/onsi/coccyx).  Coccyx helps you plug up backbone leaks with two things: named constructors and tear-downable view hierarchies.

--------------

# Testing Mixins

This section presents a testing pattern for testing mixins with [Jasmine](http://www.github.com/pivotal/jasmine).

### The problem

Mixins define new behavior that can be applied across multiple Backbone objects.  This dries up code nicely.  But how to test each object that uses the mixin without repeating the same test code across multiple specs?

### The heart of the problem

One solution is to dry up our specs by only testing one of the objects that uses the mixin in question.  This is the wrong answer.  We want to test that our mixin operates correctly in all our objects.

Moreover, this becomes crucially important in an interpreted language like JavaScript where there are no explicity interfaces.  Quite often objects that use mixins must abide by some sort of *implicit* contract.  An easy to use, and robust, spec can serve the dual purpose of making that contract *explicity* and enforcing it.

### An example mixin

Consider a mixin that allows views to perform some basic pagination:

    MyMixins.PaginateMixin = {
      initialize: function() {
        this.currentPage = 0;
      },

      events: {
        'click .previous': goToPreviousPage,
        'click .next': goToNextPage
      }

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
        return this.goToPage(this.currentPage + 1);
      }
    }

It is not immediately obvious, but any class that uses this mixin must abide by an implicit contract.  It must define `numberOfPages()` and `renderCurentPage()`.

### An example mixin spec

Jasmine does not have a formal way to define shared behaviors.  This is not a problem (we're using JavaScript after all)!  Here's one way to pull off shared behaviors:

    MyMixinSpecs = {};
    MyMixinSpecs.PaginateMixinSpec = function(context) {
      describe("[Paginate]", function() {
        var view, numberOfPages, ensureOnPage;

        beforeEach(function() {
          view = context.view;
          numberOfPages = context.numberOfPages;
          ensureOnPage = context.ensureOnPage;
        });

        describe("The Contract" {
          it("should implement numberOfPages", function() {
            expect(view.numberOfPages).toBeTruthy();
            expect(view.numberOfPages()).toEqual(numberOfPages);
          });

          it("should impelment renderCurrentPage", function() {
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
              expect(view.$('.previous')).toHaveClass('hidden');
              
              view.$('.next').click();
              ensureOnPage(1);
              expect(view.$('.previous')).not.toHaveClass('hidden');

              view.goToPage(numberOfPages - 1);
              ensureOnPage(numberOfPages - 1);
              expect(view.$('.next')).toHaveClass('hidden');
              expect(view.$('.previous')).not.toHaveClass('hidden');

              view.$('.previous').click();
              ensureOnPage(numberOfPages - 2);
              expect(view.$('.next')).not.toHaveClass('hidden');
          });
        })
      });
    }

That's a lot of code!  All the more reason to avoid repeating it!

Note that the mixin spec is a function builds a mini-hierarchy of Jasmine tests.  This function accepts a `context` argument.  This allows our spec to pass information down to the mixin spec.  In particular, we pass three things in: the `view` to be tested, the number of pages to expect the view to have, and a method called `ensureOnPage` that runs all the tests necessary to ensure that the view is, indeed, displaying the passed in page.

Note also that we explicitly test the contract as part of the mixin test.  This makes it very easy for the author of the mixin to communicate his or her intent to developers who wish to use the mixin.

### An example usage and its accompanying spec

Consider this view:

    MyPaginatedView = Backbone.View.extend({
      mixins: [MyMixinSpecs.PaginateMixinSpec],

      render: function() {
        this.$el.append('<div class="the-number"></div>')
      },

      renderCurrentPage: function(page) {
        $('.the-number').text(page + 1);
      },

      numberOfPages: function() {
        return 10;
      }
    })

Here's how we'd test this view:

    describe("MyPaginatedView", function() {
      var context = {};

      beforeEach(function() {
        context.view = new MyPaginatedView();
        context.numberOfPages = 10;
        context.ensureOnPage = function(page) {
          expect($('.the-number').text()).toEqual('' + page + 1);
        }

        context.view.render();
      });

      MyMixinSpecs.PaginateMixinSpec(context);
    });

Obviously this is a somewhat canned example.  However this principle could apply to more complicated mixins and classes.