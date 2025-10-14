# Final Project Requirements, Epics, Stories, & Tasks

## Project Pitch: Classwork Creation Tool

**The Problem in Computer Science Classrooms**

In computer science education, learning works best when it's active, adaptive, and collaborative. Students learn more by doing - writing code, discussing ideas, and solving problems - than by simply listening to lectures. Working with classmates helps you see different ways to think about a problem, and having an instructor nearby provides expert guidance and immediate feedback. The most effective classroom activities combine these elements into a single, interactive experience.

However, creating that kind of experience in a CS course is challenging. Students enter with different levels of experience and learn at different speeds. Instructors have limited time and attention - they're expected to lecture, guide, and manage all at once. A single lesson might need to mix several types of tasks: coding problems, short written answers, and auto-graded quizzes. Each of these requires different grading tools and feedback methods, from unit tests to rubrics to multiple-choice grading systems.

Existing tools only partially meet these needs.

- Document editors (like Google Docs) are great for collaboration, but they can't grade code automatically.
- Coding environments (like VS Code or Jupyter Notebooks) allow hands-on programming but lack structure for guided exercises.
- Quiz platforms (like Canvas or Google Forms) handle auto-grading well but aren't built for open-ended, interactive learning.
- As a result, instructors often switch between several platforms - losing time and breaking the flow of learning. Students may complete activities without really understanding the underlying concepts.

**The Solution: CoFlowCode**

CoFlowCode will bridges these gaps by offering a unified platform for creating and running interactive in-class assignments. Within a single document, instructors can mix: Text explanations, open-ended free-response questions, runnable code cells, and automatically graded exercises. Each activity can have its own grading logic through tests, rubrics, or AI-based feedback. Instructors can also set mastery checkpoints that ensure students fully understand a topic before moving forward. CoFlowCode also supports collaboration, so students can work in pairs or small groups, and integrates smoothly with tools like Canvas to make setup and grading easier.

With CoFlowCode, assignments become living, interactive documents. Students learn by coding, reflecting, and collaborating. Instructors gain insight into how students are thinking and can provide immediate, personalized feedback. The result is a classroom experience that feels more like an interactive lab than a passive lecture.

And that's what you're going to be making this semester! Or the frontend of it, anyway.

# Requirements

The following functionalities capture the necessary features for users using your application.

Dashboard

Displays a list of the assignments available
Each assignment must have at least a name
When a user selects an assignment, they can go to either of these other views:
Assignment Creator View
Assignment Taker View
Assignment Creator View

Questions should be displayed as being edited in-progress, including:
Text blocks (instructions or explanations)
Open-ended questions
Code cells, with multiple files supported
Auto-graded quiz questions (e.g., multiple choice, true/false, matching, fill-in-the-blank)
Ability to attach a rubric to every type of question, with different kinds of specificity depending on the question type
Auto graded questions should let you specify the answer
Code cells let you specify one of the files to have the unit tests
Open-ended questions should let you have multiple rubric items with criteria for a human/AI grader
Include controls for adding, editing, and reordering questions or activities
Include a control for adding a page break with criteria for when the taker can advance to the next page.
A "preview" or "run as student" button that will let them see what it's like to take the assignment
Export and import buttons for:
Saving and loading the current state of the application, to return to later (either in files or using localStorage)
Exporting a CSV with each rubric item broken down as a separate row.
Navigation buttons that will let you return to the assignments page.
Assignment Taker View

Questions for the user to answer, mixing question types
Each question must take user input of some kind.
There must be a progress bar that progress with each answered question. When all questions are complete, the progress bar is full.
Ability to move to the next page, but only if they have completed whatever criteria the instructor set for that page break.
A submit button for the current page, which will evaluate any automatically graded parts and decide if they have finished the current page.
Import and export buttons for:
Saving and loading the current state of the application, to return to later (either in files or using localStorage)
Exporting a Docx file with each question and answer written down in a way that is human readable.
Navigation buttons that will let you return to the assignments page.
Epics, User Stories, & Tasks
Epic 1: Assignment Authoring
Goal: Create/edit assignments composed of a linear sequence of items (optionally paginated).

