import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'myportfolio',
  location: 'us-east4'
};

export const createTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeam', inputVars);
}
createTeamRef.operationName = 'CreateTeam';

export function createTeam(dcOrVars, vars) {
  return executeMutation(createTeamRef(dcOrVars, vars));
}

export const listTeamsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTeams');
}
listTeamsRef.operationName = 'ListTeams';

export function listTeams(dc) {
  return executeQuery(listTeamsRef(dc));
}

export const createTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTask', inputVars);
}
createTaskRef.operationName = 'CreateTask';

export function createTask(dcOrVars, vars) {
  return executeMutation(createTaskRef(dcOrVars, vars));
}

export const listTasksForTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForTeam', inputVars);
}
listTasksForTeamRef.operationName = 'ListTasksForTeam';

export function listTasksForTeam(dcOrVars, vars) {
  return executeQuery(listTasksForTeamRef(dcOrVars, vars));
}

