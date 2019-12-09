import json
import boto3
import logging
import re
import csv
import time
import os

#Testing build!
RE_SAMPLE_ID = re.compile(r'ClassifierReports\/(.*?)\/(.*)')

logger = logging.getLogger()
logger.setLevel(logging.INFO)
TABLE_NAME = os.environ['DynamoDBSampleTable']

def lambda_handler(event, context):
    logger.info(event)
    
    try:
        event_type = event["Records"][0]['eventName']
        file_key = event["Records"][0]['s3']['object']['key']
        bucket = event["Records"][0]['s3']['bucket']['name']
        sample_id, file_name = RE_SAMPLE_ID.findall(file_key)[0]
    except Exception as e:
        logger.error(e)
        return  {
            'statusCode': 500,
            'body': e
        }
    if 'ObjectCreated' in event_type:
        if 'sample_sheet.csv' in file_name.lower():
            parse_sample_file(sample_id, bucket, file_key)
        elif 'classifier_prediction' in file_name.lower() and file_name.lower().endswith('.tsv'):
            parse_classifier_prediction(sample_id, bucket, file_key)
        elif 'mgmt_prediction' in file_name.lower() and file_name.lower().endswith('.tsv'):
            parse_mgmt_prediction(sample_id, bucket, file_key)
        elif 'report' in file_name.lower() and 'run' in file_name.lower() and file_name.lower().endswith('.pdf'):
            updateTable(sample_id, {'report_file_name':file_name})
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('Skipping file: {}'.format(file_name))
            }
    else:
        if 'sample_sheet.csv' in file_name.lower():
            delete_sample_file(sample_id)
        elif 'classifier_prediction' in file_name.lower() and file_name.lower().endswith('.tsv'):
            delete_classifier_prediction(sample_id)
        elif 'mgmt_prediction' in file_name.lower() and file_name.lower().endswith('.tsv'):
            delete_mgmt_prediction(sample_id)
        elif re.search('ClassifierReports/' + sample_id + '/$', file_key):
            delete_row(sample_id)
        elif 'report' in file_name.lower() and 'run' in file_name.lower() and file_name.lower().endswith('.pdf'):
            delete_file_name(sample_id, file_name)
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('Skipping file: {}'.format(file_name))
            }
    return {
        'statusCode': 200,
        'body': json.dumps('Updated dynamodb table: {}'.format(TABLE_NAME))
    }

def updateTable(sample_id, data):
    data.update({'id':sample_id})
    data = {k: None if not v else v for k, v in data.items() }
    logger.info('#### INSERTING DATA IN TABLE: {}'.format(data))
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    responseItem = data
    #try:
        #logger.info({'id': sample_id})
        #response = table.get_item(Key={'id': sample_id})
        
        
        #if 'Item' in response:
        #    responseItem = response['Item']
        #    logger.info('###RESPONSE: '.format(responseItem))
        #    responseItem.update(data)
            
        #else:
        #    table.put_item(sample_id,Item=data)
        #    logger.info('####PUT ITEM####: {}')
    #except Exception as e:
        #TODO - catch expected error when item is in table
    #    logger.error("** {}".format(e))
    logger.info('#### DATA: {}'.format(responseItem))
    #table.update_item(sample_id,Item=data)
    #table.put_item(Item=data)
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    expression = 'set '
    counter = 0
    values = {}
    names = {}
    keyList = ['investigator','project','experiment','date','sample_name','sample_well','sample_plate','sample_group','pool_id','sentrix_id','sentrix_position','material_type','gender','surgical_case','diagnosis','age','notes','tumor_data']

    for key, value in data.items():
        if counter != 0 and key != 'id':
            expression += ', '
        if(key != 'id'):
            
            expression += '#' + alphabet[counter] + ' = :' + alphabet[counter] + ' '
            values [':' + alphabet[counter]] = value
            names ['#' + alphabet[counter]] = key
            counter += 1
            #values [':' + alphabet[counter]] = value
            
        
    logger.info('$$$$EXPRESSION: ' + expression)
    logger.info('$$$$VALUES: ' + json.dumps(values))
    logger.info('$$$$NAMES:' + json.dumps(names))
    table.update_item(Key={'id':sample_id}, UpdateExpression=expression, ExpressionAttributeValues = values, ExpressionAttributeNames = names)
    
