# Context Cards

**Category**: Cards  
**Source**: https://www.beautifului.dev/#context-cards  
**Tags**: context, card, information, preview, attachment, file, url

## Description
Context Cards display file or URL attachments that have been added as context for the AI. Each compact card shows a favicon or file-type icon, the source title, and a truncated URL or path snippet in a horizontal pill layout. A remove button lets users dismiss individual sources, and multiple cards flow naturally in a horizontal scroll or wrapping row.

## Dependencies
- `shared/base.css` — for CSS variables + animations
- Tailwind CSS v4

## Key Features
- Favicon / file-type icon alongside title and URL snippet
- Compact horizontal pill layout (minimal vertical footprint)
- Multiple source cards displayed in a scrollable or wrapping row
- Remove (×) button to dismiss individual context attachments
- Truncated URL/path rendering with `truncate` for long strings

## Customization
- **Icon source**: for URLs use a favicon loader (`https://www.google.com/s2/favicons?domain=...`); for files use a file-type SVG icon mapped by extension.
- **Max width**: constrain individual card width with `max-w-[200px]` to keep the row tidy when many sources are attached.
- **Dismiss animation**: add a `scale-0 opacity-0` transition on the card when the remove button is clicked for a smooth exit:
  ```js
  card.classList.add('opacity-0', 'scale-95', 'transition-all');
  setTimeout(() => card.remove(), 200);
  ```

## Use Cases
- Showing attached files/URLs in an AI chat context panel
- Displaying retrieved sources in a RAG (retrieval-augmented generation) interface
- Reference list for documents included in a code review or analysis session
