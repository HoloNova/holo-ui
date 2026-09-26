"""Constraint-safe lexical retrieval using SQLite's standard BM25 implementation."""

import re
import sqlite3
import unicodedata

STOP_WORDS = frozenset(('a', 'an', 'the', 'i', 'me', 'my', 'please', 'need', 'want',
                        'give', 'show', 'for', 'to', 'of', 'in', 'on', 'with', 'and', 'or', 'is'))
# Identifier, name, alias and purpose column weights (SQLite bm25: lower is better).
BM25_WEIGHTS = (6.0, 4.0, 4.0, 1.0)
MAX_QUERY_LENGTH = 2000


def normalize(text):
    return unicodedata.normalize('NFKC', text).casefold().strip()


def terms(text):
    chunks = re.findall(r'[a-z0-9]+|[\u3400-\u9fff]+', normalize(text))
    return tuple(dict.fromkeys(token for chunk in chunks for token in (
        [chunk] if chunk.isascii() or len(chunk) == 1 else
        [chunk[i:i + 2] for i in range(len(chunk) - 1)]) if token not in STOP_WORDS))


def phrase_matches(phrase, query):
    phrase = normalize(phrase)
    if not phrase:
        return False
    if re.search(r'[\u3400-\u9fff]', phrase):
        return phrase in query
    return re.search(r'(?<![a-z0-9])' + re.escape(phrase) + r'(?![a-z0-9])', query) is not None


class Retrieval:
    def __init__(self, catalog):
        self.catalog = catalog
        self.db = sqlite3.connect(':memory:')
        try:
            self.db.execute('CREATE VIRTUAL TABLE documents USING fts5(identifier, name, aliases, purpose)')
        except sqlite3.OperationalError as error:
            self.db.close()
            raise RuntimeError('This Python installation requires SQLite FTS5 support') from error
        self.row_ids = tuple(catalog.components)
        self.db.executemany('INSERT INTO documents VALUES (?, ?, ?, ?)', [
            tuple(' '.join(terms(text)) for text in (
                cid, comp['name'], ' '.join(comp.get('aliases', []) + comp.get('route_aliases', [])),
                comp['when'])) for cid, comp in catalog.components.items()])

    def close(self):
        self.db.close()

    def hints(self, query):
        matches = [(style, phrase) for patterns, style in self.catalog.keywords.items()
                   for phrase in patterns.split('|') if phrase_matches(phrase, query)]
        longest = max((len(phrase) for _, phrase in matches), default=0)
        return tuple(sorted((style, phrase) for style, phrase in matches if len(phrase) == longest))

    def _lexical_scores(self, query):
        tokens = terms(query)
        if not tokens:
            return {}
        expression = ' OR '.join('"' + token.replace('"', '""') + '"' for token in tokens)
        rows = self.db.execute(
            'SELECT rowid, bm25(documents, ?, ?, ?, ?) FROM documents WHERE documents MATCH ?',
            (*BM25_WEIGHTS, expression))
        return {self.row_ids[rowid - 1]: score for rowid, score in rows}

    def search(self, query, filters, component_id=None, limit=1):
        eligible = {cid for cid, comp in self.catalog.components.items() if self.catalog.matches(comp, filters)}
        if component_id is not None:
            cid = self.catalog.ids.get(normalize(component_id))
            return [(cid, 0.0, ('canonical_id',))] if cid in eligible else []
        normalized = normalize(query)
        if not normalized and not filters:
            return []
        target_cid = self.catalog.ids.get(normalized)
        if target_cid is not None:
            reasons = tuple(['exact_id_or_alias'] + ['filter:' + k + '=' + v for k, v in sorted(filters.items())])
            return [(target_cid, 0.0, reasons)] if target_cid in eligible else []
        exact = {cid for cid, comp in self.catalog.components.items() if normalized and normalized in
                 {normalize(a) for a in [cid] + comp.get('route_aliases', []) + comp.get('aliases', [])}}
        hints = self.hints(normalized)
        hinted_styles = {style for style, _ in hints}
        scores = self._lexical_scores(normalized)
        candidates = eligible & (set(scores) | exact | {
            cid for cid in eligible if self.catalog.components[cid]['style'] in hinted_styles})
        if not normalized:
            candidates = eligible
        ordered = sorted(candidates, key=lambda cid: (
            cid not in exact, self.catalog.components[cid]['style'] not in hinted_styles,
            scores.get(cid, 0.0), cid))
        return [(cid, -scores.get(cid, 0.0), self._reasons(cid, exact, hints, scores, filters))
                for cid in ordered[:limit]]

    def _reasons(self, cid, exact, hints, scores, filters):
        return tuple(
            (['exact_id_or_alias'] if cid in exact else []) +
            ['keyword:' + phrase for style, phrase in hints if self.catalog.components[cid]['style'] == style] +
            (['bm25'] if cid in scores else []) +
            ['filter:' + key + '=' + value for key, value in sorted(filters.items())])
