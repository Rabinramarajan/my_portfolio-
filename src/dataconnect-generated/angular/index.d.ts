import { CreateUserData, GetProjectsData, UpdateProjectData, UpdateProjectVariables, ListSkillsData } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateUserOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateUserData, FirebaseError, undefined>;
export function injectCreateUser(options?: CreateUserOptions, injector?: Injector): CreateDataConnectMutationResult<CreateUserData, undefined, >;

export type GetProjectsOptions = () => Omit<CreateDataConnectQueryOptions<GetProjectsData, undefined>, 'queryFn'>;
export function injectGetProjects(options?: GetProjectsOptions, injector?: Injector): CreateDataConnectQueryResult<GetProjectsData, undefined>;

type UpdateProjectOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateProjectData, FirebaseError, UpdateProjectVariables>;
export function injectUpdateProject(options?: UpdateProjectOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateProjectData, UpdateProjectVariables, UpdateProjectVariables>;

export type ListSkillsOptions = () => Omit<CreateDataConnectQueryOptions<ListSkillsData, undefined>, 'queryFn'>;
export function injectListSkills(options?: ListSkillsOptions, injector?: Injector): CreateDataConnectQueryResult<ListSkillsData, undefined>;
