import json
import sys
from app import extract
from flask import Flask, request

app = Flask(__name__)
with app.test_request_context('/api/extract', json={'url': 'https://wetu.com/ItineraryOutputs/Discovery/8b54b589-04ad-4f50-8bdc-c11f24c56d65?m=c'}):
    res = extract()
    print(res[0].get_data(as_text=True))
