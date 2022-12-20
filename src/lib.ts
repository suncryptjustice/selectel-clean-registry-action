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
  createdAtLessThen,
  minAmmountToStay,
}: ActionInterface) {
  try {
    info(`
    Clean Selectel Registry Action
    `);

    if (!createdAtLessThen && !minAmmountToStay) {
      info("Provide at lest one filter\n");
      info("Action was skipped");
      return;
    }

    if (createdAtLessThen && !Date.parse(createdAtLessThen)) {
      throw new Error("Wrong date format");
    }

    if (minAmmountToStay && !parseInt(minAmmountToStay)) {
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

    info(
      `Locate ${images.length} images\n\n- - - - - - - - - - - -\n${images.map(
        (im, i) =>
          `digest: ${im.digest}\nsize: ${im.size}\n` +
          (i === images.length - 1 ? "\n" : "- - - - - - - - - - - -\n")
      )}`
    );

    const imagesForDelete = images
      .slice(
        0,
        !minAmmountToStay || images.length <= parseInt(minAmmountToStay)
          ? 0
          : images.length - parseInt(minAmmountToStay)
      )
      .filter((img) => {
        if (!createdAtLessThen) return img;
        if (Date.parse(img.createdAt) < Date.parse(createdAtLessThen)) {
          return true;
        } else {
          return true;
        }
      });

    info(`${imagesForDelete.length} images match criteria. Deleting...`);

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
