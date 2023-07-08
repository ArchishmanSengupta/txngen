"use client";

import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IoCopyOutline } from "react-icons/io5";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import toast from "react-hot-toast";
import { GetColorName } from 'hex-color-to-color-name';


export default function Home() {
  const [textValue, setTextValue] = useState<string>("");
  const [imageTextValue, setImageTextValue] = useState<string>("");
  const [colorHexValue, setColorHexValue] = useState<string>("");
  const [entireData, setEntireData] = useState<string>("");
  const [varArr, setVarArr] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("normal");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const generateVariables = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stringArr = selectedOption === "normal" ? textValue.trim().split("\n") : selectedOption === "image" ? imageTextValue.trim().split("\n") : colorHexValue.trim().split("\n");

    const modifiedArr = stringArr.map((ele) => {
      const modifiedEle = ele.replace(/&/g, 'and');
      const words = modifiedEle
        .replaceAll(/[^a-zA-Z ]/g, '')
        .toLowerCase()
        .split(' ');
      
      const firstWord = words[0];
      const otherWords = words.slice(1, 4)
        .map((val) => val[0].toUpperCase() + val.slice(1));
      
      const joinedWords = [firstWord, ...otherWords].join('');
    
      const escapedEle = ele.replace(/'/g, "\\'");
    
      return `static const ${joinedWords} = '${escapedEle}';`;
    });

    const modifiedImage = stringArr.map((ele) => {
      const modifiedEle = ele.replace(/&/g, 'and');
      const words = modifiedEle
        .split('-')
        .map((word, index) => {
          if (index === 0) {
            return word.charAt(0).toLowerCase() + word.slice(1);
          } else {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
        })
        .join('');
    
      const escapedEle = ele.replace(/'/g, "\\'");
    
      return `static final ${words} = '\${AppEnvironment.s3ImgUrl}${escapedEle}.png';`;
    });
    

    const modifiedColor = stringArr.map((ele) => {
      const modifiedEle = ele.replace(/&/g, 'and');
      const colorName = modifiedEle
        .replace(/[^a-fA-F0-9]/g, '') 
        .toLowerCase(); 
      
      const colorValue = `0xff${colorName}`; 
      
      const formattedColorName = GetColorName(colorName)
      return `static Color get ${formattedColorName} => const Color(${colorValue});`;
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
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
  <div className={`container mx-auto m-3 p-4`}>
      <form onSubmit={generateVariables}>
      <div className="flex justify-between items-center">
      <div className="h-12 text-2xl font-bold">
        Stackers, convert your content to variables in 1 click!
      </div>
      <a href="https://webstatic.stackfinance.co/website/Group%2073740.svg" target="_blank" rel="noopener noreferrer">
        <img src="https://webstatic.stackfinance.co/website/Group%2073740.svg" alt="Logo" className="w-50 h-50" />
      </a>
    </div>
    <br />
        <div className="flex gap-3 mb-5">
          <div>
            <input
              type="radio"
              id="normalText"
              name="inputOption"
              value="normal"
              checked={selectedOption === "normal"}
              onChange={() => setSelectedOption("normal")}
            />
            <label htmlFor="normalText" className="ml-2">
              Normal Text
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="imageText"
              name="inputOption"
              value="image"
              checked={selectedOption === "image"}
              onChange={() => setSelectedOption("image")}
            />
            <label htmlFor="imageText" className="ml-2">
              Image Text
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="colorText"
              name="inputOption"
              value="color"
              checked={selectedOption === "color"}
              onChange={() => setSelectedOption("color")}
            />
            <label htmlFor="imageText" className="ml-2">
              Hex to Color Name
            </label>
          </div>
        </div>

        {selectedOption === "normal" ? (
          <textarea
            name="variaName"
            id="varName"
            cols={100}
            rows={10}
            placeholder="Enter the text here to generate Variable..."
            className="border p-3 w-[100%] rounded"
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
            className="border p-3 w-[100%] rounded"
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
          className="border p-3 w-[100%] rounded"
            value={colorHexValue}
            onChange={(e) => setColorHexValue(e.target.value)}
          />
        )}

        <div className="flex gap-10">
          <button
            className="bg-green-600 px-10 py-3 rounded text-white hover:bg-green-500 transition-all duration-200 hover:scale-95 font-medium hover:font-normal shadow hover:shadow-none"
            type="submit"
          >
            Generate String Variables
          </button>

          <button
            className="bg-red-600 px-10 py-3 rounded text-white hover:bg-red-500 transition-all duration-200 hover:scale-95 font-medium hover:font-normal shadow hover:shadow-none"
            onClick={() => clearData()}
          >
            Clear Screen
          </button>

          {/* Copy All */}
        </div>
      </form>

      {/* Mapping the variables */}
      <br />
      {varArr.length > 0 ? (
          <div className="relative rounded border w-[100%] flex flex-col ">
            <CopyToClipboard
              text={entireData}
            onCopy={() => toast.success("Copied Successfully")}
            >
              <div className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:scale-95 transition-all duration-200 hover:bg-blue-400 w-fit m-2 self-end group">
                <IoCopyOutline size={20} />
                <div className="text-white truncate bg-black/90 absolute -left-3 -top-6  text-sm px-4 rounded-sm group-hover:block hidden">
                  Copy
                </div>
              </div>
            </CopyToClipboard>

            <div className="p-2">
              <SyntaxHighlighter language="javascript" style={a11yLight}>
                {entireData}
              </SyntaxHighlighter>
            </div>
          </div>
      ) : (
        <></>
      )}

    </div>
  );
}
