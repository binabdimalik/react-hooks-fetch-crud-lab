import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor, // Import waitFor
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/g)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // wait for first render of list (otherwise we get a React state warning)
  await screen.findByText(/lorem testum 1/g);

  // click form page
  fireEvent.click(screen.queryByText("New Question"));

  // fill out form
  fireEvent.change(screen.queryByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  // Note: QuestionForm uses "Correct Answer Index" for the number input
  // and QuestionItem uses "Correct Answer" for the select dropdown.
  // The test appears to target the QuestionForm's index input here.
  fireEvent.change(screen.queryByLabelText(/Correct Answer Index/), {
    target: { value: "1" },
  });

  // submit form
  fireEvent.submit(screen.queryByText(/Add Question/));

  // view questions (this is now handled by the form submitting and navigating back, 
  // but keeping this navigation step for robustness if the form component is complex)
  fireEvent.click(screen.queryByText(/View Questions/));

  expect(await screen.findByText(/Test Prompt/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  await screen.findByText(/lorem testum 1/g);

  fireEvent.click(screen.queryAllByText("Delete Question")[0]);

  await waitForElementToBeRemoved(() => screen.queryByText(/lorem testum 1/g));

  rerender(<App />);

  await screen.findByText(/lorem testum 2/g);

  expect(screen.queryByText(/lorem testum 1/g)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  await screen.findByText(/lorem testum 2/g);

  fireEvent.change(screen.queryAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  // FIX: Use waitFor to ensure the asynchronous state update (from the PATCH request 
  // in QuestionItem) is reflected in the DOM before asserting.
  await waitFor(() => {
    expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");
  });

  rerender(<App />);

  expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});