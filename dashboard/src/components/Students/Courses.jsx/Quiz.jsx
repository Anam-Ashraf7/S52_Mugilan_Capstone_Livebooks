import React, { useState, useEffect } from 'react';

function Quiz({ questions }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(new Array(questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Check if the quiz has been completed and stored in localStorage
    const quizCompleted = localStorage.getItem('quizCompleted');
    if (quizCompleted) {
      setSubmitted(true);
    }
  }, []);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = questions[questionIndex].options[optionIndex];
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex - 1);
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].answer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
    localStorage.setItem('quizCompleted', 'true'); // Store completion status in localStorage
  };

  const allQuestionsAnswered = selectedAnswers.every(answer => answer !== '');

  if (submitted && showResults) {
    return (
      <div className="mx-auto p-6 bg-white rounded-lg shadow-lg max-w-[80%] h-[100%]">
        <h2 className="text-2xl font-bold mb-4 text-center">Quiz Results</h2>
        <p className="text-xl text-center mb-6">Your Score: {score} / {questions.length}</p>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="font-semibold text-lg">{question.question}</p>
              <ul className="space-y-2 mt-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = option === question.answer;
                  const isSelected = option === selectedAnswers[index];
                  return (
                    <li
                      key={optionIndex}
                      className={`p-3 border rounded ${
                        isSelected
                          ? isCorrect
                            ? 'bg-green-200 border-green-400'
                            : 'bg-red-200 border-red-400'
                          : ''
                      } ${
                        !isSelected && isCorrect
                          ? 'bg-green-100 border-green-300'
                          : 'border-gray-300'
                      }`}
                    >
                      {option}
                      {isCorrect && <span className="ml-2 text-green-600 font-semibold">(Correct)</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto block"
          onClick={() => setShowResults(false)}
        >
          Go Back to Quiz Overview
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto p-6 bg-white rounded-lg shadow-lg max-w-[80%] h-[100%] text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed</h2>
        <p className="text-xl mb-6">Your Score: {score} / {questions.length}</p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowResults(true)}
        >
          View Results
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md max-w-[90%]">
      {questions && questions.length > 0 && (
        <div>
          {/* Question */}
          <h3 className="text-2xl font-semibold mb-4">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <div className="bg-white p-4 mb-6 rounded-lg shadow border">
            <p className="text-lg font-medium">{questions[currentQuestionIndex].question}</p>
          </div>

          {/* Options */}
          <ul className="space-y-4">
            {questions[currentQuestionIndex].options.map((option, optionIndex) => (
              <li
                key={optionIndex}
                className={`p-3 border-2 rounded cursor-pointer 
                  ${selectedAnswers[currentQuestionIndex] === option ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                  hover:bg-blue-50`}
                onClick={() => handleOptionSelect(currentQuestionIndex, optionIndex)}
              >
                {option}
              </li>
            ))}
          </ul>

          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between items-center">
            {currentQuestionIndex > 0 && (
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={handlePreviousQuestion}
              >
                Previous
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleNextQuestion}
              >
                Next
              </button>
            )}
            {currentQuestionIndex === questions.length - 1 && allQuestionsAnswered && (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
