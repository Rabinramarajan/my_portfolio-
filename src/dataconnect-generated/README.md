# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `Angular README`, you can find it at [`dataconnect-generated/angular/README.md`](./angular/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTeams*](#listteams)
  - [*ListTasksForTeam*](#listtasksforteam)
- [**Mutations**](#mutations)
  - [*CreateTeam*](#createteam)
  - [*CreateTask*](#createtask)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTeams
You can execute the `ListTeams` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTeams(): QueryPromise<ListTeamsData, undefined>;

interface ListTeamsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamsData, undefined>;
}
export const listTeamsRef: ListTeamsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTeams(dc: DataConnect): QueryPromise<ListTeamsData, undefined>;

interface ListTeamsRef {
  ...
  (dc: DataConnect): QueryRef<ListTeamsData, undefined>;
}
export const listTeamsRef: ListTeamsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTeamsRef:
```typescript
const name = listTeamsRef.operationName;
console.log(name);
```

### Variables
The `ListTeams` query has no variables.
### Return Type
Recall that executing the `ListTeams` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTeamsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTeamsData {
  teams: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Team_Key)[];
}
```
### Using `ListTeams`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTeams } from '@dataconnect/generated';


// Call the `listTeams()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTeams();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTeams(dataConnect);

console.log(data.teams);

// Or, you can use the `Promise` API.
listTeams().then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

### Using `ListTeams`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTeamsRef } from '@dataconnect/generated';


// Call the `listTeamsRef()` function to get a reference to the query.
const ref = listTeamsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTeamsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.teams);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

## ListTasksForTeam
You can execute the `ListTasksForTeam` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTasksForTeam(vars: ListTasksForTeamVariables): QueryPromise<ListTasksForTeamData, ListTasksForTeamVariables>;

interface ListTasksForTeamRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForTeamVariables): QueryRef<ListTasksForTeamData, ListTasksForTeamVariables>;
}
export const listTasksForTeamRef: ListTasksForTeamRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTasksForTeam(dc: DataConnect, vars: ListTasksForTeamVariables): QueryPromise<ListTasksForTeamData, ListTasksForTeamVariables>;

interface ListTasksForTeamRef {
  ...
  (dc: DataConnect, vars: ListTasksForTeamVariables): QueryRef<ListTasksForTeamData, ListTasksForTeamVariables>;
}
export const listTasksForTeamRef: ListTasksForTeamRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTasksForTeamRef:
```typescript
const name = listTasksForTeamRef.operationName;
console.log(name);
```

### Variables
The `ListTasksForTeam` query requires an argument of type `ListTasksForTeamVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTasksForTeamVariables {
  teamId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTasksForTeam` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTasksForTeamData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListTasksForTeam`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTasksForTeam, ListTasksForTeamVariables } from '@dataconnect/generated';

// The `ListTasksForTeam` query requires an argument of type `ListTasksForTeamVariables`:
const listTasksForTeamVars: ListTasksForTeamVariables = {
  teamId: ..., 
};

// Call the `listTasksForTeam()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTasksForTeam(listTasksForTeamVars);
// Variables can be defined inline as well.
const { data } = await listTasksForTeam({ teamId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTasksForTeam(dataConnect, listTasksForTeamVars);

console.log(data.tasks);

// Or, you can use the `Promise` API.
listTasksForTeam(listTasksForTeamVars).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `ListTasksForTeam`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTasksForTeamRef, ListTasksForTeamVariables } from '@dataconnect/generated';

// The `ListTasksForTeam` query requires an argument of type `ListTasksForTeamVariables`:
const listTasksForTeamVars: ListTasksForTeamVariables = {
  teamId: ..., 
};

// Call the `listTasksForTeamRef()` function to get a reference to the query.
const ref = listTasksForTeamRef(listTasksForTeamVars);
// Variables can be defined inline as well.
const ref = listTasksForTeamRef({ teamId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTasksForTeamRef(dataConnect, listTasksForTeamVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateTeam
You can execute the `CreateTeam` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTeam(vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface CreateTeamRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
}
export const createTeamRef: CreateTeamRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTeam(dc: DataConnect, vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface CreateTeamRef {
  ...
  (dc: DataConnect, vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
}
export const createTeamRef: CreateTeamRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTeamRef:
```typescript
const name = createTeamRef.operationName;
console.log(name);
```

### Variables
The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTeamVariables {
  name: string;
  description: string;
}
```
### Return Type
Recall that executing the `CreateTeam` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTeamData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTeamData {
  team_insert: Team_Key;
}
```
### Using `CreateTeam`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTeam, CreateTeamVariables } from '@dataconnect/generated';

// The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`:
const createTeamVars: CreateTeamVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createTeam()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTeam(createTeamVars);
// Variables can be defined inline as well.
const { data } = await createTeam({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTeam(dataConnect, createTeamVars);

console.log(data.team_insert);

// Or, you can use the `Promise` API.
createTeam(createTeamVars).then((response) => {
  const data = response.data;
  console.log(data.team_insert);
});
```

### Using `CreateTeam`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTeamRef, CreateTeamVariables } from '@dataconnect/generated';

// The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`:
const createTeamVars: CreateTeamVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createTeamRef()` function to get a reference to the mutation.
const ref = createTeamRef(createTeamVars);
// Variables can be defined inline as well.
const ref = createTeamRef({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTeamRef(dataConnect, createTeamVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.team_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.team_insert);
});
```

## CreateTask
You can execute the `CreateTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface CreateTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
}
export const createTaskRef: CreateTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface CreateTaskRef {
  ...
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
}
export const createTaskRef: CreateTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTaskRef:
```typescript
const name = createTaskRef.operationName;
console.log(name);
```

### Variables
The `CreateTask` mutation requires an argument of type `CreateTaskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTaskVariables {
  teamId: UUIDString;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: TimestampString | null;
}
```
### Return Type
Recall that executing the `CreateTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTaskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTaskData {
  task_insert: Task_Key;
}
```
### Using `CreateTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTask, CreateTaskVariables } from '@dataconnect/generated';

// The `CreateTask` mutation requires an argument of type `CreateTaskVariables`:
const createTaskVars: CreateTaskVariables = {
  teamId: ..., 
  title: ..., 
  description: ..., 
  priority: ..., 
  status: ..., 
  dueDate: ..., // optional
};

// Call the `createTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTask(createTaskVars);
// Variables can be defined inline as well.
const { data } = await createTask({ teamId: ..., title: ..., description: ..., priority: ..., status: ..., dueDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTask(dataConnect, createTaskVars);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
createTask(createTaskVars).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

### Using `CreateTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTaskRef, CreateTaskVariables } from '@dataconnect/generated';

// The `CreateTask` mutation requires an argument of type `CreateTaskVariables`:
const createTaskVars: CreateTaskVariables = {
  teamId: ..., 
  title: ..., 
  description: ..., 
  priority: ..., 
  status: ..., 
  dueDate: ..., // optional
};

// Call the `createTaskRef()` function to get a reference to the mutation.
const ref = createTaskRef(createTaskVars);
// Variables can be defined inline as well.
const ref = createTaskRef({ teamId: ..., title: ..., description: ..., priority: ..., status: ..., dueDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTaskRef(dataConnect, createTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

