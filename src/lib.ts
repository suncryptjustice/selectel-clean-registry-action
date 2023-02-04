import { info, setFailed } from "@actions/core";
import selectelApi from "./api";
import retry from "async-retry";
import { ActionInterface } from "./constants";

export default async function run({
  userName,
  password,
  projectName,
  selectelId,
  registryId,
  repositoryName,
  minAmmountToStay,
}: ActionInterface) {
  try {
    info(`
    Clean Selectel Registry Action
    `);

    const howManyToStay = parseInt(minAmmountToStay);

    if (
      Number.isNaN(howManyToStay) ||
      (!Number.isNaN(howManyToStay) && howManyToStay < 0)
    ) {
      throw new Error("Wrong minAmmountToStay format");
    }

    info("Try to get X-Auth-Token for futher requests...");
    const token = await retry(
      () =>
        selectelApi.getToken({
          userName,
          password,
          projectName,
          selectelId,
        }),
      { retries: 3 }
    );

    info("Grab list of images for targeted repository");

    const images = await selectelApi.listRepositoryImages({
      token,
      registryId,
      repositoryName,
    });

    if (!images) {
      info("Unable to find repository. Go to next step...");
      return;
    }

    info(
      `Locate ${images.length} images\n\n- - - - - - - - - - - -\n${images.map(
        (im, i) => {
          return (
            `Digest: ${im.digest}\nsize: ${im.size}\ncreatedAt: ${new Date(
              im.createdAt
            ).toLocaleDateString("ru-RU")}\n` +
            (i === images.length - 1 ? "\n" : "- - - - - - - - - - - -\n")
          );
        }
      )}`
    );

    if (images.length <= howManyToStay) {
      info("Repository don't need to be cleaned");
      return;
    } else {
      info("Start cleaning...");
    }

    const imagesForDelete = images.slice(0, images.length - howManyToStay);

    info(`Will delete ${imagesForDelete.length} images from repository`);

    let mbCleaned =
      imagesForDelete.reduce((p, c) => {
        return c.size + p;
      }, 0) /
      1024 /
      1024;

    imagesForDelete.forEach(async (image) => {
      retry(
        () =>
          selectelApi.deleteImageFromRegistry({
            token,
            registryId,
            repositoryName,
            digest: image.digest,
          }),
        {
          retries: 2,
          minTimeout: 200,
          maxTimeout: 500,
          onRetry: (e, attempt) => {
            info(`Error occur on delete image: digest -  ${image.digest}\n`);
            info(`message: ${e.message}\n`);
            info(`${attempt} attemt for delete\n`);
          },
        }
      );
    });

    info(`Operation is finised\n`);
    info(`${mbCleaned} MB was cleaned!`);
  } catch (error) {
    setFailed(
      error instanceof Error
        ? error.message
        : typeof error == "string"
        ? error
        : JSON.stringify(error)
    );
  }
}
