import { DynamoDBClient, ScanCommand, DeleteTableCommand, CreateTableCommand, CreateTableCommandInput, ListTablesCommand, ScanCommandInput, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DeleteCommand, GetCommand, DynamoDBDocumentClient, QueryCommandInput, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

export const put = async (tableName: string,
  item: object,
  replaceWhenExist: boolean = false) => {

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client)

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
    ConditionExpression: replaceWhenExist ? '' : 'attribute_not_exists(id)'
  })

  let response
  try {
    response = await docClient.send(command)
  } catch (err) {
    console.error('error putting item:', item)
    console.error(err)
    return err
  }

  return response;
}

//todo: might want to remove this
export const count = async (tableName: string) => {
  const client = new DynamoDBClient({});

  const command = new ScanCommand({
    TableName: tableName,
    Select: 'COUNT'
  })

  const response = await client.send(command);

  return response;
}

export const scan = async (params: ScanCommandInput) => {
  const client = new DynamoDBClient({});

  const command = new ScanCommand(params)

  const response = await client.send(command);

  return response;
}

export const queryIndex = async (params: QueryCommandInput) => {
  const client = new DynamoDBClient({});

  const command = new QueryCommand(params)

  const response = await client.send(command);

  return response;
}


export const query = async (params: QueryCommandInput) => {
  const client = new DynamoDBClient({});

  const command = new QueryCommand(params)

  const response = await client.send(command);

  return response;
}

export const get = async (tableName: string,
  itemId: string,
  itemName: string | null = null) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const Key = {
    id: itemId,
    full_name: itemName
  }

  const command = new GetCommand({
    TableName: tableName,
    Key,
  });

  var response = await docClient.send(command);

  return response;
}

export const update = async (params: UpdateCommandInput) => {
  const client = new DynamoDBClient({});

  const command = new UpdateItemCommand(params)

  const response = await client.send(command);

  return response;
}

export const remove = async (tableName: string, itemId: string) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      id: itemId,
    },
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
}

export const findTable = async (tableNameToFind: string): Promise<boolean> => {
  try {
    // List tables
    const listTablesCommand = new ListTablesCommand({});
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const data = await docClient.send(listTablesCommand);

    const tables: string[] = data.TableNames || [];
    console.log("List of tables:", tables);

    // Check if the specific table exists
    if (tables.includes(tableNameToFind)) {
      return true
    }

    return false
  } catch (err) {
    console.error("Error listing tables:", err);
  }
}

export const deleteAndRecreateTable = async (tableName: string) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: tableName
  };

  try {
    // Delete the table if exist
    if (await findTable(tableName)) {
      const command = new DeleteTableCommand(params);
      await docClient.send(command);
      console.log('Table deleted.');

      // Wait a few seconds to ensure the table is deleted
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Recreate the table (use the same table structure as before)
    const createParams: CreateTableCommandInput = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    const createCommand = new CreateTableCommand(createParams)
    await docClient.send(createCommand);
    console.log("Table recreated.");
  } catch (err) {
    console.error("Error deleting/recreating table:", err);
  }
}