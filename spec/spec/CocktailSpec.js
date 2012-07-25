describe('Cocktail', function() {
  var A, B, ViewClass;
  var calls;
  
  beforeEach(function() {
    calls = [];

    A = {
      events: {
        'click .A': 'clickA'
      },

      initialize: function() {
        this.$el.append('<div class="A"></div>');
      },

      theFunc: function() {
        calls.push('theFunc');
        return 'func!'
      },

      clickA: function() {
        calls.push('clickA');
      },

      render: function() {
        calls.push('renderA');
      },

      awesomeSauce: function() {
        calls.push('awesomeA')
        return 'the sauce'
      },

      fooBar: function() {
        calls.push('fooBarA');
        return true;
      }
    }

    B = {
      events: {
        'click .B': 'clickB'
      },

      initialize: function() {
        this.$el.append('<div class="B"></div>');
      },

      sublime: function() {
        calls.push('sublime');
        return 'sublemon'
      },

      clickB: function() {
        calls.push('clickB');
      },

      beforeTearDown: function() {
        calls.push('beforeTearDownB');
      },

      fooBar: function() {
        calls.push('fooBarB');
        return false;
      }
    }

    ViewClass = Backbone.View.extend({
      mixins: [A, B],
      
      events: {
        'click .view': 'clickView'
      },
      
      initialize: function() {
       this.$el.append('<div class="view"></div>');
     },

     clickView: function() {
      calls.push('clickView');
    },

    render: function() {
      calls.push('renderView');
      return this;
    },

    beforeTearDown: function() {
      calls.push('beforeTearDownView');
    },

    awesomeSauce: function() {
      calls.push('awesomeView')
    }
  });
  });

describe('mixing in mixins', function() {
  it('should mixin all the mixin methods for all the mixins', function() {
    view = new ViewClass();
    view.theFunc();
    expect(calls).toContain('theFunc');
    view.sublime();
    expect(calls).toContain('sublime');
  });

  describe('the events hash', function() {
    it("should preserve the original view's events and mixin the events hashes for the mixins", function() {
      view = new ViewClass();

      $('#content').append(view.$el);

      $('.A').click();        
      $('.B').click();
      $('.view').click();

      expect(calls).toEqual(['clickA', 'clickB', 'clickView']);
    });
  });
});

describe('handling method collisions', function() {
  it('should call all the methods involved in the collision in the correct order', function() {
    view = new ViewClass();
    view.render();
    view.awesomeSauce();
    view.fooBar();
    $('#content').append(view.$el);
    expect($('.A')[0]).toBeTruthy();
    expect($('.B')[0]).toBeTruthy();
    expect($('.view')[0]).toBeTruthy();
    view.beforeTearDown();

    expect(calls).toEqual(['renderView', 'renderA', 'awesomeView', 'awesomeA', 'fooBarA', 'fooBarB','beforeTearDownView', 'beforeTearDownB']);
  });

  it('should return the last return value in the collision chain', function() {
    view = new ViewClass();
    expect(view.render()).toEqual(view);
    expect(view.theFunc()).toEqual('func!');
    expect(view.sublime()).toEqual('sublemon');
    expect(view.fooBar()).toEqual(false);
    expect(view.awesomeSauce()).toEqual('the sauce');
  });
});

describe('when mixins are applied in the context of super/subclasses', function() {
  var BaseClass, SubClass, SubClassWithMixin;
  beforeEach(function() {
    BaseClass = Backbone.View.extend({
      mixins: [A],
      fooBar: function() {
        calls.push('BaseClassFoo');
      }
    });

    SubClass = BaseClass.extend({
      fooBar: function() {
        SubClass.__super__.fooBar.apply(this);
        calls.push('SubClassFoo')
      }
    });

    SubClassWithMixin = BaseClass.extend({
      mixins: [B],

      fooBar: function() {
        SubClassWithMixin.__super__.fooBar.apply(this);
        calls.push('SubClassWithMixinFoo')
      }
    });
  });

  it("should behave correctly for the base class", function() {
    baseInstance = new BaseClass();

    $('#content').append(baseInstance.$el);
    $('.A').click();
    baseInstance.fooBar();

    expect(calls).toEqual(['clickA', 'BaseClassFoo', 'fooBarA'])
  });

  it("should behave correctly for the sub class that has no mixins", function() {
    subInstance = new SubClass();

    $('#content').html(subInstance.$el);
    $('.A').click();
    subInstance.fooBar();

    expect(calls).toEqual(['clickA', 'BaseClassFoo', 'fooBarA', 'SubClassFoo']);
  });

  it("should behave correctly for the sub class that has mixins", function() {
    subInstance = new SubClassWithMixin();

    $('#content').html(subInstance.$el);
    $('.A').click();
    $('.B').click();
    subInstance.fooBar();

    expect(calls).toEqual(['clickA', 'clickB', 'BaseClassFoo', 'fooBarA', 'SubClassWithMixinFoo', 'fooBarB']);
  });
});
});