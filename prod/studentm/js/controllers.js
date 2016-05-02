angular.module('app.controllers', ['app.gradeSystem', 'app.db'])

///////////////////////////////////////////////////////////////////////////////
// Classes
///////////////////////////////////////////////////////////////////////////////
.controller('classListCtrl', function($scope, $ionicModal, db) {  
  // load the add/edit class module
  $ionicModal.fromTemplateUrl('templates/class-modal.html', {scope: $scope})
  .then(function(modal) {
    $scope.classAddEditModal = modal;
  });
  
  // keep track of the page states
  $scope.state = {};
  
  // query the list from the database
  $scope.classList = db.classCollection.find();

  // show the add/update classes dialog
  $scope.showClassAddEditModal = function(state, record) {
    // create a new template record
    if(record) {
      state.classId = record.$loki;
      state.className = record.name;
      state.classSubject = record.subject;
      state.newClass = false;
    } else {
      state.className = "";
      state.classSubject = ""; 
      state.newClass = true;
    }
    // show the modal dialog
    $scope.classAddEditModal.show();
  };
  
  // update a record in the database
  $scope.updateClassRecord = function(state) {
    // update the database
    var record = db.classCollection.get(state.classId);
    record.name = state.className;
    record.subject = state.classSubject;
    db.classCollection.update(record);
    
    // hide the dialog
    $scope.classAddEditModal.hide();
  };
  
  // add the record to the list
  $scope.addClassRecord = function(state) {
    // insert the record to the database and update the local list
    db.classCollection.insert({
      name: state.className,
      subject: state.classSubject
    });
    
    // update the class list
    $scope.classList = db.classCollection.find();
    
    // hide the modal dialog
    $scope.classAddEditModal.hide();
  };
  
  // delete a class from the list
  $scope.deleteClassRecord = function(record, index) {
    db.deleteClass(record.$loki);
    $scope.classList.splice(index, 1);
  };
  
  // toggle the delete buttons
  $scope.toggleShowDeleteButton = function(state) {
    if(state.showDeleteButton) {
      state.showDeleteButton = false;
    } else {
      state.showDeleteButton = true;
    }
  };
})
    
