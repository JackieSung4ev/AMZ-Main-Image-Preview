# Competitor Category Gallery

Put long-term competitor main-image libraries in this folder.

Recommended structure:

```text
public/competitors/
  categories.json
  mylar-bag/
    01.jpg
    02.jpg
    03.jpg
  coffee-bag/
    01.jpg
    02.jpg
```

Add each category to `categories.json`:

```json
{
  "id": "mylar-bag",
  "name": "Mylar Bag",
  "keyword": "mylar bag",
  "path": "competitors/mylar-bag",
  "files": ["01.jpg", "02.jpg", "03.jpg"]
}
```

Use 30-40 square or near-square product main images per category for the most realistic preview.
