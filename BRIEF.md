# My Dashboard - Project Brief

## Summary
FastForward Logistics is a mid-size freight and supply chain company. Their ops team is drowning in spreadsheets. The VP of Operations wants a single internal dashboard she can pull up in leadership meetings to see how the business is running: shipment volume, on-time delivery rates, regional performance, and open exceptions. With no in-house dev team, they came to you. Your job is to scope it, plan it, and build a working prototype. The specifics of what goes on the dashboard are yours to define.

## Design

### Layout

- The title of the dashboard should be at the top left aligned.
- A date picker should be on the same line as the title but right aligned.
- A row of 4 metric cards depicting the values for the 4 metrics that are being measured for the current date's month
    - Cards should show a small up/down arrow and color indicating change from previous month, the title of the metric and the value.
- Below the cards include a row of 2 charts, side-by-side
	- Left: Bar chart showing shipment volume
	- Right: Line chart showing shipment volume over time and on-time delivery rates
- The date picker should default to showing ALL months, but should have options for each month with the ability to select multiple at once.
    - It should default to the current date's month
    - When a specific month is selected, all cards and charts should filter to that month. When "All" is selected, show the full year.

### Interactions
- Date picker in the top bar filters EVERYTHING to a specific month or set of months
- When "All" is selected, summary cards show yearly values for everything

### Visual Design
- Make most of the colors in light mode
- Use a blue and gray color pallette with bright orange, yellow accent colors
- Mobile responsive - cards stack on small screens
- Typography should be clean and a san-serif font like Open Sans or something similar.