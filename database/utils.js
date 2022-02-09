import { createReadStream } from "fs";
import { parse } from "csv-parse";

export function createCsvRecordIterator(filename, columns) {
    const parseOptions = {
        columns: true,
        skip_empty_lines: true,
        cast: castValue,
        on_record: createRecordParser(columns),
    };

    return createReadStream(sourcePath)
        .pipe(parse(parseOptions));
}

export async function importTable(iterable, tableName) {
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