# React Frontend UI

The Frontend is a modern Single Page Application (SPA) built with React 19 and Vite.

## Core Features

1. **Axios Response Interceptors:** The frontend is configured to seamlessly unwrap the backend's standardized JSON envelope ({ success, data, error, message }).
2. **Modular Architecture:** Massive monolithic files (like the Admin Dashboard) have been refactored and split into clean, modular components (src/components/admin/).
3. **Dynamic Form Rendering:** Automatically reads the CustomFieldDefinitions from the backend and renders inputs (Text, Number, Date, Dropdowns, Checkboxes) on the fly for Patron and Book registration.
4. **Role-Based UI:** Conditionally hides and shows elements based on the JWT role (Admin, Librarian, Lecturer, Student).

## Running the Frontend
`ash
npm install
npm run dev
`
