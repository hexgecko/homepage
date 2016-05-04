angular.module('app.gradeSystem', ['app.db'])
.factory('grade', ['db', function(db) {
  // calculate the grade for a given exam list
  var calculateGradeList = function(examList, studentId) {
    var result = new Array(examList.length);
    for(var i=0; i<examList.length; i++) {
      // find the score for this examId - studentId
      var score = db.getExamResult(examList[i], studentId)[0].score;

      // calculate the grade
      var grade = 6;
      if(score > examList[i].grade1) {
        grade = 1;
      } else if(score > examList[i].grade2) {
        grade = 2;
      } else if(score > examList[i].grade3) {
        grade = 3;
      } else if(score > examList[i].grade4) {
        grade = 4;
      } else if(score > examList[i].grade5) {
        grade = 5;
      };

      // add the result to a list
      result[i] = {
        name: examList[i].name,
        category: examList[i].category,
        weight: examList[i].weight,
        grade: grade
      };
    }
    return result;
  };
  
  // calculate the total weight for the exam group
  var calculateSumWeight = function(gradeList) {
    // summaries the weights
    var sumWeight = 0;
    for(var i=0; i<gradeList.length; i++) {
      sumWeight += Number(gradeList[i].weight);
    }
    return sumWeight;
  };
  
  // calculate the average grade from a grade list
  var calculateAvgGrade = function(gradeList, sumWeight) {
    // calculate the average grade
    var avgGrade = 0;
    for(var i=0; i<gradeList.length; i++) {
      avgGrade += gradeList[i].grade * Number(gradeList[i].weight)/sumWeight;
    }
    return avgGrade;
  };
  
  return {
    calculateGradeList: calculateGradeList,
    calculateSumWeight: calculateSumWeight,
    calculateAvgGrade: calculateAvgGrade
  };
}]);
