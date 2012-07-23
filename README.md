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

In the example above, both `MyView` and `SelectMixin` both defined `initialize`, and `render`.  What happens with these colliding methods?

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

The example directory includes an example mixin and its usage, and the accompanying [Jasmine](http://www.github.com/pivotal/jasmine) test.  It also includes a [readme](http://www.github.com/onsi/cocktail/example/README.md) that walks through the testing pattern employed for testing mixins with Jasmine.