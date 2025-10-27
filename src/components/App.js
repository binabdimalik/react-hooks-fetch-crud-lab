import React, { useEffect, useState } from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import AdminNavBar from "./AdminNavBar"; // Import AdminNavBar

function App() {
  const [questions, setQuestions] = useState([]);
  // Use a single state to control which view is visible
  const [page, setPage] = useState("List"); 

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:4000/questions")
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setQuestions(data);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleAddQuestion(newQuestion) {
    setQuestions([...questions, newQuestion]);
    // Navigate back to the list view after adding
    // The QuestionForm now calls onCloseForm, which is setPage("List") here.
  }

  function handleDeleteQuestion(id) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function handleUpdateQuestion(updatedQuestion) {
    setQuestions(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  }

  // Function to render the correct component based on the 'page' state
  function renderPage() {
    if (page === "List") {
      return (
        <QuestionList
          questions={questions}
          onDeleteQuestion={handleDeleteQuestion}
          onUpdateQuestion={handleUpdateQuestion}
        />
      );
    } else if (page === "Form") {
      return (
        <QuestionForm
          onAddQuestion={handleAddQuestion}
          // The onCloseForm prop now sets the page back to "List"
          onCloseForm={() => setPage("List")} 
        />
      );
    }
    return null;
  }

  return (
    <main>
      {/* Use AdminNavBar to control the page state */}
      <AdminNavBar onChangePage={setPage} />
      {/* Render the currently selected page component */}
      {renderPage()}
    </main>
  );
}

export default App;