.controller('classInfoCtrl', function($scope, $ionicModal, $stateParams, db) {
  // load the add/edit student module
  $ionicModal.fromTemplateUrl('templates/student-modal.html', {scope: $scope})
  .then(function(modal) {
    $scope.studentAddEditModal = modal;
  });
  
  // load the pick student module
  $ionicModal.fromTemplateUrl('templates/pick-student-modal.html', {scope: $scope})
  .then(function(modal) {
    $scope.studentPickModal = modal;
  });
  
  // load the add/edit exam module
  $ionicModal.fromTemplateUrl('templates/exam-modal.html', {scope: $scope})
  .then(function(modal) {
    $scope.examAddEditModal = modal;
  });
  
  $scope.state = {
    classId: Number($stateParams.classId),
    showStudentDeleteButton: false,
    showExamDeleteButton: false
  };
  
  // query the class record
  $scope.classRecord = db.classCollection.get($scope.state.classId);
  
  // query the student link to this class
  var queryStudentList = function(classId) {
    var ids = db.studentClassLinkCollection.find({classId: classId});
    var res = [];
    for(var i=0; i<ids.length; i++) {
      res.push(db.studentCollection.get(ids[i].studentId));
    }
    return res;
  };
  $scope.studentList = queryStudentList($scope.state.classId);
  
  // query the exam list for the class
  var queryExamList = function(classId) {
    return db.examCollection.chain()
      .find({classId: $scope.state.classId})
      .simplesort('timestamp', true)
      .data();
  };
  $scope.examList = queryExamList($scope.state.classId);
  
  // show the add/edut dialog
  $scope.showStudentAddEditModal = function(state, record) {
    if(record) {
      state.studentId = record.$loki;
      state.studentFirstName = record.firstName;
      state.studentLastName = record.lastName;
      state.studentGender = record.gender;
      state.studentEmail = record.email;
      state.studentHomePhoneNumber = record.homePhoneNumber;
      state.studentMobilePhoneNumber = record.mobilePhoneNumber;
      state.studentStreet = record.street;
      state.studentCity = record.city;
      state.studentPostalCode = record.postalCode;
      state.newStudent = false;
    } else {
      state.studentFirstName = "";
      state.studentLastName = ""
      state.studentGender = "Male";
      state.studentEmail = "";
      state.studentHomePhoneNumber = "";
      state.studentMobilePhoneNumber = "";
      state.studentStreet = "";
      state.studentCity = "";
      state.studentPostalCode = "";
      state.newStudent = true;
    }
    $scope.studentAddEditModal.show();
  };
  
  // the user showes the pick dialog
  $scope.showStudentPickModal = function(state) {
    // get all of the student and show the dialog
    state.studentPickList = db.studentCollection.find();
    $scope.studentPickModal.show()
  };
  
  // the user have picked a student
  $scope.studentPicked = function(state, record) {    
    // link the student to the class
    db.studentClassLinkCollection.insert({
      classId: state.classId,
      studentId: record.$loki
    });
    
    // update the student list
    $scope.studentList = queryStudentList(state.classId);

    // hide the dialogs
    $scope.studentPickModal.hide()
    $scope.studentAddEditModal.hide();
  };
  
  // add a new student record to the database
  $scope.addStudentRecord = function(state) {
    // insert the the record to the database
    var record = db.studentCollection.insert({
      firstName: state.studentFirstName,
      lastName: state.studentLastName,
      gender: state.studentGender,
      email: state.studentEmail,
      homePhoneNumber: state.studentHomePhoneNumber,
      mobilePhoneNumber: state.studentMobilePhoneNumber,
      street: state.studentStreet,
      city: state.studentCity,
      postalCode: state.studentPostalCode
    });

    // link the student to the class
    db.studentClassLinkCollection.insert({
      classId: state.classId,
      studentId: record.$loki
    });
    
    // create a result for every exam
    for(var i=0; i<$scope.examList.length; i++) {
      db.examResultCollection.insert({
        examId: $scope.examList[i].$loki,
        studentId: record.$loki,
        score: 0,
        active: true
      });
    }
    
    // update the student list
    $scope.studentList = queryStudentList(state.classId);
    
    // close the dialog
    $scope.studentAddEditModal.hide();
  };
  
  // update an existing record in the database
  $scope.updateStudentRecord = function(state) {
    // update the student information
    var record = db.studentCollection.get(state.studentId);
    record.firstName = state.studentFirstName;
    record.lastName = state.studentLastName;
    record.gender = state.studentGender;
    record.email = state.studentEmail;
    record.homePhoneNumber = state.studentHomePhoneNumber;
    record.mobilePhoneNumber = state.studentMobilePhoneNumber;
    record.street = state.studentStreet;
    record.city = state.studentCity;
    record.postalCode = state.studentPostalCode;
    db.studentCollection.update(record);
    
    // close the dialog
    $scope.studentAddEditModal.hide();
  };
  
  // remove the student from the list
  $scope.deleteStudentRecord = function(record, index) {
    // delete the exam result for all the exam in the exam list
    for(var i=0; i<$scope.examList.length; i++) {
      db.examResultCollection.removeWhere({$and: [
        {examId: $scope.examList[i].$loki},
        {studentId: record.$loki}
      ]});
    }
    
    // delete the student and it's notes if it's only linked to this class
    db.deleteStudent(record.$loki, $scope.state.classId);
    
    // remove it from the local list
    $scope.studentList.splice(index, 1);
  };
  
  // show the exam add/edit dialog
  $scope.showExamAddEditModal = function(state, record) {
    if(record) {
      state.examId = record.$loki;
      state.examName = record.name;
      state.examCategory = record.category;
      state.examDate = new Date(record.timestamp);
      state.examWeight = record.weight;
      state.examMax = record.max;
      state.examGrade1 = record.grade1;
      state.examGrade2 = record.grade2;
      state.examGrade3 = record.grade3;
      state.examGrade4 = record.grade4;
      state.examGrade5 = record.grade5;
      state.examGrade6 = record.grade6;
      state.newExam = false;
    } else {
      state.examName = "";
      state.examCategory = "Test";
      state.examDate = new Date(); // current date
      state.examWeight = 50;
      state.examMax = 100;
      state.examGrade1 = 90;
      state.examGrade2 = 80;
      state.examGrade3 = 70;
      state.examGrade4 = 60;
      state.examGrade5 = 50;
      state.examGrade6 = 0;
      state.newExam = true;
    }
    $scope.examAddEditModal.show();
  };
  
  // add an exam to the database and list
  $scope.addExamRecord = function(state) {
    // create a new record
    var record = db.examCollection.insert({
      classId: state.classId,
      name: state.examName,
      category: state.examCategory,
      timestamp: new Date(state.examDate).getTime(),
      weight: Number(state.examWeight),
      max: state.examMax,
      grade1: state.examGrade1,
      grade2: state.examGrade2,
      grade3: state.examGrade3,
      grade4: state.examGrade4,
      grade5: state.examGrade5,
      grade6: state.examGrade6
    });
    
    // create a exam result for every student
    for(var i=0; i<$scope.studentList.length; i++) {
      db.examResultCollection.insert({
        examId: record.$loki,
        studentId: $scope.studentList[i].$loki,
        score: 0,
        active: true
      });
    }
    
    // update the exam list
    $scope.examList = queryExamList(state.classId);
    
    // hide the dialog
    $scope.examAddEditModal.hide();
  };
  
  // update an exam in the database and list
  $scope.updateExamRecord = function(state) {
    // update the record
    var record = db.examCollection.get(state.examId);
    record.name = state.examName;
    record.category = state.examCategory;
    record.timestamp = new Date(state.examDate).getTime();
    record.weight = Number(state.examWeight);
    record.max = state.examMax;
    record.grade1 = state.examGrade1;
    record.grade2 = state.examGrade2;
    record.grade3 = state.examGrade3;
    record.grade4 = state.examGrade4;
    record.grade5 = state.examGrade5;
    record.grade6 = state.examGrade6;
    db.examCollection.update(record);
    
    // update the exam list
    $scope.examList = queryExamList(state.classId);
    
    // hide the dialog
    $scope.examAddEditModal.hide();
  }
  
  // remove the exam from the list
  $scope.deleteExamRecord = function(record, index) {
    // delete the exam result for all the exam in the exam list
    for(var i=0; i<$scope.studentList.length; i++) {
      db.examResultCollection.removeWhere({$and: [
        {examId: record.$loki},
        {studentId: $scope.studentList[i].$loki}
      ]});
    }
    
    // remove it from the database
    db.examCollection.remove(record);
    
    // remove it from the local list
    $scope.examList.splice(index, 1);
  };
  
  // toggle the student delete buttons
  $scope.toggleShowStudentDeleteButton = function(state) {
    if(state.showStudentDeleteButton) {
      state.showStudentDeleteButton = false;
    } else {
      state.showStudentDeleteButton = true;
    }
  };
  
  // toggle the exam delete buttons
  $scope.toggleShowExamDeleteButton = function(state) {
    if(state.showExamDeleteButton) {
      state.showExamDeleteButton = false;
    } else {
      state.showExamDeleteButton = true;
    }
  };
  
  // filter to not show the student already added to the student list
  $scope.filterStudentAlreadyAdded = function(item) {
    for(var i=0; i<$scope.studentList.length; i++) {
      if($scope.studentList[i].$loki == item.$loki) {
        return false;
      }
    }
    return true;
  };
})
 
