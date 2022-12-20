import { getInput } from "@actions/core";

export interface ActionInterface {
  userName: string;
  password: string;
  projectName: string;
  selectelId: string;
  registryId: string;
  repositoryName: string;
  createdAtLessThen?: string | null;
  minAmmountToStay?: string | null;
}

export const action = {
  userName: getInput("userName"),
  password: getInput("password"),
  projectName: getInput("projectName"),
  selectelId: getInput("selectelId"),
  registryId: getInput("registryId"),
  repositoryName: getInput("repositoryName"),
  createdAtLessThen: getInput("createdAtLessThen")
    ? getInput("createdAtLessThen")
    : null,
  minAmmountToStay: getInput("minAmmountToStay")
    ? getInput("minAmmountToStay")
    : null,
};
