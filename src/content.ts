// All site copy lives here so it can be edited without touching components.

import { html, type TemplateResult } from 'lit';

export interface Role {
  title: string;
  team: string;
  /** ISO month, e.g. "2011-08" */
  start: string;
  /** ISO month, or null for the current role */
  end: string | null;
  summary: string | TemplateResult;
}

export const profile = {
  name: 'Matthew Furtado',
  tagline: 'Engineering Manager',
  email: 'mptado@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mattfurtado',
  github: 'https://github.com/mattfurtado',
  resume: 'https://drive.google.com/file/d/1OmBrUgWJYUMB0TxxmBlq57r5sEfOTaqd/view?usp=sharing',
};

export const about = {
  lede: `I started out studying interactive design, wandered into code, and
    have spent the last fifteen years leading teams and building tools that
    help other people build things.`,
  body: html`I'm an engineering manager at
    <a href="https://www.hubspot.com" target="_blank" rel="noopener noreferrer"
      >HubSpot<span class="visually-hidden"> (opens in a new tab)</span></a
    >, where I grew from a designer &amp; software engineer as the company
    went from startup to public. Today I lead a team building AI tools for developers.`,
  personal: `Outside of work, I live in Reading, MA, where I am a proud father &
    baseball coach of twin boys, lover of live music, and a craft beer
    enthusiast.`,
};

export const contact = `Questions, ideas, or just want to talk baseball or
  craft beer? Drop me a line.`;

export const roles: Role[] = [
  {
    title: 'Front End Engineer',
    team: 'Marketing',
    start: '2011-08',
    end: '2014-10',
    summary: `Built Marketing Grader and Marketing Library, HubSpot's free
      public tools for lead generation and brand awareness.`,
  },
  {
    title: 'Technical Lead',
    team: 'Design Management',
    start: '2014-10',
    end: '2016-09',
    summary: `Set direction for Design Manager, the CMS's developer tooling,
      through migrations from jQuery to Backbone to React. Built custom
      modules so developers could extend the CMS with their own components.`,
  },
  {
    title: 'Senior Software Engineer',
    team: 'Marketplace & Design Management',
    start: '2016-09',
    end: '2020-01',
    summary: `Built the frontend for the App Marketplace launch at INBOUND
      2019, and led cross-team work on Themes, a central place to manage a
      site's colors, fonts, and style.`,
  },
  {
    title: 'Technical Lead',
    team: 'Marketplace',
    start: '2020-01',
    end: '2022-04',
    summary: `Moved the Solutions Directory onto the marketplace platform for
      INBOUND 2020, then replatformed and relaunched the Template Marketplace
      alongside CMS Starter.`,
  },
  {
    title: 'Engineering Lead',
    team: 'Marketplace',
    start: '2022-04',
    end: '2026-07',
    summary: html`Led the team that delivered the
      <a href="https://ecosystem.hubspot.com/marketplace" target="_blank" rel="noopener noreferrer"
        >Unified Marketplace<span class="visually-hidden"> (opens in a new tab)</span></a
      >, one platform for 8,000+ listings, and the Embedded Marketplace across
      the product.`,
  },
  {
    title: 'Engineering Manager',
    team: 'Builder Experience',
    start: '2026-07',
    end: null,
    summary: html`Leading a full-stack team building an AI agent for creating
      UI extensions on the
      <a href="https://developers.hubspot.com/" target="_blank" rel="noopener noreferrer"
        >HubSpot developer platform<span class="visually-hidden"> (opens in a new tab)</span></a
      >
      using natural language.`,
  },
];
