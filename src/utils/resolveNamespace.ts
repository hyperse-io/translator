export function resolveNamespace(namespace: string, namespacePrefix: string) {
  return namespace === namespacePrefix
    ? undefined
    : namespace.slice((namespacePrefix + '.').length);
}
