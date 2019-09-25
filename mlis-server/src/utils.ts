import fetch from 'node-fetch';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import { Model } from 'sequelize/types';

export function requireValue<ValueType>(input: ValueType|null){
  if (input === null) {
    throw Error("value is required!");
  }
  return input;
}
export function assertTrue(b: boolean) {
  if (!b) {
    throw Error("Assertion failed");
  }
}
export function getGlobalId(x: Model & {id: number}) {
  return toGlobalId(x.constructor.name, x.id.toString());
}

export function getModelId(globalId: string, model: typeof Model) {
  const x = fromGlobalId(globalId);
  assertTrue(x.type === model.name);
  return parseInt(x.id);
}

export default class Helper {
  static async loadJson(url: string): Promise<any> {
      const res = await fetch(url);
      return res.json();
  }
};