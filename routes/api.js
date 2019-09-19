/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
//const MONGODB_CONNECTION_STRING = process.env.DB;
const MONGODB_CONNECTION_STRING =
  "mongodb://john:N1teLockon@ds035787.mlab.com:35787/jwfccmongodb";
var project = "books";
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("successful database connection");

          var getPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project)
                .find({}, { _id: 1, title: 1, commentCount: 1 })
                .toArray((err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log("Returning books");
                    console.log("Books in library: " + JSON.stringify(res));
                    resolve(res);
                  }
                });
            });
          };

          getPromise().then(getResult => {
            db.close();
            res.json(getResult);
          });
        });
      } catch (e) {
        console.log(e);
      }
    })

    .post((req, res) => {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("Successfull database connection");

          var postPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).insertOne(
                { title: title, comments: [], commentCount: 0 },
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log("1 book submitted");
                    console.log(res);
                    let bookId = res.ops[0]._id;
                    resolve(bookId);
                  }
                }
              );
            });
          };

          let postBookResult = async () => {
            let result = await postPromise();
            /*let bookPosted = {
              _id: result,
              title: title
            };*/
            return result;
          };

          postBookResult()
            .then(function(postResult) {
              db.close();
              console.log("book: " + JSON.stringify(postResult));
              res.json({
                _id: postResult,
                title: title
              });
              //next();
            })
            .catch(e => {
              console.log(e);
            });
        });
      } catch (e) {
        console.log(e);
        next(e);
      }
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("successful database connection");

          let deleteAllPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).deleteMany(
                { },
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log("All books deleted");
                    console.log("Books deleted: " + JSON.stringify(res));
                    resolve('complete delete successful');
                  }
                }
              );
            });
          };

          deleteAllPromise().then(deleteResult => {
            db.close();
            console.log('Result of delete: ' + deleteResult);
            res.json({result: deleteResult});
          });
        });
      } catch (e) {
        console.log(e);
      }
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      console.log("book id: " + bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("successful database connection");

          var getPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).findOne(
                { _id: ObjectId(bookid) },
                { _id: 1, title: 1, comments: 1 },
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    //
                    console.log("Returning selected book");
                    console.log("Book chosen: " + JSON.stringify(res));
                    if(res === null) {
                      resolve('no book exists');
                    }
                    else {
                      resolve(res);
                    }
                  }
                }
              );
            });
          };

          getPromise().then(getResult => {
            db.close();
            res.send(getResult);
          });
        });
      } catch (e) {
        console.log(e);
      }
      
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      console.log('book id: ' + bookid + ', comments: ' + comment);
      //json res format same as .get
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("successful database connection");

          var idPostPromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).findOneAndUpdate(
                { _id: ObjectId(bookid) },
                {$push: {comments: comment}},
                { projection: {_id: 1, title: 1, comments: 1},
                returnOriginal: false},
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log("Posted comment to selected book");
                    console.log("Book with comments: " + JSON.stringify(res.value));
                    resolve(res.value);
                  }
                }
              );
            });
          };

          idPostPromise().then(getResult => {
            db.close();
            res.json(getResult);
          });
        });
      } catch (e) {
        console.log(e);
      }

    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log("Database error: " + err);
          }
          console.log("successful database connection");

          var deletePromise = () => {
            return new Promise((resolve, reject) => {
              db.collection(project).findOneAndDelete(
                { _id: ObjectId(bookid) },
                (err, res) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log("Returning selected book");
                    console.log("Book deleted: " + JSON.stringify(res));
                    resolve('delete successful');
                  }
                }
              );
            });
          };

          deletePromise().then(deleteResult => {
            db.close();
            res.send(deleteResult);
          });
        });
      } catch (e) {
        console.log(e);
      }
    });
};
