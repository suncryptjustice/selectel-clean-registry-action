import fetch from "cross-fetch";

type DeleteImageArgs = {
  token: string;
  registryId: string;
  repositoryName: string;
  digest: string;
};

const deleteImageFromRegistry = ({
  token,
  registryId,
  repositoryName,
  digest,
}: DeleteImageArgs) => {
  return new Promise<void>(async (resolve, reject) => {
    const res = await fetch(
      `https://cr.selcloud.ru/api/v1/registries/${registryId}/repositories/${repositoryName}/${digest}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
      }
    );
    if (res.status === 409) {
      await res.text();
      resolve();
    } else if (!res.ok) {
      throw new Error("Unable to fetch list of images from selectel registry");
    }

    resolve();
  });
};

export default deleteImageFromRegistry;
