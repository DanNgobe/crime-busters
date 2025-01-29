/* v8 ignore start */
import { exec } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Function to read the MySQL dump file
function readMySQLDump(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseMySQLDump(mysqlDump) {
  const tables = [];
  const tableRegex = /CREATE TABLE `(\w+)` \(([\s\S]+?)\) ENGINE=/g;

  let match;
  while ((match = tableRegex.exec(mysqlDump)) !== null) {
    const tableName = match[1];
    const columnsString = match[2];

    const columnsArray = [];
    // split by \n and remove empty strings
    const columns = columnsString.split('\n').filter((line) => line.trim() !== '');
    for (const column of columns) {
      // split by space and remove empty strings
      const columnParts = column.split(' ').filter((part) => part.trim() !== '');
      const columnName = columnParts[0].replace(/`/g, '');
      const columnType = columnParts[1].replace(/`/g, '');
      const isNullable = column.includes('DEFAULT NULL');

      if (columnName == 'PRIMARY' || columnName == 'KEY' || columnName == 'FOREIGN') {
        continue;
      }

      columnsArray.push({
        name: columnName,
        type: columnType,
        nullable: isNullable,
      });
    }

    tables.push({
      name: tableName,
      columns: columnsArray,
    });
  }

  return tables;
}

function capitalizeFirstLetter(str) {
  return str
    .split('_') // Split the string by underscores
    .map((word, index) => {
      if (index === 0) {
        // Capitalize the first word
        return word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        // Capitalize the first letter of subsequent words
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    })
    .join(''); // Join the words without underscores
}

function camelCase(str) {
  return str
    .split('_') // Split the string by underscores
    .map((word, index) => {
      if (index === 0) {
        // Lowercase the first word
        return word.toLowerCase();
      } else {
        // Capitalize the first letter of subsequent words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join(''); // Join the words without underscores
}

// Function to map MySQL data types to TypeScript types
function mapMySQLTypeToTypeScript(mysqlType) {
  if (mysqlType.includes('enum')) {
    // Extract enum values from the string
    const enumValues = mysqlType.match(/'([^']+)'/g).map((value) => value.replace(/'/g, ''));
    return enumValues.map((value) => `'${value}'`).join(' | ');
  } else if (mysqlType.includes('set')) {
    // Extract set values from the string
    const setValues = mysqlType.match(/'([^']+)'/g).map((value) => value.replace(/'/g, ''));
    return setValues.map((value) => `'${value}'`).join(' | ');
  }
  // Check fo boolean type
  else if (mysqlType.includes('tinyint(1)')) {
    return 'boolean';
  }
  // Remove any parentheses from the type
  mysqlType = mysqlType.replace(/\(.+\)/, '');
  switch (mysqlType.toUpperCase()) {
    case 'INT':
    case 'BIGINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
    case 'DECIMAL':
    case 'FLOAT':
    case 'DOUBLE':
      return 'number';
    case 'VARCHAR':
    case 'CHAR':
    case 'TEXT':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
      return 'string';
    case 'DATE':
    case 'DATETIME':
    case 'TIMESTAMP':
      return 'Date | string';
    case 'BOOLEAN':
    case 'JSON':
      return 'any';
    default:
      return 'any';
  }
}

function generateInterfaces(tables) {
  let output = '';

  tables.forEach((table) => {
    output += `export type ${capitalizeFirstLetter(table.name)} = {\n`;
    table.columns.forEach((column) => {
      const columnName = camelCase(column.name);
      const nullableSymbol = column.nullable ? '?' : '';
      const columnType = mapMySQLTypeToTypeScript(column.type);
      output += `    ${columnName}${nullableSymbol}: ${columnType};\n`;
    });
    output += `}\n\n`;
  });

  return output;
}

// Function to generate TypeScript input interfaces
function generateInputInterfaces(tables) {
  let output = '';

  tables.forEach((table) => {
    output += `export type ${capitalizeFirstLetter(table.name)}Input = {\n`;
    for (let i = 0; i < table.columns.length; i++) {
      const column = table.columns[i];
      const columnName = camelCase(column.name);
      let nullableSymbol = column.nullable ? '?' : '';
      if (i == 0) {
        nullableSymbol = '?';
      }
      const columnType = mapMySQLTypeToTypeScript(column.type);
      output += `    ${columnName}${nullableSymbol}: ${columnType};\n`;
    }

    output += `}\n\n`;
  });

  return output;
}

// Function to ensure directory exists
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Main function
function generateTypeScriptInterfaces(mysqlDumpPath, outputPath) {
  const mysqlDump = readMySQLDump(mysqlDumpPath);
  const tables = parseMySQLDump(mysqlDump);
  const tsInterfaces = generateInterfaces(tables);
  const tsInputInterfaces = generateInputInterfaces(tables);

  ensureDirectoryExists(outputPath);
  fs.writeFileSync(outputPath, tsInterfaces + tsInputInterfaces);
}

const actionHandler = (action, fileName) => {
  dotenv.config({});

  const dumpFileName = fileName || 'backup.sql';

  const dumpSQLCommand = `mysqldump -h ${process.env.MYSQL_HOST} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} --no-data ${process.env.MYSQL_DATABASE} > ${dumpFileName}`;
  const restoreSQLCommand = `mysql -h ${process.env.MYSQL_HOST} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} < ${dumpFileName}`;

  if (action === 'generate' || action === 'backup') {
    exec(dumpSQLCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error dumping database: ${stderr}`);
        return;
      }
      console.log('Database dumped successfully.');

      if (action === 'backup') return;

      // Generate TypeScript interfaces after successful dump
      const outputPath = '../client/src/types/database.ts';
      generateTypeScriptInterfaces(dumpFileName, outputPath);
      console.log('TypeScript interfaces generated successfully.');
    });
  } else if (action === 'restore') {
    exec(restoreSQLCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error restoring database: ${stderr}`);
        return;
      }
      console.log('Database restored successfully.');
    });
  } else {
    console.error('Invalid action. Please provide "dump" or "restore" as a command line argument.');
  }
};

const action = process.argv[2];
const fileName = process.argv[3];

if (action) {
  actionHandler(action, fileName);
} else {
  console.error(
    'Invalid usage. Please provide "dump" or "restore" as action and "local" or "server" as environment.',
  );
}

/* v8 ignore stop */
