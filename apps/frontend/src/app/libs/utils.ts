export const truncateUsername = (username: string, maxLength = 20): string => {
  if (!username) return "";
  if (username.length <= maxLength) return username;
  return `${username.slice(0, maxLength)}...`;
};
