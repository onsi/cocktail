describe('Cocktail', function() {
    var A, B, ViewClass;
    var calls;

    beforeEach(function() {
        calls = [];

        A = {
            events: {
                'click .A': 'clickA'
            },

            zoo : {
                aardvark: 'george',
                elephant: 'edgar',
                organutan: 'fred'
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
            },

            cosmology: {
                omegaM: 0.3
            }
        }

        B = {
            events: {
                'click .B': 'clickB'
            },

            zoo : {
                antelope: 'bouregard',
                elephant: 'edward',
                zebra: 'brittania'
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
            },

            cosmology: function() {
                calls.push('cosmology');
            }
        }

        C = {
            url: function() {
                return '/sprockets';
            }
        }

        D = {
            urlRoot: '/thingamajigs',
            defaults: function() {
                return null;
            }
        }

        Cocktail.mixins.A = A;
        Cocktail.mixins.B = B;
        Cocktail.mixins.C = C;
        Cocktail.mixins.D = D;
    });

    describe("Cocktail.mixin", function() {
        beforeEach(function() {
            ViewClass = Backbone.View.extend({
                mixins: [A, 'B'],
                //should be ignored as the patch is not installed
                fooBar: function() {
                    calls.push('fooBarOriginal');
                }
            })


            var aMixin = {
                mixinmethod: function() {
                    return 'mixin';
                },
                otherMixinMethod: function() {
                    return 'other';
                }
            }

            // Works with named mixins too
            Cocktail.mixins.fooBar = {
                fooBar: function() {
                    calls.push('fooBarInclude');
                }
            }

            Cocktail.mixin(ViewClass, aMixin, 'fooBar');
        });

        it("should allow mixing in mixins after the sub class has been built (useful for coffeescript)", function() {
            var view = new ViewClass;
            expect(view.mixinmethod()).toEqual('mixin');
            expect(view.otherMixinMethod()).toEqual('other');
            view.fooBar();
            expect(calls).toEqual(['fooBarOriginal', 'fooBarInclude']);
        });
    });

    describe("when patching backbone", function() {
        beforeEach(function() {
            Cocktail.patch(Backbone);

            ViewClass = Backbone.View.extend({
                mixins: ['A', B],

                events: {
                    'click .view': 'clickView'
                },

                zoo : {
                    aardvark: 'bob',
                    penguin: 'melvin',
                    zebra: 'zoe'
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
                },

                cosmology: {
                    omegaL: 0.7
                }
            }),

            CollectionClass = Backbone.Collection.extend({
                mixins: ['C'],
                url: '/widgets'
            }),

            ModelClass = Backbone.Model.extend({
                mixins: [D],
                urlRoot: function() {
                    return '/gizmos';
                },
                defaults: {
                    foo: 'bar'
                }
            });
        });

        afterEach(function() {
            Cocktail.unpatch(Backbone);
        });

        it('should allow coffeescript syntax', function() {
            ViewClass.mixin(C);
            view = new ViewClass();
            expect(view.url()).toEqual('/sprockets');
        });

        describe('mixing in mixins', function() {
            it('should mixin all the mixin methods for all the mixins', function() {
                view = new ViewClass();
                view.theFunc();
                expect(calls).toContain('theFunc');
                view.sublime();
                expect(calls).toContain('sublime');
            });

            describe('hashes', function() {
                it("should merge in the events hash", function() {
                    view = new ViewClass();

                    $('#content').append(view.$el);

                    $('.A').click();
                    $('.B').click();
                    $('.view').click();

                    expect(calls).toEqual(['clickA', 'clickB', 'clickView']);
                });

                it("should merge together hashes, favoring values defined by the instance over mixins, and mixins on a first in will win basis", function() {
                    view = new ViewClass();
                    expect(view.zoo).toEqual({
                        aardvark: 'bob',
                        antelope: 'bouregard',
                        elephant: 'edgar',
                        organutan: 'fred',
                        penguin: 'melvin',
                        zebra: 'zoe'
                    });
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

                expect(calls).toEqual(['renderView', 'renderA', 'awesomeView', 'awesomeA', 'fooBarA', 'fooBarB', 'beforeTearDownView', 'beforeTearDownB']);
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

        describe('handling functional override of non-function property', function() {
            it('should return the last truthy defined return value in the collision chain', function() {
                var collection = new CollectionClass();
                expect(collection.url()).toEqual('/sprockets');
            });
            it('should return the last falsy defined return value in the collision chain', function() {
                var model = new ModelClass();
                expect(model.defaults()).toBeNull();
            });
            it('should set a function returning the base value if no mixin function has defined return', function() {
                var view = new ViewClass();
                expect(view.cosmology()).toEqual({
                    omegaM:0.3,
                    omegaL:0.7
                });
                expect(calls).toEqual(['cosmology']);
            });
        });

        describe('handling non-functional override of non-events property', function() {
            it('should ignore the non-functional mixin property', function() {
                var model = new ModelClass();
                expect(model.url()).toEqual('/gizmos');
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
});