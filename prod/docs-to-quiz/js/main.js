var copyAndPasteText = document.getElementById("copy-and-paste-text");
var quizIds = document.getElementById("quiz-ids");
var quizJson = document.getElementById("quiz-json");
var convertButton = document.getElementById("convert-button");

convertButton.addEventListener("click", function() {
  var lines = copyAndPasteText.value.replace(/\r\n|\n\r|\n|\r/g, "\n").split("\n");
  var quizArray = [];
  var index = 0;

  while(index < lines.length) {
    // search the lines for a "#" start charachter
    if(lines[index].charAt(0) === "#") {
      var topic = lines[index].match(/\s.*/g);
      var quiz = {
        id: uuidv4(),
        topic: (topic !== null ? topic[0].substr(1) : ""),
        question: lines[index+1],
        correctAnswer: lines[index+3],
        wrongAnswers: [lines[index+5], lines[index+6], lines[index+7]],
        trivial: lines[index+9]
      };

      quizArray.push(quiz);
    }
    index++;
  }

  // print uuids
  var ids = "";
  for(var i=0; i<quizArray.length; i++) {
    ids += "\"" + quizArray[i].id + "\"" + (i < (quizArray.length-1) ? ",\n" : "");
  }
  quizIds.value = ids;

  // print the json format
  quizJson.value = JSON.stringify(quizArray, null, 4);
})
