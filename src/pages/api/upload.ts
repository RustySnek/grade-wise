import { NextApiRequest, NextApiResponse } from 'next';
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};
interface ParsedRow {
  [key: string]: string;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const saveFile = (file: any) => {
  const data = fs.readFileSync(file.filepath);
  const file_content = data.toString('utf-8').split("\n");
  const parsed_data: ParsedRow[] = [];
  let headers: string[] = [];
  file_content.forEach((line, idx) => {
      if (idx === 0) {
        headers = line.split(',').map(header => header?.replace("\r", ""));
        return;
      }
      const values = line.split(',');
      const row: ParsedRow = {};
      for (let i =0; i < headers.length; i++) {
        const value = values[i]?.replace('\r', ''); // Remove \r from the value
        row[headers[i]] = value;
      }
      parsed_data.push(row);
    })
  console.log(parsed_data); 
  //fs.writeFileSync(`./public/uploads/${file.originalFilename}`, data);
  //fs.unlinkSync(file.filepath);
  return;
};
  if (req.method === 'POST') {
    try{
      const form = new formidable.IncomingForm();
      if (!form) {
        console.log("ZXDSZDAEGVFWEQSVA")
      }
      form.parse(req, function (err, fields, files) {
    saveFile(files.file);
    return res.status(201).send("");
  });
    }catch (error) {
      console.error("THIS SHIT HAPPENDED: ", error)
      return res.status(500).send("WHAT THE FUCKKKK")
    }
   /* try {
      const form = formidable({ uploadDir: '/home/poro/Projects/grade-wise/public/uploads/', keepExtensions: true });
      await new Promise<void>((resolve, reject) => {
form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({ error: 'Error parsing the file upload.' });
            reject(err)
        }

        const uploadedFile = files.file;
          await saveFile(uploadedFile)
        if (!uploadedFile) {
          res.status(400).json({ error: 'No file uploaded.' });
        }

        // Handle further processing, e.g., read and process the CSV file

        res.status(200).json({ message: 'File uploaded successfully.' });
          resolve()
      });

      })
          }
       catch(e) {
    console.error("Error uploading a file ", e)
    res.status(500).json({error: "Internal Server Error"})
  }*/
  } else {
     res.status(405).json({ error: 'Method not allowed.' });
    }
  
  }

