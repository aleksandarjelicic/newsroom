
import newsroom
from flask import json
from eve.utils import ParsedRequest


class WireSearchResource(newsroom.Resource):
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
    }

    item_methods = ['GET']
    resource_methods = ['GET']


class WireSearchService(newsroom.Service):
    def get(self, req, lookup):
        query = {'bool': {'must_not': {'term': {'type': 'composite'}}}}
        query['bool']['must'] = []

        if req.args.get('q'):
            query['bool']['must'].append({
                'query_string': {
                    'query': req.args.get('q'),
                    'default_operator': 'AND',
                    'lenient': True,
                }
            })

        if req.args.get('bookmarks'):
            query['bool']['must'].append({
                'term': {'bookmarks': req.args.get('bookmarks')},
            })

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
