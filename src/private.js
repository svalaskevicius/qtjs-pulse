
var privateData = new WeakMap();

export function p(obj, data) {
    if (data !== undefined) {
        privateData.set(obj, data)
    }
    return privateData.get(obj)
}
