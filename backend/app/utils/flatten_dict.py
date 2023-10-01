from collections.abc import MutableMapping
import json
from bson import ObjectId, Binary
from uuid import UUID
from datetime import datetime



# Convert UUIDs to bson.Binary
def convert_uuids(item):
    if isinstance(item, datetime):
        return item.isoformat()
    elif isinstance(item, UUID):
        return str(item)
    elif isinstance(item, dict):
        return {key: convert_uuids(value) for key, value in item.items()}
    elif isinstance(item, list):
        return [convert_uuids(element) for element in item]
    return item
        

def _flatten_dict_gen(d, parent_key, sep):
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, MutableMapping):
            yield from flatten_dict(v, new_key, sep=sep).items()
        else:
            yield new_key, v


def flatten_dict(d: MutableMapping, parent_key: str = '', sep: str = '_'):
    return dict(_flatten_dict_gen(d, parent_key, sep))