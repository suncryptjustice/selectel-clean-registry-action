import fetch from "cross-fetch";

type GetTokenArgs = {
  userName: string;
  selectelId: string;
  password: string;
  projectName: string;
};

type GetTokenResponse = string;

const getToken = ({
  userName,
  selectelId,
  password,
  projectName,
}: GetTokenArgs) => {
  return new Promise<GetTokenResponse>(async (resolve, reject) => {
    try {
      const res = await fetch("https://api.selvpc.ru/identity/v3/auth/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth: {
            identity: {
              methods: ["password"],
              password: {
                user: {
                  name: userName,
                  domain: { name: selectelId },
                  password: password,
                },
              },
            },
            scope: {
              project: {
                name: projectName,
                domain: { name: selectelId },
              },
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Unable to obtain token");

      const token = res.headers.get("x-subject-token");

      if (!token) throw new Error("Unable to obtain token");
      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

export default getToken;
