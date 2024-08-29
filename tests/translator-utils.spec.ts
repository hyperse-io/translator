import { resolveNamespace, resolvePath } from '../src/utils.js';

describe('Translator utils should correct', () => {
  it('Should correct handle resolve namespace', () => {
    expect(resolveNamespace('a.b.c', 'a')).toBe('b.c');
    expect(resolveNamespace('a.b.c', 'a.b.c')).toBeUndefined();
  });

  it('Should correct handle resolve path', () => {
    expect(resolvePath({ name: 'name' }, 'name')).toBe('name');
    expect(resolvePath({ name: { age: '1' } }, 'name.age')).toBe('1');
    expect(() =>
      resolvePath({ name: { age: '1' } }, 'name.age.c', 'ns')
    ).toThrowError(/Could not resolve `name.age.c` in `ns`/);
    expect(() =>
      resolvePath({ name: { age: '1' } }, 'name.ages', 'ns')
    ).toThrowError(/Could not resolve `name.ages` in `ns`/);
  });
});
