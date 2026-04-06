export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getLocalData = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage - helpers.js:10`, e);
    return defaultValue;
  }
};

export const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage - helpers.js:20`, e);
    if (e.name === 'QuotaExceededError') {
      alert("Local storage quota exceeded! Please delete some old chats or materials.");
    }
    return false;
  }
};