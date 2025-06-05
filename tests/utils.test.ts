import { describe, it, expect } from 'vitest';
import { parseFrontMatter, buildFrontMatter } from '../src/lib/utils';

describe('parseFrontMatter', () => {
	it('parses YAML front matter when present', () => {
		const input = `---\ntitle: "Post"\ntags: [foo, bar]\n---\nBody text`;
		const result = parseFrontMatter(input);
		expect(result).not.toBeNull();
		expect(result?.meta).toEqual({ title: 'Post', tags: ['foo', 'bar'] });
		expect(result?.body).toBe('Body text');
	});

	it('returns null when no front matter found', () => {
		const input = 'Just body';
		expect(parseFrontMatter(input)).toBeNull();
	});
});

describe('buildFrontMatter', () => {
	it('creates a YAML block with trailing newline', () => {
		const yaml = buildFrontMatter({
			title: 'A',
			author: 'B',
			date: '2024-01-01',
			tags: ['x', 'y']
		});
		const expected = `---\ntitle: "A"\nauthor: "B"\ndate: "2024-01-01"\ntags: ["x", "y"]\n---\n`;
		expect(yaml).toBe(expected);
	});
});
