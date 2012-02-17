describe("S3DB.js", function(){

  //Matches a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
  //where each x is replaced with a random hexadecimal digit from 0 to f, and
  //y is replaced with a random hexadecimal digit from 8 to b.
  var uuid_regex = /^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-4[0-9a-zA-Z]{3}-[89ab][0-9a-zA-Z]{3}-[0-9a-zA-Z]{12}$/;

  beforeEach(function(){

    var toType = function(obj) {
          return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        },
        setJasmineMatcherMessage = function(message, matcher_context){
          matcher_context.message = function(){return message;};
        },
        custom_matchers = {};

    custom_matchers.toBeA = function toBeA(expected_type){
      return toType(this.actual) === expected_type;
    };

    custom_matchers.toBeAFunction = function toBeAFunction(){
      return toType(this.actual) === 'function';
    };

    custom_matchers.toBeAObject = function toBeAObject(){
      return toType(this.actual) === 'object';
    };

    custom_matchers.toContainPrefixes = function toContainPrefixes(expected){
      var key;
      for (key in expected){
        if (expected.hasOwnProperty(key) && this.actual[key] !== expected[key]){
          setJasmineMatcherMessage(
              "Expected "+this.actual[key]+" to be "+expected[key]+", with prefix "+key+".",
              this
          );
          return false;
        }
      }
      return true;
    };

    this.addMatchers(custom_matchers);

  });

  it("should put S3DB as an object on the root object", function(){
    expect(S3DB).toBeAObject();
  });

  it("should provide a uuid at S3DB.uuid()", function(){
    var uuid = S3DB.uuid();
    expect(uuid).toMatch(uuid_regex);
  });

  describe("Deployments", function(){

    it("should provide an S3DB deployment constructor", function(){
      expect(S3DB.Deployment).toBeAFunction();
    });

    it("should throw an exception when trying to create a deployment without an rdf_store", function(){
      var temp = rdfstore;
      rdfstore = null;
      expect(S3DB.Deployment).toThrow("rdf_store required to create deployments");
      rdfstore = temp;
    });

    it("should expose a store property", function(){
      var deployment = new S3DB.Deployment();
      expect(deployment.store).toBeAObject();
    });

    describe("Deployment.store", function(){

      var deployment;

      beforeEach(function(){
        deployment = new S3DB.Deployment();
      });

      it("should be loaded with the appropriate prefixes", function(){
        var expected_prefixes = {
              "s3db" : "http://purl.org/s3dbcore#"
            };
        expect(deployment.store.rdf.prefixes).toContainPrefixes(expected_prefixes);
      });

      it("should be loaded with the S3DB Core Model", function(){
        var callback = jasmine.createSpy();
        deployment.store.execute("SELECT * WHERE {s3db:UU ?p ?o .}", callback);
        waitsFor(function(){
          return callback.callCount > 0;
        });
        runs(function(){
          var success = callback.argsForCall[0][0],
              results = callback.argsForCall[0][1];
          expect(success).toBeTruthy();
          expect(results.length).toBe(3);
        });
      });
    });

    describe("Projects", function(){
    });
  });
});
