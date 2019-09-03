export function requireValue<ValueType>(input: ValueType|null|undefined){
  if (input == null) {
    throw Error("value is required!");
  }
  return input;
}