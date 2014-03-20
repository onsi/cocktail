# Cocktail

Break out your shared [Backbone.js](http://backbonejs.org) model/collection/view behaviors into separate modules and mix them into your classes with Cocktail - an implementation of Backbone mixins.

* `bower install cocktail`
* `npm install backbone.cocktail`

## Concocting Mixins

Mixins are simply bare-bones JavaScript objects that provide additional functionality to your Backbone objects.  Think of them as bags of methods that will get added to all instances of your objects.

Here's an example mixin that implements selectability on a view based on a model's selection state:

    window.MyMixins = {};

    MyMixins.SelectMixin = {
      initialize: function() {
        this.model.on('change:selected', this.refreshSelect, this);
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

Once you have your mixins defined including them in your Backbone object definitions is a one-liner:

    var MyView = Backbone.View.extend({
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

    Cocktail.mixin(MyView, MyMixins.SelectMixin, MyMixins.SomeOtherMixin);

Now all instances of `MyView` will have the selection behavior defined in the `SelectMixin`:

    var view = new MyView(...);
    view.toggleSelect(); //works!


**Alternatively**, you can lazily mix into your views/models like so:

    var MyView = Backbone.View.extend({
      events: {
        'click .myChild': 'myCustomHandler'
      }

      initialize: function() {
        Cocktail.mixin(this, MyMixins.SelectMixin, MyMixins.SomeOtherMixin);
      },

      render: function() {
        ...
      },

      etc...
    });

This looks a bit cleaner if you can't monkeypatch (described below). In addition, this syntax gives you the flexibility
to mix in certain methods in particular states of your application. For example, maybe you have an interface that you'd like
an object to assume on login/logout or in the presence of another object (like a Flash embed).

### If you don't mind monkeypatching

By default, as of 0.2.0 Cocktail no longer messes with Backbone's built-in extend method.  However, if you don't mind some monkey patching then running:

    Cocktail.patch(Backbone);

*before* you define any classes will allow you to mixin code like this:

    var MyView = Backbone.View.extend({
      mixins: [MyMixins.SelectMixin, MyMixins.SomeOtherMixin],

      etc...
    });

or like this for CoffeeScript users:

    class MyView extends Backbone.View
      @mixin MyMixins.SelectMixin


with the monkey-patch installed, mixins are just a convenient bit of configuration at the top of your class definitions. Note that the patch should only be applied once.

### Named mixins

Whether or not you're monkey patching Backbone, you can also use named mixins by registering them with Cocktail:

    Cocktail.mixins = {
      select: MyMixins.SelectMixin,
      other: MyMixins.SomeOtherMixin
    };

    // Without monkey patching
    Cocktail.mixin(MyView, 'select', 'other', MyMixins.yetAnotherMixin);

    // With monkey patching
    var MyView = Backbone.View.extend({
      mixins: ['select', 'other', MyMixins.yetAnotherMixin],

      etc...
    });

## But What About Collisions?

In the example above, both `MyView` and `SelectMixin` both defined `initialize`, and `render`.  What happens with these colliding methods?

Cocktail automatically ensures that methods defined in your mixins do not obliterate the corresponding methods in your classes.
This is accomplished by wrapping all colliding methods into a new method that is then assigned to the final composite object.

Note: Cocktail will ensure that if you accidentally try to mix in the same method, it will not result in a collision and will do nothing.

### How are colliding functions called?

Let's take a concrete example.  Class **X** implements `render` and mixes in mixins **A**, **B**, and **C** (in that order).  Of these only **A** and **C** implement `render`.

When `render` is called on instances of **X** the implementation of `render` in **X** is called first, followed by the implementation in **A** and then **C**.  In this way the original implementation is always called first, followed by the mixins.

### What are the return values from colliding functions?

The return value of the composite function is the **last** non-`undefined` return value from the chain of colliding functions.

To be clear: let's say **X** mixes in **A** and **B**.  Say **X** implements a method `foo` that returns `bar`, **A** implements `foo` but returns nothing (i.e. `undefined` is implicitly returned) and **B** returns `baz`.  Then instances of **X** will return `baz` -- the last non-`undefined` return value from `foo`'s **X** &rarr; **A** &rarr; **B** collision chain.

## And how about hashes?

When both a mixin and the class define a hash, Cocktail will merge the hashes together.  In the case of a key collision, keys and values defined in the hash on the class take precedence followed the hash on the first mixin, then the second mixin, etc...

Note that this includes the events hash.  As a result, mixins are allowed to add new event listeners.

## And what about subclasses?

Subclass hierarchies with mixins should work just fine.  If a super class mixes in a mixin, then all subclasses will inherit that mixin.  If those subclasses mixin additional mixins, those mixins will be folded in to the subclasses and collisions will be handled correctly, even collisions with methods further up the class hierarchy.

However, if a subclass redefines a method that is provided by a mixin of the super class, the mixin's implementation will *not* be called.  This shouldn't be surprising: the subclass's method is further up in the prototype chain and is the method that gets evaluated.  In this circumstance, you *must* remember to call `SubClass.__super__.theMethod.apply(this)` to ensure that the mixin's method gets called.

## Testing Mixins

The [example](https://github.com/onsi/cocktail/tree/master/example) directory includes an example mixin and its usage, and the accompanying [Jasmine](http://www.github.com/pivotal/jasmine) test.  It also includes a [readme](https://github.com/onsi/cocktail/tree/master/example) that walks through the testing pattern employed for testing mixins with Jasmine.

## Dependencies, Installation, and Contributing

Cocktail requires:

  - [Backbone](http://backbonejs.org) (duh) (tested with 1.1.0)
  - [Underscore](http://underscorejs.org) (tested with 1.5.1)

Running Tests:

Open up `spec/SpecRunner.html` in your favorite browser.

Contributing:

You can contribute a new build by issuing the terminal command `grunt` within the root folder.


Future changes to backbone could break Cocktail or obviate its need.
If the latter happens - great!  If the former: let me know and I'll try to
ensure compatibility going forward.

## If you like Cocktail...
...check out [Coccyx](http://github.com/onsi/coccyx).  Coccyx helps you plug up backbone leaks with two things: named constructors and tear-downable view hierarchies.
