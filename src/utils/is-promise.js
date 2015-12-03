export default function isPromise (obj) {
  return obj && typeof obj.then === 'function'
}
