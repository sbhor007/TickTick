# TickTick Clone

This project is a robust task management web application modeled after the popular productivity app **TickTick**. It handles complex hierarchical data (folders > projects > tasks > subtasks) and provides rich contextual interactions.

## 🚀 Getting Started

### Development Server
To start the local development server, run:
```bash
ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Mock Backend (json-server)
This project relies on `json-server` to mock the backend database.
To run the server:
```bash
npx json-server --watch server/db.json
```

---

## 🧠 Core Concepts & Technical Rationale

This project employs several advanced architectural and design concepts to manage its complexity. Here is a breakdown of what is used and **why**:

### 1. Component-Based Architecture (Angular 19)
**What:** The UI is broken down into small, reusable components (e.g., `task-item`, `date-time-picker`, `context-header`).
**Why:** Task management apps have deeply nested and repeated UI elements (like a task row). A component-based approach ensures reusability, easier testing, and maintains a clean separation of concerns. Angular's strong typing with TypeScript prevents runtime errors common in complex data structures.

### 2. Contextual Routing & Smart Views
**What:** The app uses a highly dynamic routing structure (`ListActionPageComponent` -> `ContextPageComponent` -> `TaskDetailsComponent`). Views like "Inbox", "Today", and specific "Folders" or "Projects" are treated as "Contexts".
**Why:** Instead of creating separate pages for every filter, a single `ContextPageComponent` dynamically reads the route data (e.g., `EntityType.TODAY` or `EntityType.FOLDER`) and fetches the relevant tasks. This drastically reduces code duplication and allows for "Smart Views" that aggregate data across the entire application on the fly.

### 3. Service-Oriented Architecture (SOA)
**What:** Business logic, state, and API communications are abstracted into specialized services (`task.service.ts`, `folder-project.service.ts`, `ui-state.service.ts`).
**Why:** Components should only be responsible for presenting data and capturing user input. Moving logic to services ensures that complex operations (like moving a task between folders or calculating recurring dates) are centralized, easily testable, and reusable across different components (e.g., using the same `TaskService` in both the List View and the Details View).

### 4. Reactive State Management & Event-Driven UI (RxJS)
**What:** The application heavily utilizes RxJS (`BehaviorSubject`, `Observable`) and Angular's `EventEmitter` to manage state and communication.
**Why:** When a user right-clicks a task and changes its due date via the Context Menu, that change needs to immediately reflect in the Task List, the Task Details pane, and potentially the Smart View grouping. RxJS provides a reactive, stream-based approach where components can "subscribe" to state changes without needing tight coupling.

### 5. Utility-First CSS & Component Libraries
**What:** The project combines **Tailwind CSS 4** for layout/utility styling and **PrimeNG** for complex UI components.
**Why:** 
- *PrimeNG* provides robust, accessible, and complex components out-of-the-box (like menus, dialogs, and dropdowns) which saves weeks of development time.
- *Tailwind CSS* allows for rapid, custom layout adjustments and pixel-perfect styling without writing custom, hard-to-maintain CSS files. The combination gives the best of both worlds: speed and extreme customization.

### 6. Mock Driven Development (json-server)
**What:** A massive `db.json` file serves as the database for `json-server`, simulating a REST API.
**Why:** It allows the frontend to be developed rapidly and independently of backend readiness. By mimicking real network latency and RESTful endpoints, the frontend is built robustly to handle asynchronous data fetching, making the eventual swap to a real backend seamless.

---

## 🧩 Component Architecture & Responsibilities

The application is heavily modularized into specialized components. Here is a breakdown of every major component and **why** it exists:

### Pages & Layouts (`src/app/pages`)
- **`NavigationComponent`**: Serves as the root-level shell, rendering the global sidebar and top navigation. **Why:** It isolates persistent global navigation state from the individual task views.
- **`ListActionPageComponent`**: Acts as a primary layout container housing both the task list pane and the task details pane. **Why:** It coordinates the two-pane layout, ensuring responsive design and proper sizing between views.
- **`ContextPageComponent`**: Dynamically renders task lists based on specific route parameters (e.g., viewing 'Inbox' vs 'Project'). **Why:** Instead of creating separate pages for every filter, it dynamically reads the route and feeds the correct "context" to child components, reducing code duplication.

### Context & Headers (`src/app/components/context`)
- **`ContextHeaderComponent`**: Displays the title and action buttons (like grouping/sorting) for the currently active view. **Why:** It abstracts header UI logic so the main list component isn't cluttered with controls that change based on context.
- **`TaskListComponent`**: The core component for rendering lists of tasks, including pinned, sorted, and completed groups. **Why:** It centralizes the highly complex logic of rendering nested lists, subtasks, and drag-and-drop interactions.

### List Views (`src/app/components/list`)
- **`ListComponent`**: A generic list container that can be extended by specific list implementations. **Why:** Provides a baseline layout and shared logic for rendering standard lists, promoting DRY principles.
- **`ListActionComponent`**: Handles the action bar and specific bulk interactions performed on a list of items. **Why:** Separates the logic for list-level actions from the actual rendering of the task rows.
- **`SmartViewComponent`**: Renders predefined filters that aggregate tasks dynamically, like 'Inbox' or 'Today'. **Why:** Smart views require unique sorting and aggregation logic compared to standard folders; this isolates those rules.
- **`TagsComponent`**: Handles rendering the task list when filtered by a specific tag. **Why:** Viewing tasks by tag requires different visual indicators or groupings, making a dedicated component cleaner.
- **`PinnedComponent`**: Dedicated to displaying tasks that the user has explicitly pinned. **Why:** Pinned tasks bypass normal sorting rules; a separate component ensures these rules are encapsulated.
- **`CreateProjectComponent`**: A modal or inline UI specifically for creating new projects or lists. **Why:** Isolates the form validation and API calls required for project creation.

### Task Details & Specialized Views (`src/app/components/task-details`, `summary`, `trashed`)
- **`TaskDetailsComponent`**: The large right-hand pane for viewing and editing granular task details. **Why:** Isolates the heavy UI required for rich text editing, comments, and attachments away from the main list.
- **`SummaryComponent`**: A dedicated view for reporting metrics, productivity stats, and completed tasks. **Why:** Analytics require vastly different UI and data structures than task lists, necessitating a standalone component.
- **`TrashedComponent`**: A specialized view for managing deleted items. **Why:** Trashed items have a different set of allowed actions (e.g., "Restore") compared to active tasks, requiring dedicated UI handling.

### Shared UI & Modals (`src/app/share`)
- **`TaskItemComponent`**: Represents a single, interactive row in the task list. **Why:** Each row has complex interactions (checkboxes, context menus). Breaking this into its own component keeps the parent list maintainable.
- **`TaskInputComponent`**: The input field used to quickly type and add new tasks to a list. **Why:** Isolates the user input flow for adding new tasks, keeping the list component focused on rendering.
- **`DateTimePickerComponent`**: A custom dropdown/modal for selecting complex dates and times. **Why:** Native date pickers are inconsistent; this ensures a unified experience for setting due dates and reminders.
- **`TagSelectorComponent`**: A shared dropdown menu used to assign tags to a task. **Why:** Tag assignment is needed in multiple places (right-click menu, task details); a shared component ensures maximum reusability.
- **`TagInputComponent`**: An input field specifically for creating or searching through available tags. **Why:** Isolates the autocomplete and validation logic required for tag management.
- **`MoveToProjectComponent`**: A dropdown/modal used to move a task from one project/folder to another. **Why:** Moving tasks is a common action accessed from multiple UI contexts; placing it here avoids duplication.
- **`CreateFolderComponent`**: A modal/form for creating new organizational folders. **Why:** Isolates the specific form validation needed to manage the top-level organizational hierarchy.

---

## ⚙️ Services Architecture & Responsibilities

The application uses a Service-Oriented Architecture (SOA) to strictly separate business logic, state management, and API communications from the UI components. Here is a breakdown of every major service and **why** it exists:

### Core Entity Services
- **`TaskService`**: Manages all CRUD operations and API calls related to core tasks. **Why:** Centralizes the logic for fetching, creating, and updating tasks so that components share a single source of truth without duplicating network requests.
- **`SubTaskService`**: Handles the nested logic specifically for subtasks attached to a parent task. **Why:** Subtasks often have different API endpoints and cascading update rules compared to top-level tasks; this isolates those unique rules.
- **`FolderService`**: Manages the CRUD operations for high-level organizational folders. **Why:** Abstracts the backend communication required for retrieving and managing the user's folder hierarchy.
- **`ProjectService`**: Manages the CRUD operations for projects, which sit within folders or at the root level. **Why:** Separates project-specific logic (like colors or default sorting) from the broader folder logic.

### Feature & Relationship Services
- **`FolderProjectService`**: Manages the complex, hierarchical relationship between Folders, Projects, and Tasks. **Why:** Grouping logic (e.g., mapping projects to their parent folders for the sidebar) is complex. This service acts as an aggregator to build the structural state of the app.
- **`AttachmentService`**: Handles file uploads, image processing, and attachment metadata. **Why:** File handling often requires different network protocols (like `FormData`) compared to standard JSON REST calls; this encapsulates that complexity.
- **`CommentService`**: Manages the discussion threads and comments attached to individual tasks. **Why:** Isolates the data fetching logic for task discussions, keeping the core task logic lightweight.
- **`ReminderService`**: Manages the logic for scheduling, triggering, and updating task alerts. **Why:** Notification scheduling interacts heavily with time and browser APIs; placing it here keeps UI components unaware of scheduling intricacies.
- **`RepeatService`**: Calculates future dates for recurring tasks based on complex rules (e.g., "Every 3rd Tuesday"). **Why:** Date math for recurrences is notoriously difficult. This service isolates the algorithms required to generate the next due date.
- **`TrashService`**: Manages the soft-deletion and permanent deletion of tasks and projects. **Why:** Moving items to the trash requires updating statuses across the entire app state; this ensures data isn't permanently lost until explicitly requested.

### State Management
- **`UiStateService`**: Acts as a central, reactive store (using RxJS `BehaviorSubject`s) for application-wide UI states, such as the currently selected task or the active sorting method. **Why:** Prevents "prop drilling" (passing data through dozens of nested components). Any component can inject this to instantly know or change the global UI state.

---

## 📁 Configuration Files & Environment

The application relies on several configuration files that dictate how the build process, typing, and styling are handled. Here is a breakdown of the key config files and **why** they are used:

- **`angular.json`**: The workspace configuration file for Angular. **Why:** It defines the project structure, build options (like production vs development environments), asset directories, and configures how styles and scripts are bundled into the final application.
- **`package.json`**: The npm configuration file. **Why:** It tracks all external dependencies (like PrimeNG, Quill, and Tailwind), manages executable scripts (e.g., `npm start`, `npm run test`), and defines project metadata.
- **`tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`**: TypeScript configuration files. **Why:** `tsconfig.json` sets the strict typing rules, module resolution, and compilation targets for the entire project. The `.app` and `.spec` variations allow application code and testing code to have slightly different compiler rules.
- **`src/app/app.config.ts`**: The Angular 19 application configuration file. **Why:** In modern standalone Angular apps, this file replaces the traditional `app.module.ts`. It registers global providers like the Router, HTTP clients, and animation modules required for the app to function globally.
- **`.postcssrc.json`**: PostCSS configuration. **Why:** Tailwind CSS v4 relies on PostCSS to compile its utility classes into vanilla CSS. This file ensures the Angular build process runs the necessary Tailwind plugins.
- **`.editorconfig`**: Standardized editor configuration. **Why:** Ensures consistent coding styles (like indent size, line endings, and trailing spaces) across different IDEs (VSCode, WebStorm) to avoid formatting conflicts during development.

### Application Configuration (`src/app/config`)
While most root config files manage the build, this directory manages application-level configurations and constants:
- **`context-menu-bar.service.ts`**: Contains the comprehensive, hardcoded mapping of context menu items for every `EntityType` (Projects, Tasks, Folders, Smart Views, etc.). **Why:** Separating this massive configuration dictionary from the UI components keeps the UI files clean and provides a single place to edit available right-click actions across the entire app.
- **`tags.service.ts`**: Handles the CRUD operations and state management (utilizing Angular Signals) for tags. *(Note: While it acts like a core Entity Service, it is housed here to configure the tag state globally).*

---

## 🛠️ Key Features

- **Organizational Hierarchy:** Tasks -> Subtasks -> Projects -> Folders.
- **Smart Views:** Pre-configured filters (Inbox, Today, Next 7 Days).
- **Advanced Scheduling:** Integration of a custom `DateTimePicker` for due dates, reminders, and recurring tasks.
- **Rich Context Menus:** Right-click support across the app for rapid task manipulation.
- **Rich Text Editing:** Integrated Quill editor for complex task descriptions and comments.
- **Attachments & Tags:** Comprehensive metadata support for tasks.
