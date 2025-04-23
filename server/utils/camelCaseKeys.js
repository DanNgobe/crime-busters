// utils/camelCaseKeys.ts
const toCamel = (str) =>
  str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

export const camelCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelCaseKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[toCamel(key)] = camelCaseKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};
