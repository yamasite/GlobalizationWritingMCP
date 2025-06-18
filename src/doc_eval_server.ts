#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

class DocEvaluationServer {
  // Mock implementation of the document evaluation logic
  public async evaluateDocument(document: string): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
    try {
      // 1. Summarize the document
      const summary = `This is a summary of the document: ${document.substring(0, 50)}...`;

      const sentences = document.split(/[.!?]/).filter(s => s.trim().length > 0);
      const feedback: any[] = [];

      for (const sentence of sentences) {
        // 2. Evaluate original sentence
        // Mock call to an external service to get issues
        const originalIssues = await this.getCommonIssues(sentence);
        if (originalIssues.length > 0) {
          feedback.push({ sentence, language: 'Chinese', issues: originalIssues });
        }

        // 3. Translate and evaluate
        // Mock translation
        const translatedSentence = `[EN] ${sentence}`;
        const translatedIssues = await this.getCommonIssues(translatedSentence);
        if (translatedIssues.length > 0) {
          feedback.push({ sentence: translatedSentence, language: 'English', issues: translatedIssues });
        }
      }

      // 4. Summarize feedback
      const report = {
        summary,
        feedback,
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(report, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  // Mock function to simulate fetching common issues
  private async getCommonIssues(sentence: string): Promise<string[]> {
    const issues: string[] = [];
    if (sentence.includes("ambiguous")) {
        issues.push("Potential ambiguity detected.");
    }
    if (sentence.length > 100) {
        issues.push("Sentence may be too long.");
    }
    return issues;
  }
}

const DOC_EVALUATION_TOOL: Tool = {
  name: "evaluate_document",
  description: `Describes how to evaluate given documentation.

General Guideline:
The original version of technical documentation is in Chinese. The Chinese documentation contains adequate and correct information for readers to understand and the information stays correct and unambiguous when translated to other languages, such as English, Japanese, Korean, or Bahasa Indonesia.

LLM Thinking Pattern:
Given a document for globalization review, the LLM should:
1. Read the whole documentation and summarize it. Save documentation summarization for future use.
2. Read the documentation sentence by sentence. For each sentence:
   - Evaluate whether the sentence has common issues. Common issues can be acquired from the Excel MCP Server. Save the issue name and description for future use.
   - Translate the sentence to English and evaluate whether the translated sentence has common issues. Save the issue name and description for future use.
3. Summarize all feedback and report.`,
  inputSchema: {
    type: "object",
    properties: {
      document: {
        type: "string",
        description: "The documentation content to be evaluated."
      },
    },
    required: ["document"]
  }
};

const server = new Server(
  {
    name: "doc-evaluation-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const docEvalServer = new DocEvaluationServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [DOC_EVALUATION_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "evaluate_document") {
    const args = request.params.arguments as { document: string };
    return docEvalServer.evaluateDocument(args.document);
  }

  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Doc Evaluation MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
