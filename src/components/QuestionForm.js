import React, { useState } from "react";

function QuestionForm({ onAddQuestion, onCloseForm }) {
  const [formData, setFormData] = useState({
    prompt: "",
    answers: ["", "", "", ""],
    correctIndex: 0,
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleAnswerChange(index, value) {
    const updatedAnswers = [...formData.answers];
    updatedAnswers[index] = value;
    setFormData({ ...formData, answers: updatedAnswers });
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Call onCloseForm first to unmount the component immediately.
    // The state update that causes the warning is setFormData({ ... })
    // If we close the form first, we remove the need to reset local state.
    onCloseForm(); 
    
    fetch("http://localhost:4000/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((r) => r.json())
      .then((newQuestion) => {
        onAddQuestion(newQuestion);
        // 2. Remove setFormData reset, as the component is now unmounted.
        /*
        setFormData({
          prompt: "",
          answers: ["", "", "", ""],
          correctIndex: 0,
        });
        */
      });
  }

  return (
    <section>
      <h2>Add New Question</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt:
          <input
            type="text"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
          />
        </label>
        {formData.answers.map((ans, index) => (
          <label key={index}>
            Answer {index + 1}:
            <input
              type="text"
              value={ans}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
          </label>
        ))}
        <label>
          Correct Answer Index:
          <input
            type="number"
            name="correctIndex"
            value={formData.correctIndex}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Add Question</button>
      </form>
    </section>
  );
}

export default QuestionForm;