const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('fragments database methods', () => {
  test('deleteFragment() deletes both metadata and data', async () => {
    await writeFragment({ ownerId: 'a', id: 'b', type: 'text/plain' });
    await writeFragmentData('a', 'b', { value: 123 });
    await deleteFragment('a', 'b');
    const metadata = await readFragment('a', 'b');
    const data = await readFragmentData('a', 'b');
    expect(metadata).toBe(undefined);
    expect(data).toBe(undefined);
  });

  test('deleteFragment() throws when fragment does not exists', () => {
    expect(async () => await deleteFragment('a', 'b')).rejects.toThrow();
  });

  describe("fragment's metadata methods", () => {
    test('readFragment() returns what we put into db using writeFragment()', async () => {
      const metadata = {
        ownerId: 'a',
        id: 'b',
        type: 'text/plain',
      };
      await writeFragment(metadata);
      const result = await readFragment('a', 'b');
      expect(result).toEqual(metadata);
    });

    test('writeFragment() throws when given invalid metadata', () => {
      expect(async () => await writeFragment()).rejects.toThrow();
      expect(async () => await writeFragment({ ownerId: 1 })).rejects.toThrow();
      expect(async () => await writeFragment({ ownerId: 1, id: 1 })).rejects.toThrow();
      expect(async () => await writeFragment({ id: 'b', type: 'text/plain' })).rejects.toThrow();
    });

    test('readFragment() with incorrect id returns nothing', async () => {
      await writeFragment({ ownerId: 'a', id: 'b', type: 'text/plain' });
      const result = await readFragment('a', 'c');
      expect(result).toBe(undefined);
    });

    test('readFragment() expects string keys', () => {
      expect(async () => await readFragment()).rejects.toThrow();
      expect(async () => await readFragment(1)).rejects.toThrow();
      expect(async () => await readFragment(1, 1)).rejects.toThrow();
    });

    test('listFragments() returns fragment objects', async () => {
      await writeFragment({ ownerId: 'd', id: 'a', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'b', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'c', type: 'text/plain' });

      const results = await listFragments('d', true);
      expect(Array.isArray(results)).toBe(true);
      results.forEach((fragment) => expect(fragment.ownerId).toEqual('d'));
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'a' }),
          expect.objectContaining({ id: 'b' }),
          expect.objectContaining({ id: 'c' }),
        ])
      );
      results.forEach((fragment) => expect(fragment.type).toEqual('text/plain'));
    });

    test('listFragments() returns ids only', async () => {
      await writeFragment({ ownerId: 'd', id: 'a', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'b', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'c', type: 'text/plain' });

      const results = await listFragments('d');
      expect(Array.isArray(results)).toBe(true);
      expect(results).toContain('a');
      expect(results).toContain('b');
      expect(results).toContain('c');
    });

    test('listFragments() returns empty array', async () => {
      await writeFragment({ ownerId: 'd', id: 'a', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'b', type: 'text/plain' });
      await writeFragment({ ownerId: 'd', id: 'c', type: 'text/plain' });

      const results = await listFragments('e');
      expect(Array.isArray(results)).toBe(true);
      expect(results).toEqual([]);
    });
  });

  describe("fragment's data methods", () => {
    test('readFragmentData() returns what we put into db using writeFragmentData()', async () => {
      const data = Buffer.from([1, 2, 3]);
      await writeFragmentData('a', 'b', data);
      const result = await readFragmentData('a', 'b');
      expect(result).toEqual(data);
    });

    test('writeFragmentData() throws when given invalid data', () => {
      expect(async () => await writeFragmentData()).rejects.toThrow();
      expect(async () => await writeFragmentData(1)).rejects.toThrow();
      expect(async () => await writeFragmentData(1, 1)).rejects.toThrow();
    });

    test('readFragmentData() with incorrect id returns nothing', async () => {
      await writeFragmentData('a', 'b', Buffer.from([1, 2, 3]));
      const result = await readFragment('a', 'c');
      expect(result).toBe(undefined);
    });

    test('readFragmentData() expects string keys', () => {
      expect(async () => await readFragmentData()).rejects.toThrow();
      expect(async () => await readFragmentData(1)).rejects.toThrow();
      expect(async () => await readFragmentData(1, 1)).rejects.toThrow();
    });
  });
});
