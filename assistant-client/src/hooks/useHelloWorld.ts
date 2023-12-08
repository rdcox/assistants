import { useEffect, useState } from "react";
import { ASSISTANTS_API_URL } from "../constants";

/**
 * A hook to test connection to the express server is working.
 * @returns "Hello World!" response
 */
export const useHelloWorld = () => {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const fetchFromApi = async () => {
      const response = await fetch(ASSISTANTS_API_URL);
      const helloWorld = await response.text();
      setMessage(helloWorld);
    };

    fetchFromApi();
  }, []);

  return message;
};
