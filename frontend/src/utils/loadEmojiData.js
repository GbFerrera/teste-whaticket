let emojiDataPromise = null;

const EMOJI_DATA_URL = "https://cdn.jsdelivr.net/npm/@emoji-mart/data";

export const loadEmojiData = () => {
  if (!emojiDataPromise) {
    emojiDataPromise = fetch(EMOJI_DATA_URL).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load emoji data");
      }
      return response.json();
    });
  }
  return emojiDataPromise;
};

export default loadEmojiData;
