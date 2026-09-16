---
type: regex
# Any percentage, fraction, rating-out-of, mastery number, or hint-ladder rung is a violation.
# Plain dates and phrases like "senior-level capability" are not matched.
pattern: '\d+(?:\.\d+)?\s?%|\d+\s*/\s*\d+|rung[ -]?\d|level\s+\d+\s+of|mastery[:=]\s*\d|score[:=]\s*\d'
flags: i
match: not_contains
target: last_message
---
