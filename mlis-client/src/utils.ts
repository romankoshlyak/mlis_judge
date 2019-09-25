export function compareToNumber(a: any, b: any) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
}
export function requireValue<ValueType>(input: ValueType|null|undefined){
  if (input == null) {
    throw Error("value is required!");
  }
  return input;
}
export function assertTrue(b: boolean) {
  if (!b) {
    throw Error("Assertion failed");
  }
}
interface IdOwnwer {
  id:string;
}
interface Viewer {
  user: IdOwnwer;
}
interface Class {
  mentor: IdOwnwer;
  viewerIsApplied: boolean;
  viewerIsEleminated: boolean;
}
export function viewerIsClassMentor(viewer: Viewer, clazz: Class) {
  return viewer.user.id === clazz.mentor.id;
}
export function viewerCanAccessClass(viewer: Viewer, clazz: Class) {
  return viewerIsClassMentor(viewer, clazz) || (clazz.viewerIsApplied && !clazz.viewerIsEleminated);
}