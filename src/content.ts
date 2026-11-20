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
  name: 'Matt Furtado',
  tagline: 'Design-minded engineering leader',
  email: 'mptado@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mattfurtado',
  github: 'https://github.com/mattfurtado',
  repo: 'https://github.com/mattfurtado/matt-furtado',
  resume: 'https://drive.google.com/file/d/1OmBrUgWJYUMB0TxxmBlq57r5sEfOTaqd/view?usp=sharing',
};

export const about = {
  lede: `I started out studying interactive design, wandered into code, and
    have spent the last fifteen years leading teams and building tools that
    help other people build things.`,
  body: html`I'm an Engineering Manager at
    <a href="https://www.hubspot.com" target="_blank" rel="noopener noreferrer"
      >HubSpot<span class="visually-hidden"> (opens in a new tab)</span></a
    >, where I grew from a designer &amp; software engineer as the company
    went from startup to public. Today I lead a team building AI tools for developers.`,
  personal: `Outside of work, I live in Reading, MA, where I'm a proud father &
    baseball coach of twin boys, lover of live music, amateur skier & golfer,
    and a craft beer enthusiast.`,
};

export const contact = `Questions, ideas, or just want to talk sports or
  craft beer? Drop me a line.`;

export const roles: Role[] = [
  {
    title: 'Front End Engineer',
    team: 'Marketing',
    start: '2011-08',
    end: '2014-10',
    summary: `Created Marketing Grader and Marketing Library, free public tools for lead generation and brand awareness.`,
  },
  {
    title: 'Technical Lead',
    team: 'Design Management',
    start: '2014-10',
    end: '2016-09',
    summary: `Set the technical direction for the CMS developer tooling as it moved through three frontend frameworks, and created custom modules that let developers add their own components.`,
  },
  {
    title: 'Senior Software Engineer',
    team: 'Marketplace & Design Management',
    start: '2016-09',
    end: '2020-01',
    summary: `Built the frontend for the App Marketplace launch at INBOUND 2019, and drove cross-team work on Themes, a central place to manage site styling.`,
  },
  {
    title: 'Technical Lead',
    team: 'Marketplace',
    start: '2020-01',
    end: '2022-04',
    summary: `Brought the Solutions Directory onto the marketplace platform for INBOUND 2020, then replatformed and relaunched the Template Marketplace alongside CMS Starter.`,
  },
  {
    title: 'Engineering Lead',
    team: 'Marketplace',
    start: '2022-04',
    end: '2026-07',
    summary: html`Headed the team that shipped the <a href="https://ecosystem.hubspot.com/marketplace" target="_blank" rel="noopener noreferrer">Unified Marketplace</a>, which covers 8,000+ listings, and the Embedded Marketplace across the product.`,
  },
  {
    title: 'Engineering Lead',
    team: 'Breeze Builder',
    start: '2026-07',
    end: '2026-10',
    summary: html`Steered a full-stack team building an AI agent that creates UI extensions on the <a href="https://developers.hubspot.com/" target="_blank" rel="noopener noreferrer">HubSpot developer platform</a> from natural-language prompts, turning a prompt into working UI.`,
  },
  {
    title: 'Engineering Manager',
    team: 'Connectors Experience',
    start: '2026-11',
    end: null,
    summary: `Manages a full-stack team building MCP tools and apps for Claude, ChatGPT, and other AI hosts, bringing HubSpot into the places people already work with AI.`,
  },
];
