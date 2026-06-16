# ReuseFirst Slovenija

ReuseFirst Slovenija is a geospatial decision-support web application for identifying, ranking and comparing urban locations that are suitable for reuse before expanding to greenfield land.

The project was developed as a prototype for a spatial-data hackathon focused on smarter land use, brownfield activation and sustainable urban development in Slovenia.

## What the app does

ReuseFirst helps users explore potential reuse locations and understand why a specific location may be suitable for redevelopment.

Main features:

- interactive map of candidate reuse locations
- Reuse Score for ranking locations
- filters by municipality, district and intended use
- support for different reuse programs:
  - housing
  - public services
  - small business
  - local infrastructure
- location detail view with key spatial indicators
- comparison of multiple locations
- map layers for settlements, public transport, flood risk, brownfield potential, GJI and opportunity heatmap
- confidence score showing how reliable the recommendation is based on available data
- explainable recommendations with positive reasons and warnings

## Purpose

Many Slovenian municipalities face pressure for new development on greenfield land while existing urban areas, brownfields and underused spaces remain available. ReuseFirst supports a “reuse first” approach by helping users find locations that may already have better access to infrastructure, public transport and urban services.

The application is not a final legal or investment decision tool. It is intended as an early-stage screening and decision-support prototype.

## Tech stack

This project is structured as a monorepo.

- Frontend: React, TypeScript, Vite, TanStack Router
- Map: Leaflet
- UI: Tailwind CSS, Radix UI components
- Data logic: TypeScript scoring model
- Backend: Node.js API scaffold
- Shared package: common types and validation contracts

## Workspace structure

```text
apps/
  web/      Frontend application
  api/      Backend API scaffold

packages/
  shared/   Shared TypeScript types and contracts

```
## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
