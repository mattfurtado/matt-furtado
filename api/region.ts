import { OPT_IN_REGIONS } from '../shared/consent-regions.ts';

/** Tells the page whether this visitor's country needs opt-in cookie consent. */
export function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  return Response.json(
    {
      country,
      // Unknown location: ask for consent to be safe.
      consentRequired: country ? OPT_IN_REGIONS.includes(country) : true,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
