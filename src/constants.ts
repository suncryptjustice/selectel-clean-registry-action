import { getInput } from "@actions/core";

export interface ActionInterface {
  userName: string;
  password: string;
  projectName: string;
  selectelId: string;
  registryId: string;
  repositoryName: string;
  minAmmountToStay: string;
}

export const action = {
  userName: getInput("userName"),
  password: getInput("password"),
  projectName: getInput("projectName"),
  selectelId: getInput("selectelId"),
  registryId: getInput("registryId"),
  repositoryName: getInput("repositoryName"),
  minAmmountToStay: getInput("minAmmountToStay"),
};
