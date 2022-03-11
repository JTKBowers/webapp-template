# Webapp template

This repository contains a frontend project setup with:
- React
- Typescript
- TailwindCSS
- Parcel
- Tests (via chai, react-testing-library and web-test-runner)
- Linting & formatting (ESLint and prettier)
- Automatic dependency updates (Dependabot)
- PR checks (checks tests, linting & build with github actions)

## Usage

### yarn start

Runs the app in development mode.
Open http://localhost:1234 to view it in the browser.

The page will reload if you make edits.

### yarn build

Builds a static copy of your site to the `build/` folder.
Your app is ready to be deployed!

### yarn test

Launches the application test runner.
~Run with the `--watch` flag (`yarn test --watch`) to run in interactive watch mode.~ CURRENTLY BROKEN

### yarn format

Formats the code according to the [prettier](https://prettier.io/) style convention.

### yarn lint

Runs linting rules across the code to catch basic code quality issues.
