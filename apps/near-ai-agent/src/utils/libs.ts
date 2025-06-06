export function isValidJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object';
  } catch (e) {
    return false;
  }
}

export const parseEventJson = (log: string) => {
  if (!log?.startsWith('EVENT_JSON:')) return log;

  const jsonString = log.replace('EVENT_JSON:', '').trim();

  if (typeof jsonString !== 'string') {
    throw new Error('jsonString is not a valid string');
  }

  if (!isValidJson(jsonString)) {
    const fixedJsonString = jsonString.replace(/\\"/g, '"');

    if (isValidJson(fixedJsonString)) {
      return JSON.parse(fixedJsonString);
    } else {
      return null;
    }
  }

  return JSON.parse(jsonString);
};
