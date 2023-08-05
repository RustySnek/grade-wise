"use client"
import { ChangeEvent, FormEvent, FormEventHandler, MouseEventHandler, useState } from "react";

const MassImport = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      alert("please choose a file")
      return
    }
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const body = new FormData();
  if (!file) {
      alert('Please select a file.');
      return;
    }

    body.append("file", file);
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: body,
      });

      if (response.ok) {
        alert('File uploaded successfully.');
      } else {
        console.log(response)
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  return (
    <main>
        <input onChange={handleFileChange} type="file" id="csv-file" accept=".csv" />
    <button type="submit" onClick={handleUpload}>Upload CSV</button>
    </main>
  );
}

export default MassImport;
