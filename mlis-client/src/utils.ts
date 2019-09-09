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