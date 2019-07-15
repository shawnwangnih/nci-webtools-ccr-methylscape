import json
import boto3
import logging
import re
import csv

RE_SAMPLE_ID = re.compile(r'ClassifierReports\/(.*?)\/(.*)')
TABLE_NAME = 'MethylScape'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(event)
    try:
        file_key = event["Records"][0]['s3']['object']['key']
        bucket = event["Records"][0]['s3']['bucket']['name']
        sample_id, file_name = RE_SAMPLE_ID.findall(file_key)[0]
    except Exception as e:
        logger.error(e)
        return  {
            'statusCode': 500,
            'body': e
        }

    if 'sample_sheet.csv' in file_name.lower():
        parse_sample_file(sample_id, bucket, file_key)
    elif '_classifier_prediction_' in file_name.lower() and file_name.lower().endswith('.tsv'):
        parse_classifier_prediction(sample_id, bucket, file_key)
    elif '_mgmt_prediction_' in file_name.lower() and file_name.lower().endswith('.tsv'):
        parse_mgmt_prediction(sample_id, bucket, file_key)
    else:
        return {
            'statusCode': 200,
            'body': json.dumps('Hello from Lambda!')
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

def updateTable(sample_id, data):
    data.update({'id':sample_id})
    data = {k: None if not v else v for k, v in data.items() }
    logger.info('#### INSERTING DATA IN TABLE: {}'.format(data))
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    try:
        logger.info({'id': sample_id})
        response = table.get_item(Key={'id': sample_id})
        logger.info(response)
        if 'Item' in response:
            data.update(response['Item'])
    except Exception as e:
        #TODO - catch expected error when item is in table
        logger.error("** {}".format(e))
    logger.info('#### DATA: {}'.format(data))
    table.put_item(Item=data)

def parse_sample_file(sample_id, bucket, file_key):
    logger.info('##### PARSING SAMPLE FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    data = list(csv.reader(obj_body))
    sample_dict = {
        'investigator': data[1][1],
        'project': data[2][1],
        'experiment': data[3][1],
        'date': data[4][1],
        'sample_name' : data[8][0],
        'sample_well' : data[8][1],
        'sample_plate' : data[8][2],
        'sample_group' : data[8][3],
        'pool_id' : data[8][4],
        'sentrix_id' : data[8][5],
        'sentrix_position' : data[8][6],
        'material_type' : data[8][7],
        'gender' : data[8][8],
        'surgical_case' : data[8][9],
        'diagnosis' : data[8][10],
        'age' : data[8][11],
        'notes' : data[8][12],
    }
    updateTable(sample_id, sample_dict)


def parse_classifier_prediction(sample_id, bucket, file_key):
    logger.info('##### PARSING CLASSIFIER PREDICTION FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    data = list(csv.reader(obj_body, delimiter='"'))
    data = {"classifier_prediction": {i[0].strip():i[1].strip() for i in data[1:]}}
    updateTable(sample_id, data)

def parse_mgmt_prediction(sample_id, bucket, file_key):
    logger.info('##### PARSING MGMT PREDICTION FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    logger.info(obj_body)
    data = list(csv.reader(obj_body, delimiter=' '))
    data = {"mgmt_prediction": dict(zip(data[0], data[1]))}
    updateTable(sample_id, data)
