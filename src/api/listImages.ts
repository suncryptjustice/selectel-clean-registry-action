import fetch from "cross-fetch";

type listImagesArgs = {
  token: string;
  registryId: string;
  repositoryName: string;
};

type listImagesResponse = Array<{
  createdAt: string;
  digest: string;
  layers: Array<{
    digest: string;
    size: number;
  }>;

  size: number;
  tags: string[];
}>;

const listRepositoryImages = async ({
  token,
  registryId,
  repositoryName,
}: listImagesArgs) => {
  return new Promise<listImagesResponse>(async (resolve, reject) => {
    try {
      const res = await fetch(
        `https://cr.selcloud.ru/api/v1/registries/${registryId}/repositories/${repositoryName}/images`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
          },
        }
      );

      if (!res.ok)
        throw new Error(
          "Unable to fetch list of images from selectel registry"
        );
      const data: listImagesResponse = await res.json();

      resolve(
        data.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      );
    } catch (error) {
      reject(error);
    }
  });
};

export default listRepositoryImages;
