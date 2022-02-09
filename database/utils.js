import { createReadStream } from "fs";
import { parse } from "csv-parse";
import knex from "knex";

export function createConnection(args) {
    return knex({
        client: "pg",
        connection: {
            host: args.host || "localhost",
            port: args.port || 5432,
            user: args.user || "methylscape",
            password: args.password || "methylscape",
            database: args.database || "methylscape",
        },
    });
}

export function createCsvRecordIterator(filename, columns) {
    const parseOptions = {
        columns: true,
        skip_empty_lines: true,
        cast: castValue,
        on_record: createRecordParser(columns),
    };

    return createReadStream(filename)
        .pipe(parse(parseOptions));
}

export async function importTable(connection, iterable, tableName) {
    let index = 0;
    for await (const record of iterable) {
        try {
            await connection.insert(record).into(tableName);
        } catch (error) {
            console.log(record);
            throw error;
        }
        if (++index % 1000 === 0) {
            console.log(`Imported ${index} rows`);
        }
    }

    console.log(`Imported ${index} rows`);
}

export function castValue(value) {
    if (value === "") {
        return null;
    } else if (!isNaN(value)) {
        return parseFloat(value);
    } else {
        return value;
    }
}

export function createRecordParser(columns) {
    return function (record) {
        let row = {};
        for (const { sourceName, name, defaultValue } of columns) {
            row[name] = record[sourceName] ?? defaultValue ?? null;
        }
        return row;
    }
}