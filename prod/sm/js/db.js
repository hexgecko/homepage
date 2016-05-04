angular.module('app.db', ['lokijs'])
.factory('db', ['$q', 'Loki', function($q, Loki) {
  // database and collections
  var _db;
  var _classCollection;
  var _studentCollection;
  var _studentClassLinkCollection;
  var _studentNoteCollection;
  var _examCollection;
  var _examResultCollection;
  
  //  initialize the database
  var _init = function() {
    // check if the database already exist
    if(_db != undefined) {
      return $q(function(resolve, reject) {
        resolve();
      });
    }
    
    // save the database on the web local storage if it running in a web browser
    if(typeof cordova == 'undefined') {
      _db = new Loki("studentmarker_def.json", {
        autosave: true,
        autosaveInterval: 1000,
      });
      
    // store the database to a file if it's running on a device
    } else {
      _db = new Loki("test", {
        autosave: true,
        autosaveInterval: 1000,
        adapter: new LokiCordovaFSAdapter({"prefix": "loki"})
      });
    }
    
    // get/add the database collections
    return $q(function(resolve, reject) {
      // check if we need to create/load the database, if not just continue
      _db.loadDatabase({}, function() {
        _classCollection =
          _db.getCollection('class') ||
          _db.addCollection('class');

        _studentCollection =
          _db.getCollection('student') ||
          _db.addCollection('student');

        _studentClassLinkCollection =
          _db.getCollection('studentClassLink') ||
          _db.addCollection('studentClassLink', { indices: ['studentId', 'classId']});

        _studentNoteCollection =
          _db.getCollection('studentNote') ||
          _db.addCollection('studentNote', {indices: ['studentId']});

        _examCollection =
          _db.getCollection('exam') ||
          _db.addCollection('exam', {indices: ['classId']});

        _examResultCollection =
          _db.getCollection('examResult') ||
          _db.addCollection('examResult', {indices: ['examId', 'studentId']});

        resolve();
      });
    });
  };
  
  // return a list with the classes
  var _getClassList = function() {
    return _classCollection.find();
  };
  
  // get a class with a given id
  var _getClass = function(id) {
    return _classCollection.get(id);
  };
  
  // add a class
  var _addClass = function(record) {
    _classCollection.insert(record)
  };
  
  // update a class
  var _updateClass = function(record) {
    _classCollection.update(record);
  };
  
  // delete a class, exam and students it it's not linked to an other class
  var _deleteClass = function(record) {
    // remove all student linked to the class if applicable
    var students = _studentClassLinkCollection.find({classId: record.$loki});
    for(var i=0; i<students.length; i++) {
      _deleteStudent(students[i].studentId, record.$loki);
    }
    
    // remove the class, exams and linkes for the student
    _classCollection.remove(record);
    _examCollection.removeWhere({classId: record.$loki});
    _studentClassLinkCollection.removeWhere({classId: record.$loki});
  };
  
  
  // return a list of student for a given class
  var _getStudentList = function(classId) {
    if(classId == undefined) {
      return _studentCollection.find();
    } else {
      var ids = _studentClassLinkCollection.find({classId: classId});
      var res = [];
      for(var i=0; i<ids.length; i++) {
        res.push(_studentCollection.get(ids[i].studentId));
      }
      return res;
    }
  };
  
  // return a student with a given id
  var _getStudent = function(id) {
    return _studentCollection.get(id);
  };
  
  // add a student to the student collection
  var _addStudent = function(classId, record) {
    var student = _studentCollection.insert(record);
    _studentClassLinkCollection.insert({
      classId: classId,
      studentId: record.$loki
    });
    return student;
  };
  
  // update a student in the student collection
  var _updateStudent = function(record) {
    _studentCollection.update(record);
  };
  
  // delete a student and its notes
  var _deleteStudent = function(studentId, classId) {
    
    // remove the link between the student and class collector
   _studentClassLinkCollection.removeWhere(
      {'$and': [{studentId: studentId}, {classId: classId}]
    });
    
    // remove any student and there note if there are no reference to
    // it between a class and a student
    if(_studentClassLinkCollection.find({studentId: studentId}).length == 0) {
      _studentCollection.remove(studentId);
      _studentNoteCollection.removeWhere({studentId: studentId});
    }
  };
  
  // return student linked to a class
  var _getStudentToClassLink = function(classId) {
    return _studentClassLinkCollection.find({classId: classId});
  };
  
  // return classes linked to a student
  var _getClassToStudentLink = function(studentId) {
    return _studentClassLinkCollection.find({studentId: studentId});
  };
  
  // linked students to a class
  var _linkStudentToClass = function(record, classId) {
    _studentClassLinkCollection.insert({
      classId: classId,
      studentId: record.$loki
    });
  };
  
  
  // return the exam list in data order
  var _getExamList = function(classId) {
    return _examCollection.chain()
      .find({classId: classId})
      .simplesort('timestamp', true)
      .data();
  };
  
  // return an exam record from the collection
  var _getExam = function(id) {
    return _examCollection.get(id);
  };
  
  // add an exam to the collection
  var _addExam = function(record) {
    return _examCollection.insert(record);
  };
  
  // add an exam to the collection
  var _updateExam = function(record) {
    _examCollection.update(record);
  };
  
  // delete an exam from the collection
  var _deleteExam = function(record) {
    _examCollection.remove(record);
  };
  
  // add an exam result to the collection
  var _addExamResult = function(record) {
    return _examResultCollection.insert(record);
  };
  
  // return an exam from the id
  var _getExamResultFromId = function(id) {
    return _examResultCollection.get(id);
  };
  
  // return a result with the exam and student id
  var _getExamResult = function(record, studentId) {
    return _examResultCollection.find({$and: [
      {examId: record.$loki},
      {studentId: studentId}
    ]});
  };
  
  // return an exam result list for a given student
  var _getStudentExamResult = function(examId) {
    return _examResultCollection.find({examId: examId});
  };
  
  // update an exam result record
  var _updateExamResult = function(record) {
    _examResultCollection.update(record);
  };
  
  // delete an exam result from the collection with a given student id
  var _deleteExamResult = function(record, studentId) {
    _examResultCollection.removeWhere({$and: [
      {examId: record.$loki},
      {studentId: studentId}
    ]});
  };
  
  // get the notes connected to a student
  var _getStudentNoteList = function(id) {
    return _studentNoteCollection.chain()
      .find({studentId: id})
      .simplesort('timestamp', true)
      .data();
  };
  
  // get a student note from from the collection
  var _getStudentNote = function(id) {
    return _studentNoteCollection.get(id);
  };
  
  // add a student note to the collection
  var _addStudentNote = function(record) {
    return _studentNoteCollection.insert(record);
  }
  
  // update a student note in the collection
  var _updateStudentNote = function(record) {
    _studentNoteCollection.update(record);
  }
  
  
  // delete a student note from the collection
  var _deleteStudentNote = function(record) {
    _studentNoteCollection.remove(record);
  }
  
  // return the service
  return {
    // initalize the database
    init: _init,
    
    // class interface
    getClassList: _getClassList,
    getClass: _getClass,
    addClass: _addClass,
    updateClass: _updateClass,
    deleteClass: _deleteClass,

    // student interface
    getStudentList: _getStudentList,
    getStudent: _getStudent,
    addStudent: _addStudent,
    updateStudent: _updateStudent,
    deleteStudent: _deleteStudent,
    
    // student to class link interface
    getStudentToClassLink: _getStudentToClassLink,
    getClassToStudentLink: _getClassToStudentLink,
    linkStudentToClass: _linkStudentToClass,
    
    // exam interface
    getExamList: _getExamList,
    getExam: _getExam,
    addExam: _addExam,
    deleteExam: _deleteExam,
    updateExam: _updateExam,
    
    // exam result interface
    addExamResult: _addExamResult,
    getExamResultFromId: _getExamResultFromId,
    getExamResult: _getExamResult,
    getStudentExamResult: _getStudentExamResult,
    updateExamResult: _updateExamResult,
    deleteExamResult: _deleteExamResult,
    
    // note interface
    getStudentNoteList: _getStudentNoteList,
    getStudentNote: _getStudentNote,
    addStudentNote: _addStudentNote,
    updateStudentNote: _updateStudentNote,
    deleteStudentNote: _deleteStudentNote
  };
}]);
