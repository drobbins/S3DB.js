(function(){
  "use strict";
  /*global rdfstore : false*/

  var s3db_as_n3 =  '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n'+
                    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n'+
                    '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n'+
                    '@prefix s3db: <http://purl.org/s3dbcore#> .\n'+
                    '@prefix owl: <http://www.w3.org/2002/07/owl#> .\n'+
                    '\n'+
                    's3db:entity a rdfs:Class ;\n'+
                    '	rdfs:label "S3DB entity" ;\n'+
                    '	rdfs:comment "The class of all entities from the S3DB core model" .\n'+
                    '\n'+
                    's3db:relationship a rdfs:Class ;\n'+
                    '	rdfs:label "S3DB relationship" ;\n'+
                    '	rdfs:comment "The class of all relationships between entities of the S3DB core model" .\n'+
                    '\n'+
                    's3db:deployment rdfs:label "S3DB Deployment" ;\n'+
                    '	rdfs:comment "The physical location of an S3DB Deployment" ;\n'+
                    '	rdfs:subClassOf s3db:entity .\n'+
                    '\n'+
                    's3db:project rdfs:label "S3DB Project" ;\n'+
                    '	rdfs:comment "A contextualizer entity; can be used as the common attribute in a list of instances of s3db:rules describing the same domain" ;\n'+
                    '	rdfs:subClassOf s3db:entity .\n'+
                    '\n'+
                    's3db:rule rdfs:label "S3DB Rule" ;\n'+
                    '	rdfs:subClassOf s3db:entity ;\n'+
                    '	rdfs:comment "A triple describing an attribute from the domain; the subject of the s3db:Rule is an instance of s3db:collection, the predicate is an instance of s3db:item and the object may either be an instance of s3db:collection or a literal value" .\n'+
                    '\n'+
                    's3db:collection rdfs:label "S3DB Collection" ;\n'+
                    '	rdfs:subClassOf s3db:entity ;\n'+
                    '	rdfs:comment "The subject of an instance of s3db:rule" .\n'+
                    '\n'+
                    's3db:item rdfs:label "S3DB Item" ;\n'+
                    '	rdfs:subClassOf s3db:entity ;\n'+
                    '	rdfs:comment "The subject of an instance of s3db:statement" .\n'+
                    '\n'+
                    's3db:statement rdfs:label "S3DB Statement" ;\n'+
                    '	rdfs:subClassOf s3db:entity ;\n'+
                    '	rdfs:comment "A triple describing an attribute/value pair; the subject of an  an instance of s3db:Statement is an instance of s3db:item, the predicate is an instance of s3db:rule and the object can either be an  an instance of s3db:item or a literal, according to the object used in the predicate s3db:rule" .\n'+
                    '\n'+
                    's3db:user rdfs:label "S3DB User" ;\n'+
                    '	rdfs:subClassOf s3db:entity ;\n'+
                    '	rdfs:comment "The subject of a permission assignment operation" .\n'+
                    '\n'+
                    's3db:DP rdfs:subClassOf s3db:relationship ;\n'+
                    '	rdfs:domain s3db:deployment ; \n'+
                    '	rdfs:range s3db:project.\n'+
                    '\n'+
                    's3db:PC rdfs:subClassOf s3db:relationship ;\n'+
                    '	rdfs:domain s3db:project ; \n'+
                    '	rdfs:range s3db:collection .\n'+
                    '\n'+
                    's3db:PR rdfs:subClassOf s3db:relationship ;\n'+
                    '	rdfs:domain s3db:project ; \n'+
                    '	rdfs:range s3db:rule .\n'+
                    '\n'+
                    's3db:CI rdfs:subClassOf s3db:relationship ;\n'+
                    '	rdfs:domain s3db:collection ; \n'+
                    '	rdfs:range s3db:item .\n'+
                    '\n'+
                    's3db:Rsubject rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:subject ; \n'+
                    '		rdfs:domain s3db:collection ; \n'+
                    '		rdfs:range s3db:rule .\n'+
                    '\n'+
                    's3db:Robject rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:object ; \n'+
                    '		rdfs:domain s3db:collection ; \n'+
                    '		rdfs:range s3db:rule .\n'+
                    '\n'+
                    's3db:Rpredicate rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:predicate ; \n'+
                    '		rdfs:domain s3db:item ; \n'+
                    '		rdfs:range s3db:rule .\n'+
                    '\n'+
                    's3db:Spredicate rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:predicate ; \n'+
                    '		rdfs:domain s3db:rule ; \n'+
                    '		rdfs:range s3db:statement .\n'+
                    '\n'+
                    's3db:Ssubject rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:subject ;\n'+
                    '		rdfs:domain s3db:item ;\n'+
                    '		rdfs:range s3db:statement .\n'+
                    '\n'+
                    's3db:Sobject rdfs:subClassOf s3db:relationship ; \n'+
                    '		owl:inverseOf rdf:object ; \n'+
                    '		rdfs:domain s3db:item ;\n'+
                    '		rdfs:range s3db:statement .\n'+
                    '\n'+
                    's3db:DU rdfs:subClassOf s3db:relationship ; \n'+
                    '	rdfs:domain s3db:deployment ; \n'+
                    '	rdfs:range s3db:user .\n'+
                    '\n'+
                    's3db:UU rdfs:subClassOf s3db:relationship ; \n'+
                    '	rdfs:domain s3db:user ; \n'+
                    '	rdfs:range s3db:user .\n'+
                    '\n'+
                    's3db:user s3db:operator s3db:entity . \n';
  var root = this,
      S3DB = {},
      required_prefixes = {
        "s3db" : "http://purl.org/s3dbcore#"
      },
      extend = function extend(obj, source){
        for (var prop in source){
          obj[prop] = source[prop];
        }
      };

  //Version
  S3DB.Version = "0.0.1";

  //Utility Function(s)
  S3DB.uuid = function uuid(a){
    //Function from https://gist.github.com/982883 (@jed)
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
  };
  S3DB._DeploymentStore = function DeploymentStore(){
    var store,
        prefix;

    try{
      store = new rdfstore.Store();
    }
    catch(e){
      throw "rdf_store required to create deployments";
    }

    for (prefix in required_prefixes){
      store.registerDefaultNamespace(prefix, required_prefixes[prefix]);
    }
    store.registerDefaultProfileNamespaces(); //Registers typical namespaces, e.g. rdf, rdfs, owl

    store.load("text/n3", s3db_as_n3, function(success, results){
      if(!success){
        throw "Unable to load S3DB core model";
      }
    });

    return store;
  };

  //Deployment Constructor
  S3DB.Deployment = function Deployment(name){
    var store;

    if (!name || typeof name !== 'string'){
      throw "name option required to create a deployment";
    }
    this.name = name;
    this.uri = "http://"+name+"/#";

    store = new S3DB._DeploymentStore();

    store.execute("INSERT DATA { <"+this.uri+S3DB.uuid()+"> rdf:type s3db:deployment .}", function(success, results){
      if(!success){
        throw "Unable to create deployment";
      }
    });

    this.store = store;

    this.projects = [];
  };

  //Load the deployment prototype with the remaining S3DB functions
  extend(S3DB.Deployment.prototype, {

    // Create functions
    createProject : function(){
      var projectID = S3DB.uuid().slice(0,6);
      while (this.projects.indexOf(projectID) !== -1) projectID = S3DB.uuid().slice(0,6);
      this.projects.push(projectID);
      return projectID;
    }

  });

  //Put S3DB on the root object
  root.S3DB = root.S3DB || S3DB;
}).call(this);
