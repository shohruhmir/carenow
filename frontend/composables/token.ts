export const useToken = () =>
  useState("token", () =>
    useCookie("auth_token", {
      maxAge: 99999999,
    })
  );
