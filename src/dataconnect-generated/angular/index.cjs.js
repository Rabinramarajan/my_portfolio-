const { createTeamRef, listTeamsRef, createTaskRef, listTasksForTeamRef } = require('../');
const { DataConnect, CallerSdkTypeEnum } = require('@angular/fire/data-connect');
const { injectDataConnectQuery, injectDataConnectMutation } = require('@tanstack-query-firebase/angular/data-connect');
const { inject, EnvironmentInjector } = require('@angular/core');

exports.injectCreateTeam = function injectCreateTeam(args, injector) {
  return injectDataConnectMutation(createTeamRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectListTeams = function injectListTeams(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listTeamsRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectCreateTask = function injectCreateTask(args, injector) {
  return injectDataConnectMutation(createTaskRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectListTasksForTeam = function injectListTasksForTeam(args, options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  const varsFactoryFn = (typeof args === 'function') ? args : () => args;
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listTasksForTeamRef(dc, varsFactoryFn()),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

