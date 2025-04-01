Spirograph Web Simulator

A dynamic, web-based Spirograph simulator built with Go (WebAssembly) and Next.js. This project features a responsive design with a slide-out control panel and the ability to generate and share unique designs via a URL.

Features

* Go WebAssembly Integration: All spirograph point calculations are handled by a highly efficient Go function compiled to WebAssembly (.wasm). This offloads intensive mathematical work from the main JavaScript thread, ensuring a smooth and responsive user experience.

* Modern Next.js & React UI: The interface is built with Next.js, leveraging React's component-based architecture for a clean and maintainable codebase.

* Responsive Design: The application automatically scales to fit the screen on both desktop and mobile devices. A slide-out control panel allows you to adjust parameters without obstructing the canvas.

* Shareable Links: Any spirograph design you create can be shared with others. The app generates a unique URL with all the design parameters, which automatically loads and starts drawing when accessed.

Prerequisites

Before you begin, ensure you have the following installed on your system:

* Go (1.18 or later): Required to compile the Go source code to WebAssembly.

  * Installation: Download and install Go from the official Go website (https://go.dev/dl/).

  * Verification: Open your terminal and run go version to confirm a successful installation.

* Node.js (14.0 or later): The JavaScript runtime environment for Next.js.

  * Installation: Download the installer from the Node.js website (https://nodejs.org/). This also includes npm (Node Package Manager).

  * Verification: Run node -v and npm -v in your terminal to check the versions.

Project Structure

The project is structured to clearly separate the Go backend from the Next.js frontend.

* main.go: The core Go logic for calculating spirograph points.

* go.mod: The Go module file, defining project dependencies.

* public/main.wasm: The compiled WebAssembly binary of the Go code.

* public/wasm_exec.js: The JavaScript bridge provided by Go, which enables communication between JavaScript and the WASM module.

* pages/index.jsx: The single main component of the application. It orchestrates all logic, including state management, WASM loading, and rendering the UI.

* styles/Home.module.css: Contains the custom CSS for the responsive layout and the sliding control panel.

Getting Started

Follow these steps to get the project up and running on your local machine.

1. Clone the Repository
   If your project is in a repository, clone it. Otherwise, ensure you have all the necessary project files in a local directory.

2. Install Node.js Dependencies
   Navigate to your project's folder and install the required packages.

   npm install

3. Compile Go to WebAssembly
   Run this command in your project's root directory to compile the Go code. The output (main.wasm) will be placed directly in the public folder.

   GOARCH=wasm GOOS=js go build -o public/main.wasm main.go

4. Run the Development Server
   Start the Next.js development server.

   npm run dev

   Your application will be available at http://localhost:3000.

Build Scripts

The following scripts are defined in your package.json and are used to manage the application lifecycle.

* npm run dev: Starts the development server. Use this for local development as it includes hot-reloading.

* npm run build: Creates a production-optimized, static build of your application. This is the command to use before deploying to a server.

* npm run start: Serves the production build. This command will only work after you have run npm run build.

