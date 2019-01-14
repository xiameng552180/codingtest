import json
import os
import csv
import pandas as pd

from app import app
from flask import Flask, request

debug = False


@app.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/list')
def _list():
    datalist = [name for name in os.listdir("app/data")]

    if ".DS_Store" in datalist:
        datalist.remove(".DS_Store")

    return json.dumps(datalist)


@app.route('/data/<dataname>')
def _data(dataname):
    # data preprocessing
    fpath = 'app/data/' + dataname + '/graph.json'
    data = json.load(open(fpath, 'r'))
    return json.dumps(data)

@app.route('/data/level1')
def _codesdata():
	df = pd.read_csv('./app/data/level1/temperature_daily.csv')
	return df.to_csv()

@app.route('/data/level3')
def _graphdata():
    data = json.load(open('app/data/level3/HKUST_coauthor_graph.json', 'r'))
    return json.dumps(data)