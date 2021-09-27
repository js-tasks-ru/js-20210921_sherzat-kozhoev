/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const newArray = arr.slice();

  newArray.sort((a, b) => {
    const charA = a[0];
    const charB = b[0];
    const result = charA.localeCompare(charB);

    if (charA.toLowerCase() === charB.toLowerCase()) {
      return result === 1 ? -1 : result;
    }

    return result;
  });

  return param === 'desc' ? newArray.reverse() : newArray;
}
