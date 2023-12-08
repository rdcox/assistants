import { useEffect, useState } from "react";
import { getAssistants } from "../api/assistants";

export const useAssistants = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  useEffect(() => {
    const fetchFromApi = async () => {
      const assistantResponse = await getAssistants();
      setAssistants(assistantResponse);
    };

    fetchFromApi();
  }, []);

  return assistants;
};
