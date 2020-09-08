import boto3
from datetime import datetime, timedelta
from random import randint
from boto3.dynamodb.conditions import Key

dynamoDb = boto3.client('dynamodb')

tableName = 'Transactions'

userIds = ['john@example.org', 'mary@example.org', 'todd@example.org']

categories = ['books', 'groceries', 'utilities', 'gadgets', 'online-services']


def table_exists(tableName):
    response = dynamoDb.list_tables()
    return tableName in response["TableNames"]


def create_table(tableName):
    dynamoDb.create_table(
        AttributeDefinitions=[
            {
                'AttributeName': 'UserId',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'Timestamp',
                'AttributeType': 'N'
            },
            {
                'AttributeName': 'Category',
                'AttributeType': 'S'
            },
        ],
        TableName=tableName,
        KeySchema=[
            {
                'AttributeName': 'UserId',
                'KeyType': 'HASH'
            },
            {
                'AttributeName': 'Timestamp',
                'KeyType': 'RANGE'
            },
        ],
        LocalSecondaryIndexes=[
            {
                'IndexName': 'Category',
                'KeySchema': [
                    {
                        'AttributeName': 'UserId',
                        'KeyType': 'HASH'

                    },
                    {
                        'AttributeName': 'Category',
                        'KeyType': 'RANGE'

                    }
                ],
                'Projection': {
                    'ProjectionType': 'ALL'
                }
            }
        ],
        BillingMode='PAY_PER_REQUEST'
    )

    print("Table {} created".format(tableName))


def insert_data(tableName):

    millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000

    for userId in userIds:
        for i in range(10):
            yesterday = datetime.now() - timedelta(days=7)

            # TS in milliseconds I think, Python docs are terrible
            # Generate Random timestamp within the last 7 days
            timestamp = int(yesterday.timestamp() * 1000) + \
                randint(0, millisecondsPerWeek)

            # Random category
            category = categories[randint(0, len(categories)-1)]

            # Random amount
            amount = randint(-100, -10)

            # Description
            description = "Random entry {}".format(i)

            print(userId, timestamp, category, amount)

            dynamoDb.put_item(
                Item={
                    'UserId': {
                        'S': userId,
                    },
                    'Timestamp': {
                        'N': str(timestamp),
                    },
                    'Category': {
                        'S': category,
                    },
                    'Amount': {
                        'N': str(amount)
                    },
                    'Description': {
                        'S': description
                    }
                },
                TableName=tableName,
            )


def map_tx(item):
    return {
        'UserId': item['UserId']['S'],
        'Amount': item['Amount']['N'],
        'Timestamp': item['Timestamp']['N'],
        'Description': item['Description']['S'],
        'Category': item['Category']['S'],
    }


def expenses_between(tableName, userId, start, end):
    tstart = int(start.timestamp() * 1000)
    tend = int(end.timestamp() * 1000)

    res = dynamoDb.query(
        TableName=tableName,
        KeyConditions={
            'UserId': {
                'AttributeValueList': [
                    {'S': userId}
                ],
                'ComparisonOperator': 'EQ'
            },
            'Timestamp': {
                'AttributeValueList': [
                    {'N': str(tstart)},
                    {'N': str(tend)}
                ],
                'ComparisonOperator': 'BETWEEN'
            }
        }
    )

    return [map_tx(item) for item in res['Items']]


if table_exists(tableName):
    print("Table exists")
else:
    print("Creating table")
    create_table(tableName)
    insert_data(tableName)

# Johns expenses the day before yesterday
start = datetime.now() - timedelta(days=2)
end = datetime.now() - timedelta(days=1)
print(expenses_between(tableName, 'john@example.org', start, end))
