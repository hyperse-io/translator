import { resolveNamespace, resolvePath } from '../src/utils.js';

describe('Translator utils should correct', () => {
  it('Should correct handle resolve namespace', () => {
    expect(resolveNamespace('a.b.c', 'a')).toBe('b.c');
    expect(resolveNamespace('a.b.c', 'a.b.c')).toBeUndefined();
  });

  it('Should correct handle resolve path', () => {
    expect(resolvePath('en', { name: 'name' }, 'name')).toBe('name');
    expect(resolvePath('en', { name: { age: '1' } }, 'name.age')).toBe('1');
    expect(() =>
      resolvePath('en', { name: { age: '1' } }, 'name.age.c', 'ns')
    ).toThrowError(
      /Could not resolve `ns.name.age.c` in messages for locale `en`./
    );
    expect(() =>
      resolvePath('en', { name: { age: '1' } }, 'name.ages', 'ns')
    ).toThrowError(
      /Could not resolve `ns.name.ages` in messages for locale `en`./
    );
  });
});
