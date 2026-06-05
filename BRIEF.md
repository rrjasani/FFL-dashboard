# My Dashboard - Project Brief

## Summary
FastForward Logistics is a mid-size freight and supply chain company. Their ops team is drowning in spreadsheets. The VP of Operations wants a single internal dashboard she can pull up in leadership meetings to see how the business is running: shipment volume, on-time delivery rates, regional performance, and open exceptions. With no in-house dev team, they came to you. Your job is to scope it, plan it, and build a working prototype. The specifics of what goes on the dashboard are yours to define.

## Design

### Layout

- The title of the dashboard should be at the top left aligned.
- A date picker should be on the same line as the title but right aligned.
- A region picker next to the date picker should be on the same line as the title but right aligned.
- A row of 4 metric cards depicting the values for the 4 metrics that are being measured for the current date's month
    - Cards should show a small up/down arrow and color indicating change from previous month, the title of the metric and the value.
- Below the cards include a row of 2 charts, side-by-side
	- Left: Bar chart showing shipment volume
	- Right: Line chart showing shipment volume over time and on-time delivery rates
- The date picker should default to showing ALL months, but should have options for each month with the ability to select multiple at once.
    - It should default to the current date's month
    - When a specific month is selected, all cards and charts should filter to that month. When "All" is selected, show the full year.
- The region picker should default to showing ALL regions, but should have options for each region with the ability to select multiple at once.
    - It should default to the region that includes Texas
    - When a specific region is selected, all cards and charts should filter to that month. When "All" is selected, show all regions.
    - Group the states of the USA into 4 distinct regions.

### Interactions
- Date picker in the top bar filters EVERYTHING to a specific month or set of months
- When "All" is selected, summary cards show yearly values for everything

### Visual Design
- Make most of the colors in light mode
- Use a blue and gray color pallette with bright orange, yellow accent colors
- Mobile responsive - cards stack on small screens
- Typography should be clean and a san-serif font like Open Sans or something similar.

## Data
- Create a fake dataset as a JSON file (src/data/metrics.json) for the data by month and region.

## Reverse-Engineered Visual Requirements (From Reference Screenshot)
- Use a light neutral app background (soft gray) with white content cards and subtle 1px borders.
- Prioritize a dense, information-forward layout with compact vertical rhythm and minimal decorative chrome.
- Use strong headline typography for the page title and section headers, with medium-to-small body text elsewhere.
- Style section headings with numbered badge markers to create clear visual hierarchy across analysis blocks.
- Keep the top filter controls compact: short input heights, tight chip spacing, and aligned in a single right-side group.
- Use uppercase micro-labels for KPI card subtitles and large, bold numerals for metric values.
- Use muted grayscale text for labels/metadata and reserve saturated accent colors for trends and chart series only.
- Apply consistent spacing tokens: ~8-12px inner control spacing, ~12-16px card gaps, and ~24-32px section spacing.
- Keep chart containers visually quiet: very light panel background, low-contrast borders, and minimal axis/grid noise.
- Maintain responsive behavior by stacking filters and cards on narrow widths while preserving compact density.