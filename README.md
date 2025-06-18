# Document Evaluation MCP Server

This project is a Model Context Protocol (MCP) server designed to evaluate technical documentation against globalization standards. It provides a tool to analyze documentation, identify potential issues, and ensure clarity and correctness across different languages.

## Features

- **Globalization Review**: Evaluates documentation for common issues that might arise during translation.
- **Sentence-by-Sentence Analysis**: Checks for potential ambiguity and overly long sentences.
- **Bilingual Evaluation**: Assesses both the original Chinese text and its English translation.
- **Summarization**: Provides a summary of the document and a final report of all feedback.

## Installation

To install the necessary dependencies, run the following command:

```bash
npm install
```

## Usage

### Build

To compile the TypeScript code into JavaScript, run:

```bash
npm run build
```

This will create a `dist` directory with the compiled code.

### Start the Server

To start the server, use the following command:

```bash
npm run start
```

The server will start and listen for requests on stdio.

### As a CLI Tool

Once the package is published and installed globally, you can also run it as a command-line tool:

```bash
doc-evaluation-server
```

## Tool: `evaluate_document`

The server exposes a single tool named `evaluate_document`.

- **Description**: This tool takes a string of documentation as input and returns a detailed evaluation report.
- **Input**: 
  - `document` (string): The documentation content to be evaluated.
- **Output**: A JSON object containing a summary of the document and detailed feedback on potential issues.