User Story 1.1) View assignments: As an instructor, I want to be able to see all the created assignments in a dashboard list.

Acceptance criteria:

All assignments listed
Buttons for navigating to the editor view for assignment and taking view for assignment
User Story 1.2) Create a new assignment: As an instructor, I want to create a new assignment with a title and optional description so that I can start adding content.

Acceptance criteria:

"New Assignment" button creates an assignment with default title, empty title list, and a default single page.
Appears in the dashboard list immediately.
User Story 1.3) Add/edit/reorder items: As an instructor I want to add text blocks, questions, and page breaks; ability to reorder; and edit inline so that I can structure the flow.

Acceptance criteria:

Controls for adding text, MCQ, fill-in-the-blank, essay, code cell, and page break.
Mechanism for reordering between/within pages
Controls for deleting an item
Page break visibly separates pages in editor
User Story 1.4) Assignment metadata: As an instructor, I want to be able to set instructions, estimated time, and notes to myself.

Acceptance criteria:

Metadata panel (title, description, estimated time, and notes)
Epic 2: Question Types & Editors
Goal: Author rich, mixed content like Google Docs × Jupyter.

User Story 2.1) Text block: As an instructor, I want rich text (headings, bold/italic, code span, lists) so that I can present instructions.

Acceptance criteria:

Minimal WYSIWYG controls; inline preview.
Markdown editing for the rich-text content.
User Story 2.2) Multiple Choice: As an instructor, I want MCQ items with one or more correct answers so that they can be auto-graded.

Acceptance criteria:

Choice editor (add/remove, shuffle toggle).
Mark one or more correct options.
Optional feedback per choice.
User Story 2.3) Fill-in-the-blank: As an instructor, I want pattern or exact-match questions (with case/trim options) so that simple answers can be auto-graded.

Acceptance criteria:

Accept list of accepted answers and/or regex.
Options for controlling case-sensitive; whitespace-trim on/off.
User Story 2.4) Essay/Free Response: As an instructor, I want a long-form response area so that students can explain reasoning.

Acceptance criteria:

Word/character counter
User Story 2.5) Multi-file code cell setup: As an instructor I want to configure a code cell with multiple files (name + language) so that students can work across files like mini-repos.

Acceptance criteria:

Add/remove files inside a code block
Supported modes: at least Python display (with syntax highlighting)
Ability to run using Pyodide and see the execution results
Able to mark files as either instructor files (not shown to students) or starter files (provided for students on load)
Epic 3: Rubric Configuration
Goal: Attach grading logic definitions in the form of rubrics.

User Story 3.1) Per-type grading options: As an instructor, I want to choose grading mode per item so that each item can be auto-graded or human-graded.

Acceptance criteria:

Modes (these are not mutually exclusive):
Answer checks (MCQ/Fill-blank) - client evaluation
Unit tests metadata (Code) - mark one of the files as tests that should be run for the students' code.
Rubric (Essay/Code/Text) - point-based criteria across one or more items, with a description for each level
AI prompt - Further instructions that can be provided to an AI for additional grading.
Preview shows which items are auto vs manual
User Story 3.2) Local auto-grading for simple items: As a student, I want immediate feedback on MCQ/Fill-blank so that I can learn iteratively.

Acceptance criteria:

On submit: client compares selection/answers to configured keys/patterns and returns pass/fail + per choice feedback
User Story 3.3) Executable unit tests: As a student, I want to be able to execute the instructor-provided unit tests in a code block, to get immediate feedback on my code.

Acceptance criteria:

Button to execute instructor tests
Feedback immediately displayed showing the results of the instructor unit tests
User Story 3.4) Rubric entry and scoring: As an instructor, I want to define rubric criteria and max points so that manual grading is structured.

Acceptance criteria:

Create/edit/delete a rubric item (title, description)
Create/edit/delete criteria for a rubric item (level, name, description, points)
Shown in feedback view as "awaiting grading"
User Story 3.5) AI Prompt provided: As an instructor, I want to write additional instructions to augment an AI grader for how to grade this assignment.

