"use client";

import { GetColorName } from 'hex-color-to-color-name';
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { IoCopyOutline } from "react-icons/io5";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Home() {
  const [textValue, setTextValue] = useState<string>("");
  const [imageTextValue, setImageTextValue] = useState<string>("");
  const [colorHexValue, setColorHexValue] = useState<string>("");
  const [entireData, setEntireData] = useState<string>("");
  const [varArr, setVarArr] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("normal");

  const generateVariables = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stringArr = selectedOption === "normal" ? textValue.split("\n").map(ele => ele.trim()) :
                      selectedOption === "image" ? imageTextValue.split("\n").map(ele => ele.trim()) :
                      colorHexValue.split("\n").map(ele => ele.trim());

    const modifiedArr = stringArr.map((ele) => {
      const isNumber = /^\d+\s+\w+/.test(ele); 
      if (isNumber) {
        const [number, word] = ele.split(' ');
        const escapedEle = ele.replace(/'/g, "\\'");
        return `static const ${word.replace(/\W/g, '_')} = '${escapedEle}';`;
      }
    
      const modifiedEle = ele.replace(/&/g, 'and');
      const words = modifiedEle
        .replaceAll(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase()
        .split(' ');
    
      let firstWord = '';
      let otherWords = '';
    
      if (words.length >= 1) {
        firstWord = words[0];
      }
    
      if (words.length >= 2) {
        otherWords = words.slice(1, 4)
          .map((val) => val[0].toUpperCase() + val.slice(1))
          .join('');
      }
    
      const joinedWords = [firstWord, otherWords].join('');
    
      const escapedEle = ele.replace(/'/g, "\\'");
    
      return `static const ${joinedWords} = '${escapedEle}';`;
    });
    
    const modifiedImage = stringArr.map((ele) => {
      const extensionIndex = ele.lastIndexOf('.');
      const extension = ele.slice(extensionIndex);
      
      const nameWithoutExtension = ele.slice(0, extensionIndex);
      
      const modifiedEle = nameWithoutExtension.replace(/&/g, 'and');
      const words = modifiedEle
        .split(/[_-\s]/)
        .map((word, index) => {
          if (index === 0) {
            return word.charAt(0).toLowerCase() + word.slice(1);
          } else {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
        })
        .join('');
      
      const modifiedFileName = `${words}${extension}`;
      
      var namingEle = ele;
      if (!ele.endsWith(".png")) {
        namingEle+='.png';
      }
      
      return `static final ${words} = '\${AppEnvironment.s3ImgUrl}${namingEle}';`;
    });

    const totalVariablesGenerated = stringArr.length;

    const modifiedColor = stringArr.map((ele) => {
      const modifiedEle = ele.replace(/&/g, 'and');
      const colorName = modifiedEle
        .replace(/[^a-fA-F0-9]/g, '') 
        .toLowerCase(); 
      
      const colorValue = `0xff${colorName}`; 
      
      const formattedColorName = GetColorName(colorName);  
      const newFormattedColorName = formattedColorName.split(' ');  
      const firstWord = newFormattedColorName[0].toLowerCase();
      const otherWords = newFormattedColorName.slice(1, 4)
        .map((val: string | any[]) => val[0].toUpperCase() + val.slice(1));
    
      const joinedWords = [firstWord, ...otherWords].join('');
    
      return `static Color get ${joinedWords} => const Color(${colorValue});`;
    });

    setVarArr(selectedOption === "normal" ? modifiedArr : selectedOption === "image" ? modifiedImage : modifiedColor);
    setEntireData(selectedOption === "normal" ? modifiedArr.join("\n") : selectedOption === "image" ? modifiedImage.join("\n") : modifiedColor.join("\n"));
  };

  const clearData = () => {
    setTextValue("");
    setImageTextValue("");
    setColorHexValue("");
    setVarArr([]);
  };
  
  return (
    <div className="container mx-auto m-3 p-4">
      <form onSubmit={generateVariables} className="space-y-8">
        <a href="https://twitter.com/archiexzzz" >
          <h3 className='text-center'>@archiexzzz</h3>
        </a>
        <h1 className="text-2xl font-bold text-center">A tiny static variable generator for hex, images, and content strings</h1>
        <h2 className="text-sm font-medium text-gray-600 text-right mt-2">change the ouput format by forking this repo
        <a href="https://github.com/ArchishmanSengupta/txtgen" target="_blank" rel="noopener noreferrer" className="ml-1">
          <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" alt="GitHub Logo" className="w-5 h-5 inline-block" />
        </a>
        </h2>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="normalText"
              name="inputOption"
              value="normal"
              checked={selectedOption === "normal"}
              onChange={() => setSelectedOption("normal")}
              className="hidden"
            />
            <label htmlFor="normalText" className={`radio-label ${selectedOption === "normal" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} px-4 py-2 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-blue-600 hover:text-white`}>Normal Text</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="imageText"
              name="inputOption"
              value="image"
              checked={selectedOption === "image"}
              onChange={() => setSelectedOption("image")}
              className="hidden"
            />
            <label htmlFor="imageText" className={`radio-label ${selectedOption === "image" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} px-4 py-2 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-blue-600 hover:text-white`}>Image Text</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="colorText"
              name="inputOption"
              value="color"
              checked={selectedOption === "color"}
              onChange={() => setSelectedOption("color")}
              className="hidden"
            />
            <label htmlFor="colorText" className={`radio-label ${selectedOption === "color" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} px-4 py-2 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-blue-600 hover:text-white`}>Hex to Color Name</label>
          </div>
        </div>

        {selectedOption === "normal" ? (
          <textarea
            name="variaName"
            id="varName"
            cols={100}
            rows={10}
            placeholder="Enter the text here to generate Variable..."
            className="border p-3 w-full rounded"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          ></textarea>
        ) : selectedOption === "image" ? (
          <textarea
            name="variaName"
            id="varName"
            cols={100}
            rows={10}
            placeholder="Enter the image text here to generate Variable..."
            className="border p-3 w-full rounded"
            value={imageTextValue}
            onChange={(e) => setImageTextValue(e.target.value)}
          ></textarea>
        ) : (
          <textarea
            name="variaName"
            id="varName"
            cols={100}
            rows={10}
            placeholder="Enter the color HEX here to generate Variable..."
            className="border p-3 w-full rounded"
            value={colorHexValue}
            onChange={(e) => setColorHexValue(e.target.value)}
          />
        )}

      <div className="flex justify-center space-x-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
          type="submit"
          onClick={generateVariables}
        >
          Abra Cadabra
        </button>

        <button
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={clearData}
        >
          Clear Screen
        </button>
      </div>
      </form>
      <br/>
      {varArr.length > 0 && (
      <div className="relative rounded border w-full">
        <CopyToClipboard
          text={entireData}
          onCopy={() => toast.success("Copied Successfully")}
        >
          <div className="copy-button top-1 left-2 text-black p-2 rounded cursor-pointer hover:scale-10 transition-all duration-1000 hover:bg-blue-400">
            <IoCopyOutline size={20} />
          </div>
        </CopyToClipboard>
        <div className="syntax-highlighter p-2">
          <SyntaxHighlighter language="javascript" style={a11yLight}>
            {entireData}
          </SyntaxHighlighter>
        </div>
      </div>
    )}
    </div>
  );
}
