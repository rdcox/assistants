async function fetchEvents({ lat, lon }: { lat: string; lon: string }) {
  const eventsUrl = `https://api.seatgeek.com/2/events?lat=${lat}&lon=${lon}&client_id=${Bun.env["SEATGEEK_CLIENTID"]}`;
  console.log(`Requesting: ${eventsUrl}`);

  try {
    const response = await fetch(eventsUrl, {
      method: "GET",
    });
    return await response.json();
  } catch (e: any) {
    throw e;
  }
}

export const matchFunction = (name: string) => {
  switch (name) {
    case fetchEvents.name:
      return fetchEvents;
    default:
      break;
  }
};
