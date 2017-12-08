var copyAndPasteText = document.getElementById("copy-and-paste-text");
var quizJson = document.getElementById("quiz-json");
var convertButton = document.getElementById("convert-button");

convertButton.addEventListener("click", function() {
  var lines = copyAndPasteText.value.replace(/\r\n|\n\r|\n|\r/g, "\n").split("\n");
  var quizArray = [];
  var index = 0;

  // remove empty lines
  for(var i=lines.length; i>=0; i--) {
    if(lines[i] == "") {
      lines.splice(i, 1);
    }
  }

  while(index < lines.length) {
    console.log(lines[index])
    // search the lines for a "#" start charachter
    if(lines[index].charAt(0) === '#') {
      var answerIndex = index+10

      var quiz = {
        id: lines[index+1],
        type: lines[index+3],
        question: lines[index+5],
        imgSrc: lines[index+7],
        multiOptions: lines[index+9] == "true",
        answers: []
      };

      while(lines[answerIndex] == "answer") {
        quiz.answers.push({
          letter: lines[answerIndex+1],
          answer: lines[answerIndex+2],
          correct: lines[answerIndex+3] == "true"
        })
        answerIndex += 4
      }

      quizArray.push(quiz);
    }
    index++;
  }

  // print the json format
  quizJson.value = JSON.stringify(quizArray);
})
