import fs from "fs";
import { parse, ParseResult } from 'papaparse';

export const gen_temp_password = () => {
  const crypto = require('crypto')
  const randomBytes = crypto.randomBytes(8).toString("hex");
  return randomBytes;
}

export const csv_into_object = (file: any) => {
  const data = fs.readFileSync(file.filepath, 'utf-8');
  let parsed_data: any = [];
  parse(data, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // This will automatically convert strings to appropriate types
    complete: (result: ParseResult<[]>) => {
      parsed_data = result.data
    },
    error: (error: any) => {
      throw new Error("Error parsing CSV:", error.message);
    },
  })
  return parsed_data;

}