.controller('classReportCtrl', function($scope, $stateParams, db, grade) {
  // state of the page
  $scope.state = {
    classId: Number($stateParams.classId)
  };
  
  // get the class record
  $scope.classRecord = db.classCollection.get($scope.state.classId);
  
  // query and calulate the grade list
  $scope.gradeList = function(classId) {
    // query the students in the class
    var studentList = db.studentClassLinkCollection.find({classId: classId});
    
    // for every student, calculate the grade
    var returnList = new Array(studentList.length);
    studentList.forEach(function(record, index) {
      // query/calculate the data
      var student = db.studentCollection.get(record.studentId);
      var examList = db.examCollection.find({classId: classId});
      var gradeList = grade.calculateGradeList(examList, record.studentId);
      var sumWeight = grade.calculateSumWeight(gradeList);
      var avgGrade = grade.calculateAvgGrade(gradeList, sumWeight);
      
      // fill the return list
      returnList[index] = {
        firstName: student.firstName,
        lastName: student.lastName,
        avgGrade: avgGrade
      };
    });
    
    return returnList;
  }($scope.state.classId);
})
 
.controller('studentInfoCtrl', function($scope, $ionicModal, $stateParams, db, grade) {
  // load the add/edit student module
  $ionicModal.fromTemplateUrl('templates/note-modal.html', {scope: $scope})
  .then(function(modal) {
    $scope.noteAddEditModal = modal;
  });
  
  // the state of the page
  $scope.state = {
    studentId: Number($stateParams.studentId)
  };
  
  // query the student record
  $scope.studentRecord = db.studentCollection.get($scope.state.studentId);
  
  // query the class the student belong to
  $scope.classList = function(studentId) {
    // get a list where the student belongs
    var ids = db.studentClassLinkCollection.find({studentId: studentId});
    
    // get the record from the class collection
    var list = new Array(ids.length);
    for(var i=0; i<ids.length; i++) {
      var record = db.classCollection.get(ids[i].classId);
      var gradeList = grade.calculateGradeList(db.examCollection.find({classId: record.$loki}), studentId);
      var sumWeight = grade.calculateSumWeight(gradeList);
      list[i] = {
        name: record.name,
        subject: record.subject,
        examResult: gradeList,
        sumWeight: sumWeight,
        avgGrade: grade.calculateAvgGrade(gradeList, sumWeight)
      };
    }
    
    // finnaly return the class list
    return list;
  }($scope.state.studentId);
  
  // query the note list for the student
  var queryNoteList = function(studentId) {
    return db.noteCollection.chain()
      .find({studentId: studentId})
      .simplesort('timestamp', true)
      .data();
  };
  $scope.noteList = queryNoteList($scope.state.studentId);
  
  // create a date list for the notes
  var updateNoteDateList = function(noteList) {
    var dateList = new Array(noteList.length)
    for(var i=0; i<noteList.length; i++) {
      dateList[i] = {
        date: new Date(noteList[i].timestamp).toLocaleDateString()
      };
    }
    return dateList;
  };
  $scope.noteDateList = updateNoteDateList($scope.noteList);
  
  // show the add/edit note dialog
  $scope.showNoteAddEditModal = function(state, record) {
    if(record) {
      state.noteId = record.$loki;
      state.noteCategory = record.category;
      state.noteDate = new Date(record.timestamp);
      state.noteComment = record.comment;
      $scope.state.newNote = false;
    } else {
      state.noteCategory = "Absent";
      state.noteComment = "";
      state.noteDate = new Date(); // return today date
      $scope.state.newNote = true;
    }
    $scope.noteAddEditModal.show();
  };
  
  // add a new note to the local list and database
  $scope.addNoteRecord = function(state) {
    // add the list to the database
    db.noteCollection.insert({
      studentId: state.studentId,
      category: state.noteCategory,
      timestamp: state.noteDate.getTime(),
      comment: state.noteComment
    });
    
    // update the lists
    $scope.noteList = queryNoteList(state.studentId);
    $scope.noteDateList = updateNoteDateList($scope.noteList);
    
    // hide the dialog
    $scope.noteAddEditModal.hide();
  };
  
  // update an existing note in the local list and database
  $scope.updateNoteRecord = function(state) {
    // update the record
    var record = db.noteCollection.get(state.noteId);
    record.category = state.noteCategory;
    record.timestamp = state.noteDate.getTime();
    record.comment = state.noteComment;
    db.noteCollection.update(record);
    
    // update the lists
    $scope.noteList = queryNoteList(state.studentId);
    $scope.noteDateList = updateNoteDateList($scope.noteList);
    
    // hide the dialog
    $scope.noteAddEditModal.hide();
  };
  
  // delete a note from the local list and the database
  $scope.deleteNoteRecord = function(record, index) {
    // remove it from the database
    db.noteCollection.remove(record);
    
    // remove it from the local list
    $scope.noteList.splice(index, 1);
  };
  
  // toggle the delete button in the note list
  $scope.toggleShowNoteDeleteButton = function(state) {
    if(state.showNoteDeleteButton) {
      state.showNoteDeleteButton = false;
    } else {
      state.showNoteDeleteButton = true;
    }
  };
})

