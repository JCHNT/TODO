# Task Manager Application

## Overview
This is a Task Manager Application built with Vite, React, and TypeScript. It allows users to create, manage, and organize tasks with features like task prioritization, deadlines, reminders, and tags. The application supports both list and calendar views, and includes a dark mode for a better user experience.

The app is designed to be simple, intuitive, and responsive, making it easy for users to keep track of their tasks and deadlines.

## Features

### 1. Task Management
- **Create Tasks**: Add new tasks with a title, description, priority, deadline, and optional reminder.
- **Edit Tasks**: Update task details at any time.
- **Delete Tasks**: Remove tasks that are no longer needed.
- **Mark as Done**: Toggle task completion status.
- **Drag and Drop**: Reorder tasks in the list view by dragging and dropping them.

### 2. Task Views
- **List View**: View tasks in a simple list format.
- **Calendar View**: Organize tasks by day, week, or month (currently a placeholder for future implementation).

### 3. Task Filtering and Sorting
- **Search**: Search for tasks by title or description.
- **Priority Filter**: Filter tasks by priority (high, medium, low, or all).
- **Sorting**: Tasks are sorted by their order in the list.

### 4. Dark Mode
- Toggle between light and dark themes for better visibility in different lighting conditions.

### 5. Confetti Animation
- Celebrate task completion with a fun confetti animation.

### 6. Local Storage
- Tasks are saved in the browser's local storage, so they persist even after refreshing the page.

## Technologies Used

### Frontend:
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: Adds static typing to JavaScript for better code quality and maintainability.
- **Vite**: A fast build tool for modern web development.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Lucide Icons**: A set of clean and customizable icons.

### Other Tools:
- **Canvas Confetti**: A lightweight library for creating confetti animations.

## Installation
To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/task-manager-app.git
   cd task-manager-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   The app will be running at [http://localhost:5173](http://localhost:5173) (or another port if specified).

## Project Structure
Here’s an overview of the project structure:
```plaintext
.
|-- Readme.md
|-- eslint.config.js
|-- index.html
|-- package-lock.json
|-- package.json
|-- postcss.config.js
|-- src
|   |-- App.tsx
|   |-- components
|   |   |-- ProgressBar.tsx
|   |   |-- TaskCard.tsx
|   |   |-- TaskForm.tsx
|   |   `-- TaskList.tsx
|   |-- index.css
|   |-- main.tsx
|   |-- types.ts
|   |-- utils
|   |   `-- confetti.ts
|   `-- vite-env.d.ts
|-- tailwind.config.js
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
`-- vite.config.ts
```

## Usage

### 1. Adding a Task
- Click the "Nouvelle tâche" button to open the task creation form.
- Fill in the task details (title, description, priority, deadline, and optional reminder).
- Click "Enregistrer" to add the task.

### 2. Editing a Task
- Click the edit icon (pencil) on a task card to open the edit form.
- Make the necessary changes and click "Enregistrer".

### 3. Deleting a Task
- Click the delete icon (trash) on a task card.
- Confirm the deletion by clicking the icon again.

### 4. Marking a Task as Done
- Click the checkmark icon on a task card to toggle its completion status.

### 5. Filtering Tasks
- Use the search bar to filter tasks by title or description.
- Use the priority filter to show tasks of a specific priority.

### 6. Switching Themes
- Click the moon/sun icon in the top-right corner to toggle between light and dark modes.

## Customization

### 1. Changing Placeholder Colors
To change the placeholder text color in input fields, modify the `placeholder:text-gray-600` class in the `TaskForm.tsx` file. You can use any Tailwind color class (e.g., `placeholder:text-gray-700`).

### 2. Adding New Features
You can extend the app by adding new features like:
- **Calendar View**: Implement a full calendar view using a library like `react-calendar`.
- **Task Categories**: Add support for categorizing tasks (e.g., work, personal).
- **Task Sharing**: Allow users to share tasks via email or a link.

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as you see fit.

## Acknowledgments
- **Vite**: For providing a fast and modern development environment.
- **Tailwind CSS**: For making it easy to style the app with utility classes.
- **Lucide Icons**: For providing a clean and consistent set of icons.
- **Canvas Confetti**: For adding a fun touch to task completion.

## Contact
If you have any questions or feedback, feel free to reach out:

- **Email**: jchouinato@gmail.com
- **GitHub**: [JCHNT](https://github.com/JCHNT)
