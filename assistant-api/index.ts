import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { matchFunction } from "./fetchers";
import { sleep } from "./helpers";

// Initialize an express app
const app = express();

// Set-up CORS to allow requests from the client
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY,
});

// Route Handlers
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/assistants", async (req, res) => {
  const assistants = await openai.beta.assistants.list();
  res.send(assistants);
});

app.post("/assistants/create-travel", async (req, res) => {
  const assistant = await openai.beta.assistants.create({
    name: "Travel planner",
    instructions:
      "You are a helpful travel assistant. Use the provided functions to assist in planning a fun and memorable getaway.",
    model: "gpt-3.5-turbo-1106",
    tools: [
      {
        type: "function",
        function: {
          name: "fetchEvents",
          description:
            "Gets a list of upcoming concerts, sports games, theatrical productions, and other events near a given location.",
          parameters: {
            type: "object",
            properties: {
              lat: {
                type: "number",
                description:
                  "The latitude of the desired search location, e.g. Boston would be 42.3601",
              },
              lon: {
                type: "number",
                description:
                  "The longitude of the desired search location, e.g. Boston would be -71.0589",
              },
              startDate: {
                type: "string",
                description:
                  "The UTC start date events should appear after expressed as year-month-day, e.g. 2012-06-12",
              },
              endDate: {
                type: "string",
                description:
                  "The UTC end date events should appear before expressed as year-month-day, e.g. 2012-01-23",
              },
            },
            required: ["lat", "lon", "startDate", "endDate"],
          },
        },
      },
    ],
  });

  res.status(201).json({
    id: assistant.id,
  });
});

app.post("/assistant/message", async (req, res) => {
  const threadId = req.body.threadId;
  const assistantId = req.body.assistantId;
  const message = req.body.message;

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const newRun = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  let run = await openai.beta.threads.runs.retrieve(threadId, newRun.id);
  const terminalStates = ["completed", "failed", "cancelled", "expired"];
  while (!terminalStates.includes(run.status)) {
    if (run.status === "requires_action") {
      const actionFunction =
        run.required_action?.submit_tool_outputs.tool_calls[0].function;
      let result;

      if (actionFunction) {
        const matchedFunction = matchFunction(actionFunction.name as string);
        if (matchedFunction) {
          const args = JSON.parse(actionFunction.arguments);
          console.log(
            `Calling ${actionFunction.name} with args ${JSON.stringify(args)}`
          );
          result = await matchedFunction(args);
        }
      }

      if (result) {
        console.log(
          `Submitting results ${console.log(JSON.stringify(result))}`
        );
        openai.beta.threads.runs.submitToolOutputs(threadId, newRun.id, {
          tool_outputs: [
            {
              tool_call_id:
                run.required_action?.submit_tool_outputs.tool_calls[0].id,
              output: JSON.stringify(result),
            },
          ],
        });
      }
    }

    await sleep(10000);
    run = await openai.beta.threads.runs.retrieve(threadId, newRun.id);
  }

  const messages = await openai.beta.threads.messages.list(threadId);

  res.status(201).json({
    message: messages.data[0],
  });
});

app.post("/thread/create", async (req, res) => {
  const thread = await openai.beta.threads.create();

  res.send(thread);
});

// Start listening on the configured port
const PORT = Bun.env.EXPRESS_PORT;
app.listen(PORT, () => {
  console.log(`Assistant API is listening on port ${PORT}`);
});
