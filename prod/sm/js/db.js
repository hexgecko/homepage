angular.module('app.db', ['lokijs'])
.factory('db', ['Loki', '$window', function(Loki, $window) {
  // create the database and load the database
  var lokiDb = new Loki("studentmarker_def.json", {
    autosave: true,
    autosaveInterval: 1000,
  });
  lokiDb.loadDatabase();
  
  // this will store the data if the document id closed (like reload)
  $window.onbeforeunload = function() {
    lokiDb.close();
  };
  
  // create the collections
  var classCollection =
      lokiDb.getCollection('class') ||
      lokiDb.addCollection('class');
  
  var studentCollection =
      lokiDb.getCollection('student') ||
      lokiDb.addCollection('student');
  
  var studentClassLinkCollection =
      lokiDb.getCollection('studentClassLink') ||
      lokiDb.addCollection('studentClassLink', { indices: ['studentId', 'classId']});
  
  var noteCollection =
      lokiDb.getCollection('note') ||
      lokiDb.addCollection('note', {indices: ['studentId']});
  
  var examCollection =
      lokiDb.getCollection('exam') ||
      lokiDb.addCollection('exam', {indices: ['classId']});
  
  var examResultCollection =
      lokiDb.getCollection('examResult') ||
      lokiDb.addCollection('examResult', {indices: ['examId', 'studentId']});
  
  // delete a student and its notes
  var deleteStudent = function(studentId, classId) {
    // remove the link between the student and class collector
    studentClassLinkCollection.removeWhere(
      {'$and': [{studentId: studentId}, {classId: classId}]
    });
    
    // remove any student and there note if there are no reference to
    // it between a class and a student
    if(studentClassLinkCollection.find({studentId: studentId}).length == 0) {
      studentCollection.remove(studentId);
      noteCollection.removeWhere({studentId: studentId});
    }
  };
  
  // delete a class, exam and students it it's not linked to an other class
  var deleteClass = function(classId) {
    // remove all student linked to the class if applicable
    var students = studentClassLinkCollection.find({classId: classId});
    for(var i=0; i<students.length; i++) {
      deleteStudent(students[i].studentId, classId);
    }
    
    // remove the class, exams and linkes for the student
    classCollection.remove(classId);
    examCollection.removeWhere({classId: classId});
    studentClassLinkCollection.removeWhere({classId: classId});
    
    // for debuging, write all collections
    /*
    console.log("class", classCollection.find());
    console.log("student", studentCollection.find());
    console.log("studentClasLink", studentClassLinkCollection.find());
    console.log("note", noteCollection.find());
    console.log("exam", examCollection.find());
    */
  };
  
  // return the service
  return {    
    classCollection: classCollection,
    studentCollection: studentCollection,
    studentClassLinkCollection: studentClassLinkCollection,
    noteCollection: noteCollection,
    examCollection: examCollection,
    examResultCollection: examResultCollection,
    deleteStudent: deleteStudent,
    deleteClass: deleteClass
  }
}]);