Acceptance criteria:

Prompt templates support {{placeholders}} (e.g., {{studentAnswer}}, {{testResults}}).
Epic 4: Page Flow, Checkpoints & Gating
Goal: Control progression with mastery checkpoints.

User Story 4.1) Page submit & gating: As an instructor, I want to require submit + feedback before students proceed so that mastery is ensured

Acceptance criteria:

Per page: toggle "require all correct before next page"
If toggled, next is disabled until the user submits answers that pass all automatic checks
Items with auto-grading update immediately, but items needing manual review are marked "in-progress"
User Story 4.2) Show attempts: As a student, I want to see the results of my current attempt and past attempts.

Acceptance criteria:

A counter is shown indicating which attempt they are making
The current feedback is shown for the most recent submitted attempt
Epic 5: Student Taking Experience
Goal: A focused assignment taker view with progress and navigation

User Story 5.1) Start/continue assignment: As a student, I want to open an assignment and see instructions and progress so that I can get oriented.

Acceptance criteria:

Intro screen shows title, description, estimated time, total items/pages.
Resume from last saved point (either upload or localStorage)
User Story 5.2) Answer interactions: As a student, I want to input answers across all item types so that I can complete the assignment.

Acceptance criteria:

Each item captures input (choices, text, code across files).
User Story 5.3) Page submit + feedback: As a student, I want to submit a page and get immediate auto-graded feedback where applicable so that I know if I can continue.

Acceptance criteria:

Submit button at bottom of page
If gating is enabled, next only unlocks when conditions are met
User Story 5.4) Group attribution: As a student, I want to list everyone who worked with me so that collaboration is documented.

Acceptance criteria:

"Collaborators" panel for users to add name, email, and optional role.
Stored in submission and exported.
Epic 6: Import/Export
Goal: Move data in/out without servers.

User Story 6.1) Export assignment bundle: As an instructor, I want to be able to export an assignment so I can share or version it.

Acceptance criteria:

JSON bundle contains: metadata, items, pages, grading logic, unit test files (text), prompts, rubrics, etc.
Download prompts the browser to save file.
User Story 6.2) Import assignment bundle: As an instructor, I want to be able to import a previously exported assignment so that I can continue editing.

Acceptance criteria:

File picker validates schema; loads into editor.
User Story 6.3) Export submission bundle: As a student, I want to be able to export my in-progress submission so that I can come back to it later.

Acceptance criteria:

JSON bundle contains: assignment information, answers, timestamps, collaborators, auto-grade outcomes, pending flags, page-gating statuses.
Download prompts the browser to save file.
User Story 6.4) Import submission bundle: As a student, I want to be able to import my in-progress submission so that I can come back to it later.

Acceptance criteria:

File picker validates schema; loads into editor.
User Story 6.5) Export DOCX: As a student, I want to be able to export my submission as a Docx, so that I can upload the file to Canvas.

Acceptance criteria:

Client-side DOCX generation: renders text, selected answers, essay text, code blocks (monospace), page breaks aligned to assignment.
Header includes assignment title, student names and emails, date, and completion status
Download prompts the browser to save file.
User Story 6.6) Export Canvas Rubric: As an instructor, I want to be able to export the complete grading rubric for the assignment so that I can import it into Canvas.

Acceptance criteria:

Export a CSV with each criteria and rubric item on its own separate line.
Auto-graded questions also have a rubric item.

# Constraints

Your application is going to have the following constraints placed on it.

- You must use React, and more specifically React Hooks. Class-based components are way passé. 
- You must use TypeScript, with well-defined types. You are not allowed to use any, unknown, or other typeless types.
- You must use branches, with the main branch always stable and continuously deploying.
- You must use a linter, with any committed code passing all linting and formatting checks. You cannot override the linter or changes it settings.
- Your application must be well-tested, with the main branch always passing all tests. High code coverage is expected.
- You must deploy your application via GitHub pages. 
- The user experience matters.
- Your codebase's quality matters. 