#Only deletes column info - website will filter the rest out by itself
def delete_sample_file(sample_id):
    logger.info("#### DELETING sample data from item: " + sample_id)
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    keyList = ['investigator','project','experiment','date','sample_name','sample_well','sample_plate','sample_group','pool_id','sentrix_id','sentrix_position','material_type','gender','surgical_case','diagnosis','age','notes','tumor_data']
    attributes = {}
    expression = 'remove '
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    count = 0
    
    for key in keyList:
        if count != 0:
            expression += ','
        expression += '#' + alphabet[count]
        attributes['#' + alphabet[count]] = key
        count += 1
        
    
    #expression = 'remove investigator,project,experiment,date,sample_name,sample_well,sample_plate,sample_group,pool_id,sentrix_id,sentrix_position,material_type,gender,surgical_case,diagnosis,age,notes'
    table.update_item(Key = {'id':sample_id}, UpdateExpression = expression, ExpressionAttributeNames = attributes)
    #table.delete_item(Key={'id':sample_id})
    
def delete_classifier_prediction(sample_id):
    logger.info("#### DELETING classifier_prediction data from item: " + sample_id)
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    keyList = ['classifier_prediction']
    attributes = {}
    expression = 'remove '
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    count = 0
    
    for key in keyList:
        if count != 0:
            expression += ','
        expression += '#' + alphabet[count]
        attributes['#' + alphabet[count]] = key
        count += 1
        
    table.update_item(Key = {'id':sample_id}, UpdateExpression = expression, ExpressionAttributeNames = attributes)
    #table.delete_item(Key={'id':sample_id})
    
def delete_file_name(sample_id):
    logger.info("#### DELETING report file name data from item: " + sample_id)
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    keyList = ['report_file_name']
    attributes = {}
    expression = 'remove '
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    count = 0
    
    for key in keyList:
        if count != 0:
            expression += ','
        expression += '#' + alphabet[count]
        attributes['#' + alphabet[count]] = key
        count += 1
        
    table.update_item(Key = {'id':sample_id}, UpdateExpression = expression, ExpressionAttributeNames = attributes)
    #table.delete_item(Key={'id':sample_id})
    
    
#option 1 -> just delete entire item
def delete_mgmt_prediction(sample_id):
    logger.info("#### DELETING mgmt_prediction data from item: " + sample_id)
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    keyList = ['mgmt_prediction']
    attributes = {}
    expression = 'remove '
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    count = 0
    
    for key in keyList:
        if count != 0:
            expression += ','
        expression += '#' + alphabet[count]
        attributes['#' + alphabet[count]] = key
        count += 1
    table.update_item(Key = {'id':sample_id}, UpdateExpression = expression, ExpressionAttributeNames = attributes)
    #table.delete_item(Key={'id':sample_id})

def delete_row(sample_id):
    logger.info("#### DELETING sample data from item: " + sample_id)
    dbd = boto3.resource('dynamodb')
    table = dbd.Table(TABLE_NAME)
    table.delete_item(Key={'id':sample_id})

def parse_sample_file(sample_id, bucket, file_key):
    logger.info('##### PARSING SAMPLE FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    data = list(csv.reader(obj_body))

    sample_dict = { 'investigator': data[1][1], 'project': data[2][1],
        'experiment': str(int(float(data[3][1]))), 'date': data[4][1], 'sample_name' : data[8][0],
        'sample_well' : data[8][1], 'sample_plate' : data[8][2], 'sample_group' : data[8][3],
        'pool_id' : data[8][4], 'sentrix_id' : str(int(float(data[8][5]))), 'sentrix_position' : data[8][6],
        'material_type' : data[8][7], 'gender' : data[8][8], 'surgical_case' : data[8][9],
        'diagnosis' : data[8][10], 'age' : data[8][11], 'notes' : data[8][12], 'tumor_data': data[8][13] if len(data[8]) > 13 else ''
    }
    sample_dict = dict(map(lambda kv: (str(kv[0]), str(kv[1])), sample_dict.items()))
    updateTable(sample_id, sample_dict)


def parse_classifier_prediction(sample_id, bucket, file_key):
    logger.info('##### PARSING CLASSIFIER PREDICTION FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    data = list(csv.reader(obj_body, delimiter='"'))
    cur_data = {}
    for i, r in enumerate(data[1:]):
        # cur_data.update({i:{r[0]:r[1]}})
        cur_data.update({str(i):{str(r[0]).strip():str(r[1]).strip()}})
    data = {"classifier_prediction": cur_data}
    updateTable(sample_id, data)


def parse_mgmt_prediction(sample_id, bucket, file_key):
    logger.info('##### PARSING MGMT PREDICTION FILE {}'.format(file_key))
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=file_key)
    obj_body = obj["Body"].read().decode('utf-8').splitlines(True)
    logger.info(obj_body)
    data = list(csv.reader(obj_body, delimiter=' '))
    # data = {"mgmt_prediction": dict(zip(data[0], data[1]))}
    data = {"mgmt_prediction": dict(zip(map(str,data[0]), map(str,data[1])))}
    updateTable(sample_id, data)