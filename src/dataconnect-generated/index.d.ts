import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateTaskData {
  task_insert: Task_Key;
}

export interface CreateTaskVariables {
  teamId: UUIDString;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: TimestampString | null;
}

export interface CreateTeamData {
  team_insert: Team_Key;
}

export interface CreateTeamVariables {
  name: string;
  description: string;
}

export interface ListTasksForTeamData {
  tasks: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    priority: string;
    status: string;
    dueDate?: TimestampString | null;
    createdAt: TimestampString;
  } & Task_Key)[];
}

export interface ListTasksForTeamVariables {
  teamId: UUIDString;
}

export interface ListTeamsData {
  teams: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Team_Key)[];
}

export interface Membership_Key {
  userId: UUIDString;
  teamId: UUIDString;
  __typename?: 'Membership_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface Team_Key {
  id: UUIDString;
  __typename?: 'Team_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateTeamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
  operationName: string;
}
export const createTeamRef: CreateTeamRef;

export function createTeam(vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;
export function createTeam(dc: DataConnect, vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface ListTeamsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTeamsData, undefined>;
  operationName: string;
}
export const listTeamsRef: ListTeamsRef;

export function listTeams(): QueryPromise<ListTeamsData, undefined>;
export function listTeams(dc: DataConnect): QueryPromise<ListTeamsData, undefined>;

interface CreateTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  operationName: string;
}
export const createTaskRef: CreateTaskRef;

export function createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;
export function createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface ListTasksForTeamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForTeamVariables): QueryRef<ListTasksForTeamData, ListTasksForTeamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTasksForTeamVariables): QueryRef<ListTasksForTeamData, ListTasksForTeamVariables>;
  operationName: string;
}
export const listTasksForTeamRef: ListTasksForTeamRef;

export function listTasksForTeam(vars: ListTasksForTeamVariables): QueryPromise<ListTasksForTeamData, ListTasksForTeamVariables>;
export function listTasksForTeam(dc: DataConnect, vars: ListTasksForTeamVariables): QueryPromise<ListTasksForTeamData, ListTasksForTeamVariables>;

