describe("S3DB.js", function(){

  beforeEach(function(){
    var toType = function(obj) {
          return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        },
        custom_matchers = {};

    custom_matchers.toBeA = function toBeA(expected_type){
      return this.actual === expected_type;
    };

    custom_matchers.toBeAFunction = function toBeAFunction(){
      return this.actual === 'function';
    };

    custom_matchers.toBeAObject = function toBeAObject(){
      return this.actual === 'object';
    };

    this.addMatchers(custom_matchers);
  });

  it("should put S3DB as an object on the root object", function(){
    expect(toType(S3DB)).toBe('object');
  });

  describe("Deployments", function(){

    it("should provide an S3DB deployment constructor", function(){
      expect(toType(S3DB.Deployment)).toBe('function');
    });

    it("should throw an exception when trying to create a deployment without an rdf_store", function(){
      var temp = rdfstore;
      delete rdfstore;
      expect(S3DB.Deployment).toThrow("rdf_store required to create deployments");
      rdfstore = temp;
    });

    it("should expose a store property", function(){
      var deployment = new S3DB.Deployment();
      expect(deployment.store).to
    });
  });
});
