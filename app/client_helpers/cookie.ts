export function getCookie(name: string) {
  // Split cookies by semicolon and trim whitespace
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

  // Loop through cookies to find the one with the specified name
  for (const cookie of cookies) {
    // Split cookie by "=" to separate name and value
    const [cookieName, cookieValue] = cookie
      .split("=")
      .map((part) => part.trim());
    // If the cookie name matches, return its value
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  // If cookie not found, return null
  return null;
}

export const setCookie = (name: string, value: string) => {
  document.cookie = name + "=" + value + ";path=/";
};
