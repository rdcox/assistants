import { ASSISTANTS_API_URL } from "../constants";

/**
 * Gets a list of Assistants from the API
 * @returns An array of Assistants
 */
export const getAssistants = async () => {
  const response = await fetch(`${ASSISTANTS_API_URL}/assistants`);
  const data = await (await response.json()).data;
  return data as Assistant[];
};

/**
 * Posts a message to the Assistant API and returns its response.
 * @param message Message to post to the Assistant API
 * @returns Assistant API response
 */
export const postMessage = async (
  assistant: Assistant,
  threadId: string,
  message: string
) => {
  const response = await fetch(`${ASSISTANTS_API_URL}/assistant/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assistantId: assistant.id,
      threadId: threadId,
      message: message,
    }),
  });

  const body = await response.json();
  return body.message.content[0].text.value;
};

/**
 * Creates a new Thread
 * @returns Thread object
 */
export const createThread = async () => {
  const response = await fetch(`${ASSISTANTS_API_URL}/thread/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return await response.json();
};

export const createTravelDemo = async () => {
  const response = await fetch(
    `${ASSISTANTS_API_URL}/assistants/create-travel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  return await response.json();
};
