import { describe, expect, it } from 'vitest';

import { PROJECTS, SITE_URL } from '../config/portfolio.content';
import { homeSchema, personSchema, projectSchema } from './structured-data';

describe('structured data', () => {
  it('describes the owner as a Person with an absolute url', () => {
    const schema = personSchema() as Record<string, unknown>;
    expect(schema['@type']).toBe('Person');
    expect(schema['url']).toBe(SITE_URL);
  });

  it('bundles Person, WebSite and ProfessionalService on the home page', () => {
    const graph = (homeSchema() as { '@graph': { '@type': string }[] })['@graph'];
    expect(graph.map((node) => node['@type'])).toEqual([
      'Person',
      'WebSite',
      'ProfessionalService',
    ]);
  });

  it('points a project schema at its own canonical url', () => {
    const project = PROJECTS[0]!;
    const schema = projectSchema(project) as Record<string, string>;
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema['url']).toBe(`${SITE_URL}/work/${project.slug}`);
    expect(schema['image'].startsWith('http')).toBe(true);
  });
});
