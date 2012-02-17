(function(){
  "use strict";

  var root = this,
      S3DB = {};

  //Version
  S3DB.Version = "0.0.1";

  //Deployments
  S3DB.Deployment = function Deployment(){
    try{
      this.store = new rdfstore.Store();
    }
    catch(e){
      throw "rdf_store required to create deployments";
    }
  };

  //Put S3DB on the root object
  root.S3DB = root.S3DB || S3DB;
}).call(this);
