import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data';

const client = new RDSDataClient({});

function ensureConfig() {
  const { AURORA_CLUSTER_ARN, AURORA_SECRET_ARN, AURORA_DATABASE_NAME } = process.env;

  if (!AURORA_CLUSTER_ARN || !AURORA_SECRET_ARN || !AURORA_DATABASE_NAME) {
    throw new Error('Aurora Data API environment variables are not fully configured');
  }

  return {
    resourceArn: AURORA_CLUSTER_ARN,
    secretArn: AURORA_SECRET_ARN,
    database: AURORA_DATABASE_NAME,
  };
}

function toField(value) {
  if (value === null) {
    return { isNull: true };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { longValue: value } : { doubleValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  throw new TypeError(`Unsupported SQL parameter type: ${typeof value}`);
}

function fromField(field, columnName, typeName) {
  if (!field) {
    return null;
  }

  if (field.isNull) {
    return null;
  }

  if ('stringValue' in field) {
    if (typeof typeName === 'string' && typeName.toLowerCase().includes('json')) {
      try {
        return JSON.parse(field.stringValue);
      } catch {
        return field.stringValue;
      }
    }

    return field.stringValue;
  }

  if ('longValue' in field) {
    return field.longValue;
  }

  if ('doubleValue' in field) {
    return field.doubleValue;
  }

  if ('booleanValue' in field) {
    return field.booleanValue;
  }

  if ('blobValue' in field) {
    return Buffer.from(field.blobValue).toString('base64');
  }

  if ('arrayValue' in field) {
    if (field.arrayValue.stringValues) {
      return field.arrayValue.stringValues;
    }

    if (field.arrayValue.longValues) {
      return field.arrayValue.longValues;
    }

    if (field.arrayValue.doubleValues) {
      return field.arrayValue.doubleValues;
    }

    if (field.arrayValue.booleanValues) {
      return field.arrayValue.booleanValues;
    }

    if (field.arrayValue.arrayValues) {
      return field.arrayValue.arrayValues.map((value) => fromField({ arrayValue: value }, columnName, typeName));
    }

    return [];
  }

  return null;
}

/**
 * Executes a SQL statement through the Aurora Data API.
 *
 * @param {string} sql - SQL statement.
 * @param {Array<{name: string, value: string | number | boolean | null}>} [params=[]] - Named parameters.
 * @returns {Promise<{rows: Array<Record<string, unknown>>}>} Query result rows.
 */
export async function query(sql, params = []) {
  const response = await client.send(
    new ExecuteStatementCommand({
      ...ensureConfig(),
      sql,
      parameters: params.map(({ name, value }) => ({
        name,
        value: toField(value),
      })),
      includeResultMetadata: true,
    }),
  );

  const metadata = response.columnMetadata ?? [];
  const rows = (response.records ?? []).map((record) =>
    record.reduce((row, field, index) => {
      const column = metadata[index];
      const columnName = column?.name ?? `column_${index}`;
      row[columnName] = fromField(field, columnName, column?.typeName);
      return row;
    }, {}),
  );

  return { rows };
}