.controller('examInfoCtrl', function($scope, $stateParams, db) {  
  // query the exam record
  $scope.examRecord = db.examCollection.get(Number($stateParams.examId));
  
  // keep the current state of the page
  $scope.state = {
    examId: Number($stateParams.examId),
    examDate: new Date($scope.examRecord.timestamp).toLocaleDateString()
  };
  
  // query the students result
  $scope.studentResultList = function(examId) {
    // query the results
    var examResult = db.examResultCollection.find({examId: examId});
    
    // create a a result list
    result = new Array(examResult.length);
    for(var i=0; i<examResult.length; i++) {
      var student = db.studentCollection.get(examResult[i].studentId);
      result[i] = {
        examResultId: examResult[i].$loki,
        firstName: student.firstName,
        lastName: student.lastName,
        score: examResult[i].score,
        active: examResult[i].active
      };
    }
    return result;
  }($scope.state.examId);
  
  // called when an result is updates
  $scope.examResutlChanged = function(result) {
    if(!Number.isNaN(result.score)) {
      var record = db.examResultCollection.get(result.examResultId);
      record.score = result.score;
      db.examResultCollection.update(record);
    }
  }
})

///////////////////////////////////////////////////////////////////////////////
// About
///////////////////////////////////////////////////////////////////////////////
.controller('aboutCtrl', function($scope) {

})

///////////////////////////////////////////////////////////////////////////////
// Settings
///////////////////////////////////////////////////////////////////////////////
.controller('settingsCtrl', function($scope) {

})

///////////////////////////////////////////////////////////////////////////////
