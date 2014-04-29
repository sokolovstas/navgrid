'use strict';

describe('Directive: NavGrid', function () {

  // load the directive's module
  beforeEach(module('navGridApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-nav-grid></-nav-grid>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the NavGrid directive');
  }));
});
