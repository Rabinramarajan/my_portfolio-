import { CreateTeamData, CreateTeamVariables, ListTeamsData, CreateTaskData, CreateTaskVariables, ListTasksForTeamData, ListTasksForTeamVariables } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateTeamOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateTeamData, FirebaseError, CreateTeamVariables>;
export function injectCreateTeam(options?: CreateTeamOptions, injector?: Injector): CreateDataConnectMutationResult<CreateTeamData, CreateTeamVariables, CreateTeamVariables>;

export type ListTeamsOptions = () => Omit<CreateDataConnectQueryOptions<ListTeamsData, undefined>, 'queryFn'>;
export function injectListTeams(options?: ListTeamsOptions, injector?: Injector): CreateDataConnectQueryResult<ListTeamsData, undefined>;

type CreateTaskOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateTaskData, FirebaseError, CreateTaskVariables>;
export function injectCreateTask(options?: CreateTaskOptions, injector?: Injector): CreateDataConnectMutationResult<CreateTaskData, CreateTaskVariables, CreateTaskVariables>;

type ListTasksForTeamArgs = ListTasksForTeamVariables | (() => ListTasksForTeamVariables);
export type ListTasksForTeamOptions = () => Omit<CreateDataConnectQueryOptions<ListTasksForTeamData, ListTasksForTeamVariables>, 'queryFn'>;
export function injectListTasksForTeam(args: ListTasksForTeamArgs, options?: ListTasksForTeamOptions, injector?: Injector): CreateDataConnectQueryResult<ListTasksForTeamData, ListTasksForTeamVariables>;
