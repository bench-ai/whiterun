import React, {useEffect} from 'react';

const Simplified = () => {

    useEffect(() => {
        const loadScripts = async () => {

            const fontAwesomeScript = document.createElement('script');
            fontAwesomeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/js/all.min.js';
            fontAwesomeScript.async = true;

            const fontAwesomeScriptLoaded = new Promise(resolve => {
                fontAwesomeScript.onload = resolve;
            });

            document.head.appendChild(fontAwesomeScript);

            await fontAwesomeScriptLoaded;

            const baseScript = document.createElement('script');
            baseScript.src = './simplifiedview/base.js'; // Adjust the path to your base.js file
            baseScript.type = 'module';
            baseScript.async = true;

            const baseScriptLoaded = new Promise(resolve => {
                baseScript.onload = resolve;
            });

            document.head.appendChild(baseScript);

            await baseScriptLoaded;

        };

        loadScripts();
    }, []);

    return (
        <div dangerouslySetInnerHTML={{
            __html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Bench AI | Workbench
  </title>
  <meta name="description"
        content="Simple library for flow programming. Drawflow allows you to create data flows easily and quickly.">
</head>
<body>
<link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet'>
<link rel="stylesheet" type="text/css" href="simplified.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css"
      integrity="sha256-h20CPZ0QyXlBuAw7A+KluUYx/3pK+c7lYEpqLTlxjYQ=" crossorigin="anonymous"/>
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

<div class="center-container">
    <div class="mode-section">
        <h2 class="mode-header">Mode</h2>
        <button id="tti" class="mode-button"><b>Text To Image</b></button>
        <button id="iti" class="mode-button"><b>Image To Image</b></button>
        <button id="inp" class="mode-button"><b>Inpaint</b></button>
        <button id="ups" class="mode-button"><b>Upscale</b></button>
        <button id="anm" class="mode-button"><b>Animate</b></button>
    </div>
    
    <div class="mode-layout">
    
    </div>
</div>

</body>
</html>

`
        }}/>
    );
};

export default Simplified;