const TLD = "com|net|org|io|xyz|co|app|me|ly|info|biz|gg|ai|dev";
export const LINKY = new RegExp(
  "https?:\\/\\/|www\\.|\\b[a-z0-9-]+\\.(" + TLD + ")\\b",
  "i",
);
export const LINK_MSG =
  "Links are not allowed in comments. " +
  "Remove the link and try again.";
